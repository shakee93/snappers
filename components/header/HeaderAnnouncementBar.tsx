"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import useInterval from "react-use/lib/useInterval";
import announcementMessages from "@/content/announcement-bar.json";

const SLIDE_INTERVAL = 5000;
/** iOS picker-style ease — snappy deceleration into place */
const SLIDE_TRANSITION = { duration: 0.48, ease: [0.32, 0.72, 0, 1] as const };

/**
 * Thin top announcement strip — cycles messages with an iOS alarm-picker
 * slide: current exits upward, next enters from below.
 */
const HeaderAnnouncementBar = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const message = announcementMessages[activeIndex];

  useInterval(
    () => setActiveIndex((prev) => (prev + 1) % announcementMessages.length),
    announcementMessages.length > 1 ? SLIDE_INTERVAL : null
  );

  if (!message) return null;

  const isKokoIcon = message.icon.includes("koko");

  return (
    <div className="bg-header-green text-white">
      <div className="relative mx-auto h-9 max-w-[100vw] overflow-hidden px-4 sm:h-10 lg:px-6">
        <AnimatePresence initial={false}>
          <motion.div
            key={activeIndex}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={SLIDE_TRANSITION}
            className="absolute inset-0 flex items-center justify-center gap-2 px-4 text-center"
          >
            <Image
              src={message.icon}
              alt=""
              width={isKokoIcon ? 52 : 18}
              height={isKokoIcon ? 20 : 18}
              aria-hidden
              className={
                isKokoIcon
                  ? "h-6 w-auto max-w-[72px] shrink-0 object-contain sm:h-7"
                  : "h-[18px] w-[18px] shrink-0 object-contain"
              }
            />
            <span className="text-[10px] font-medium leading-tight text-white/95 lg:text-xs">
              {message.text}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default HeaderAnnouncementBar;
