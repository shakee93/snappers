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
  REVIEW_IMAGE_MAX_BYTES,
  REVIEW_IMAGE_MAX_FILES,
  uploadReviewImage,
} from "@/lib/productReviews";
import { pdpRadius } from "@/components/product/pdpStyles";
import { twMerge } from "tailwind-merge";
import { Customer } from "@/graphql/types/graphql";
import { USER_DATA_KEY } from "@/utils/storage-keys";

interface ProductReviewFeedbackProps {
  productDatabaseId: number;
  averageRating?: number | null;
  reviewCount?: number | null;
  className?: string;
}

const ProductReviewFeedback = ({
  productDatabaseId,
  averageRating,
  reviewCount,
  className = "",
}: ProductReviewFeedbackProps) => {
  const { customer, fetchCustomer } = useSession();
  const [resolvedCustomer, setResolvedCustomer] = useState<Customer | null>(null);

  const isLoggedIn = Boolean(resolvedCustomer);

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [writeReview] = useMutation(WRITE_PRODUCT_REVIEW);

  useEffect(() => {
    if (customer && customer.id !== "guest") {
      setResolvedCustomer(customer);
      return;
    }

    try {
      const raw = localStorage.getItem(USER_DATA_KEY);
      if (!raw) {
        setResolvedCustomer(null);
        return;
      }

      const parsed = JSON.parse(raw) as Customer;
      setResolvedCustomer(parsed?.id !== "guest" ? parsed : null);
    } catch {
      setResolvedCustomer(null);
    }
  }, [customer]);

  useEffect(() => {
    if (!resolvedCustomer) {
      void fetchCustomer();
    }
  }, [resolvedCustomer, fetchCustomer]);

  const reviewAuthorName = useMemo(() => {
    if (!resolvedCustomer) return "";

    const displayName = resolvedCustomer.displayName?.trim();
    if (displayName) return displayName;

    return [resolvedCustomer.firstName, resolvedCustomer.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();
  }, [resolvedCustomer]);

  const reviewAuthorEmail = useMemo(
    () =>
      resolvedCustomer?.email?.trim() ??
      resolvedCustomer?.billing?.email?.trim() ??
      "",
    [resolvedCustomer],
  );

  const previews = useMemo(
    () => files.map((file) => ({ name: file.name, url: URL.createObjectURL(file) })),
    [files],
  );

  useEffect(
    () => () => previews.forEach((preview) => URL.revokeObjectURL(preview.url)),
    [previews],
  );

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

    const name = isLoggedIn ? reviewAuthorName : authorName.trim();
    const email = isLoggedIn ? reviewAuthorEmail : authorEmail.trim();

    if (!name || !email) {
      toast.error(
        isLoggedIn
          ? "Your account is missing a name or email. Update your profile and try again."
          : "Please enter your name and email.",
      );
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
            ...(isLoggedIn ? {} : { author: name, authorEmail: email }),
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
      if (!isLoggedIn) {
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
    <div className={twMerge(`overflow-hidden border border-[#E8E8E8] bg-white ${pdpRadius}`, className)}>
      <div className="border-b border-[#E8E8E8] px-4 py-4 sm:px-5">
        <h2 className="mb-3 inline-block border-b-[3px] border-[#ACDA5A] pb-1 text-base font-bold text-[#1A1A1A]">
          Write a Review
        </h2>
        <ProductStarRating
          averageRating={averageRating}
          reviewCount={reviewCount}
          showWhenEmpty
        />
      </div>

      <form
        id="product-review-form"
        onSubmit={handleSubmit}
        className="space-y-4 px-4 pb-4 pt-4 sm:px-5 sm:pb-5"
      >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
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
                            className={`h-16 w-16 border border-[#E8E8E8] object-cover ${pdpRadius}`}
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
                    <label
                      className={`inline-flex h-11 cursor-pointer items-center gap-2 border border-dashed border-[#D1D5DB] px-4 text-sm font-medium text-[#374151] hover:border-[#38461F] ${pdpRadius}`}
                    >
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

                <div className="shrink-0 text-right">
                  <p className="mb-2 text-sm font-medium text-[#374151]">Your rating</p>
                  <div className="flex items-center justify-end gap-1">
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
              </div>

              {!isLoggedIn && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm">
                    <span className="mb-1.5 block font-medium text-[#374151]">Name</span>
                    <input
                      type="text"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      required
                      className={`w-full border border-[#D1D5DB] px-3 py-2.5 text-sm outline-none focus:border-[#38461F] focus:ring-1 focus:ring-[#38461F] ${pdpRadius}`}
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
                      className={`w-full border border-[#D1D5DB] px-3 py-2.5 text-sm outline-none focus:border-[#38461F] focus:ring-1 focus:ring-[#38461F] ${pdpRadius}`}
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
                  className={`w-full resize-y border border-[#D1D5DB] px-3 py-2.5 text-sm outline-none focus:border-[#38461F] focus:ring-1 focus:ring-[#38461F] ${pdpRadius}`}
                  placeholder="Share your experience with this product"
                />
              </label>

              <button
                type="submit"
                disabled={submitting}
                className={`flex h-11 w-full items-center justify-center bg-[#C5E066] px-6 text-sm font-bold text-[#1A1A1A] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 ${pdpRadius}`}
              >
                {submitting ? <Loader className="h-4 w-4 animate-spin" /> : "Submit review"}
            </button>
      </form>
    </div>
  );
};

export default ProductReviewFeedback;
