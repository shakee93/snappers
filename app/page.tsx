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
import bgSlide2 from '@/public/homepage/slider/Layer_2.png';
import kokoBg from '@/public/homepage/slider/koko.png';
import bgSlide3 from '@/public/homepage/slider/Layer_3.png';
import bgSlide4 from '@/public/homepage/slider/Layer_4.png';
import bgSlide5 from '@/public/homepage/slider/Layer_5.png';
import bgSlide6 from '@/public/homepage/slider/Layer_6.png';
import bgSlide7 from '@/public/homepage/slider/Layer_7.png';
import bgSlide8 from '@/public/homepage/slider/Layer_8.png';
import bgSlide9 from '@/public/homepage/slider/Layer_9.png';
import bgSlide10 from '@/public/homepage/slider/Layer_10.png';
import bgSlide11 from '@/public/homepage/slider/Layer_11.png';


const slidesData = [
  {
    id: "1",
    slideFields: {
      mainHeading: "Shop now, pay later with Koko.",
      subHeading: "No interest, No card block",
      buttonText: "Contact",
      buttonLink: "/contact",
      backgroundColor: "#CCE0EF",
      backgroundImage:kokoBg.src,
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
      mainHeading: "Pioneering Excellence",
      subHeading: "Samsung Galaxy Watch 7: Smart, Stylish, Superior",
      buttonText: "Buy Now",
      buttonLink: "/samsung/samsung-galaxy-watch7",
      backgroundColor: "#CCE0EF",
      backgroundImage:bgSlide10.src,
      featureImage: {
        id: "2",
        sourceUrl:
          "http://api.gqmobiles.lk/wp-content/uploads/2024/07/ph-galaxy-watch7-l310-sm-l310nzgaasa-542245338.avif",
      },
    },
  },
  {
    id: "3",
    slideFields: {
      mainHeading: "Ultimate Precision",
      subHeading: "Samsung Galaxy Watch Ultra: Style Meets Performance",
      buttonText: "Buy Now",
      buttonLink: "/samsung/samsung-galaxy-watch-ultra",
      backgroundColor: "#CCE0EF",
      backgroundImage:bgSlide8.src,
      featureImage: {
        id: "2",
        sourceUrl:
          "http://api.gqmobiles.lk/wp-content/uploads/2024/07/Samsung-Galaxy-Watch-Ultra-47mm-Titanium-Grey-C-small-removebg-preview.png",
      },
    },
  },

  {
    id: "4",
    slideFields: {
      mainHeading: "Innovation Redefined",
      subHeading: "CMF Phone 1: Simple, Elegant, Powerful",
      buttonText: "Buy Now",
      buttonLink: "/cmf/cmf-phone-1",
      backgroundColor: "#CCE0EF",
      backgroundImage:bgSlide4.src,
      featureImage: {
        id: "2",
        sourceUrl:
          "http://api.gqmobiles.lk/wp-content/uploads/2024/07/CMF-Phone-1-orange-removebg-preview.png",
      },
    },
  },

  {
    id: "5",
    slideFields: {
      mainHeading: "Flip Your World",
      subHeading: "Samsung Galaxy Z Flip 6: Elegance Redefined in Every Flip",
      buttonText: "Buy Now",
      buttonLink: "/samsung/samsung-galaxy-z-flip6-5g",
      backgroundColor: "#CCE0EF",
      backgroundImage:bgSlide9.src,

      featureImage: {
        id: "2",
        sourceUrl:
          "http://api.gqmobiles.lk/wp-content/uploads/2024/07/Galaxy-Z-Flip-6-4-removebg-preview.png",
      },
    },
  },

  {
    id: "6",
    slideFields: {
      mainHeading: "Unfold Excellence",
      subHeading: "Z Fold 6 : Cutting-Edge Innovation, Unmatched Sophistication",
      buttonText: "Buy Now",
      buttonLink: "/samsung/samsung-galaxy-z-fold6-5g",
      backgroundColor: "#CCE0EF",
      backgroundImage:bgSlide6.src,

      featureImage: {
        id: "2",
        sourceUrl:
          "http://api.gqmobiles.lk/wp-content/uploads/2024/07/uk-galaxy-z-fold6-f956-sm-f956bzsneub-542454423.avif",
      },
    },
  },

  {
    id: "7",
    slideFields: {
      mainHeading: "Power Up Swiftly",
      subHeading: "Apple 20W USB-C Power Adapter",
      buttonText: "Buy Now",
      buttonLink: "/apple/apple-20w-usb-c-power-adapter",
      backgroundColor: "#CCE0EF",
      backgroundImage:bgSlide2.src,

      featureImage: {
        id: "2",
        sourceUrl:
          "http://api.gqmobiles.lk/wp-content/uploads/2024/08/apple-1607949659-removebg-preview.png",
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
    getClient().query({ query: GET_PRODUCTS_NODES }).then(res => {
      return res.data?.products?.nodes || [];
    }).catch(() => {
      console.error('Error fetching new arrivals');
      return [];
    }),

    getClient().query({
      query: GET_PRODUCTS_NODES,
      variables: { first: 10, categoryIdIn: [165] },
    }).then(res => {
      return res.data?.products?.nodes || [];
    }).catch(() => {
      console.error('Error fetching mobiles');
      return [];
    }),

    getClient().query({
      query: GET_PRODUCTS_NODES_HOMEPAGE,
      variables: { first: 10, tagId: 538 },
    }).then(res => {
      return res.data?.products?.nodes || [];
    }).catch(() => {
      console.error('Error fetching speakers');
      return [];
    }),

    getClient().query({
      query: GET_PRODUCTS_NODES,
      variables: { first: 10, categoryIdIn: [302] },
    }).then(res => {
      return res.data?.products?.nodes || [];
    }).catch(() => {
      console.error('Error fetching watches');
      return [];
    }),

    getClient().query({
      query: GET_PRODUCTS_NODES_HOMEPAGE,
      variables: { first: 10, tagId: 536 },
    }).then(res => {
      console.debug('Back In Stock Response:', res);
      return res.data?.products?.nodes || [];
    }).catch(() => {
      console.error('Error fetching back in stock');
      return [];
    }),
  ];

  const [newArrivals, mobiles, speakers, watches, backInStock] = await Promise.all(queries);

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
        {/* <div className="bg-[#285f38] px-2 py-4 md:p-3">
          <div className="items-between flex flex-col gap-4 md:flex-row md:items-center md:gap-3">
            <div className="flex w-full flex-col items-center justify-center gap-2 md:flex-row">
              <div className="flex shrink-0 flex-col gap-0">
                <p className="items-center justify-center text-center text-lg font-semibold text-white md:text-lg lg:text-2xl">
                  Up to 24 Month Bank Installment Plans
                  <span className="mt-2 flex shrink-0 justify-center text-[10px] font-semibold leading-none text-gray-400 md:mt-0 md:justify-center xl:text-xs">
                    (T & C Apply)
                  </span>
                </p>
                <p className="flex w-full items-baseline justify-end gap-2 md:gap-1"></p>
              </div>

            </div>
          </div>
        </div> */}
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
