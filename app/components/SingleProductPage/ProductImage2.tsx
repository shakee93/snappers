/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import ImageEffect from "@/components/ImageMagnifier";
import { useImage } from "@/context/ImageChangeGrabber";
import { SimpleProduct, VariableProduct } from "@/graphql/types/graphql";
import {
  CoreVariationThumb,
  Thumb,
} from "app/components/SingleProductBlock/ProductCarouselThumb";
import { EmblaOptionsType } from "embla-carousel";
import useEmblaCarousel from "embla-carousel-react";
import { PlayIcon } from "lucide-react";
import Image from "next/image";
import React, { useCallback, useEffect, useState, useRef } from "react";
// import "styles/embla.css";
import "styles/product_embla.scss";

type PropType = {
  options?: EmblaOptionsType;
  product: SimpleProduct & VariableProduct & { productVideoUrl?: string };
};
type selectedVariationType = {
  sourceUrl: string;
  databaseId: any;
};

const EmblaCarousel: React.FC<PropType> = ({ product }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [emblaMainRef, emblaMainApi] = useEmblaCarousel({});
  const [emblaThumbsRef, emblaThumbsApi] = useEmblaCarousel({
    containScroll: 'keepSnaps',
    dragFree: true,
    align: "center"
  });
  const { variationId, activeVariation } = useImage();
  const [variationImageEnabled, setVariationImageEnabled] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasUserInteracted = useRef(false);
  const initialVariationId = useRef(variationId);

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
          controls: '1',          // Show native controls
          showinfo: '0',          // No title/uploader info
          rel: '0',               // No related videos at end
          modestbranding: '1',    // Minimal YouTube branding
          iv_load_policy: '3',    // No annotations
          mute: '1',              // Muted by default
          loop: '1',              // Loop video (prevents end screen)
          playlist: videoId,      // Required for loop to work
          playsinline: '1',       // Play inline on mobile
        });
        
        if (typeof window !== 'undefined') {
          params.append('origin', window.location.origin);
        }
        
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

  const hasValidVideo = isValidVideoUrl(product.productVideoUrl);
  const videoItem = hasValidVideo ? {
    sourceUrl: product.productVideoUrl,
    databaseId: 'video',
    altText: 'Product Video',
    isVideo: true
  } : null;

  const originalGalleryImages = product?.galleryImages?.nodes?.length ? product.galleryImages.nodes : [];
  const initialGalleryImages = videoItem ? [videoItem, ...originalGalleryImages] : originalGalleryImages;
  
  const [galleryImages, setGalleryImages] = useState(initialGalleryImages);


  const variationImages = product.variations?.nodes?.map(
    (variation: any) => variation.image
  ) ?? [product.image];

  const combinedImages = [...variationImages, ...(galleryImages || [])];
  const [selectedVariation, setSelectedVariation] =
    useState<selectedVariationType | null>(combinedImages[0]);


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
    // If variation changed from initial, mark as user interaction
    if (variationId !== initialVariationId.current) {
      hasUserInteracted.current = true;
    }

    const activeVariationImage = variationImages.find(i => i.databaseId === variationId);

    setGalleryImages(previousImages => {
      if (!previousImages) {
        return initialGalleryImages
      }

      // Only check for user interaction if there's a video
      // Otherwise, allow normal variation scrolling
      const shouldPreventScroll = hasValidVideo && !hasUserInteracted.current;

      if (activeVariationImage && !shouldPreventScroll) {
        const videoOffset = hasValidVideo ? 1 : 0;
        const newFirstIndex = videoOffset;
        
        if (hasValidVideo) {
          const newImages = [videoItem, activeVariationImage, ...originalGalleryImages.slice(1)];
          emblaThumbsApi?.scrollTo(newFirstIndex);
          setSelectedIndex(newFirstIndex);
          emblaMainApi?.scrollTo(newFirstIndex);
          return newImages;
        } else {
          const newImages = [activeVariationImage, ...originalGalleryImages.slice(1)];
          emblaThumbsApi?.scrollTo(0);
          setSelectedIndex(0);
          emblaMainApi?.scrollTo(0);
          return newImages;
        }
      }
      return previousImages;
    });
  }, [variationId]);

  const onThumbVariationClick = (variationId: string | null = null) => {
    if (!emblaMainApi || !emblaThumbsApi) return;

    hasUserInteracted.current = true;
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
      hasUserInteracted.current = true;
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
    if (newIndex !== selectedIndex) {
      hasUserInteracted.current = true;
      pauseAllVideos();
      setSelectedIndex(newIndex);
    }
  }, [emblaMainApi, emblaThumbsApi, selectedIndex, pauseAllVideos]);

  useEffect(() => {
    if (!emblaMainApi) return;
    onSelect();
    emblaMainApi.on("select", onSelect);
    emblaMainApi.on("reInit", onSelect);
  }, [emblaMainApi, onSelect]);

  return (
    <div className="embla min-h-[272px] md:min-h-[576px]" id='product-image'>
      <div className="embla__viewport  rounded-2xl" ref={emblaMainRef}>
        <div className="embla__container ">
          {galleryImages?.map((variation: any, index: number) => (
            <div className="embla__slide" key={index}>
              {variation.isVideo ? (
                isTikTokUrl(variation.sourceUrl) ? (
                  <div className="relative max-h-[330px] md:max-h-[410px] w-full rounded-2xl overflow-hidden bg-black flex items-center justify-center min-h-[330px] md:min-h-[410px]">
                    <iframe
                      src={getTikTokEmbedUrl(variation.sourceUrl) || variation.sourceUrl}
                      className="w-full h-[330px] md:h-[410px] rounded-xl"
                      allowFullScreen
                      scrolling="no"
                      allow="encrypted-media;"
                    />
                  </div>
                ) : isYouTubeUrl(variation.sourceUrl) ? (
                  <div className="relative max-h-[330px] md:max-h-[410px] w-full rounded-2xl overflow-hidden bg-black flex items-center justify-center min-h-[330px] md:min-h-[410px]">
                    <iframe
                      src={getYouTubeEmbedUrl(variation.sourceUrl) || variation.sourceUrl}
                      className="w-full h-[330px] md:h-[410px] rounded-xl"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      title="YouTube video player"
                    />
                  </div>
                ) : (
                  <div className="relative max-h-[330px] md:max-h-[410px] w-full rounded-2xl overflow-hidden bg-black flex items-center justify-center min-h-[330px] md:min-h-[410px]">
                    <video 
                      ref={videoRef}
                      className="max-w-full max-h-full object-contain rounded-xl"
                      controls={isVideoPlaying}
                      poster={originalGalleryImages?.[0]?.sourceUrl || product.image?.sourceUrl || undefined}
                      preload="metadata"
                      onPlay={() => setIsVideoPlaying(true)}
                      onPause={() => setIsVideoPlaying(false)}
                      onEnded={() => setIsVideoPlaying(false)}
                    >
                      <source src={variation.sourceUrl} type="video/mp4" />
                      <p>Your browser does not support the video tag.</p>
                    </video>
                    {!isVideoPlaying && (
                      <div 
                        className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 cursor-pointer group hover:bg-opacity-40 transition-all duration-300"
                        onClick={() => {
                          if (videoRef.current) {
                            videoRef.current.play();
                            setIsVideoPlaying(true);
                          }
                        }}
                      >
                        <div className="bg-white bg-opacity-90 rounded-[2rem] p-4 md:p-6 shadow-2xl group-hover:bg-opacity-100 group-hover:scale-110 transition-all duration-300">
                          <PlayIcon className="w-12 h-12 md:w-16 md:h-16 text-primaryColor ml-1" />
                        </div>
                      </div>
                    )}
                  </div>
                )
              ) : (
                <ImageEffect
                  index={index}
                  src={variation?.sourceUrl || ""}
                  classNames="max-h-[330px] object-contain md:max-h-[410px] image transform transition-transform duration-300"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="embla-thumbs">
        <div className="embla-thumbs__viewport " ref={emblaThumbsRef}>
          <div className="embla-thumbs__container" >
            {/* Gallery Image */}
            {galleryImages?.map((variation: any, index: number) => (
              variation.isVideo ? (
                <div
                  key={index}
                  className={'embla-thumbs__slide relative '.concat(
                    index === selectedIndex ? ' embla-thumbs__slide--selected' : ''
                  )}
                >
                  <button
                    onClick={() => onThumbClickCalculated(index)}
                    className="embla-thumbs__slide__button flex items-center relative w-full"
                    type="button"
                  >
                    <Image
                      className="embla-thumbs__slide__img object-contain max-h-[75px] min-h-[75px] md:max-h-[100px] md:min-h-[100px] min-w-[75px] md:max-w-[100px] md:min-w-[100px] rounded-lg"
                      src={originalGalleryImages?.[0]?.sourceUrl || product.image?.sourceUrl || '/images/placeholder-small.png'}
                      width={100}
                      height={100}
                      alt="Video thumbnail"
                    />
                    <div className="absolute inset-0 max-h-[75px] min-h-[75px] md:max-h-[100px] md:min-h-[100px] min-w-[75px] md:max-w-[100px] md:min-w-[100px] bg-black bg-opacity-30 flex items-center justify-center rounded-lg">
                      <div className="bg-white bg-opacity-90 rounded-full p-1.5">
                        <PlayIcon className="w-4 h-4 text-black" />
                      </div>
                    </div>
                  </button>
                </div>
              ) : (
                <Thumb
                  onClick={() => onThumbClickCalculated(index)}
                  selected={index === selectedIndex}
                  index={index}
                  imgSrc={variation?.sourceUrl || ""}
                  key={index}
                />
              )
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmblaCarousel;
