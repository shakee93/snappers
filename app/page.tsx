import SectionHero2 from "@/app/components/HomePage/SectionHero";
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
import Heading from "@/components/Heading/Heading";
import SectionMagazine5 from "@/containers/BlogPage/SectionMagazine5";
import {getClient} from "@/graphql/apollo-ssr";
import {GET_SLIDES} from "@/graphql/defs/slides";

const getSlides = async () => {
  // const { data } = await getClient().query({
  //   query: GET_SLIDES,
  // })
  //
  // return data?.slides?.nodes
}

export default async function Home() {

  const slides = await getSlides()

  return (
    <main>
      <div className="nc-PageHome relative overflow-hidden">
        <div className="z-30">
          {/* <SectionHero2 /> */}
          {/*<SectionHero3 slides={slides} />*/}
        </div>
        <div className=" gap-4 container m-auto">
          <div className="my-10">
            <SectionSliderProductCard
              data={SPORT_PRODUCTS.filter((_, i) => i < 7)}
              subHeading="New Sports equipment"
              heading="New Arrivals"
            />
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
            subHeading= "Explore the Latest in Smartphone Innovation"
              heading="Mobiles"
          />

          {/* <div className="py-24 lg:py-32 border-t border-b border-slate-200 dark:border-slate-700">
            <SectionHowItWork />
          </div> */}

          {/* SECTION */}
          <div className="relative py-10 lg:py-20">
            <BackgroundSection className="bg-blue-100"/>

            <SectionPromo1 />
          </div>

          {/* SECTION */}
          <div className="relative py-24 lg:py-32">
            <BackgroundSection  />
            <SectionGridMoreExplore />
          </div>

          {/* SECTION */}
          {/* <SectionGridFeatureItems /> */}

          {/* <SectionPromo2 /> */}

          {/* SECTION 3 */}
          {/* <SectionSliderLargeProduct cardStyle="style2" /> */}

          {/* SECTION */}
          {/* <SectionSliderCategories /> */}

          {/* <SectionPromo3 /> */}

          <SectionSliderProductCard
            heading="Best Sellers"
            subHeading="Best selling of the month"
          />

          {/* <div className="relative py-24 lg:py-32"> */}
          {/* <BackgroundSection /> */}
          {/* <div>
              <Heading rightDescText="From the Ciseco blog">
                The latest news
              </Heading>
              <SectionMagazine5 />
              <div className="flex mt-16 justify-center">
                <ButtonSecondary>Show all blog articles</ButtonSecondary>
              </div>
            </div> */}
          {/* </div> */}

          {/* SECTION */}
          {/* <SectionClientSay /> */}
        </div>
      </div>
    </main>
  );
}
