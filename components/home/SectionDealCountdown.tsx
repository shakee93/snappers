"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export interface SectionDealCountdownProps {
  className?: string;
  /** Desktop banner artwork. */
  backgroundImage?: string;
  /** Mobile banner artwork (puppy on the right). */
  backgroundImageMobile?: string;
  /** Deal end time as an ISO string. */
  endsAt?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
}

const pad = (n: number) => n.toString().padStart(2, "0");


const getTimeLeft = (target: number): TimeLeft => {
  const diff = Math.max(0, target - Date.now());
  const totalMinutes = Math.floor(diff / 60000);
  return {
    days: Math.floor(totalMinutes / (60 * 24)),
    hours: Math.floor((totalMinutes % (60 * 24)) / 60),
    minutes: totalMinutes % 60,
  };
};

/**
 * Promo banner with a live "deal ends in" countdown overlaid on a provided
 * background image (the cat & dog artwork).
 */
const SectionDealCountdown = ({
  className = "",
  backgroundImage = "/homepage/deal-bg.png",
  backgroundImageMobile = "/homepage/deal-m-bg.png",
  endsAt,
}: SectionDealCountdownProps) => {
  // Countdown values depend on Date.now() — only compute after mount so SSR
  // and the first client render match (avoids hydration mismatch).
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    const target = endsAt
      ? new Date(endsAt).getTime()
      : Date.now() + 1000 * 60 * 60 * 24 * 2;

    const tick = () => setTimeLeft(getTimeLeft(target));
    tick();

    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [endsAt]);

  const units = timeLeft
    ? [
        { label: "Days", value: timeLeft.days },
        { label: "Hrs", value: timeLeft.hours },
        { label: "Mins", value: timeLeft.minutes },
      ]
    : null;

  const countdownBody = (
    <div
      className="flex min-h-[2.25rem] w-full items-center justify-evenly md:min-h-[4.25rem] md:w-auto md:justify-center"
      aria-busy={!units}
    >
      {units ? (
        units.map((unit, index) => (
          <div key={unit.label} className="flex items-center">
            {index > 0 && (
              <span
                className="mx-2 h-8 w-px bg-[#E7D9C7] md:mx-4 md:h-10"
                aria-hidden
              />
            )}
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold tabular-nums text-[#3E251B] md:text-4xl">
                {pad(unit.value)}
              </span>
              <span className="text-[9px] leading-none py-1 md:py-2 font-semibold uppercase tracking-wider text-[#EE9E7D] md:text-xs">
                {unit.label}
              </span>
            </div>
          </div>
        ))
      ) : (
        <div className="flex w-full items-center justify-center gap-2 md:gap-4">
          {[0, 1, 2].map((index) => (
            <div key={index} className="flex items-center">
              {index > 0 && (
                <span
                  className="mx-2 h-8 w-px bg-[#E7D9C7] md:mx-4 md:h-10"
                  aria-hidden
                />
              )}
              <div className="flex flex-col items-center gap-1.5">
                <span className="h-7 w-9 animate-pulse rounded-md bg-[#E7D9C7]/80 md:h-9 md:w-12" />
                <span className="h-2 w-7 animate-pulse rounded bg-[#EE9E7D]/40 md:h-2.5 md:w-8" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <section className={`mx-auto w-full max-w-[1368px] px-3 lg:px-0 md:mt-[-50px] mt-[-20px] ${className}`}>
      <div className="relative w-full overflow-visible rounded-[20px] md:overflow-hidden md:rounded-[28px]">
        <Image
          src={backgroundImageMobile}
          alt=""
          width={371}
          height={170}
          aria-hidden
          className="h-auto w-full object-cover md:hidden"
        />
        <Image
          src={backgroundImage}
          alt=""
          width={1368}
          height={386}
          aria-hidden
          className="hidden h-auto w-full object-cover md:block"
        />

        {/* Mobile: left-aligned title + countdown over puppy bg */}
        <div className="absolute inset-0 flex flex-col items-start justify-center pl-5 pr-[30%] md:hidden ">
          <div className="inline-block pt-10">
            <div className="relative">
              <Image
                src="/homepage/lines.png"
                alt=""
                width={28}
                height={28}
                aria-hidden
                className="absolute -left-5 -top-3 h-4 w-4 hidden md:block"
              />
              <h2 className="text-[25px] font-albra font-bold leading-tight text-[#3E251B] mb-2">
                Deals for your <span className="text-[#E79A72]">pet</span>
              </h2>
              <Image
                src="/homepage/bone.png"
                alt=""
                width={40}
                height={34}
                aria-hidden
                className="absolute -right-6 -top-2 h-5 w-6 hidden md:block"
              />
            </div>

            <div className="relative mt-2.5 w-full rounded-xl border border-[#E7D9C7] bg-white px-2 pb-1.5 pt-2.5">
              <span className="absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-[#3E251B] px-1.5 py-1 text-[8px] font-bold uppercase leading-none tracking-wide !text-[#EE9E7D]">
                Hurry! Deals ends in:
              </span>
              {countdownBody}
            </div>
          </div>
        </div>

        {/* Desktop: centered title + countdown overlay */}
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
            <h2 className="text-6xl font-albra font-bold text-[#092412]">
              Deals for your <span className="text-[#E79A72]">pet</span>
            </h2>
            <Image
              src="/homepage/bone.png"
              alt=""
              width={40}
              height={34}
              aria-hidden
              className="absolute -right-11 -top-4 h-8 w-10"
            />
          </div>

          <div className="relative rounded-2xl border border-[#E7D9C7] bg-white/70 px-7 py-0 md:pb-3 md:pt-5 backdrop-blur-sm">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#3E251B] px-3 py-2 text-[10px] font-bold uppercase leading-none tracking-wider !text-[#EE9E7D]">
              Hurry! Deals ends in:
            </span>
            {countdownBody}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SectionDealCountdown;
