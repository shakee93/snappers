"use client";

import SectionSliderProductCard from "@/components/global/ui/SectionSliderProductCard";
import { SimpleProduct, VariableProduct } from "@/graphql/types/graphql";

const UpsellProducts = ({
  newArrivals,
}: {
  newArrivals: (SimpleProduct | VariableProduct)[];
}) => {
  if (!newArrivals?.length) {
    return null;
  }

  return (
    <section className="rounded-3xl bg-white px-4 py-6 sm:px-6 lg:px-8">
      <SectionSliderProductCard
        products={newArrivals}
        heading="You May Also Want"
        headingFontClassName="font-albra text-2xl font-bold text-[#0A0A0A] sm:text-3xl"
        headingClassName="mb-6"
        link={undefined}
      />
    </section>
  );
};

export default UpsellProducts;
