"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation } from "@apollo/client";
import { ApolloError } from "@apollo/client";
import Image from "next/image";
import { ImagePlus, Loader, Star, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { WRITE_PRODUCT_REVIEW } from "@/graphql/defs/reviews";
import ProductFeaturedReview from "@/components/product/ProductFeaturedReview";
import ProductStarRating from "@/components/product/ProductStarRating";
import { useSession } from "@/context/SessionProvider";
import {
  REVIEW_IMAGE_MAX_BYTES,
  REVIEW_IMAGE_MAX_FILES,
  sortReviewsImageFirst,
  uploadReviewImage,
  type ProductReviewItem,
} from "@/lib/productReviews";
import { twMerge } from "tailwind-merge";

type ReviewTab = "add" | "explore";

const REVIEWS_PAGE_SIZE = 5;

interface ProductReviewTabsProps {
  productDatabaseId: number;
  reviews?: ProductReviewItem[] | null;
  averageRating?: number | null;
  reviewCount?: number | null;
  className?: string;
}

const tabButtonClass = (isActive: boolean) =>
  twMerge(
    "border-b-2 pb-1 text-base font-bold transition-colors",
    isActive
      ? "border-[#ACDA5A] border-b-3 font-bold text-[#1A1A1A]"
      : "border-transparent font-medium text-[#9CA3AF] hover:text-[#6B7280]",
  );

const ProductReviewTabs = ({
  productDatabaseId,
  reviews = [],
  averageRating,
  reviewCount,
  className = "",
}: ProductReviewTabsProps) => {
  const { customer } = useSession();
  const isGuest = !customer || customer.id === "guest";

  const [activeTab, setActiveTab] = useState<ReviewTab>("explore");
  const [formOpen, setFormOpen] = useState(false);
  const [visibleReviewCount, setVisibleReviewCount] = useState(REVIEWS_PAGE_SIZE);
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

  useEffect(
    () => () => previews.forEach((preview) => URL.revokeObjectURL(preview.url)),
    [previews],
  );

  useEffect(() => {
    if (activeTab !== "add") {
      setFormOpen(false);
    }
  }, [activeTab]);

  const approvedReviews = useMemo(
    () => sortReviewsImageFirst(reviews ?? []),
    [reviews],
  );

  const visibleReviews = useMemo(
    () => approvedReviews.slice(0, visibleReviewCount),
    [approvedReviews, visibleReviewCount],
  );

  const hasMoreReviews = visibleReviewCount < approvedReviews.length;

  useEffect(() => {
    setVisibleReviewCount(REVIEWS_PAGE_SIZE);
  }, [reviews]);

  const displayRating = hoverRating || rating;

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
      if (files.length && email) {
        await Promise.all(
          files.map((file) => uploadReviewImage(file, email, productDatabaseId)),
        );
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
      setFormOpen(false);
    } catch (error) {
      toast.error(getReviewErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const reviewSummaryBar = (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
      <ProductStarRating
        averageRating={averageRating}
        reviewCount={reviewCount}
        showWhenEmpty
      />
      <button
        type="button"
        onClick={() => setFormOpen((open) => !open)}
        aria-expanded={formOpen}
        aria-controls="product-review-form"
        className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-[#C5E066] px-5 text-sm font-bold text-[#1A1A1A] transition-opacity hover:opacity-90"
      >
        Write a Review
      </button>
    </div>
  );

  const reviewForm = (
    <form
      id="product-review-form"
      onSubmit={handleSubmit}
      className="space-y-4 border-t border-[#E8E8E8] px-4 pb-4 pt-4 sm:px-5 sm:pb-5"
    >
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
  );

  return (
    <section id="product-reviews" className={className}>
      <div
        role="tablist"
        aria-label="Product reviews"
        className="flex gap-6 border-b border-[#E8E8E8]"
      >
        <button
          type="button"
          role="tab"
          id="product-reviews-tab-add"
          aria-selected={activeTab === "add"}
          aria-controls="product-reviews-panel-add"
          onClick={() => setActiveTab("add")}
          className={tabButtonClass(activeTab === "add")}
        >
          Add Feedback
        </button>
        <button
          type="button"
          role="tab"
          id="product-reviews-tab-explore"
          aria-selected={activeTab === "explore"}
          aria-controls="product-reviews-panel-explore"
          onClick={() => setActiveTab("explore")}
          className={tabButtonClass(activeTab === "explore")}
        >
          Explore Reviews
        </button>
      </div>

      <div className="pt-4">
        {activeTab === "explore" ? (
          <div
            role="tabpanel"
            id="product-reviews-panel-explore"
            aria-labelledby="product-reviews-tab-explore"
            className="space-y-2"
          >
            {approvedReviews.length > 0 ? (
              <>
                <ul className="space-y-2">
                  {visibleReviews.map((review) => (
                    <li key={review.databaseId}>
                      <ProductFeaturedReview review={review} />
                    </li>
                  ))}
                </ul>
                {hasMoreReviews && (
                  <button
                    type="button"
                    onClick={() =>
                      setVisibleReviewCount((count) => count + REVIEWS_PAGE_SIZE)
                    }
                    className="mt-3 w-full rounded-full border border-[#E8E8E8] bg-white py-2.5 text-sm font-semibold text-[#38461F] transition-colors hover:border-[#38461F]/40 hover:bg-[#FAFAFA]"
                  >
                    Load more
                  </button>
                )}
              </>
            ) : (
              <p className="rounded-2xl border border-[#E8E8E8] bg-white p-4 text-sm text-[#6B7280]">
                No customer reviews yet. Be the first to share your experience.
              </p>
            )}
          </div>
        ) : (
          <div
            role="tabpanel"
            id="product-reviews-panel-add"
            aria-labelledby="product-reviews-tab-add"
            className="overflow-hidden rounded-2xl border border-[#E8E8E8] bg-white"
          >
            {reviewSummaryBar}
            <AnimatePresence initial={false}>
              {formOpen && (
                <motion.div
                  key="product-review-form-panel"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  {reviewForm}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductReviewTabs;
