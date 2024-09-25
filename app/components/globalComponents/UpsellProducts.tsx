"use client";

import React from 'react';
import SectionSliderProductCard from '../SectionSliderProductCard';

const UpsellProducts = ({ newArrivals }: any) => {
    console.log("newArrivals", newArrivals)
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
