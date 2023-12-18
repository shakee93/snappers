"use client";

import MainNav2 from "./components/Header/MainNav2";
import MainNav1 from "./components/Header/MainNav1";
import SectionHero2 from "@/components/SectionHero/SectionHero2";
import DiscoverMoreSlider from "components/DiscoverMoreSlider";
import SectionSliderProductCard from "@/app/components/SectionSliderProductCard";
import { PRODUCTS, SPORT_PRODUCTS } from "@/data/data";
import BackgroundSection from "@/components/BackgroundSection/BackgroundSection";
import SectionGridMoreExplore from "@/components/SectionGridMoreExplore/SectionGridMoreExplore";
// import SectionGridFeatureItems from "@/containers/SectionGridFeatureItems";
import SectionSliderCategories from "@/components/SectionSliderCategories/SectionSliderCategories";
import SectionClientSay from "@/components/SectionClientSay/SectionClientSay";
import SectionHowItWork from "@/components/SectionHowItWork/SectionHowItWork";
import SectionPromo1 from "@/components/SectionPromo1";
import SectionPromo2 from "@/components/SectionPromo2";
import SectionPromo3 from "@/components/SectionPromo3";
import SectionSliderLargeProduct from "@/components/SectionSliderLargeProduct";
import Heading from "@/components/Heading/Heading";
import SectionMagazine5 from "@/containers/BlogPage/SectionMagazine5";
import ButtonSecondary from "@/shared/Button/ButtonSecondary";
import SiteHeader from "containers/SiteHeader";
import Footer from "@/shared/Footer/Footer";
import Header from "@/app/components/Header/Header";
import SingleProductBlock from "./components/SingleProductBlock/SingleProductBlock";
import ProductCard from "./components/ProductCard2";

export default function Home() {
  return (
    <main>
      {/* <Header/> */}
      {/* <MainNav1 isTop /> */}
      {/* <SiteHeader /> */}
      {/* <div className="nc-Header relative w-full z-40 ">
        <MainNav1 isTop />
      </div> */}
      {/* <MainNav2 /> */}
      <div className="nc-PageHome relative overflow-hidden">
        {/* SECTION HERO */}
        <SectionHero2 />
        <div className=" gap-4 container m-auto">
          <div>
          <SectionSliderProductCard
          data={SPORT_PRODUCTS.filter((_, i) => i < 7)}
          subHeading="New Sports equipment"
        />
          </div>
          <div>
            {/* <SingleProductBlock/> */}
          </div>
          <div>
            {/* <SingleProductBlock/> */}
          </div>
          <div>
            {/* <SingleProductBlock/> */}
          </div>
          
        </div>

        <div className="mt-24 lg:mt-32">
          <DiscoverMoreSlider />
        </div>

        <div className="container relative space-y-24 my-24 lg:space-y-32 lg:my-32">
          {/* SECTION */}
          <SectionSliderProductCard
            data={[
              PRODUCTS[4],
              SPORT_PRODUCTS[5],
              PRODUCTS[7],
              SPORT_PRODUCTS[1],
              PRODUCTS[6],
            ]}
          />

          <div className="py-24 lg:py-32 border-t border-b border-slate-200 dark:border-slate-700">
            <SectionHowItWork />
          </div>

          {/* SECTION */}
          <SectionPromo1 />

          {/* SECTION */}
          <div className="relative py-24 lg:py-32">
            <BackgroundSection />
            <SectionGridMoreExplore />
          </div>

          {/* SECTION */}
          {/* <SectionGridFeatureItems /> */}

          <SectionPromo2 />

          {/* SECTION 3 */}
          <SectionSliderLargeProduct cardStyle="style2" />

          {/* SECTION */}
          <SectionSliderCategories />

          <SectionPromo3 />

          <SectionSliderProductCard
            heading="Best Sellers"
            subHeading="Best selling of the month"
          />

          <div className="relative py-24 lg:py-32">
            <BackgroundSection />
            <div>
              <Heading rightDescText="From the Ciseco blog">
                The latest news
              </Heading>
              <SectionMagazine5 />
              <div className="flex mt-16 justify-center">
                <ButtonSecondary>Show all blog articles</ButtonSecondary>
              </div>
            </div>
          </div>

          {/* SECTION */}
          <SectionClientSay />
        </div>
      </div>

      <Footer />
    </main>
  );
}
