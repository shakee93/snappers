"use client";

import React from 'react';
import SectionSliderProductCard from '../SectionSliderProductCard';
import { SimpleProduct } from '@/graphql/types/graphql';

const UpsellProducts = ({ newArrivals }: any) => {

  return (
    <div>
      <SectionSliderProductCard
        products={newArrivals}
        heading="Don’t Miss Our Other Great Products"
        link={undefined}
      />
    </div>
  );
};

export default UpsellProducts;
