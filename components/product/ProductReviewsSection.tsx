"use client";

import { useMemo, useState } from "react";
import { useMutation } from "@apollo/client";
import { ApolloError } from "@apollo/client";
import { useRouter } from "next/navigation";
import { Loader, Star } from "lucide-react";
import { toast } from "sonner";
import { WRITE_PRODUCT_REVIEW } from "@/graphql/defs/reviews";
import ProductStarRating from "@/components/product/ProductStarRating";
import { useSession } from "@/context/SessionProvider";
import {
  formatReviewDate,
  stripReviewHtml,
  type ProductReviewItem,
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
  const router = useRouter();
  const { customer } = useSession();
  const isGuest = !customer || customer.id === "guest";

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [writeReview] = useMutation(WRITE_PRODUCT_REVIEW);

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
      const { data } = await writeReview({
        variables: {
          input: {
            commentOn: productDatabaseId,
            rating,
            content: content.trim(),
            ...(isGuest
              ? { author: name, authorEmail: email }
              : { author: name, authorEmail: email }),
          },
        },
      });

      const submittedRating = data?.writeReview?.rating;
      if (submittedRating == null || submittedRating < 1) {
        throw new Error("Failed to submit review.");
      }

      setRating(0);
      setContent("");
      if (isGuest) {
        setAuthorName("");
        setAuthorEmail("");
      }

      toast.success(
        "Thank you! Your review has been submitted and will appear after approval.",
      );

      router.refresh();
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
