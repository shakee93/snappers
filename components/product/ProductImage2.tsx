/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { useImage } from "@/context/ImageChangeGrabber";
import { SimpleProduct, VariableProduct } from "@/graphql/types/graphql";
import { getPreferredVariation } from "@/lib/getPreferredVariation";
import { getProductVideoUrl, type ProductVideoSource } from "@/lib/productVideo";
import { siteConfig } from "@/site.config";
import {
  CoreVariationThumb,
  Thumb,
} from "@/components/product/SingleProductBlock/ProductCarouselThumb";
import { EmblaOptionsType } from "embla-carousel";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Expand, PlayIcon } from "lucide-react";
import Image from "next/image";
import React, { useCallback, useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";

const ProductLightbox = dynamic(() => import("./ProductLightbox"), {
  ssr: false,
});
// import "styles/embla.css";
import "styles/product_embla.scss";

type PropType = {
  options?: EmblaOptionsType;
  product: SimpleProduct & VariableProduct & ProductVideoSource;
};
type selectedVariationType = {
  sourceUrl: string;
  databaseId: any;
};

const EmblaCarousel: React.FC<PropType> = ({ product }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [emblaMainRef, emblaMainApi] = useEmblaCarousel({});
  const [emblaThumbsRef, emblaThumbsApi] = useEmblaCarousel({
    containScroll: "trimSnaps",
    align: "start",
  });
  const { variationId, activeVariation } = useImage();
  const [variationImageEnabled, setVariationImageEnabled] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // const [galleryImages, setGalleryImages]  = useState(product.galleryImages?.nodes.length !== 0
  //     ? product.galleryImages?.nodes
  //     : [] || [])

  const isValidVideoUrl = (url?: string): boolean => {
    if (!url) return false;
    try {
      const videoUrl = new URL(url);
      const videoExtensions = ['.mp4', '.webm', '.ogg', '.avi', '.mov'];
      return videoExtensions.some(ext => videoUrl.pathname.toLowerCase().endsWith(ext)) ||
        videoUrl.hostname.includes('youtube.com') ||
        videoUrl.hostname.includes('youtu.be') ||
        videoUrl.hostname.includes('vimeo.com') ||
        videoUrl.hostname.includes('tiktok.com');
    } catch {
      return false;
    }
  };

  const getTikTokEmbedUrl = (url: string): string | null => {
    try {
      const videoUrl = new URL(url);
      if (videoUrl.hostname.includes('tiktok.com')) {
        const videoIdMatch = url.match(/\/video\/(\d+)/);
        if (videoIdMatch && videoIdMatch[1]) {
          return `https://www.tiktok.com/embed/v2/${videoIdMatch[1]}`;
        }
      }
      return null;
    } catch {
      return null;
    }
  };

  const getYouTubeEmbedUrl = (url: string): string | null => {
    try {
      let videoId = null;

      // Handle youtu.be format
      if (url.includes('youtu.be/')) {
        const match = url.match(/youtu\.be\/([^?&]+)/);
        videoId = match ? match[1] : null;
      }
      // Handle youtube.com/watch format
      else if (url.includes('youtube.com/watch')) {
        const urlObj = new URL(url);
        videoId = urlObj.searchParams.get('v');
      }
      // Handle youtube.com/embed format (already embedded)
      else if (url.includes('youtube.com/embed/')) {
        const match = url.match(/embed\/([^?&]+)/);
        videoId = match ? match[1] : null;
      }

      if (videoId) {
        // Add parameters for better experience
        const params = new URLSearchParams({
          controls: "1",
          showinfo: "0",
          rel: "0",
          modestbranding: "1",
          iv_load_policy: "3",
          mute: "1",
          loop: "1",
          playlist: videoId,
          playsinline: "1",
          origin: siteConfig.url.base,
        });

        return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
      }
      return null;
    } catch {
      return null;
    }
  };

  const isTikTokUrl = (url?: string): boolean => {
    if (!url) return false;
    try {
      const videoUrl = new URL(url);
      return videoUrl.hostname.includes('tiktok.com');
    } catch {
      return false;
    }
  };

  const isYouTubeUrl = (url?: string): boolean => {
    if (!url) return false;
    try {
      const videoUrl = new URL(url);
      return videoUrl.hostname.includes('youtube.com') || videoUrl.hostname.includes('youtu.be');
    } catch {
      return false;
    }
  };

  const productVideoUrl = getProductVideoUrl(product);
  const hasValidVideo = isValidVideoUrl(productVideoUrl);
  const videoItem = hasValidVideo ? {
    sourceUrl: productVideoUrl,
    databaseId: 'video',
    altText: 'Product Video',
    isVideo: true
  } : null;

  const originalGalleryImages = product?.galleryImages?.nodes?.length ? product.galleryImages.nodes : [];

  const preferredVariation = getPreferredVariation(product?.variations?.nodes);
  const preferredImage = preferredVariation?.image;

  // If there's a preferred in-stock variation with an image, place it first
  const initialGalleryImages = preferredImage
    ? [preferredImage, ...originalGalleryImages.slice(1)]
    : originalGalleryImages;

  const [galleryImages, setGalleryImages] = useState(initialGalleryImages);


  const variationImages = product.variations?.nodes?.map(
    (variation: any) => variation.image
  ) ?? [product.image];

  const combinedImages = [...variationImages, ...(galleryImages || [])];
  const [selectedVariation, setSelectedVariation] =
    useState<selectedVariationType | null>(preferredImage || combinedImages[0]);


  // combinedImages.forEach((image) => {
  //   if (image?.sourceUrl?.includes("300x300")) {
  //     image.sourceUrl = image?.sourceUrl?.replace("-300x300", "");
  //   }
  // });

  combinedImages.forEach((image) => {
    if (image?.sourceUrl && image.sourceUrl.includes("300x300")) {
      image.sourceUrl = image.sourceUrl.replace("-300x300", "");
    }
  });


  const pauseAllVideos = useCallback(() => {
    // Pause HTML5 video
    if (videoRef.current) {
      videoRef.current.pause();
      setIsVideoPlaying(false);
    }
  }, []);

  useEffect(() => {
    if (variationId === null || variationId === undefined) return;

    const activeVariationImage = variationImages.find(i => i?.databaseId === variationId);

    setGalleryImages(previousImages => {
      if (!previousImages) {
        return initialGalleryImages
      }

      if (activeVariationImage) {
        const newImages = [activeVariationImage, ...originalGalleryImages.slice(1)];
        emblaThumbsApi?.scrollTo(0);
        setSelectedIndex(0);
        emblaMainApi?.scrollTo(0);
        return newImages;
      }
      return previousImages;
    });
  }, [variationId]);

  const onThumbVariationClick = (variationId: string | null = null) => {
    if (!emblaMainApi || !emblaThumbsApi) return;

    setVariationImageEnabled(false);
    if (variationId) {
      const variationIndex = combinedImages.findIndex(
        (image: any) => image.databaseId === parseInt(variationId)
      );
      combinedImages[variationIndex] &&
        setSelectedVariation(combinedImages[variationIndex]);

      if (variationIndex !== -1) {
        emblaMainApi.scrollTo(variationIndex);
      } else {
      }
      return;
    }
    return;
  };

  const onThumbClickCalculated = useCallback(
    (thumbIndex: number | null) => {
      if (!emblaMainApi || !emblaThumbsApi) return;
      setVariationImageEnabled(true);
      setSelectedIndex(thumbIndex as number)
      emblaThumbsApi.scrollTo(thumbIndex as number)
      emblaMainApi.scrollTo(thumbIndex as number);

      // Pause videos when changing slides
      pauseAllVideos();

      return;
    },
    [emblaMainApi, emblaThumbsApi, product, pauseAllVideos]
  );

  const onSelect = useCallback(() => {
    if (!emblaMainApi || !emblaThumbsApi) return;
    const newIndex = emblaMainApi.selectedScrollSnap();
    setCanScrollPrev(emblaMainApi.canScrollPrev());
    setCanScrollNext(emblaMainApi.canScrollNext());
    if (newIndex !== selectedIndex) {
      pauseAllVideos();
      setSelectedIndex(newIndex);
    }
  }, [emblaMainApi, emblaThumbsApi, selectedIndex, pauseAllVideos]);

  useEffect(() => {
    if (!emblaMainApi) return;
    onSelect();
    emblaMainApi.on("select", onSelect);
    emblaMainApi.on("reInit", onSelect);

    const rootNode = emblaMainApi.rootNode();
    const onPointerDown = () => rootNode.classList.add("is-dragging");
    const onPointerUp = () => rootNode.classList.remove("is-dragging");
    emblaMainApi.on("pointerDown", onPointerDown);
    emblaMainApi.on("pointerUp", onPointerUp);

    return () => {
      emblaMainApi.off("select", onSelect);
      emblaMainApi.off("reInit", onSelect);
      emblaMainApi.off("pointerDown", onPointerDown);
      emblaMainApi.off("pointerUp", onPointerUp);
    };
  }, [emblaMainApi, onSelect]);

  return (
    <div className="embla w-full" id='product-image'>
      <div className="relative">
        <div
          className="embla__viewport rounded-2xl border border-[#0000001A] bg-white"
          ref={emblaMainRef}
        >
          <div className="embla__container ">
            {galleryImages?.map((variation: any, index: number) => (
              <div
                className="embla__slide"
                key={index}
                onClick={() => {
                  setLightboxIndex(index);
                  setLightboxOpen(true);
                }}
              >
                <div className="relative aspect-square w-full overflow-hidden">
                  <Image
                    fetchPriority={index === 0 ? "high" : undefined}
                    loading={index === 0 ? "eager" : "lazy"}
                    className="image h-full w-full object-cover transition-transform duration-300"
                    alt=""
                    width={1000}
                    height={1000}
                    src={variation?.sourceUrl || ""}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <button
          onClick={() => {
            setLightboxIndex(selectedIndex);
            setLightboxOpen(true);
          }}
          className="absolute top-3 left-3 z-10 bg-white/80 hover:bg-white rounded-lg p-2 shadow-md transition-colors"
          aria-label="View fullscreen"
        >
          <Expand className="w-5 h-5 text-gray-700" />
        </button>
        {canScrollPrev && (
          <button
            onClick={() => emblaMainApi?.scrollPrev()}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-colors"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
        )}
        {canScrollNext && (
          <button
            onClick={() => emblaMainApi?.scrollNext()}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-colors"
            aria-label="Next image"
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>
        )}
      </div>

      <div className="embla-thumbs">
        <div className="embla-thumbs__viewport " ref={emblaThumbsRef}>
          <div className="embla-thumbs__container" >
            {/* Gallery Image Thumbnails */}
            {galleryImages?.map((variation: any, index: number) => (
              <Thumb
                onClick={() => onThumbClickCalculated(index)}
                selected={index === selectedIndex}
                index={index}
                imgSrc={variation?.sourceUrl || ""}
                key={index}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Product Video Section - Below Thumbnails */}
      {hasValidVideo && productVideoUrl && (
        <div className="mt-4 border-t border-[#E8E8E8] pt-4 md:mt-8 md:pt-8">
          {isTikTokUrl(productVideoUrl) ? (
            <div className="relative h-0 w-full overflow-hidden rounded-2xl bg-black pb-[56.25%]">
              <iframe
                src={getTikTokEmbedUrl(productVideoUrl) || productVideoUrl}
                className="absolute inset-0 h-full w-full border-0"
                allowFullScreen
                scrolling="no"
                allow="encrypted-media;"
                title="TikTok video"
              />
            </div>
          ) : isYouTubeUrl(productVideoUrl) ? (
            <div className="relative h-0 w-full overflow-hidden rounded-2xl bg-black pb-[56.25%]">
              <iframe
                src={getYouTubeEmbedUrl(productVideoUrl) ?? productVideoUrl}
                className="absolute inset-0 h-full w-full border-0"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                title="YouTube video player"
              />
            </div>
          ) : (
            <div className="relative h-0 w-full overflow-hidden rounded-2xl bg-black pb-[56.25%]">
              <video
                ref={videoRef}
                className="absolute inset-0 h-full w-full object-cover"
                controls={isVideoPlaying}
                poster={originalGalleryImages?.[0]?.sourceUrl || product.image?.sourceUrl || undefined}
                preload="metadata"
                onPlay={() => setIsVideoPlaying(true)}
                onPause={() => setIsVideoPlaying(false)}
                onEnded={() => setIsVideoPlaying(false)}
              >
                <source src={productVideoUrl} type="video/mp4" />
                <p>Your browser does not support the video tag.</p>
              </video>
              {!isVideoPlaying && (
                <div
                  className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/30 transition-all duration-300 hover:bg-black/40"
                  onClick={() => {
                    if (videoRef.current) {
                      videoRef.current.play();
                      setIsVideoPlaying(true);
                    }
                  }}
                >
                  <div className="rounded-[2rem] bg-white/90 p-4 shadow-2xl transition-all duration-300 group-hover:scale-110 md:p-6">
                    <PlayIcon className="ml-1 h-12 w-12 text-primary-500 md:h-16 md:w-16" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {lightboxOpen && galleryImages && (
        <ProductLightbox
          images={galleryImages}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
};

export default EmblaCarousel;
