'use client';

import MainNav2 from "./components/Header/MainNav2";
import MainNav1 from "./components/Header/MainNav1";
import SectionHero2 from "./components/SectionHero/SectionHero2";
import DiscoverMoreSlider from "./components/DiscoverMoreSlider";
import SectionSliderProductCard from "./components/SectionSliderProductCard";
import { PRODUCTS, SPORT_PRODUCTS } from "@/data/data";
import BackgroundSection from "@/app/components/BackgroundSection/BackgroundSection";
import SectionGridMoreExplore from "@/app/components/SectionGridMoreExplore/SectionGridMoreExplore";
import SectionGridFeatureItems from "@/app/containers/SectionGridFeatureItems";
import SectionSliderCategories from "@/app/components/SectionSliderCategories/SectionSliderCategories";
import SectionClientSay from "@/app/components/SectionClientSay/SectionClientSay";
import SectionHowItWork from "@/app/components/SectionHowItWork/SectionHowItWork";
import SectionPromo1 from "@/app/components/SectionPromo1";
import SectionPromo2 from "@/app/components/SectionPromo2";
import SectionPromo3 from "@/app/components/SectionPromo3";
import SectionSliderLargeProduct from "@/app/components/SectionSliderLargeProduct";
import Heading from "@/app/components/Heading/Heading";
import SectionMagazine5 from "@/app/containers/BlogPage/SectionMagazine5";
import ButtonSecondary from "@/shared/Button/ButtonSecondary";
import Footer from '@/shared/Footer/Footer';

export default function Home() {
  return (
    <main>
      <MainNav1 isTop />
      {/* <MainNav2 /> */}
      <div className="nc-PageHome relative overflow-hidden">
        {/* SECTION HERO */}
        <SectionHero2 />

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
          <SectionGridFeatureItems />

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
  )
}
