"use client";

import Script from "next/script";
import { useState, useEffect } from "react";

// TikTok Embed Skeleton Component
function TikTokSkeleton() {
  return (
    <div className="w-full max-w-[780px] mx-auto bg-transparent p-6 animate-pulse">
      {/* Profile Section Skeleton */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="w-16 h-16 bg-gray-300 rounded-full"></div>
        <div className="flex-1">
          <div className="h-6 bg-gray-300 rounded w-32 mb-2"></div>
          <div className="flex space-x-4">
            <div className="h-4 bg-gray-300 rounded w-20"></div>
            <div className="h-4 bg-gray-300 rounded w-24"></div>
            <div className="h-4 bg-gray-300 rounded w-20"></div>
          </div>
        </div>
      </div>

      {/* Video Grid Skeleton */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="aspect-video bg-gray-300 rounded-lg"></div>
        ))}
      </div>

      {/* Footer Skeleton */}
      <div className="flex justify-between items-center">
        <div className="h-4 bg-gray-300 rounded w-16"></div>
        <div className="h-10 bg-gray-300 rounded w-32"></div>
      </div>
    </div>
  );
}

export default function TikTokSection() {
  const [isLoading, setIsLoading] = useState(true);
  const [embedLoaded, setEmbedLoaded] = useState(false);

  useEffect(() => {
    // Check if TikTok embed is loaded
    const checkEmbedLoaded = () => {
      const embedElement = document.querySelector(".tiktok-embed iframe");
      if (embedElement) {
        setEmbedLoaded(true);
        setIsLoading(false);
      }
    };

    // Check immediately and then every 500ms
    checkEmbedLoaded();
    const interval = setInterval(checkEmbedLoaded, 500);

    // Cleanup interval
    return () => clearInterval(interval);
  }, []);

  // Fallback timeout to hide skeleton after 5 seconds
  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 5000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="w-full">
      {isLoading && <TikTokSkeleton />}

      <div className={isLoading ? "hidden" : "block"}>
        <blockquote
          className="tiktok-embed"
          cite="https://www.tiktok.com/@gqmobiles"
          data-unique-id="gqmobiles"
          data-embed-type="creator"
          style={{ maxWidth: 780, minWidth: 288 }}
        >
          <section>
            <a
              target="_blank"
              rel="noreferrer"
              href="https://www.tiktok.com/@gqmobiles?refer=creator_embed"
            >
              @gqmobiles
            </a>
          </section>
        </blockquote>
      </div>

      <Script
        src="https://www.tiktok.com/embed.js"
        strategy="afterInteractive"
        onLoad={() => {
          // Script loaded, but we still need to wait for the actual embed
          setTimeout(() => setIsLoading(false), 1000);
        }}
      />
    </div>
  );
}
