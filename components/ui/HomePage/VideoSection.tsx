"use client";
import React, { useState, useRef } from "react";

interface VideoSectionProps {
  videoUrl: string;
  tiktokLink: string;
  productLink: string;
}

const VideoSection = ({
  videoUrl,
  tiktokLink,
  productLink,
}: VideoSectionProps) => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Video control handlers
  const handleVideoMouseEnter = (e: React.MouseEvent<HTMLVideoElement>) => {
    if (videoRef.current) {
      // Ensure video is loaded and ready to play
      if (videoRef.current.readyState >= 2) {
        videoRef.current
          .play()
          .then(() => {
            setIsVideoPlaying(true);
          })
          .catch((error) => {
            // console.log("Video play failed:", error);
          });
      } else {
        // If video isn't ready, wait for it to load
        videoRef.current.addEventListener(
          "canplay",
          () => {
            videoRef.current
              ?.play()
              .then(() => {
                setIsVideoPlaying(true);
              })
              .catch((error) => {
                // console.log("Video play failed:", error);
              });
          },
          { once: true }
        );
      }
    }
  };

  const handleVideoMouseLeave = (e: React.MouseEvent<HTMLVideoElement>) => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsVideoPlaying(false);
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
        setIsVideoPlaying(false);
      } else {
        videoRef.current.play();
        setIsVideoPlaying(true);
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isVideoMuted;
      setIsVideoMuted(!isVideoMuted);
    }
  };

  const openVideoLink = () => {
    // Pause the video when opening the link
    if (videoRef.current) {
      videoRef.current.pause();
      setIsVideoPlaying(false);
    }

    if (tiktokLink) {
      window.open(tiktokLink, "_blank");
    }
  };

  if (!videoUrl) return null;

  return (
    <div className="w-1/5 hidden lg:block flex-shrink-0 h-full rounded-[18px] overflow-hidden relative bg-black">
      <div className="w-full h-full relative">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-cover cursor-pointer"
          onMouseEnter={handleVideoMouseEnter}
          onMouseLeave={handleVideoMouseLeave}
          onClick={togglePlayPause}
          onTouchEnd={togglePlayPause}
          muted
          loop
          preload="metadata"
        >
          Your browser does not support the video tag.
        </video>

        {/* Video Controls */}
        <div className="absolute bottom-3 left-3 flex space-x-2">
          {/* Play/Pause Button */}
          <button
            onClick={togglePlayPause}
            className="w-8 h-8 bg-black bg-opacity-50 rounded-full flex items-center justify-center text-white hover:bg-opacity-70 transition-all duration-200"
            aria-label={isVideoPlaying ? "Pause video" : "Play video"}
          >
            {isVideoPlaying ? (
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* Mute/Unmute Button */}
          <button
            onClick={toggleMute}
            className="w-8 h-8 bg-black bg-opacity-50 rounded-full flex items-center justify-center text-white hover:bg-opacity-70 transition-all duration-200"
            aria-label={isVideoMuted ? "Unmute video" : "Mute video"}
          >
            {isVideoMuted ? (
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
              </svg>
            )}
          </button>

          {/* Link Button */}
          <button
            onClick={openVideoLink}
            className="w-8 h-8 bg-black bg-opacity-50 rounded-full flex items-center justify-center text-white hover:bg-opacity-70 transition-all duration-200"
            aria-label="Open video in new tab"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z" />
            </svg>
          </button>
 
          {/* Product Link Button */}
          {productLink && (
            <button
              onClick={() => window.open(productLink, "_blank")}
              className=" bg-primaryColor rounded-full text-xs px-4 flex items-center justify-center text-white hover:bg-blue-700 transition-all duration-200"
              aria-label="View product"
              title="View product"
            >
              Buy Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoSection;
