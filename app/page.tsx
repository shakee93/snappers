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
import bgSlide2 from "@/public/homepage/slider/Layer_2.png";
import kokoBg from "@/public/homepage/slider/koko.png";
import bgSlide3 from "@/public/homepage/slider/Layer_3.png";
import bgSlide4 from "@/public/homepage/slider/Layer_4.png";
import bgSlide5 from "@/public/homepage/slider/Layer_5.png";
import bgSlide6 from "@/public/homepage/slider/Layer_6.png";
import bgSlide7 from "@/public/homepage/slider/Layer_7.png";
import bgSlide8 from "@/public/homepage/slider/Layer_8.png";
import bgSlide9 from "@/public/homepage/slider/Layer_9.png";
import bgSlide10 from "@/public/homepage/slider/Layer_10.png";
import bgSlide11 from "@/public/homepage/slider/Layer_11.png";

const slidesData = [
  {
    id: "1",
    slideFields: {
      mainHeading: "Shop now, pay later with Koko.",
      subHeading: "No interest, No card block",
      buttonText: "Contact",
      buttonLink: "/contact",
      backgroundColor: "#CCE0EF",
      backgroundImage: kokoBg.src,
      featureImage: {
        id: "2",
        sourceUrl:
          "http://api.gqmobiles.lk/wp-content/uploads/2024/09/Group-1.png",
      },
    },
  },
  {
    id: "2",
    slideFields: {
      mainHeading: "SAMSUNG Galaxy Watch FE",
      subHeading: "Precision in Every Movement",
      buttonText: "Buy Now",
      buttonLink: "https://gqmobiles.lk/samsung/samsung-galaxy-watch-fe",
      backgroundColor: "#CCE0EF",
      backgroundImage: bgSlide10.src,
      featureImage: {
        id: "2",
        sourceUrl:
          "https://api.gqmobiles.lk/wp-content/uploads/2024/09/WatchFE_FT02_Customize_PC.png",
      },
    },
  },
  {
    id: "3",
    slideFields: {
      mainHeading: "Silence the World, Hear the Detail",
      subHeading: "Apple AirPods 4 with Active Noise Cancellation (ANC) — 2024",
      buttonText: "Buy Now",
      buttonLink:
        "https://gqmobiles.lk/apple/apple-airpods-4-with-active-noise-cancellation-anc-2024",
      backgroundColor: "#CCE0EF",
      backgroundImage: bgSlide4.src,
      featureImage: {
        id: "2",
        sourceUrl:
          "https://api.gqmobiles.lk/wp-content/uploads/2024/09/Apple-AirPods-Hearing-Aid-240909_inline.jpg.large-removebg-preview.png",
      },
    },
  },

  {
    id: "4",
    slideFields: {
      mainHeading:
        "AirPods Pro (2nd generation) with MagSafe Charging Case (USB‑C) — 2024",
      subHeading: "USB-C Power, Pro-Level Performance",
      buttonText: "Buy Now",
      buttonLink:
        "https://gqmobiles.lk/apple/airpods-pro-2nd-generation-with-magsafe-charging-case-usb%E2%80%91c-2024",
      backgroundColor: "#CCE0EF",
      backgroundImage: bgSlide8.src,
      featureImage: {
        id: "2",
        sourceUrl:
          "https://api.gqmobiles.lk/wp-content/uploads/2024/09/file_2.png",
      },
    },
  },

  {
    id: "5",
    slideFields: {
      mainHeading: "Apple Watch Series 10",
      subHeading: "The Future on Your Wrist",
      buttonText: "Buy Now",
      buttonLink: "https://gqmobiles.lk/apple/apple-watch-series-10",
      backgroundColor: "#CCE0EF",
      backgroundImage: bgSlide9.src,

      featureImage: {
        id: "2",
        sourceUrl:
          "https://api.gqmobiles.lk/wp-content/uploads/2024/09/safety__eg2903fny6gm_large-removebg-preview.png",
      },
    },
  },

  {
    id: "6",
    slideFields: {
      mainHeading: "Apple AirPods Max (USB-C) — 2024",
      subHeading: "The Perfect Harmony of Sound and Tech",
      buttonText: "Buy Now",
      buttonLink: "https://gqmobiles.lk/apple/apple-watch-series-10",
      backgroundColor: "#CCE0EF",
      backgroundImage: bgSlide6.src,

      featureImage: {
        id: "2",
        sourceUrl:
          "https://api.gqmobiles.lk/wp-content/uploads/2024/09/gq-mobiles-apple-airpods-max-usb-type-c-2024-orange-2-removebg-preview.png",
      },
    },
  },

  {
    id: "7",
    slideFields: {
      mainHeading: 'iPad Air 11" &  13"',
      subHeading: "Where Performance Meets Portability",
      buttonText: "Buy Now",
      buttonLink:
        "https://gqmobiles.lk/apple/apple-ipad-air-6th-generation-wi-fi-13-inch-m2-chip",
      backgroundColor: "#CCE0EF",
      backgroundImage: bgSlide2.src,

      featureImage: {
        id: "2",
        sourceUrl:
          "https://api.gqmobiles.lk/wp-content/uploads/2024/09/ccddacd68dff4ee0927266e4f98d06c8-removebg-preview.png",
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
  ];

  const [newArrivals, mobiles, speakers, watches, backInStock] =
    await Promise.all(queries);

  return {
    newArrivals: newArrivals as (SimpleProduct & VariableProduct)[],
    mobiles: mobiles as (SimpleProduct & VariableProduct)[],
    speakers: speakers as (SimpleProduct & VariableProduct)[],
    watches: watches as (SimpleProduct & VariableProduct)[],
    backInStock: backInStock as (SimpleProduct & VariableProduct)[],
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
              {/* <div className="flex shrink-0 flex-row gap-0">
                <p className="flex items-center justify-center text-center text-lg font-semibold text-white md:text-lg lg:text-2xl">
                  iPhone 16 Available
                </p>
                <p className="flex w-full items-baseline justify-center">
                  <a
                    href="/iphone-16-product-link"
                    className="bg-blue-500 text-white font-semibold py-2 px-4 rounded"
                  >
                    Shop Now
                  </a>
                </p>
              </div> */}
              <div className="flex-col md:flex-row flex gap-5 justify-center text-center items-center">
                <div className="text-sm font-semibold text-white md:text-lg lg:text-2xl">
                  The ALL NEW Exclusive iPhone 16 Series Available
                </div>
                <div className="text-sm">
                  <a
                    href="https://gqmobiles.lk/apple/apple-iphone-16-pro"
                    className="bg-[#1b40af] text-white font-semibold py-2 px-4 rounded"
                  >
                    Shop Now
                  </a>
                </div>
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

        <div className="flex flex-col px-3  gap-10 lg:gap-16 sm:container sm:max-w-screen-2xl">
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
