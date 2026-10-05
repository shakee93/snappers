"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getYoutubeEmbedUrl } from "@/lib/youtube";

export interface HowToOrderVideoProps {
  videoId: string;
  title: string;
}

const HowToOrderVideo = ({ videoId, title }: HowToOrderVideoProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  const embedUrl = useMemo(
    () => getYoutubeEmbedUrl(videoId, { autoplay: true }),
    [videoId],
  );

  const thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.45, rootMargin: "0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  if (!embedUrl) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden rounded-2xl bg-[#2B2B2B] shadow-sm"
    >
      <div className="relative h-0 w-full pb-[56.25%]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={thumbnailUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <iframe
          src={isInView ? embedUrl : "about:blank"}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className={`absolute inset-0 h-full w-full border-0 transition-opacity ${
            isInView ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        />
      </div>
    </div>
  );
};

export default HowToOrderVideo;
