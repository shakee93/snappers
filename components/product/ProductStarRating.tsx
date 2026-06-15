import { Star } from "lucide-react";

interface ProductStarRatingProps {
  averageRating?: number | null;
  reviewCount?: number | null;
  className?: string;
  showWhenEmpty?: boolean;
  labelMode?: "reviews" | "rated";
}

const ProductStarRating = ({
  averageRating = 0,
  reviewCount = 0,
  className = "",
  showWhenEmpty = false,
  labelMode = "reviews",
}: ProductStarRatingProps) => {
  const count = reviewCount ?? 0;
  const rating = Math.min(5, Math.max(0, averageRating ?? 0));

  if (count === 0 && !showWhenEmpty) {
    return null;
  }

  const label =
    labelMode === "rated" ? (
      <span className="text-sm text-[#6B7280]">
        {rating.toFixed(1)} Star Rated
      </span>
    ) : (
      <span className="text-sm text-[#6B7280]">
        {count === 0
          ? "No reviews yet"
          : `${count} customer review${count === 1 ? "" : "s"}`}
      </span>
    );

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
        {Array.from({ length: 5 }).map((_, index) => {
          const filled = rating >= index + 1;
          const partial = !filled && rating > index;
          return (
            <Star
              key={index}
              className={`h-4 w-4 ${
                filled || partial
                  ? "fill-[#F5A623] text-[#F5A623]"
                  : "fill-transparent text-[#D1D5DB]"
              }`}
              strokeWidth={1.5}
            />
          );
        })}
      </div>
      {label}
    </div>
  );
};

export default ProductStarRating;
