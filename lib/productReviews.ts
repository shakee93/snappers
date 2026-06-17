export type ReviewImage = {
  sourceUrl?: string | null;
  thumbnailUrl?: string | null;
  isVideo?: boolean | null;
};

export type ProductReviewItem = {
  databaseId: number;
  content?: string | null;
  date?: string | null;
  rating?: number | null;
  author?: { node?: { name?: string | null } | null } | null;
  reviewImages?:
    | (ReviewImage | null)[]
    | { nodes?: (ReviewImage | null)[] | null }
    | null;
};

export type ReviewDisplayImage = {
  sourceUrl: string;
  thumbnailUrl: string;
  altText: string;
};

export function getReviewDisplayImages(
  review: ProductReviewItem,
  authorName = "Customer",
): ReviewDisplayImage[] {
  const raw = review.reviewImages;
  const list: ReviewImage[] = Array.isArray(raw)
    ? raw.filter((image): image is ReviewImage => !!image)
    : raw &&
        typeof raw === "object" &&
        "nodes" in raw &&
        Array.isArray((raw as { nodes?: unknown }).nodes)
      ? ((raw as { nodes: (ReviewImage | null)[] }).nodes ?? []).filter(
          (image): image is ReviewImage => !!image,
        )
      : [];

  return list
    .filter(
      (image) => !image.isVideo && !!(image.thumbnailUrl ?? image.sourceUrl),
    )
    .map((image, index) => ({
      sourceUrl: image.sourceUrl ?? image.thumbnailUrl ?? "",
      thumbnailUrl: image.thumbnailUrl ?? image.sourceUrl ?? "",
      altText: `Photo ${index + 1} from ${authorName}'s review`,
    }));
}

type ProductReviewConnection = {
  edges?: Array<{
    rating?: number | null;
    node?: ProductReviewItem | null;
  } | null> | null;
  nodes?: Array<ProductReviewItem | null> | null;
} | null;

/** Flatten a product reviews connection; prefers edges (includes per-review rating). */
export function flattenProductReviews(
  connection?: ProductReviewConnection,
): ProductReviewItem[] {
  const fromEdges = (connection?.edges ?? [])
    .filter((edge): edge is NonNullable<typeof edge> => !!edge?.node?.databaseId)
    .map((edge) => ({
      ...edge.node!,
      rating: edge.rating ?? edge.node?.rating ?? null,
    }));

  if (fromEdges.length > 0) {
    return fromEdges;
  }

  return (connection?.nodes ?? []).filter(
    (review): review is ProductReviewItem => !!review?.databaseId,
  );
}

/** REST origin of the WordPress backend, derived from the GraphQL endpoint. */
const WP_REST_BASE = new URL(
  process.env.NEXT_PUBLIC_WP_GRAPHQL ?? "https://catlitter-api.freshpixl.com",
).origin;

export type UploadedReviewImage = { id: number; url: string };

/** Max files / size — keep in sync with the backend mu-plugin. */
export const REVIEW_IMAGE_MAX_FILES = 5;
export const REVIEW_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

/**
 * Upload one image/video to the headless CusRev bridge. The file is tagged with
 * the submitter's email + product id; the backend links it to the review when
 * the review comment is created (no separate attach call, no comment id needed).
 */
export async function uploadReviewImage(
  file: File,
  email: string,
  productId: number,
): Promise<UploadedReviewImage> {
  const body = new FormData();
  body.append("cr_file", file);
  body.append("email", email);
  body.append("productId", String(productId));

  const res = await fetch(`${WP_REST_BASE}/wp-json/headless/v1/review-media`, {
    method: "POST",
    body,
  });

  if (!res.ok) {
    const message = await res
      .json()
      .then((data: { message?: string }) => data?.message)
      .catch(() => null);
    throw new Error(message || "Image upload failed.");
  }

  return res.json() as Promise<UploadedReviewImage>;
}

export function stripReviewHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function parseReviewTimestamp(date?: string | null): number {
  if (!date) return 0;
  const normalized = date.includes("T") ? date : date.replace(" ", "T");
  const timestamp = Date.parse(normalized);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

/** Newest-first; undated reviews keep their original relative order at the end. */
export function sortReviewsByDateDesc(reviews: ProductReviewItem[]): ProductReviewItem[] {
  return [...reviews]
    .map((review, index) => ({ review, index }))
    .sort((a, b) => {
      const dateDiff = parseReviewTimestamp(b.review.date) - parseReviewTimestamp(a.review.date);
      return dateDiff !== 0 ? dateDiff : a.index - b.index;
    })
    .map(({ review }) => review);
}

export function reviewHasImages(review: ProductReviewItem): boolean {
  return getReviewDisplayImages(review).length > 0;
}

/** Reviews with photos first, then newest within each group. */
export function sortReviewsImageFirst(reviews: ProductReviewItem[]): ProductReviewItem[] {
  return [...reviews]
    .map((review, index) => ({ review, index }))
    .sort((a, b) => {
      const imageDiff =
        Number(reviewHasImages(b.review)) - Number(reviewHasImages(a.review));
      if (imageDiff !== 0) return imageDiff;

      const dateDiff =
        parseReviewTimestamp(b.review.date) - parseReviewTimestamp(a.review.date);
      return dateDiff !== 0 ? dateDiff : a.index - b.index;
    })
    .map(({ review }) => review);
}

/** First review with visible text, preferring the newest. */
export function getFeaturedReview(reviews: ProductReviewItem[]): ProductReviewItem | null {
  const sorted = sortReviewsByDateDesc(reviews);
  return (
    sorted.find((review) => !!review.content && stripReviewHtml(review.content)) ??
    sorted[0] ??
    null
  );
}

export function formatReviewDate(date: string): string {
  try {
    const normalized = date.includes("T") ? date : date.replace(" ", "T");
    return new Date(normalized).toLocaleDateString("en-LK", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return date;
  }
}
