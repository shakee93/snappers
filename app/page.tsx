import SectionHero2 from "@/app/components/HomePage/SectionHero";
import CategoryBlockSection from "@/app/components/HomePage/CategoryBlocksSection";
import SectionHero3 from "@/app/components/HomePage/SectionHero2";
import DiscoverMoreSlider from "@/app/components/HomePage/DiscoverMoreSlider";
import SectionSliderProductCard from "@/app/components/SectionSliderProductCard";
import { PRODUCTS, SPORT_PRODUCTS } from "@/data/data";
import BackgroundSection from "@/app/components/HomePage/BackgroundSection";
import SectionGridMoreExplore from "@/app/components/HomePage/SectionGridMoreExplore";
import SectionSliderCategories from "@/components/SectionSliderCategories/SectionSliderCategories";
import SectionClientSay from "@/components/SectionClientSay/SectionClientSay";
import SectionHowItWork from "@/app/components/HomePage/SectionHowItWork";
import SectionPromo1 from "@/app/components/HomePage/SectionPromo1";
import SectionPromo2 from "@/app/components/HomePage/SectionPromo2";
import SectionPromo3 from "@/app/components/HomePage/SectionPromo3";
import SectionSliderLargeProduct from "@/components/SectionSliderLargeProduct";
import Heading from "@/app/components/Heading/Heading";
import SectionMagazine5 from "@/containers/BlogPage/SectionMagazine5";
import { getClient } from "@/graphql/apollo-ssr";
import { GET_SLIDES } from "@/graphql/defs/slides";
import {
  GET_CATEGORY_ARCHIVE,
  GET_NEW_ARRIVALS,
  GET_PRODUCTS_NODES,
} from "@/graphql/defs/products";
import {
  ProductConnectionEdge,
  RootQuery,
  RootQueryToProductUnionConnection,
  SimpleProduct,
  VariableProduct,
} from "@/graphql/types/graphql";

const getData = async () => {
  const [slides, newArrivals, mobiles, speakers, topSelling] =
    await Promise.all([
      getClient().query({ query: GET_SLIDES }),
      getClient().query({ query: GET_PRODUCTS_NODES }),
      getClient().query({
        query: GET_PRODUCTS_NODES,
        variables: { first: 10, categoryIdIn: [165] },
      }),
      getClient().query({
        query: GET_PRODUCTS_NODES,
        variables: { first: 10, categoryIdIn: [71] },
      }),
      getClient().query({
        query: GET_PRODUCTS_NODES,
        variables: { first: 10, categoryIdIn: [86] },
      }),
    ]);

  return {
    slides: slides.data?.slides?.nodes,
    newArrivals: newArrivals.data.products?.nodes as (SimpleProduct &
      VariableProduct)[],
    mobiles: mobiles.data.products?.nodes as (SimpleProduct &
      VariableProduct)[],
    speakers: speakers.data.products?.nodes as (SimpleProduct &
      VariableProduct)[],
    topSelling: topSelling.data.products?.nodes as (SimpleProduct &
      VariableProduct)[],
  };
};

export default async function Home() {
  const { slides, newArrivals, mobiles, speakers, topSelling } =
    await getData();
  const hi = "sahdeer";
  return (
    <main>
      <div className="nc-PageHome flex flex-col  relative overflow-hidden">
        {/* hero section */}
        <div className="z-0">
          <SectionHero3 slides={slides} />
        </div>
        <div className="container flex flex-col gap-10 lg:gap-16">
          
          {/* new arrivals section */}
          <div className="mt-5 md:mt-10">
            <SectionSliderProductCard
              products={newArrivals}
              heading="New Arrivals"
            />
          </div>
          
          {/*featured categoties */}
          <div>
            <Heading>Featured Categories</Heading>
            <CategoryBlockSection />
          </div>
          
          {/*mobile categoty */}
          <div>
            <SectionSliderProductCard
              products={mobiles}
              subHeading="Explore the Latest in Smartphone Innovation"
              heading="Mobiles"
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
              subHeading="Surround Yourself with Sound"
              heading="Speakers"
            />
          </div>

          {/* brand section */}
          <div className="relative">
            {/* <BackgroundSection /> */}
            <SectionGridMoreExplore />
          </div>
          
          {/* smart watches section */}
          <div>
            <SectionSliderProductCard
              products={topSelling}
              heading="Smart Watches"
              subHeading="Best selling of the month"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
