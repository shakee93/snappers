

import React from "react";
import Image from "next/image";
import SectionHero4 from "../components/HomePage/SectionHero4";
import { GET_BENTO_SLIDER } from "@/graphql/defs/products";
import { getClient } from "@/graphql/apollo-ssr";

const TestPage = async () => {

    const result =  await getClient().query({ query: GET_BENTO_SLIDER });
    
      console.log("result", result);    
  return (
    <div className="">
      <h1 className="text-3xl font-bold mb-8">Test Page</h1>
      
     <SectionHero4 data={result.data} />
    </div>
  );
};

export default TestPage;
