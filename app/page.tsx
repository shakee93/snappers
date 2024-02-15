import CategoryBlockSection from "@/app/components/HomePage/CategoryBlocksSection";
import SectionHero3 from "@/app/components/HomePage/SectionHero2";
import SectionSliderProductCard from "@/app/components/SectionSliderProductCard";
import SectionGridMoreExplore from "@/app/components/HomePage/SectionGridMoreExplore";
import SectionPromo1 from "@/app/components/HomePage/SectionPromo1";
import Heading from "@/app/components/Heading/Heading";
import { getClient } from "@/graphql/apollo-ssr";
import { GET_SLIDES } from "@/graphql/defs/slides";
import { GET_PRODUCTS_NODES, GET_PRODUCTS_NODES_BACK_IN_STOCK } from "@/graphql/defs/products";
import { SimpleProduct, VariableProduct } from "@/graphql/types/graphql";
import "styles/embla.css";

const getData = async () => {
  const [slides, newArrivals, mobiles, speakers, watches, backInStock] = await Promise.all([
    //Slides
    getClient().query({ query: GET_SLIDES }),
    //New Arrivals
    getClient().query({ query: GET_PRODUCTS_NODES }),
    //Mobiles
    getClient().query({
      query: GET_PRODUCTS_NODES,
      variables: { first: 10, categoryIdIn: [165] },
    }),
    //Speakers
    getClient().query({
      query: GET_PRODUCTS_NODES,
      variables: { first: 10, categoryIdIn: [71] },
    }),
    //Watches
    getClient().query({
      query: GET_PRODUCTS_NODES,
      variables: { first: 10, categoryIdIn: [302] },
    }),

    //Back In Stock
    getClient().query({
      query: GET_PRODUCTS_NODES_BACK_IN_STOCK,
      variables: { first: 10 },
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
    watches: watches.data.products?.nodes as (SimpleProduct &
      VariableProduct)[],
    backInStock: backInStock.data.products?.nodes as (SimpleProduct &
      VariableProduct)[],
  };
};

export default async function Home() {
  // const startTime = performance.now(); // Log the start time

  const { slides, newArrivals, mobiles, speakers, watches, backInStock } = await getData();
  // const endTime = performance.now(); // Log the end time
  // console.log(
  //   `getData function took ${endTime - startTime} milliseconds to execute.`
  // );

  return (
    <main>
      <div className="nc-PageHome relative flex  flex-col overflow-hidden">
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

          {/* Back In Stock category */}
          <div>
            <SectionSliderProductCard
              products={backInStock}
              // subHeading=""
              heading="Back In Stock"
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
              products={watches}
              heading="Smart Watches"
            // subHeading="Best selling of the month"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
