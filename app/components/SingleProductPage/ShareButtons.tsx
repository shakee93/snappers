"use client";

import { useState, useCallback } from "react";
import { FaFacebookF, FaWhatsapp } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { Share2, Check } from "lucide-react";
import { siteConfig } from "@/site.config";

type ShareButtonsProps = {
  url: string;
  title: string;
  text?: string;
  className?: string;
};

const shareLinks = {
  facebook: (url: string) =>
    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  twitter: (url: string, text: string) =>
    `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
  whatsapp: (url: string, text: string) =>
    `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
};

export default function ShareButtons({
  url,
  title,
  text = "",
  className = "",
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const shareText = text || `Check out ${title} at ${siteConfig.brand.name}!`;

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [url]);

  const buttonClass =
    "flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2";

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <a
        href={shareLinks.facebook(url)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on Facebook"
        className={`${buttonClass} bg-[#1877f2] text-white hover:bg-[#166fe5] focus:ring-[#1877f2]`}
      >
        <FaFacebookF className="h-4 w-4" />
      </a>
      <a
        href={shareLinks.twitter(url, shareText)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on X (Twitter)"
        className={`${buttonClass} bg-black text-white hover:bg-gray-800 focus:ring-gray-600`}
      >
        <FaXTwitter className="h-4 w-4" />
      </a>
      <a
        href={shareLinks.whatsapp(url, shareText)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on WhatsApp"
        className={`${buttonClass} bg-[#25d366] text-white hover:bg-[#20bd5a] focus:ring-[#25d366]`}
      >
        <FaWhatsapp className="h-5 w-5" />
      </a>
      <button
        type="button"
        onClick={handleCopyLink}
        aria-label={copied ? "Link copied!" : "Copy link"}
        className={`${buttonClass} bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-400`}
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-600" />
        ) : (
          <Share2 className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}
