"use client";

import React from 'react';
import SectionSliderProductCard from '@/components/global/ui/SectionSliderProductCard';

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
