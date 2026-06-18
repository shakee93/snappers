import Image from "next/image";
import ReviewImageSlider, {
  type ReviewImage as ReviewImageNode,
} from "@/components/home/ReviewImageSlider";
import { cn } from "@/lib/utils";

interface GoogleReviewItem {
  review?: string | null;
  reviewer?: string | null;
  stars?: number | null;
  reviewImages?: { nodes?: (ReviewImageNode | null)[] | null } | null;
}

export interface GoogleReviewsFields {
  reviews?: (GoogleReviewItem | null)[] | null;
}

export interface SectionGoogleReviewsProps {
  className?: string;
  data?: GoogleReviewsFields | null;
  /** Homepage uses a negative top margin so the wave banner bridges sections. */
  disableTopOffset?: boolean;
}

const StarIcon = () => (
  <svg
    viewBox="0 0 20 20"
    aria-hidden
    className="h-5 w-5 shrink-0 text-[#F0810F]"
    fill="currentColor"
  >
    <path d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1.99 5.79L10 14.77l-5.2 2.74.99-5.79-4.21-4.1 5.82-.85L10 1.5z" />
  </svg>
);

const REVIEW_PREVIEW_CHARS = 300;

/** Strip tags + decode the common WP entities so the text can be truncated. */
function reviewPlainText(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, code: string) =>
      String.fromCharCode(parseInt(code, 16))
    )
    .replace(/&#(\d+);/g, (_, code: string) =>
      String.fromCharCode(Number(code))
    )
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function truncateAtWord(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return cut.slice(0, cut.lastIndexOf(" ")).trimEnd();
}

const ReviewCard = ({
  item,
  ariaHidden = false,
}: {
  item: GoogleReviewItem;
  ariaHidden?: boolean;
}) => {
  const images = (item.reviewImages?.nodes ?? []).filter(
    (img): img is ReviewImageNode => !!img?.sourceUrl
  );
  const rating = Math.min(Math.max(item.stars ?? 5, 0), 5);
  const starCount = Math.round(rating);
  const fullText = reviewPlainText(item.review ?? "");
  const previewText = truncateAtWord(fullText, REVIEW_PREVIEW_CHARS);
  const isTruncated = previewText.length < fullText.length;

  return (
    <figure
      aria-hidden={ariaHidden || undefined}
      className={`flex shrink-0 gap-4 rounded-2xl border border-black/5 bg-white p-4 shadow-sm ${
        images.length > 0 ? "w-[440px] sm:w-[600px]" : "w-[320px] sm:w-[400px]"
      }`}
    >
      {images.length > 0 && (
        <div className="w-2/5 shrink-0">
          <ReviewImageSlider
            images={images}
            reviewer={item.reviewer}
            className="h-full min-h-[200px] w-full"
          />
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {fullText && (
          <blockquote className="mb-3 text-sm leading-relaxed text-neutral-800">
            {previewText}
            {isTruncated && "..."}
          </blockquote>
        )}

        <figcaption className="mt-auto flex items-center justify-between gap-3 border-t border-neutral-200 pt-3">
          <span className="truncate text-sm font-bold text-[#092412]">
            {item.reviewer}
          </span>
          <span
            className="flex shrink-0 items-center gap-0 text-sm text-neutral-800"
            aria-label={`${starCount} out of 5 stars`}
          >
            {Array.from({ length: starCount }).map((_, index) => (
              <StarIcon key={index} />
            ))}
          </span>
        </figcaption>
      </div>
    </figure>
  );
};

// Each marquee half needs enough cards to cover the viewport width.
const MIN_CARDS_PER_HALF = 6;

/**
 * "Real stories from happy families" — Google reviews fed by the
 * `googleReviews` ACF options page (see `GET_GOOGLE_REVIEWS`), shown as
 * three infinite marquee rows (left / right / left).
 */
const SectionGoogleReviews = ({
  className = "",
  data,
  disableTopOffset = false,
}: SectionGoogleReviewsProps) => {
  const reviews = (data?.reviews ?? []).filter(
    (r): r is GoogleReviewItem => !!r?.review || !!r?.reviewer
  );

  if (reviews.length === 0) return null;

  // Round-robin the reviews into three rows, then repeat each row's cards
  // until a marquee half is wide enough for a seamless loop.
  const rows: GoogleReviewItem[][] = [[], [], []];
  reviews.forEach((review, index) => {
    rows[index % 3].push(review);
  });

  const marqueeRows = rows
    .filter((row) => row.length > 0)
    .map((row) => {
      const repeats = Math.ceil(MIN_CARDS_PER_HALF / row.length);
      return {
        sourceLength: row.length,
        cards: Array.from({ length: repeats }, () => row).flat(),
      };
    });

  return (
    <section
      className={cn(
        "w-full",
        !disableTopOffset && "-mt-16 md:-mt-24",
        className
      )}
    >
      {/* Full-width banner artwork (transparent WebP, wave edge baked in) */}
      <Image
        src="/homepage/real-story-top.webp"
        alt=""
        width={1728}
        height={618}
        aria-hidden
        className="h-auto w-full object-cover"
      />

      <div className="w-full bg-[#EDF2EE] pb-16 md:pb-24 pt-8">
        <div className="mx-auto flex w-full max-w-[1368px] flex-col items-center px-3 lg:px-0">
          <Image
            src="/homepage/review.png"
            alt="Google Rated 4.9"
            width={516}
            height={147}
            className="h-28 md:h-44 w-auto"
          />
          <h2 className="block font-albra text-3xl font-semibold text-[#092412] md:text-6xl pt-5 text-center">
            Real stories from{" "}
            <span className="font-bold text-[#769F5F]">happy families</span>
          </h2>
        </div>

        <div className="mt-10 flex flex-col gap-4 overflow-hidden md:mt-14">
          {marqueeRows.map((row, rowIndex) => (
            <div key={rowIndex} className="overflow-hidden">
              <div
                className={`flex w-max hover:[animation-play-state:paused] ${
                  rowIndex % 2 === 0
                    ? "animate-marquee-left"
                    : "animate-marquee-right"
                }`}
              >
                {[0, 1].map((half) => (
                  <div
                    key={half}
                    aria-hidden={half === 1}
                    className="flex gap-4 pr-4"
                  >
                    {row.cards.map((item, index) => (
                      <ReviewCard
                        key={`${item.reviewer?.trim() ?? "review"}-${half}-${index}`}
                        item={item}
                        ariaHidden={half === 1 || index >= row.sourceLength}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SectionGoogleReviews;
