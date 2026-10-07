"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface SectionDealCountdownProps {
  className?: string;
  /** Desktop banner artwork. */
  backgroundImage?: string;
  /** Mobile banner artwork. */
  backgroundImageMobile?: string;
  /** Deal end time as an ISO string. */
  endsAt?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const pad = (n: number) => n.toString().padStart(2, "0");

const DEFAULT_COUNTDOWN_MS = 1000 * 60 * 60 * 24 * 2;

/** Parse Hero Settings ACF `dealsDate` (ISO, `Y-m-d H:i:s`, etc.). */
const parseDealEndsAt = (value: string | undefined): number => {
  if (!value?.trim()) return NaN;
  const trimmed = value.trim();
  const direct = new Date(trimmed).getTime();
  if (Number.isFinite(direct)) return direct;
  const normalized = trimmed.replace(" ", "T");
  const withTz = new Date(normalized).getTime();
  return Number.isFinite(withTz) ? withTz : NaN;
};

/** Snappers palette (replaces legacy deal-brown / peach timer colors). */
const TITLE_PRIMARY = "#092412";
const TITLE_ACCENT = "#769F5F";
const TIMER_DIGIT = "#092412";
const TIMER_LABEL = "#769F5F";
const TIMER_DIVIDER = "#E7EAD9";
const TIMER_BOX_BORDER = "#E7EAD9";
const TIMER_RIBBON_BG = "#092412";
const TIMER_RIBBON_TEXT = "#B8D962";

const DEAL_BANNER_WIDTH = 1024;
const DEAL_BANNER_HEIGHT = 341;

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

const DealCountdownTitle = ({
  className,
  align = "center",
}: {
  className?: string;
  align?: "start" | "center";
}) => (
  <h2
    className={cn(
      "font-albra font-bold leading-[1.05]",
      align === "center" ? "text-center" : "text-left",
      className,
    )}
  >
    <span className="block" style={{ color: TITLE_PRIMARY }}>
      Deals for your
    </span>
    <span className="block" style={{ color: TITLE_ACCENT }}>
      daily shopping
    </span>
  </h2>
);

/**
 * Promo banner with a live "deal ends in" countdown overlaid on grocery artwork.
 */
const SectionDealCountdown = ({
  className = "",
  backgroundImage = "/homepage/deal-bg.png",
  backgroundImageMobile = "/homepage/deal-bg.png",
  endsAt,
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

  const isExpired = timeLeft !== null && isExpiredTime(timeLeft);
  const timerVisibilityClass = isExpired ? "invisible" : "";

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
              <span
                className="text-xl font-bold tabular-nums leading-none md:text-4xl md:leading-none"
                style={{ color: TIMER_DIGIT }}
              >
                {pad(unit.value)}
              </span>
              <span
                className="py-1 text-[9px] font-semibold uppercase leading-none tracking-wider md:py-2 md:text-xs"
                style={{ color: TIMER_LABEL }}
              >
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
                <span
                  className="h-2 w-7 animate-pulse rounded md:h-2.5 md:w-8"
                  style={{ backgroundColor: `${TIMER_LABEL}40` }}
                />
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
      className={`relative z-0 mx-auto w-full max-w-[1368px] px-3 lg:px-0 ${className}`}
    >
      <div className="relative w-full overflow-visible rounded-[20px] md:overflow-hidden md:rounded-[28px]">
        <Image
          src={backgroundImageMobile}
          alt=""
          width={DEAL_BANNER_WIDTH}
          height={DEAL_BANNER_HEIGHT}
          priority
          unoptimized
          sizes="100vw"
          aria-hidden
          className="h-auto w-full rounded-[20px] object-cover object-center md:hidden"
        />
        <Image
          src={backgroundImage}
          alt=""
          width={DEAL_BANNER_WIDTH}
          height={DEAL_BANNER_HEIGHT}
          priority
          unoptimized
          sizes="(max-width: 1368px) 100vw, 1368px"
          aria-hidden
          className="hidden h-auto w-full object-cover object-center md:block"
        />

        {/* Mobile: left-aligned title + compact countdown */}
        <div className="absolute inset-0 flex flex-col items-start justify-center pl-5 pr-[28%] md:hidden">
          <div className="inline-block pt-8">
            <div className="relative">
              <DealCountdownTitle
                align="start"
                className="mb-2 text-[25px]"
              />
            </div>

            <div
              className={cn(
                "relative mt-2.5 w-full overflow-visible rounded-xl border bg-white px-2 pb-2 pt-6",
                timerVisibilityClass,
              )}
              style={{ borderColor: TIMER_BOX_BORDER }}
            >
              <span
                className={cn(
                  ribbonClass,
                  "-top-2.5 z-10 rounded px-1.5 py-1 text-[8px] tracking-wide",
                )}
                style={{
                  backgroundColor: TIMER_RIBBON_BG,
                  color: TIMER_RIBBON_TEXT,
                }}
              >
                Hurry! Deal ends in:
              </span>
              {countdownBody}
            </div>
          </div>
        </div>

        {/* Desktop: centered title + compact countdown (original layout) */}
        <div className="absolute inset-0 hidden flex-col items-center justify-end gap-5 px-4 pb-12 md:flex">
          <div className="relative">
            <Image
              src="/homepage/lines.png"
              alt=""
              width={28}
              height={28}
              aria-hidden
              className="absolute -left-4 -top-5 h-7 w-7"
            />
            <DealCountdownTitle align="center" className="text-6xl" />
          </div>

          <div
            className={cn(
              "relative overflow-visible rounded-2xl border bg-white/70 px-7 pb-3 pt-8 backdrop-blur-sm md:pt-9",
              timerVisibilityClass,
            )}
            style={{ borderColor: TIMER_BOX_BORDER }}
          >
            <span
              className={cn(
                ribbonClass,
                "-top-3.5 z-10 rounded-md px-3 py-2 text-[10px] tracking-wider",
              )}
              style={{
                backgroundColor: TIMER_RIBBON_BG,
                color: TIMER_RIBBON_TEXT,
              }}
            >
              Hurry! Deal ends in:
            </span>
            {countdownBody}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SectionDealCountdown;
