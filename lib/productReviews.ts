export type ReviewImage = {
  sourceUrl?: string | null;
  thumbnailUrl?: string | null;
  isVideo?: boolean | null;
};

export type ProductReviewItem = {
  databaseId: number;
  content?: string | null;
  date?: string | null;
  author?: { node?: { name?: string | null } | null } | null;
  reviewImages?: (ReviewImage | null)[] | null;
};

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
