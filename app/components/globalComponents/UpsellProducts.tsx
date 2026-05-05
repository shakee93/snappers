"use client";

import React from 'react';
import SectionSliderProductCard from '../SectionSliderProductCard';
import { SimpleProduct, VariableProduct } from '@/graphql/types/graphql';
import { filterHiddenProducts } from '@/lib/hidden-products';

const UpsellProducts = ({ newArrivals }: any) => {
  const visibleProducts = filterHiddenProducts<SimpleProduct | VariableProduct>(newArrivals ?? []);

  return (
    <div>
      <SectionSliderProductCard
        products={visibleProducts}
        heading="Don’t Miss Our Other Great Products"
        link={undefined}
      />
    </div>
  );
};

export default UpsellProducts;
