"use client";

import { useRef, useState } from "react";
import { PlayIcon } from "lucide-react";
import { SimpleProduct, VariableProduct } from "@/graphql/types/graphql";
import { getProductVideoUrl, type ProductVideoSource } from "@/lib/productVideo";
import { getYoutubeVideoId } from "@/lib/youtube";
import { siteConfig } from "@/site.config";
import { pdpRadius } from "@/components/product/pdpStyles";

type ProductVideoProps = {
  product: SimpleProduct & VariableProduct & ProductVideoSource;
  className?: string;
};

const isValidVideoUrl = (url?: string): boolean => {
  if (!url) return false;
  try {
    const videoUrl = new URL(url);
    const videoExtensions = [".mp4", ".webm", ".ogg", ".avi", ".mov"];
    return (
      videoExtensions.some((ext) =>
        videoUrl.pathname.toLowerCase().endsWith(ext),
      ) ||
      videoUrl.hostname.includes("youtube.com") ||
      videoUrl.hostname.includes("youtu.be") ||
      videoUrl.hostname.includes("vimeo.com") ||
      videoUrl.hostname.includes("tiktok.com")
    );
  } catch {
    return false;
  }
};

const getTikTokEmbedUrl = (url: string): string | null => {
  try {
    const videoUrl = new URL(url);
    if (videoUrl.hostname.includes("tiktok.com")) {
      const videoIdMatch = url.match(/\/video\/(\d+)/);
      if (videoIdMatch?.[1]) {
        return `https://www.tiktok.com/embed/v2/${videoIdMatch[1]}`;
      }
    }
    return null;
  } catch {
    return null;
  }
};

const getYouTubeEmbedUrl = (url: string): string | null => {
  const videoId = getYoutubeVideoId(url);
  if (!videoId) return null;

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
};

const isTikTokUrl = (url?: string): boolean => {
  if (!url) return false;
  try {
    return new URL(url).hostname.includes("tiktok.com");
  } catch {
    return false;
  }
};

const isYouTubeUrl = (url?: string): boolean => {
  if (!url) return false;
  try {
    const videoUrl = new URL(url);
    return (
      videoUrl.hostname.includes("youtube.com") ||
      videoUrl.hostname.includes("youtu.be")
    );
  } catch {
    return false;
  }
};

const ProductVideo = ({ product, className = "" }: ProductVideoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const productVideoUrl = getProductVideoUrl(product);
  const hasValidVideo = isValidVideoUrl(productVideoUrl);

  if (!hasValidVideo || !productVideoUrl) {
    return null;
  }

  const posterUrl =
    product.galleryImages?.nodes?.[0]?.sourceUrl ||
    product.image?.sourceUrl ||
    undefined;

  return (
    <div className={className}>
      {isTikTokUrl(productVideoUrl) ? (
        <div className={`relative h-0 w-full overflow-hidden bg-black pb-[56.25%] ${pdpRadius}`}>
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
        <div className={`relative h-0 w-full overflow-hidden bg-black pb-[56.25%] ${pdpRadius}`}>
          <iframe
            src={getYouTubeEmbedUrl(productVideoUrl) ?? productVideoUrl}
            className="absolute inset-0 h-full w-full border-0"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            title="YouTube video player"
          />
        </div>
      ) : (
        <div className={`relative h-0 w-full overflow-hidden bg-black pb-[56.25%] ${pdpRadius}`}>
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover"
            controls={isVideoPlaying}
            poster={posterUrl}
            preload="metadata"
            onPlay={() => setIsVideoPlaying(true)}
            onPause={() => setIsVideoPlaying(false)}
            onEnded={() => setIsVideoPlaying(false)}
          >
            <source src={productVideoUrl} type="video/mp4" />
            <p>Your browser does not support the video tag.</p>
          </video>
          {!isVideoPlaying && (
            <button
              type="button"
              className="absolute inset-0 flex cursor-pointer items-center justify-center border-0 bg-black/30 p-0 transition-all duration-300 hover:bg-black/40"
              onClick={() => {
                videoRef.current?.play();
                setIsVideoPlaying(true);
              }}
              aria-label="Play product video"
            >
              <span className="rounded-[2rem] bg-white/90 p-4 shadow-2xl md:p-6">
                <PlayIcon className="ml-1 h-12 w-12 text-primary-500 md:h-16 md:w-16" />
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductVideo;
