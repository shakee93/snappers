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

const TIMER_DIVIDER = "#E7EAD9";
const TIMER_BOX_BORDER = "#E7EAD9";

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
      className="flex min-h-[2.25rem] w-full items-center justify-evenly pt-1 md:min-h-[4.25rem] md:w-auto md:justify-center md:pt-0.5"
      aria-busy={!units}
    >
      {units ? (
        units.map((unit, index) => (
          <div key={unit.label} className="flex items-center">
            {index > 0 && (
              <span
                className="mx-1.5 h-8 w-px md:mx-3 md:h-10"
                style={{ backgroundColor: TIMER_DIVIDER }}
                aria-hidden
              />
            )}
            <div className="flex flex-col items-center">
              <span className="text-xl font-bold tabular-nums leading-none text-header-green md:text-4xl md:leading-none">
                {pad(unit.value)}
              </span>
              <span className="py-1 text-[9px] font-semibold uppercase leading-none tracking-wider text-primary-600 md:py-2 md:text-xs">
                {unit.label}
              </span>
            </div>
          </div>
        ))
      ) : (
        <div className="flex w-full items-center justify-center gap-1 md:gap-4">
          {[0, 1, 2, 3].map((index) => (
            <div key={index} className="flex items-center">
              {index > 0 && (
                <span
                  className="mx-1.5 h-8 w-px md:mx-3 md:h-10"
                  style={{ backgroundColor: TIMER_DIVIDER }}
                  aria-hidden
                />
              )}
              <div className="flex flex-col items-center gap-1.5">
                <span
                  className="h-7 w-8 animate-pulse rounded-md md:h-9 md:w-12"
                  style={{ backgroundColor: `${TIMER_DIVIDER}cc` }}
                />
                <span className="h-2 w-7 animate-pulse rounded bg-primary-600/25 md:h-2.5 md:w-8" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const ribbonClass =
    "absolute left-1/2 -translate-x-1/2 whitespace-nowrap font-bold uppercase leading-none tracking-wide";

  return (
    <section
      className={`relative z-0 mx-auto w-full max-w-[1368px] px-4 ${className}`}
    >
      <div className={cn("w-full py-2", showTimer ? "md:py-4" : "md:py-3")}>
        <p className={sectionEyebrowClass}>Deals</p>
        <h2
          className={cn(
            sectionTitleClass,
            "mt-2 md:mt-3",
          )}
        >
          Deals for your daily shopping
        </h2>
        <p className={sectionDescriptionClass}>
          Limited-time savings on groceries, household essentials, and favourites
          across the store — updated regularly.
        </p>
        {showTimer ? (
          <div
            className="relative mt-4 max-w-xl overflow-hidden rounded-xl border bg-[#faf9f7] px-3 pb-3 pt-3 md:mt-6 md:px-7 md:pb-3 md:pt-9"
            style={{ borderColor: TIMER_BOX_BORDER }}
          >
            <span
              className={cn(
                ribbonClass,
                "-top-3.5 z-10 rounded-md bg-header-green px-3 py-2 text-[10px] tracking-wider text-deal-accent",
              )}
            >
              Hurry! Deal ends in:
            </span>
            {countdownBody}
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default SectionDealCountdown;
