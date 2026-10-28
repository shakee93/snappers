"use client";

import { useEffect, useState } from "react";
import { parseDealEndsAt } from "@/lib/dealCountdown";
import {
  sectionDescriptionClass,
  sectionEyebrowClass,
  sectionTitleClass,
} from "@/lib/sectionTypography";
import { cn } from "@/lib/utils";

export interface SectionDealCountdownProps {
  className?: string;
  /** Deal end time as an ISO string. */
  endsAt?: string;
  /** From SSR: deal already ended when the page HTML was generated. */
  hideTimer?: boolean;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const pad = (n: number) => n.toString().padStart(2, "0");

const DEFAULT_COUNTDOWN_MS = 1000 * 60 * 60 * 24 * 2;

/** Snappers deal timer (matches legacy banner countdown palette). */
const TIMER_DIVIDER = "#E7EAD9";
const TIMER_LABEL = "#769F5F";

const getTimeLeft = (target: number): TimeLeft => {
  const diff = Math.max(0, target - Date.now());
  const totalSeconds = Math.floor(diff / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
};

const isExpiredTime = (t: TimeLeft) =>
  t.days === 0 && t.hours === 0 && t.minutes === 0 && t.seconds === 0;

/**
 * Promo strip with optional live "deal ends in" countdown (no decorative banner artwork).
 */
const SectionDealCountdown = ({
  className = "",
  endsAt,
  hideTimer = false,
}: SectionDealCountdownProps) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    const parsed = endsAt ? parseDealEndsAt(endsAt) : NaN;
    const target = Number.isFinite(parsed)
      ? parsed
      : Date.now() + DEFAULT_COUNTDOWN_MS;

    const tick = () => {
      const next = getTimeLeft(target);
      setTimeLeft(next);
      return isExpiredTime(next);
    };

    if (tick()) return;

    const id = window.setInterval(() => {
      if (tick()) window.clearInterval(id);
    }, 1000);
    return () => window.clearInterval(id);
  }, [endsAt]);

  const liveExpired = timeLeft !== null && isExpiredTime(timeLeft);
  const showTimer = !hideTimer && !liveExpired;

  const units = timeLeft
    ? [
        { label: "Days", value: timeLeft.days },
        { label: "Hrs", value: timeLeft.hours },
        { label: "Mins", value: timeLeft.minutes },
        { label: "Secs", value: timeLeft.seconds },
      ]
    : null;

  const countdownBody = (
    <div
      className="flex w-full items-center justify-evenly"
      aria-busy={!units}
      aria-live="polite"
    >
      {units ? (
        units.map((unit, index) => (
          <div key={unit.label} className="flex items-center">
            {index > 0 && (
              <span
                className="mx-2 h-9 w-px md:mx-2.5 md:h-10"
                style={{ backgroundColor: TIMER_DIVIDER }}
                aria-hidden
              />
            )}
            <div className="flex min-w-[2.75rem] flex-col items-center md:min-w-[3.25rem]">
              <span className="font-lexend text-2xl font-bold tabular-nums leading-none text-header-green md:text-[2rem] md:leading-none">
                {pad(unit.value)}
              </span>
              <span
                className="mt-1.5 text-[9px] font-semibold uppercase leading-none tracking-wider md:text-[10px]"
                style={{ color: TIMER_LABEL }}
              >
                {unit.label}
              </span>
            </div>
          </div>
        ))
      ) : (
        <div className="flex w-full items-center justify-center gap-1">
          {[0, 1, 2, 3].map((index) => (
            <div key={index} className="flex items-center">
              {index > 0 && (
                <span
                  className="mx-2 h-9 w-px"
                  style={{ backgroundColor: TIMER_DIVIDER }}
                  aria-hidden
                />
              )}
              <div className="flex flex-col items-center gap-1.5">
                <span
                  className="h-8 w-9 animate-pulse rounded-md md:h-9 md:w-10"
                  style={{ backgroundColor: `${TIMER_DIVIDER}cc` }}
                />
                <span
                  className="h-2 w-8 animate-pulse rounded"
                  style={{ backgroundColor: `${TIMER_LABEL}40` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <section
      className={`relative z-0 mx-auto w-full max-w-[1368px] px-4 ${className}`}
    >
      <div
        className={cn(
          "w-full py-2",
          showTimer ? "md:py-4" : "md:py-3",
          showTimer && "md:flex md:items-center md:justify-between md:gap-8 lg:gap-10",
        )}
      >
        <div className="min-w-0 flex-1">
          <p className={sectionEyebrowClass}>Deals</p>
          <h2 className={cn(sectionTitleClass, "mt-2 md:mt-3")}>
            Deals for your daily shopping
          </h2>
          <p className={sectionDescriptionClass}>
            Limited-time savings on groceries, household essentials, and favourites
            across the store - updated regularly.
          </p>
        </div>

        {showTimer ? (
          <div
            className={cn(
              "mt-4 w-full shrink-0 overflow-hidden rounded-2xl border border-[#E7EAD9] bg-white shadow-sm",
              "md:mt-0 md:w-[min(100%,20.5rem)]",
            )}
          >
            <p className="bg-header-green px-3 py-2.5 text-center font-lexend text-[10px] font-bold uppercase leading-none tracking-wider text-deal-accent md:px-4 md:py-3 md:text-xs">
              Hurry! Deal ends in:
            </p>
            <div className="px-3 py-3.5 md:px-4 md:py-4">{countdownBody}</div>
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default SectionDealCountdown;
