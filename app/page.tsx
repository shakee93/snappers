import CategoryBlockSection from "@/app/components/HomePage/CategoryBlocksSection";
import SectionHero3 from "@/app/components/HomePage/SectionHero3";
import SectionSliderProductCard from "@/app/components/SectionSliderProductCard";
import SectionGridMoreExplore from "@/app/components/HomePage/SectionGridMoreExplore";
import SectionPromo1 from "@/app/components/HomePage/SectionPromo1";
import Heading from "@/app/components/Heading/Heading";
import { getClient } from "@/graphql/apollo-ssr";
import {
  GET_PRODUCTS_NODES,
  GET_PRODUCTS_NODES_HOMEPAGE,
} from "@/graphql/defs/products";
import { SimpleProduct, VariableProduct } from "@/graphql/types/graphql";
import "styles/embla.css";
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
import CategoryWithSubcategories from "./components/globalComponents/CategoryWithSubcategories";

const slidesData = [
  {
    id: "2",
    slideFields: {
      mainHeading: "Experience gaming at its finest",
      subHeading: "Sony PS5 Slim: Gaming Redefined",
      buttonText: "Buy Now",
      buttonLink: "/sony/sony-playstation-5-slim-disc-edition",
      backgroundColor: "#CCE0EF",
      featureImage: {
        id: "2",
        sourceUrl:
          "http://api.gqmobiles.lk/wp-content/uploads/2024/03/Untitled-design-2024-03-13T155550.163-removebg-preview.png",
      },
    },
  },
  {
    id: "3",
    slideFields: {
      mainHeading: "Embrace the Future of Accessories",
      subHeading: "Step into Tomorrow's Style",
      buttonText: "Explore Products",
      buttonLink: "/collections/all",
      backgroundColor: "#F4E7E7",
      featureImage: {
        id: "3",
        sourceUrl:
          "https://api.gqmobiles.lk/wp-content/uploads/2023/12/dlcdnwebimgs.asus_-300x300.png",
      },
    },
  },
  {
    id: "4",
    slideFields: {
      mainHeading: "Hot Picks of the Month!",
      subHeading: "Explore Our Top-Selling Products",
      buttonText: "Explore Now",
      buttonLink: "/collections/all",
      backgroundColor: "#E2F1F0",
      featureImage: {
        id: "4",
        sourceUrl:
          "https://api.gqmobiles.lk/wp-content/uploads/2023/12/Layer-1-1-278x300.png",
      },
    },
  },
];

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
  const [newArrivals, mobiles, speakers, watches, backInStock] =
    await Promise.all([
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

  const { newArrivals, mobiles, speakers, watches, backInStock } =
    await getData();
  // const endTime = performance.now(); // Log the end time
  // console.log(
  //   `getData function took ${endTime - startTime} milliseconds to execute.`
  // );

  return (
    <main>
      <div className="nc-PageHome relative flex  flex-col overflow-hidden">
        <div className="bg-[#285f38] py-4 md:p-3">
          <div className="flex md:items-center gap-4 md:gap-3 flex-col md:flex-row items-between ">
            <div className="flex flex-col md:flex-row gap-2 justify-center items-center w-full">
              {/* <div>
                <p className="text-3xl md:text-xl lg:text-3xl xl:text-5xl -skew-x-[20deg] font-bold bg-gradient-to-r from-blue-600 via-green-500 to-indigo-400 inline-block text-transparent bg-clip-text">
                  0% Installment
                </p>
              </div> */}
              <div className="flex flex-col gap-0">
                <p className="text-xl md:text-lg lg:text-2xl text-white text-center font-bold ">
                  Up to 12 Month Installment Plans
                </p>
                {/* <p className="flex w-full gap-2 md:gap-1  justify-between items-baseline ">
                  <span className="text-sm md:text-xs xl:text-xl font-bold text-gray-500">
                    06 Months | 12 Months
                  </span>
                  <span className="text-[10px]  xl:text-xs font-semibold text-gray-400">
                    T & C Apply
                  </span>
                </p> */}
              </div>

              <div className="flex py-2 mx-4 md:mx-0 px-2 md:px-4   gap-2 xl:gap-5 bg-white rounded-xl">
                <div className="flex flex-wrap justify-center gap-2 xl:gap-4">
                  {Banks.map((bank, index) => (
                    <div key={index} className="">
                      <Image
                        src={bank}
                        alt={`Bank Logo ${index}`}
                        className="w-auto h-5 lg:h-7"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* hero section */}
        <div className="z-0">
          {/* <SectionHero3 /> */}
          <SectionHero2 slides={slidesData} />
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
            {/* <SectionGridMoreExplore /> */}
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
