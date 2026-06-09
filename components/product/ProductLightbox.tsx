"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { createPortal } from "react-dom";

interface ProductLightboxProps {
  images: any[];
  initialIndex: number;
  onClose: () => void;
}

const ProductLightbox: React.FC<ProductLightboxProps> = ({
  images,
  initialIndex,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    startIndex: initialIndex,
    loop: false,
  });
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<Element | null>(null);
  const isDraggingRef = useRef(false);

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCurrentIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);

    const onPointerDown = () => { isDraggingRef.current = false; };
    const onPointerUp = () => { /* reset after click event fires */ };
    emblaApi.on("pointerDown", onPointerDown);
    emblaApi.on("pointerUp", onPointerUp);

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
      emblaApi.off("pointerDown", onPointerDown);
      emblaApi.off("pointerUp", onPointerUp);
    };
  }, [emblaApi, onSelect]);

  // Focus management + keyboard navigation + body scroll lock
  useEffect(() => {
    previouslyFocusedRef.current = document.activeElement;
    dialogRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") emblaApi?.scrollPrev();
      if (e.key === "ArrowRight") emblaApi?.scrollNext();

      // Trap focus within the dialog
      if (e.key === "Tab") {
        const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
          'button, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable || focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      if (previouslyFocusedRef.current instanceof HTMLElement) {
        previouslyFocusedRef.current.focus();
      }
    };
  }, [emblaApi, onClose]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      // Only close if clicking directly on the backdrop, not on children
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Product image gallery, showing image ${currentIndex + 1} of ${images.length}`}
      tabIndex={-1}
      className="fixed inset-0 z-[9999] bg-black/90 flex flex-col outline-none h-[100dvh] w-[100dvw]"
      onClick={handleBackdropClick}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 sm:p-4 flex-shrink-0">
        <span
          className="text-white/80 text-sm bg-black/40 px-3 py-1.5 rounded-full"
          aria-live="polite"
        >
          {currentIndex + 1} / {images.length}
        </span>
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white bg-black/40 hover:bg-black/60 rounded-full p-2 transition-colors"
          aria-label="Close gallery"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Carousel */}
      <div
        className="flex-1 flex items-center justify-center min-h-0 relative px-10 sm:px-14 md:px-16"
        onClick={handleBackdropClick}
      >
        {/* Prev button */}
        {canScrollPrev && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              scrollPrev();
            }}
            className="absolute left-1 sm:left-2 md:left-4 z-10 bg-white/90 hover:bg-white rounded-full p-1.5 sm:p-2 md:p-3 shadow-lg transition-colors"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-gray-800" />
          </button>
        )}

        <div
          className="overflow-hidden w-full h-full cursor-grab active:cursor-grabbing"
          ref={emblaRef}
        >
          <div className="flex h-full touch-pan-y">
            {images.map((image, index) => (
              <div
                key={index}
                className="flex-[0_0_100%] min-w-0 flex items-center justify-center px-2"
              >
                <Image
                  src={image.sourceUrl}
                  alt={image.altText || `Product image ${index + 1}`}
                  width={1200}
                  height={1200}
                  className="max-h-[calc(100dvh-100px)] w-auto max-w-full object-contain select-none"
                  draggable={false}
                  priority={Math.abs(index - initialIndex) <= 1}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Next button */}
        {canScrollNext && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              scrollNext();
            }}
            className="absolute right-1 sm:right-2 md:right-4 z-10 bg-white/90 hover:bg-white rounded-full p-1.5 sm:p-2 md:p-3 shadow-lg transition-colors"
            aria-label="Next image"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-gray-800" />
          </button>
        )}
      </div>
    </div>,
    document.body
  );
};

export default ProductLightbox;
