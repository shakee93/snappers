import {getClient} from "@/graphql/apollo-ssr";
import {GET_BRANDS, GET_CATEGORY_SLUGS, GET_PRODUCT, GET_PRODUCT_SLUGS} from "@/graphql/defs/products";
import {Brand, Product, ProductCategory} from "@/graphql/types/graphql";
import {notFound} from "next/navigation";
import Image from "next/image";
import {useQuery} from "@apollo/client";
import AddToCart from "@/app/components/AddToCart";
import InnerImageZoom from "react-inner-image-zoom";
import ProductDetails from "@/app/components/SingleProductPage/ProductDetails";
import Features from "@/app/components/SingleProductPage/FeatureCard";
import ProductOverview from "@/app/components/SingleProductPage/ProductOverview";
import SectionSliderProductCard from "@/app/components/SectionSliderProductCard";
import {PRODUCTS, SPORT_PRODUCTS} from "@/data/data";
import Link from "next/link";


export async function generateStaticParams() {

    const {data: {brands}} = await getClient().query({
        query: GET_BRANDS
    });

    return brands.nodes.map((p: Brand) => p.slug);
}


async function getData(slug: string, brand: string) {

    try {

        const {data} = await getClient().query(
            {
                query: GET_PRODUCT,
                variables: {
                    productId: slug,
                },
                fetchPolicy: 'no-cache'
            }
        );

        if (!data.product) {
            return notFound();
        }

        const productBrand = data.product.terms?.nodes.find((term: Brand) => term.__typename === 'Brand') || {
            name: 'Product',
            slug: 'product'
        };


        if(productBrand.slug !== brand) {
            return notFound()
        }

        return {
            product: data.product,
            brand: productBrand
        }

    } catch (e ) {
        console.log(e);
        return notFound();
    }
}

const Page = async ({ params }: any) => {

    const { product, brand} = await getData(params.slug, params.brand)


    return <div className='mt-24'>
        <main className="container m-auto">

            <div className="mt-5 text-xs md:px-5 md:text-base">
                <Link href='/'>Home</Link> &gt; <Link href={`/${brand.slug}`}>{brand.name}</Link> &gt; <Link href={`/${brand.slug}/${product.slug}`}>{product.name}</Link>
            </div>

            <div>

            </div>
            <div className="flex flex-col md:flex-row p-3 rounded-3xl mt-5 md:mt-6 md:p-10 bg-white">

                <div className="w-full md:w-2/5 flex-col gap-2">

                    {/*<div className="w-full flex p-4 min-h-[400px]">*/}
                    {/*    {selectedImage && (*/}
                    {/*        <InnerImageZoom*/}
                    {/*            src={selectedImage.thumbnail}*/}
                    {/*            zoomSrc={selectedImage.original}*/}
                    {/*            zoomType="hover"*/}
                    {/*            zoomPreload={false}*/}
                    {/*            className="object-cover w-full h-auto "*/}
                    {/*        />*/}
                    {/*    )}*/}
                    {/*</div>*/}

                    {/*<div className="flex w-full md:w-full p-2">*/}
                    {/*    <ImageGallery*/}
                    {/*        // style={{ objectFit: 'cover' }}*/}
                    {/*        images={images}*/}
                    {/*        onThumbnailClick={handleThumbnailClick}*/}
                    {/*        selectedImage={selectedImage}*/}
                    {/*    />*/}
                    {/*</div>*/}

                </div>


                <div className="md:w-2/5 flex flex-col p-2 gap-y-1 md:gap-y-3">
                    <ProductDetails product={product} />
                </div>

                <div className="hidden lg:block w-full md:w-1/5 ">
                    <Features />
                </div>

            </div>

            {/* Image Gallery */}


            <ProductOverview />
            <div className=" lg:hidden w-full lg:w-1/5 p-3 bg-white rounded-3xl my-5">
                <Features />
            </div>
            <div className="py-5 rounded-3xl my-5">
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
    </div>;
}

export default Page