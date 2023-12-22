

import SectionSliderCollections from "components/SectionSliderLargeProduct";
import SectionPromo1 from "components/SectionPromo1";
import ProductCard from "components/ProductCard";
import { PRODUCTS } from "@/data/data";
import {getClient} from "@/graphql/apollo-ssr";
import {GET_ALL_PRODUCTS, GET_CATEGORY, GET_VARIATIONS_PRODUCT} from "@/graphql/defs/products";
import {notFound} from "next/navigation";
import {Product} from "@/graphql/types/graphql";
import Image from "next/image";
import SidebarFilters from "@/app/components/SidebarFilters";
import ProductGrid from "@/app/components/ProductGrid";
import { useQuery } from "@apollo/client";
import TabFilters from "@/app/components/TabFilters";
// import TabFilters from "@/containers/TabFilters";

// import TabFilters from "";



export async function getData(categories : number[] | null = null)  {
    const {data} = await getClient().query(
        {
            query: GET_ALL_PRODUCTS,
            variables:   {
                categoryIdIn: categories
            }
        }
    );


    if (!data.products) {
        return {
            products: [],
            productCategories: [],
        }
    }

    return {
        products: data.products.edges,
        productCategories: data.productCategories.nodes,
    }
}



const Page = async () => {

    const { products, productCategories } = await getData()

    // console.log(products, productCategories);

    return (
        <div
            className={`nc-PageCollection2 `}
            data-nc-id="PageCollection2"
        >

            <div className="container py-16 lg:pb-28 lg:pt-20 space-y-16 sm:space-y-20 lg:space-y-28">
                <div className="space-y-10 lg:space-y-14">
                    {/* HEADING */}
                    <div className="max-w-screen-sm">
                        <h2 className="block text-2xl sm:text-3xl lg:text-4xl font-semibold">
                            All Collections
                        </h2>
                        <span className="block mt-4 text-neutral-500 dark:text-neutral-400 text-sm sm:text-base">
                            We not only help you design exceptional products, but also make it
                            easy for you to share your designs with more like-minded people.
                        </span>
                    </div>
                    <TabFilters />

                    <hr className="border-slate-200 dark:border-slate-700"/>
                    <main>
                        {/* LOOP ITEMS */}
                        <div className="flex flex-col lg:flex-row">
                            {/* <div className="lg:w-1/3 xl:w-1/4 pr-4">
                                <SidebarFilters
                                    categories={productCategories}
                                />
                            </div> */}
                            <div className="flex-shrink-0 mb-10 lg:mb-0 lg:mx-4 border-t lg:border-t-0"></div>
                            <div className="flex-1 ">
                                <ProductGrid products={products}/>
                            </div>
                        </div>
                    </main>
                </div>

                {/* === SECTION 5 === */}
                <hr className="border-slate-200 dark:border-slate-700"/>

                {/*<SectionSliderCollections />*/}
                <hr className="border-slate-200 dark:border-slate-700"/>

                {/* SUBCRIBES */}
                {/*<SectionPromo1 />*/}
            </div>
        </div>
    );
}



export default Page;
