

import React from "react";
import Image from "next/image";
import SectionHero4 from "@/app/components/HomePage/SectionHero4";
import { GET_BENTO_SLIDER } from "@/graphql/defs/products";
import { getClient } from "@/graphql/apollo-ssr";

const TestPage = async () => {
  return (
    <div className="">
      <h1 className="text-3xl font-bold mb-8">Test Page</h1>
      
    </div>
  );
};

export default TestPage;
