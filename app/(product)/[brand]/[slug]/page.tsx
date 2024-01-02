import {getClient} from "@/graphql/apollo-ssr";
import {
    GET_BRANDS,
    GET_CATEGORY_SLUGS,
    GET_PRODUCT,
    GET_PRODUCT_SLUGS,
    GET_TECH_SPEC,
} from "@/graphql/defs/products";
import {
    Brand,
    Product,
    ProductCategory,
    SimpleProduct,
    VariableProduct,
} from "@/graphql/types/graphql";
import {notFound} from "next/navigation";
import Image from "next/image";
import {EmblaOptionsType} from "embla-carousel-react";

import {useQuery} from "@apollo/client";
import AddToCart from "@/app/components/AddToCart";
import InnerImageZoom from "react-inner-image-zoom";
import ProductDetails from "@/app/components/SingleProductPage/ProductDetails";
import Features from "@/app/components/SingleProductPage/FeatureCard";
import ProductOverview from "@/app/components/SingleProductPage/ProductOverview";
import SectionSliderProductCard from "@/app/components/SectionSliderProductCard";
import {PRODUCTS, SPORT_PRODUCTS} from "@/data/data";
import Link from "next/link";
import ImageGallery from "@/app/[brand]/imageGallery";
import ProductImage from "@/app/components/SingleProductPage/ProductImage2";

export async function generateStaticParams() {
    const {
        data: {brands},
    } = await getClient().query({
        query: GET_BRANDS,
    });
    return brands.nodes.map((p: Brand) => p.slug);
}

async function getData(slug: string, brand: string) {
    try {
        const {data} = await getClient().query({
            query: GET_PRODUCT,
            variables: {
                productId: slug,
            },
            fetchPolicy: "no-cache",
        });
        if (!data.product) {
            return notFound();
        }
        const productBrand = data.product.brands?.nodes[0] || {
            name: "Product",
            slug: "product",
        };
        if (productBrand.slug !== brand) {
            return notFound();
        }
        const productId = data.product.databaseId;
        console.log({productId});
        const results = await getClient().query({
            query: GET_TECH_SPEC,
            variables: {
                productId: productId,
            },
            fetchPolicy: "no-cache",
        });
        return {
            product: data.product,
            brand: productBrand,
            tech: results.data,
        };
    } catch (e) {
        // console.log(e);
        return notFound();
    }
}

const Page = async ({params}: any) => {
    const {
        product,
        brand,
        tech,
    }: {
        product: SimpleProduct & VariableProduct;
        brand: Brand;
        tech: any;
    } = await getData(params.slug, params.brand);
    const techValue = tech?.product.metaData[0]?.value;
    const techspecs = JSON.parse(techValue);
    // console.log('techspecs: jaka jaka', tech);

    // console.log("techasdasd", tech.product)
    // console.log({product})

    const OPTIONS: EmblaOptionsType = {};
    const SLIDE_COUNT = 7;
    const SLIDES = Array.from(Array(SLIDE_COUNT).keys());
    return (
        <div className="mt-5 md:mt-16">
            <main className="container m-auto">
                <div className="md:mt-5 text-xs md:px-5 md:text-base">
                    <Link href="/">Home</Link> &gt;{" "}
                    <Link href={`/${brand.slug}`}>{brand.name}</Link> &gt;{" "}
                    <Link href={`/${brand.slug}/${product.slug}`}>{product.name}</Link>
                </div>
                <div></div>
                <div className="flex flex-col md:flex-row p-3 rounded-3xl mt-5 md:mt-6 md:p-10 bg-white">
                    <div className="w-full md:w-2/5 flex-col gap-2 pr-10">
                        <ProductImage product={product} slides={SLIDES} options={OPTIONS}/>
                    </div>
                    <div className="md:w-2/5 flex flex-col p-2 gap-y-1 md:gap-y-3">
                        <ProductDetails brand={brand} product={product}/>
                    </div>
                    <div className="hidden lg:block w-full md:w-1/5 ">
                        <Features/>
                    </div>
                </div>
                {/* Image Gallery */}
                <ProductOverview product={product} techspecs={techspecs}/>
                <div className=" lg:hidden w-full lg:w-1/5 p-3 bg-white rounded-3xl my-5">
                    <Features/>
                </div>
                <div className="hidden py-5 rounded-3xl my-5">
                    {/*<SectionSliderProductCard*/}
                    {/*    data={[*/}
                    {/*        PRODUCTS[4],*/}
                    {/*        SPORT_PRODUCTS[5],*/}
                    {/*        PRODUCTS[7],*/}
                    {/*        SPORT_PRODUCTS[1],*/}
                    {/*        PRODUCTS[6],*/}
                    {/*    ]}*/}
                    {/*    heading="Related Products"*/}
                    {/*/>*/}
                </div>
            </main>
        </div>
    );
};
export default Page;
