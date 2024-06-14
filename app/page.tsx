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
    id: "1",
    slideFields: {
      mainHeading: "Innovation at Its Best",
      subHeading: "Tecno Spark 20 Pro: Sleek, Powerful, Connected",
      buttonText: "Buy Now",
      buttonLink: "/tecno/tecno-spark-20-pro",
      backgroundColor: "#CCE0EF",
      featureImage: {
        id: "2",
        sourceUrl:
          "http://gq.freshpixl.com/wp-content/uploads/2024/06/Wild-Green-2024-03-31T131534.300.png",
      },
    },
  },
  // {
  //   id: "2",
  //   slideFields: {
  //     mainHeading: " Immersive Sound, Mastery of Performance",
  //     subHeading: "Bose S1 Pro: Portable, Powerful, Versatile",
  //     buttonText: "Buy Now",
  //     buttonLink:
  //       "/bose",
  //     backgroundColor: "#F4E7E7",
  //     featureImage: {
  //       id: "2",
  //       sourceUrl:
  //         "http://gq.freshpixl.com/wp-content/uploads/2024/06/filebose.png",
  //     },
  //   },
  // },
  {
    id: "3",
    slideFields: {
      mainHeading: "Pulse of Performance",
      subHeading: "Beats Fit Pro: Unleash Your Rhythm",
      buttonText: "Buy Now",
      buttonLink: "/beats/beats-fit-pro-true-wireless-noise-cancelling-earbuds",
      backgroundColor: "#E2F1F0",
      featureImage: {
        id: "3",
        sourceUrl:
          "http://gq.freshpixl.com/wp-content/uploads/2024/06/10-10.png",
      },
    },
  },
  {
    id: "4",
    slideFields: {
      mainHeading: "Embark on Your Fitness Journey",
      subHeading: "Fitbit Charge 5: Elevate Your Fitness",
      buttonText: "Buy Now",
      buttonLink: "/fitbit/google-fitbit-charge-5-gift-pack",
      backgroundColor: "#E2F1F0",
      featureImage: {
        id: "4",
        sourceUrl:
          "http://gq.freshpixl.com/wp-content/uploads/2024/06/2-35.png",
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
      <div className="nc-PageHome relative flex flex-col overflow-hidden">
        <div className="bg-[#285f38] px-2 py-4 md:p-3">
          <div className="items-between flex flex-col gap-4 md:flex-row md:items-center md:gap-3">
            <div className="flex w-full flex-col items-center justify-center gap-2 md:flex-row">
              {/* <div>
                <p className="text-3xl md:text-xl lg:text-3xl xl:text-5xl -skew-x-[20deg] font-bold bg-gradient-to-r from-blue-600 via-green-500 to-indigo-400 inline-block text-transparent bg-clip-text">
                  0% Installment
                </p>
              </div> */}
              <div className="flex shrink-0 flex-col gap-0">
                <p className="items-center justify-center text-center text-lg font-semibold text-white md:text-lg lg:text-2xl">
                  Up to 24 Month Bank Installment Plans
                  <span className="mt-2 flex shrink-0 justify-center text-[10px] font-semibold leading-none text-gray-400 md:mt-0 md:justify-center xl:text-xs">
                    (T & C Apply)
                  </span>
                </p>
                <p className="flex w-full items-baseline justify-end gap-2 md:gap-1"></p>
              </div>

              {/* <div className="flex py-2 mx-4 md:mx-0 px-2 md:px-4  shrink  gap-2 xl:gap-5 bg-white rounded-xl">
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 md:gap-x-7 md:gap-y-2 xl:gap-4">
                  {Banks.map((bank, index) => (
                    <div key={index} className="">
                      <Image
                        src={bank}
                        alt={`Bank Logo ${index}`}
                        className="w-auto h-5 md:h-6 lg:h-7"
                      />
                    </div>
                  ))}
                </div>
              </div> */}
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
              link="new-arrivals"
            />
          </div>

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
