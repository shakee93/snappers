import Link from "next/link";
import { ArrowRight } from "lucide-react";
import howToOrderContent from "@/content/how-to-order.json";
import HowToOrderVideo from "@/components/home/HowToOrderVideo";
import { getYoutubeVideoId } from "@/lib/youtube";

export interface SectionHowToOrderProps {
  className?: string;
  /** WP Homepage ACF `videoUrlOfHowToOrderSection` (full URL or video id). */
  youtubeVideoUrl?: string | null;
}

const SectionHowToOrder = ({
  className = "",
  youtubeVideoUrl,
}: SectionHowToOrderProps) => {
  const { eyebrow, title, description, ctaLabel, ctaHref, youtubeVideoId } =
    howToOrderContent as {
      eyebrow: string;
      title: string;
      description: string;
      ctaLabel: string;
      ctaHref: string;
      youtubeVideoId: string;
    };

  const videoId = getYoutubeVideoId(
    youtubeVideoUrl?.trim() || youtubeVideoId,
  );

  return (
    <section
      className={`w-full bg-[#F5F5F5] px-3 py-12 md:py-16 lg:px-0 ${className}`}
    >
      <div className="mx-auto grid w-full max-w-[1368px] grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-14">
        <div className="min-w-0">
          {videoId ? (
            <HowToOrderVideo videoId={videoId} title={title} />
          ) : (
            <div className="relative w-full overflow-hidden rounded-2xl bg-[#2B2B2B] shadow-sm">
              <div className="relative h-0 w-full pb-[56.25%]">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="flex h-12 w-[4.25rem] items-center justify-center rounded-xl bg-[#FF0000] shadow-md md:h-14 md:w-20">
                    <svg
                      viewBox="0 0 24 24"
                      className="ml-0.5 h-5 w-5 fill-white md:h-6 md:w-6"
                      aria-hidden
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col items-start justify-center lg:px-2">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500 md:text-sm">
            {eyebrow}
          </p>
          <h2 className="mt-2 font-albra text-4xl font-bold leading-tight text-[#092412] md:text-5xl lg:text-6xl">
            {title}
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-neutral-600 md:text-base">
            {description}
          </p>
          <Link
            href={ctaHref}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-header-action px-8 py-3.5 text-sm font-bold text-header-green transition-opacity hover:opacity-90 md:mt-8 md:text-base"
          >
            {ctaLabel}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default SectionHowToOrder;
