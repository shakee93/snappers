"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation } from "@apollo/client";
import { ApolloError } from "@apollo/client";
import Image from "next/image";
import { ImagePlus, Loader, Star, X } from "lucide-react";
import { toast } from "sonner";
import { WRITE_PRODUCT_REVIEW } from "@/graphql/defs/reviews";
import ProductStarRating from "@/components/product/ProductStarRating";
import { useSession } from "@/context/SessionProvider";
import {
  attachReviewMedia,
  formatReviewDate,
  REVIEW_IMAGE_MAX_BYTES,
  REVIEW_IMAGE_MAX_FILES,
  stripReviewHtml,
  uploadReviewImage,
  type ProductReviewItem,
  type UploadedReviewMedia,
} from "@/lib/productReviews";
import { twMerge } from "tailwind-merge";

interface ProductReviewsSectionProps {
  productDatabaseId: number;
  reviews?: ProductReviewItem[] | null;
  averageRating?: number | null;
  reviewCount?: number | null;
}

const ProductReviewsSection = ({
  productDatabaseId,
  reviews = [],
  averageRating,
  reviewCount,
}: ProductReviewsSectionProps) => {
  const { customer } = useSession();
  const isGuest = !customer || customer.id === "guest";

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [writeReview] = useMutation(WRITE_PRODUCT_REVIEW);

  const previews = useMemo(
    () => files.map((file) => ({ name: file.name, url: URL.createObjectURL(file) })),
    [files],
  );

  // Release the object URLs when the selection changes or the component unmounts.
  useEffect(
    () => () => previews.forEach((preview) => URL.revokeObjectURL(preview.url)),
    [previews],
  );

  const handleFilesSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!selected.length) return;

    const accepted = selected.filter((file) => {
      if (file.size > REVIEW_IMAGE_MAX_BYTES) {
        toast.error(`${file.name} is too large (max 5 MB).`);
        return false;
      }
      return true;
    });

    setFiles((prev) => {
      if (prev.length + accepted.length > REVIEW_IMAGE_MAX_FILES) {
        toast.error(`You can attach up to ${REVIEW_IMAGE_MAX_FILES} images.`);
      }
      return [...prev, ...accepted].slice(0, REVIEW_IMAGE_MAX_FILES);
    });
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, fileIndex) => fileIndex !== index));
  };

  const approvedReviews = useMemo(
    () => (reviews ?? []).filter((review): review is ProductReviewItem => !!review?.databaseId),
    [reviews],
  );

  const displayRating = hoverRating || rating;

  const getReviewErrorMessage = (error: unknown): string => {
    if (error instanceof ApolloError) {
      const graphQLError = error.graphQLErrors[0]?.message;
      if (graphQLError) {
        if (graphQLError.includes("closed to comments")) {
          return "Reviews are not enabled for this product.";
        }
        if (graphQLError.includes("duplicate")) {
          return "You have already reviewed this product.";
        }
        return graphQLError;
      }
      if (error.networkError) {
        return "Unable to connect. Please check your connection and try again.";
      }
    }
    if (error instanceof Error && error.message) {
      return error.message;
    }
    return "Failed to submit review.";
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (rating < 1 || rating > 5) {
      toast.error("Please select a star rating.");
      return;
    }

    if (!content.trim()) {
      toast.error("Please write your review.");
      return;
    }

    const name = isGuest ? authorName.trim() : customer?.displayName?.trim();
    const email = isGuest ? authorEmail.trim() : customer?.email?.trim();

    if (isGuest && (!name || !email)) {
      toast.error("Please enter your name and email.");
      return;
    }

    setSubmitting(true);

    try {
      // Upload images first so a bad file fails before the review is created.
      let uploaded: UploadedReviewMedia[] = [];
      if (files.length) {
        uploaded = await Promise.all(files.map(uploadReviewImage));
      }

      const { data } = await writeReview({
        variables: {
          input: {
            commentOn: productDatabaseId,
            rating,
            content: content.trim(),
            ...(isGuest ? { author: name, authorEmail: email } : {}),
          },
        },
      });

      const submittedRating = data?.writeReview?.rating;
      if (submittedRating == null || submittedRating < 1) {
        throw new Error("Failed to submit review.");
      }

      const commentId = data?.writeReview?.comment?.databaseId;
      if (commentId && uploaded.length) {
        await attachReviewMedia(commentId, uploaded);
      }

      setRating(0);
      setContent("");
      setFiles([]);
      if (isGuest) {
        setAuthorName("");
        setAuthorEmail("");
      }

      toast.success(
        "Thank you! Your review has been submitted and will appear after approval.",
      );
    } catch (error) {
      toast.error(getReviewErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="product-reviews"
      className="space-y-6 border-t border-[#E8E8E8] pt-6"
    >
      <div className="space-y-2">
        <h2 className="font-albra text-xl font-bold text-[#0A0A0A] sm:text-2xl">
          Customer Reviews
        </h2>
        <ProductStarRating
          averageRating={averageRating}
          reviewCount={reviewCount}
          showWhenEmpty
        />
      </div>

      {approvedReviews.length > 0 && (
        <ul className="space-y-4">
          {approvedReviews.map((review) => {
            const body = review.content ? stripReviewHtml(review.content) : "";
            const authorName = review.author?.node?.name?.trim() || "Customer";
            const images = (review.reviewImages ?? []).filter(
              (image): image is NonNullable<typeof image> =>
                !!image && !image.isVideo && !!(image.thumbnailUrl ?? image.sourceUrl),
            );

            return (
              <li
                key={review.databaseId}
                className="rounded-2xl border border-[#E8E8E8] bg-[#FAFAFA] p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-[#1A1A1A]">{authorName}</p>
                  {review.date && (
                    <time
                      dateTime={review.date}
                      className="text-xs text-[#6B7280]"
                    >
                      {formatReviewDate(review.date)}
                    </time>
                  )}
                </div>
                {body && (
                  <p className="mt-2 text-sm leading-relaxed text-[#4B5563]">{body}</p>
                )}
                {images.length > 0 && (
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {images.map((image, index) => (
                      <li key={`${review.databaseId}-${index}`}>
                        <a
                          href={image.sourceUrl ?? "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block overflow-hidden rounded-lg border border-[#E8E8E8]"
                        >
                          <Image
                            src={image.thumbnailUrl ?? image.sourceUrl ?? ""}
                            alt={`Photo from ${authorName}'s review`}
                            width={64}
                            height={64}
                            loading="lazy"
                            className="h-16 w-16 object-cover"
                          />
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl border border-[#E8E8E8] bg-white p-4 sm:p-5"
      >
        <h3 className="text-base font-semibold text-[#1A1A1A]">Write a review</h3>

        <div>
          <p className="mb-2 text-sm font-medium text-[#374151]">Your rating</p>
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, index) => {
              const value = index + 1;
              const filled = displayRating >= value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  onMouseEnter={() => setHoverRating(value)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="rounded p-0.5"
                  aria-label={`Rate ${value} out of 5 stars`}
                >
                  <Star
                    className={twMerge(
                      "h-6 w-6",
                      filled
                        ? "fill-[#F5A623] text-[#F5A623]"
                        : "fill-transparent text-[#D1D5DB]",
                    )}
                    strokeWidth={1.5}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {isGuest && (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-[#374151]">Name</span>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                required
                className="w-full rounded-xl border border-[#D1D5DB] px-3 py-2.5 text-sm outline-none focus:border-[#38461F] focus:ring-1 focus:ring-[#38461F]"
                autoComplete="name"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-[#374151]">Email</span>
              <input
                type="email"
                value={authorEmail}
                onChange={(e) => setAuthorEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-[#D1D5DB] px-3 py-2.5 text-sm outline-none focus:border-[#38461F] focus:ring-1 focus:ring-[#38461F]"
                autoComplete="email"
              />
            </label>
          </div>
        )}

        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-[#374151]">Your review</span>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={4}
            className="w-full resize-y rounded-xl border border-[#D1D5DB] px-3 py-2.5 text-sm outline-none focus:border-[#38461F] focus:ring-1 focus:ring-[#38461F]"
            placeholder="Share your experience with this product"
          />
        </label>

        <div>
          <p className="mb-2 text-sm font-medium text-[#374151]">
            Add photos{" "}
            <span className="font-normal text-[#6B7280]">
              (optional, up to {REVIEW_IMAGE_MAX_FILES})
            </span>
          </p>
          {previews.length > 0 && (
            <ul className="mb-2 flex flex-wrap gap-2">
              {previews.map((preview, index) => (
                <li key={preview.url} className="relative">
                  <Image
                    src={preview.url}
                    alt={preview.name}
                    width={64}
                    height={64}
                    unoptimized
                    className="h-16 w-16 rounded-lg border border-[#E8E8E8] object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    aria-label={`Remove ${preview.name}`}
                    className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#1A1A1A] text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          {previews.length < REVIEW_IMAGE_MAX_FILES && (
            <label className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-full border border-dashed border-[#D1D5DB] px-4 text-sm font-medium text-[#374151] hover:border-[#38461F]">
              <ImagePlus className="h-4 w-4" />
              Choose images
              <input
                type="file"
                accept="image/png,image/jpeg,image/gif,image/webp"
                multiple
                onChange={handleFilesSelected}
                className="sr-only"
              />
            </label>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex h-11 items-center justify-center rounded-full bg-[#C5E066] px-6 text-sm font-bold text-[#1A1A1A] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? <Loader className="h-4 w-4 animate-spin" /> : "Submit review"}
        </button>
      </form>
    </section>
  );
};

export default ProductReviewsSection;
