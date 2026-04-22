"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";

type HappiestCustomersGalleryProps = {
  images?: string[];
};

const INITIAL_VISIBLE_IMAGES = 6;

const HappiestCustomersGallery = ({ images = [] }: HappiestCustomersGalleryProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const normalizedImages = useMemo(
    () =>
      images
        .map((url) => (typeof url === "string" ? url.trim() : ""))
        .filter((url) => Boolean(url)),
    [images]
  );

  if (normalizedImages.length === 0) {
    return null;
  }

  const visibleImages = normalizedImages.slice(0, INITIAL_VISIBLE_IMAGES);

  const openDialogAt = (index: number) => {
    setActiveImageIndex(index);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
  };

  return (
    <section className="mt-6 rounded-3xl bg-white p-4 md:p-6">
      <h2 className="text-xl md:text-2xl font-semibold text-primaryColor text-center">
        Happiest Customers
      </h2>

      <div className="mt-4 flex flex-wrap justify-center gap-3">
        {visibleImages.map((url, index) => (
          <button
            key={`${url}-${index}`}
            type="button"
            onClick={() => openDialogAt(index)}
            className="relative w-[calc(50%-0.375rem)] sm:w-[calc(33.333%-0.5rem)] md:w-[calc(25%-0.5625rem)] lg:w-[calc(16.666%-0.625rem)] aspect-square overflow-hidden rounded-xl border border-gray-200 bg-gray-50"
          >
            <img
              src={url}
              alt={`Happiest customer ${index + 1}`}
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </button>
        ))}
      </div>

      {normalizedImages.length > INITIAL_VISIBLE_IMAGES ? (
        <div className="flex justify-center mt-6">
          <button
            type="button"
            onClick={() => openDialogAt(0)}
            className="inline-flex items-center px-6 py-3 text-sm font-medium text-gray-700 bg-white rounded-full shadow-lg hover:shadow-md transition-all duration-200"
          >
            See more
          </button>
        </div>
      ) : null}

      {isDialogOpen ? (
        <div className="fixed inset-0 z-[1200] bg-black/95 flex flex-col">
          <div className="absolute top-4 right-4 z-[1210]">
            <button
              type="button"
              onClick={closeDialog}
              className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
              aria-label="Close gallery"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 min-h-0 px-4 pt-16 pb-4 md:px-8 md:pt-20">
            <div className="w-full h-full flex items-center justify-center">
              <img
                src={normalizedImages[activeImageIndex]}
                alt={`Happiest customer full view ${activeImageIndex + 1}`}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          </div>

          <div className="px-4 pb-5 md:px-8 md:pb-8">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {normalizedImages.map((url, index) => (
                <button
                  key={`${url}-thumb-${index}`}
                  type="button"
                  onClick={() => setActiveImageIndex(index)}
                  className={`relative shrink-0 w-16 h-16 md:w-20 md:h-20 overflow-hidden rounded-lg border-2 ${
                    index === activeImageIndex
                      ? "border-white"
                      : "border-transparent opacity-80 hover:opacity-100"
                  }`}
                >
                  <img
                    src={url}
                    alt={`Happiest customer thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default HappiestCustomersGallery;
