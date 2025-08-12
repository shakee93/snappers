import CategoryBlockSection from "@/app/components/HomePage/CategoryBlocksSection";
import SectionHero3 from "@/app/components/HomePage/SectionHero3";
import SectionSliderProductCard from "@/app/components/SectionSliderProductCard";
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
import SectionSliderBrandCard from "./components/SectionSliderBrandCard";
import CardSkeleton from "./components/Skeletons/CardSkeleton";
import { GET_OPTIONS } from "@/graphql/defs/options";
import FancyTestimonialsSlider from "@/app/components/TestimonialsSlider";
import GoogleReviewsSection from "@/app/components/HomePage/GoogleReviewsSection";
import FAQ from "./components/HomePage/FAQSection";
import TikTokSection from "@/components/TikTokSection";


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

  const [newArrivals, mobiles, speakers, watches, backInStock, brands, slides, options] = await Promise.all(queries);

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


  const { newArrivals, mobiles, speakers, watches, backInStock, brands, slides } = await getData();

  return (
    <main>
      <div className="nc-PageHome relative flex flex-col overflow-hidden">
        <div className="z-0">
          <SectionHero3 slides={slides} />
        </div>

        <div className="flex flex-col px-3 gap-10 lg:gap-12 sm:container sm:max-w-screen-2xl">
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
            <Heading>Featured Categories</Heading>
            <CategoryBlockSection />
          </div>

          {/* TikTok Section */}
          <div>
            <Heading isCenter={true} >Take a look at our TikTok.</Heading>
            <TikTokSection />
          </div>

          {/* Testimonials section */}
          <div className="">
            <Heading>What Our Customers Say</Heading>
            <FancyTestimonialsSlider />
          </div>

          {/* Google Reviews Section */}
          <GoogleReviewsSection />

          {/*Mobile Category */}
          <div className="block md:hidden">
            <SectionSliderProductCard
              products={mobiles}
              heading="Latest Smartphones"
            />
          </div>

          {/* About section */}
          <div className="">
            <SectionPromo1 />
          </div>

          

          {/* Speakers Category */}
          <div>
            <SectionSliderProductCard
              products={speakers}
              // subHeading=""
              heading="Explore Speakers"
              link="explore-speakers"
            />
          </div>

          {/* brand section */}
          {/* <div className="relative md:hidden"> */}
          {/* <BackgroundSection /> */}
          {/* <SectionGridMoreExplore /> */}
          {/* </div> */}

          {/* Smart Watches Section */}
          <div>
            <SectionSliderProductCard
              products={watches}
              heading="Smart Watches"
              link="smartwatches"
            />
          </div>

          <div>
          <Heading>Frequently Asked Questions</Heading>
            <FAQ />
          </div>
        </div>
      </div>
    </main>
  );
}
