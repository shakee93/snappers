import { siteConfig } from "@/site.config";

const YOUTUBE_ID_PATTERN = /^[\w-]{11}$/;

export function getYoutubeVideoId(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (YOUTUBE_ID_PATTERN.test(trimmed)) {
    return trimmed;
  }

  const shortMatch = trimmed.match(/youtu\.be\/([^?&/]+)/);
  if (shortMatch?.[1]) {
    return shortMatch[1];
  }

  try {
    const url = new URL(
      trimmed.startsWith("http") ? trimmed : `https://${trimmed}`,
    );

    if (!url.hostname.includes("youtube.com")) {
      return null;
    }

    const watchId = url.searchParams.get("v");
    if (watchId) {
      return watchId;
    }

    const embedMatch = url.pathname.match(/\/embed\/([^/]+)/);
    if (embedMatch?.[1]) {
      return embedMatch[1];
    }
  } catch {
    return null;
  }

  return null;
}

export function getYoutubeEmbedUrl(
  value: string,
  options?: { autoplay?: boolean },
): string | null {
  const videoId = getYoutubeVideoId(value);
  if (!videoId) return null;

  const params = new URLSearchParams({
    rel: "0",
    modestbranding: "1",
    origin: siteConfig.url.base,
  });

  if (options?.autoplay) {
    params.set("autoplay", "1");
  }

  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}
