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
import Footer from '@/shared/Footer/Footer';
import Header from "./components/globalComponents/Header";

export default function Home() {
  return (
    <main>

      <Header/>
      {/* <MainNav1 isTop /> */}
      <MainNav2 />
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

          {/* SECTION */}
          <div className="relative py-24 lg:py-32">
            <BackgroundSection />
            <SectionGridMoreExplore />
          </div>

           {/* SECTION */}
          <SectionGridFeatureItems />

          {/* SECTION */}
          <SectionSliderCategories />

           {/* SECTION */}
          <SectionClientSay />

        </div>
      </div>
      
      <Footer />
    </main>
  )
}
