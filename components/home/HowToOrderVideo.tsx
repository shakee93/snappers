"use client";

import { useMemo, useState } from "react";
import { getYoutubeEmbedUrl } from "@/lib/youtube";

export interface HowToOrderVideoProps {
  videoId: string;
  title: string;
}

const HowToOrderVideo = ({ videoId, title }: HowToOrderVideoProps) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const embedUrl = useMemo(
    () => getYoutubeEmbedUrl(videoId, { autoplay: true }),
    [videoId],
  );

  const thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

  if (!embedUrl) {
    return null;
  }

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-[#2B2B2B] shadow-sm">
      <div className="relative h-0 w-full pb-[56.25%]">
        {isPlaying ? (
          <iframe
            src={embedUrl}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 h-full w-full border-0"
          />
        ) : (
          <button
            type="button"
            onClick={() => setIsPlaying(true)}
            className="group absolute inset-0 h-full w-full border-0 p-0"
            aria-label={`Play ${title} video`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thumbnailUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
            <span className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors group-hover:bg-black/30">
              <span className="flex h-12 w-[4.25rem] items-center justify-center rounded-xl bg-[#FF0000] shadow-md transition-transform group-hover:scale-105 md:h-14 md:w-20">
                <svg
                  viewBox="0 0 24 24"
                  className="ml-0.5 h-5 w-5 fill-white md:h-6 md:w-6"
                  aria-hidden
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            </span>
          </button>
        )}
      </div>
    </div>
  );
};

export default HowToOrderVideo;
