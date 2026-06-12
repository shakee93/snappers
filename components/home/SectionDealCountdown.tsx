"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export interface SectionDealCountdownProps {
  className?: string;
  /** Banner artwork (includes the cat & dog). */
  backgroundImage?: string;
  /** Deal end time as an ISO string. */
  endsAt?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
}

const pad = (n: number) => n.toString().padStart(2, "0");

const PLACEHOLDER_TIME: TimeLeft = { days: 0, hours: 0, minutes: 0 };

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
  endsAt,
}: SectionDealCountdownProps) => {
  // Countdown values depend on Date.now() — only compute after mount so SSR
  // and the first client render match (avoids hydration mismatch).
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(PLACEHOLDER_TIME);

  useEffect(() => {
    const target = endsAt
      ? new Date(endsAt).getTime()
      : Date.now() + 1000 * 60 * 60 * 24 * 2;

    const tick = () => setTimeLeft(getTimeLeft(target));
    tick();

    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [endsAt]);

  const units = [
    { label: "Days", value: timeLeft.days },
    { label: "Hrs", value: timeLeft.hours },
    { label: "Mins", value: timeLeft.minutes },
  ];

  return (
    <section className={`mx-auto w-full max-w-[1368px] px-3 lg:px-0 mt-[-50px] ${className}`}>
      <div className="relative w-full overflow-hidden rounded-[28px]">
        <Image
          src={backgroundImage}
          alt=""
          width={1368}
          height={386}
          aria-hidden
          className="h-auto w-full object-cover"
        />

        {/* Centered title + countdown overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-end gap-5 px-4 pb-8 sm:pb-12">
          <div className="relative">
            <Image
              src="/homepage/lines.png"
              alt=""
              width={28}
              height={28}
              aria-hidden
              className="absolute -left-7 -top-5 h-5 w-5 sm:-left-4 sm:h-7 sm:w-7"
            />
            <h2 className="text-3xl font-albra font-bold text-[#092412] md:text-6xl">
              Deals for your <span className="text-[#E79A72]">pet</span>
            </h2>
            <Image
              src="/homepage/bone.png"
              alt=""
              width={40}
              height={34}
              aria-hidden
              className="absolute -right-9 -top-4 h-6 w-7 sm:-right-11 sm:h-8 sm:w-10"
            />
          </div>

          <div className="relative rounded-2xl border border-[#E7D9C7] bg-white/70 px-5 pb-3 pt-5 backdrop-blur-sm sm:px-7">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[#3E251B] px-3 py-0 text-[10px] font-bold uppercase tracking-wider text-[#EE9E7D]">
              Hurry! Deals ends in:
            </span>

            <div className="flex items-center">
              {units.map((unit, index) => (
                <div key={unit.label} className="flex items-center">
                  {index > 0 && (
                    <span className="mx-3 h-10 w-px bg-[#E7D9C7] sm:mx-4" aria-hidden />
                  )}
                  <div className="flex flex-col items-center">
                    <span className="text-3xl font-bold tabular-nums text-[#3E251B] sm:text-4xl">
                      {pad(unit.value)}
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#EE9E7D] sm:text-xs">
                      {unit.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SectionDealCountdown;
