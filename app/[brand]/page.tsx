import SectionSliderCollections from "components/SectionSliderLargeProduct";
import SectionPromo1 from "components/SectionPromo1";
import ProductCard from "components/ProductCard";
import { PRODUCTS } from "@/data/data";
import {getClient} from "@/graphql/apollo-ssr";
import {
    GET_ALL_PRODUCTS,
    GET_BRAND,
    GET_BRAND_ARCHIVE, GET_BRANDS,
    GET_CATEGORY,
    GET_VARIATIONS_PRODUCT
} from "@/graphql/defs/products";
import {notFound} from "next/navigation";
import {Brand, Product} from "@/graphql/types/graphql";
import Image from "next/image";
import SidebarFilters from "@/app/components/SidebarFilters";
import ProductGrid from "@/app/components/ProductGrid";
import InstantSearchWrapper from "@/app/components/InstantSearchWrapper";


async function getData(slug : string | null = null)  {


    const {data} = await getClient().query(
        {
            query: GET_BRAND,
            variables:   {
                brandId: slug
            },
        }
    );

    if (!data.brand) {
        return notFound()
    }

    return {
        productCategories: data.productCategories.nodes,
        brand: data.brand,
        brands: data.brands.nodes
    }
}

const Page = async ({ params } : {
    params: {
        brand: string
    }
}) => {

    const { productCategories, brand, brands } = await getData(params.brand)



    return (
        <div
            className={`nc-PageCollection2 `}
            data-nc-id="PageCollection2"
        >
            <div className="container py-16 lg:pb-24 lg:pt-12 space-y-16 sm:space-y-20 lg:space-y-28">
                <div className="space-y-10 lg:space-y-14">
                    {/* HEADING */}
                    <div className="max-w-screen-sm">
                        <h2 className="block text-2xl sm:text-3xl lg:text-4xl font-semibold">
                            {brand.name}
                        </h2>
                        <span className="block mt-4 text-neutral-500 dark:text-neutral-400 text-sm sm:text-base">
                            We not only help you design exceptional products, but also make it
                            easy for you to share your designs with more like-minded people.
                        </span>
                    </div>

                    <hr className="border-slate-200 dark:border-slate-700"/>
                    <main>
                        {/* LOOP ITEMS */}
                        <div className="flex flex-col lg:flex-row">
                            <div className="flex-shrink-0 mb-10 lg:mb-0 lg:mx-4 border-t lg:border-t-0"></div>
                            <div className="flex-1 ">
                                <InstantSearchWrapper
                                    filters
                                    brand={brand}
                                    categories={productCategories}
                                    brands={brands}
                                >

                                </InstantSearchWrapper>
                            </div>
                        </div>
                    </main>
                </div>

                {/* === SECTION 5 === */}
                {/*<hr className="border-slate-200 dark:border-slate-700"/>*/}

                {/*<SectionSliderCollections />*/}
                {/*<hr className="border-slate-200 dark:border-slate-700"/>*/}

                {/* SUBCRIBES */}
                {/*<SectionPromo1 />*/}
            </div>
        </div>
    );
}



export default Page;
