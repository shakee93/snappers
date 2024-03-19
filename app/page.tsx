import CategoryBlockSection from "@/app/components/HomePage/CategoryBlocksSection";
import SectionHero3 from "@/app/components/HomePage/SectionHero3";
import SectionSliderProductCard from "@/app/components/SectionSliderProductCard";
import SectionGridMoreExplore from "@/app/components/HomePage/SectionGridMoreExplore";
import SectionPromo1 from "@/app/components/HomePage/SectionPromo1";
import Heading from "@/app/components/Heading/Heading";
import { getClient } from "@/graphql/apollo-ssr";
import { GET_PRODUCTS_NODES, GET_PRODUCTS_NODES_HOMEPAGE } from "@/graphql/defs/products";
import { SimpleProduct, VariableProduct } from "@/graphql/types/graphql";
import "styles/embla.css";
import Image from "next/image";
import Scam from "@/public/homepage/scam.webp";
import SectionHero2 from "./components/HomePage/SectionHero2";

const slidesData = [
  {
    id: "2",
    slideFields: {
      mainHeading: "Experience gaming at its finest",
      subHeading: "Sony PS5 Slim: Gaming Redefined",
      buttonText: "Buy Now",
      buttonLink: "/sony/sony-playstation-5-slim-disc-edition",
      backgroundColor:"#CCE0EF",
      featureImage: {
        id: "2",
        sourceUrl: "http://api.gqmobiles.lk/wp-content/uploads/2024/03/Untitled-design-2024-03-13T155550.163-removebg-preview.png"
      }
    }
  },
  {
    id: "3",
    slideFields: {
      mainHeading: "Embrace the Future of Accessories",
      subHeading: "Step into Tomorrow's Style",
      buttonText: "Explore Products",
      buttonLink: "/collections/all",
      backgroundColor:"#F4E7E7",
      featureImage: {
        id: "3",
        sourceUrl: "https://api.gqmobiles.lk/wp-content/uploads/2023/12/dlcdnwebimgs.asus_-300x300.png"
      }
    }
  },
  {
    id: "4",
    slideFields: {
      mainHeading: "Hot Picks of the Month!",
      subHeading: "Explore Our Top-Selling Products",
      buttonText: "Explore Now",
      buttonLink: "/collections/all",
      backgroundColor:"#E2F1F0",
      featureImage: {
        id: "4",
        sourceUrl: "https://api.gqmobiles.lk/wp-content/uploads/2023/12/Layer-1-1-278x300.png"
      }
    }
  }
];

const getData = async () => {
  const [ newArrivals, mobiles, speakers, watches, backInStock] = await Promise.all([
    //Slides
    // getClient().query({ query: GET_SLIDES }),
    //New Arrivals
    getClient().query({ query: GET_PRODUCTS_NODES }),
    //Mobiles
    getClient().query({
      query: GET_PRODUCTS_NODES,
      variables: { first: 10, categoryIdIn: [165] },
    }),
    //Speakers
    getClient().query({
      query: GET_PRODUCTS_NODES_HOMEPAGE,
      variables: { first: 10, tagId: 538 },
    }),
    //Watches
    getClient().query({
      query: GET_PRODUCTS_NODES,
      variables: { first: 10, categoryIdIn: [302] },
    }),

    //Back In Stock
    getClient().query({
      query: GET_PRODUCTS_NODES_HOMEPAGE,
      variables: { first: 10, tagId: 536 },
    }),
  ]);

  return {
    // slides: slides.data?.slides?.nodes,
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

  const {  newArrivals, mobiles, speakers, watches, backInStock } = await getData();
  // const endTime = performance.now(); // Log the end time
  // console.log(
  //   `getData function took ${endTime - startTime} milliseconds to execute.`
  // );

  return (
    <main>
      <div className="nc-PageHome relative flex  flex-col overflow-hidden">
        {/* hero section */}
        <div className="z-0">
          {/* <SectionHero3 /> */}
          <SectionHero2 slides={slidesData}/>
        </div>
        <div className="bg-[#e5e7eb] py-4 md:p-2">
          <div className="container flex md:items-center gap-3 flex-col md:flex-row items-start ">
            <Image src={Scam} alt="" height={20} className="w-56 md:w-40 h-auto"/>
            <div>
              <p className="text-base md:text-lg font-medium">Fraud Alert : Rajagiriya & Kurunegala Scam Warning!</p>
              <p className="text-sm md:text-base">We have no branches in Rajagiriya or Kurunegala. Beware of scams. Your safety is our priority.</p>
            </div>
          </div>
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
