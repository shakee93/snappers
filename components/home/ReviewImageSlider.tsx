"use client";

import { useState } from "react";
import Image from "next/image";
import useInterval from "react-use/lib/useInterval";

export interface ReviewImage {
  id?: string | null;
  sourceUrl?: string | null;
  altText?: string | null;
}

export interface ReviewImageSliderProps {
  images: ReviewImage[];
  reviewer?: string | null;
  className?: string;
}

const SLIDE_INTERVAL = 3500;

/** Auto-rotating image slider for a single review card (one image at a time). */
const ReviewImageSlider = ({
  images,
  reviewer,
  className = "aspect-[4/3] w-full",
}: ReviewImageSliderProps) => {
  const [index, setIndex] = useState(0);

  useInterval(
    () => setIndex((i) => (i + 1) % images.length),
    images.length > 1 ? SLIDE_INTERVAL : null
  );

  if (images.length === 0) return null;

  return (
    <div className={`relative overflow-hidden rounded-xl ${className}`}>
      {images.map((img, i) => (
        <Image
          key={img.id ?? i}
          src={img.sourceUrl as string}
          alt={
            img.altText ||
            `Photo from ${reviewer ?? "a customer"}'s review`
          }
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className={`object-cover transition-opacity duration-700 ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {images.length > 1 && (
        <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5">
          {images.map((img, i) => (
            <span
              key={img.id ?? i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === index ? "w-4 bg-white" : "w-1.5 bg-white/60"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewImageSlider;
