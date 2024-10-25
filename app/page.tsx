import CategoryBlockSection from "@/app/components/HomePage/CategoryBlocksSection";
import SectionHero3 from "@/app/components/HomePage/SectionHero3";
import SectionSliderProductCard from "@/app/components/SectionSliderProductCard";
import SectionGridMoreExplore from "@/app/components/HomePage/SectionGridMoreExplore";
import SectionPromo1 from "@/app/components/HomePage/SectionPromo1";
import Heading from "@/app/components/Heading/Heading";
import { getClient } from "@/graphql/apollo-ssr";
import {
  GET_BRANDS,
  GET_PRODUCTS_NODES,
  GET_PRODUCTS_NODES_HOMEPAGE,
} from "@/graphql/defs/products";
import { GET_SLIDES } from "@/graphql/defs/slides";
import { Brand, SimpleProduct, VariableProduct } from "@/graphql/types/graphql";
import Image from "next/image";
import Scam from "@/public/homepage/scam.webp";
import Sampath from "@/public/images/bank logos/sampath.png";
import Commercial from "@/public/images/bank logos/commercial.png";
import Hnb from "@/public/images/bank logos/hnb.png";
import Dfcc from "@/public/images/bank logos/logo-dfccbank.png";
import Ntb from "@/public/images/bank logos/Nations_Trust_Bank_logo.png";
import Hsbc from "@/public/images/bank logos/2560px-HSBC_logo_(2018).svg.png";
import Peaple from "@/public/images/bank logos/Peoplesbanklk.png";
import Seylan from "@/public/images/bank logos/Seylan_Bank_logo.png";
import Standard from "@/public/images/bank logos/standard-chartered-2021-logo-freelogovectors.net_.png";
import SectionHero2 from "./components/HomePage/SectionHero2";
import SectionSliderBrandCard from "./components/SectionSliderBrandCard";
import { Card } from "@nextui-org/react";
import CardSkeleton from "./components/Skeletons/CardSkeleton";
import TopBarPromotion from "@/components/TopBarPromotion";
import { GET_OPTIONS } from "@/graphql/defs/options";

const Banks = [
  Sampath,
  Dfcc,
  Ntb,
  Peaple,
  Hnb,
  Commercial,
  Standard,
  Seylan,
  Hsbc,
];

const getData = async () => {
  const queries = [
    getClient()
      .query({ query: GET_PRODUCTS_NODES })
      .then((res) => {
        return res.data?.products?.nodes || [];
      })
      .catch(() => {
        console.error("Error fetching new arrivals");
        return [];
      }),

    getClient()
      .query({
        query: GET_PRODUCTS_NODES,
        variables: { first: 10, categoryIdIn: [165] },
      })
      .then((res) => {
        return res.data?.products?.nodes || [];
      })
      .catch(() => {
        console.error("Error fetching mobiles");
        return [];
      }),

    getClient()
      .query({
        query: GET_PRODUCTS_NODES_HOMEPAGE,
        variables: { first: 10, tagId: 538 },
      })
      .then((res) => {
        return res.data?.products?.nodes || [];
      })
      .catch(() => {
        console.error("Error fetching speakers");
        return [];
      }),

    getClient()
      .query({
        query: GET_PRODUCTS_NODES,
        variables: { first: 10, categoryIdIn: [302] },
      })
      .then((res) => {
        return res.data?.products?.nodes || [];
      })
      .catch(() => {
        console.error("Error fetching watches");
        return [];
      }),

    getClient()
      .query({
        query: GET_PRODUCTS_NODES_HOMEPAGE,
        variables: { first: 10, tagId: 536 },
      })
      .then((res) => {
        return res.data?.products?.nodes || [];
      })
      .catch(() => {
        console.error("Error fetching back in stock");
        return [];
      }),

    getClient()
      .query({
        query: GET_BRANDS,
      })
      .then((res) => {
        return res.data?.brands?.nodes || [];
      })
      .catch(() => {
        console.error("Error fetching brands");
        return [];
      }),

    getClient()
      .query({
        query: GET_SLIDES,
      })
      .then((res) => {
        return res.data?.slides?.nodes || [];
      })
      .catch(() => {
        console.error("Error fetching slides");
        return [];
      }),
      getClient()
      .query({
        query: GET_OPTIONS,
      })
      .then((res) => res.data || [])
      .catch(() => {
        console.error("Error fetching options");
        return [];
      }),
  ];

  const [newArrivals, mobiles, speakers, watches, backInStock, brands, slides , options] = await Promise.all(queries);

  return {
    newArrivals: newArrivals as (SimpleProduct & VariableProduct)[],
    mobiles: mobiles as (SimpleProduct & VariableProduct)[],
    speakers: speakers as (SimpleProduct & VariableProduct)[],
    watches: watches as (SimpleProduct & VariableProduct)[],
    backInStock: backInStock as (SimpleProduct & VariableProduct)[],
    brands: brands as Brand[],
    slides,
    options,
  };
};

export default async function Home() {
  // const startTime = performance.now(); // Log the start time

  const { newArrivals, mobiles, speakers, watches, backInStock, brands, slides, options } = await getData();

  return (
    <main>
      <div className="nc-PageHome relative flex flex-col overflow-hidden">
      {/* <TopBarPromotion options={options} /> */}
        {/* hero section */}
        <div className="z-0">
          {/* <SectionHero3 /> */}
          {/* <SectionHero2 slides={slides} /> */}
          <SectionHero3 slides={slides} />
          {/* <CategoryWithSubcategories/> */}
        </div>
        {/* <div className="bg-[#e5e7eb] py-4 md:p-2">
          <div className="container flex md:items-center gap-3 flex-col md:flex-row items-start ">
            <Image
              src={Scam}
              alt=""
              height={20}
              className="w-56 md:w-40 h-auto"
            />
            <div>
              <p className="text-base md:text-lg font-medium">
                Fraud Alert : Rajagiriya & Kurunegala Scam Warning!
              </p>
              <p className="text-sm md:text-base">
                We have no branches in Rajagiriya or Kurunegala. Beware of
                scams. Your safety is our priority.
              </p>
            </div>
          </div>
        </div> */}

        <div className="flex flex-col px-3  gap-10 lg:gap-16 sm:container sm:max-w-screen-2xl">
          {/* new arrivals section */}
          <div className="mt-5 md:mt-10">
            <SectionSliderProductCard
              products={newArrivals}
              heading="New Arrivals"
              link="new-arrivals"
            />
          </div>
          {brands ? (
            <SectionSliderBrandCard
              heading="Our Brands"
              link="brands"
              brands={brands}
            />
          ) : (
            <CardSkeleton />
          )}

          {/* Back In Stock category */}
          <div>
            <SectionSliderProductCard
              products={backInStock}
              // subHeading=""
              heading="Back In Stock"
              link="back-in-stock"
            />
          </div>

          {/*featured categoties */}
          <div>
            <Heading>Featured Categories.</Heading>
            <CategoryBlockSection />
          </div>

          {/*mobile categoty */}
          <div>
            <SectionSliderProductCard
              products={mobiles}
              // subHeading="Explore the Latest in Smartphone Innovation"
              heading="Latest Smartphones"
            />
          </div>

          {/* about section */}
          <div>
            <SectionPromo1 />
          </div>

          {/* speakers category */}
          <div>
            <SectionSliderProductCard
              products={speakers}
              // subHeading=""
              heading="Explore Speakers"
              link="explore-speakers"
            />
          </div>

          {/* brand section */}
          <div className="relative">
            {/* <BackgroundSection /> */}
            {/* <SectionGridMoreExplore /> */}
          </div>

          {/* smart watches section */}
          <div>
            <SectionSliderProductCard
              products={watches}
              heading="Smart Watches"
              link="smartwatches"
            // subHeading="Best selling of the month"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
