"use client";

import { useMemo } from "react";
import ProductReviewTabs from "@/components/product/ProductReviewTabs";
import { flattenProductReviews } from "@/lib/productReviews";
import type { SimpleProduct, VariableProduct } from "@/graphql/types/graphql";

type ProductReviewsProps = {
  product: SimpleProduct & VariableProduct;
  className?: string;
  hasVideoAbove?: boolean;
};

const ProductReviews = ({
  product,
  className = "",
  hasVideoAbove = false,
}: ProductReviewsProps) => {
  const productReviews = useMemo(
    () =>
      flattenProductReviews(
        (product as { reviews?: Parameters<typeof flattenProductReviews>[0] })
          .reviews,
      ),
    [product],
  );

  return (
    <ProductReviewTabs
      productDatabaseId={product.databaseId}
      reviews={productReviews}
      averageRating={
        (product as SimpleProduct & { averageRating?: number | null })
          .averageRating
      }
      reviewCount={product.reviewCount}
      className={
        hasVideoAbove
          ? className
          : `${className} border-t border-[#E8E8E8] pt-4 lg:pt-8`.trim()
      }
    />
  );
};

export default ProductReviews;
