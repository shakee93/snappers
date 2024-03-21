import {getClient} from "@/graphql/apollo-ssr";
import {GET_BRANDS, GET_PRODUCT} from "@/graphql/defs/products";
import {Brand, SimpleProduct, VariableProduct} from "@/graphql/types/graphql";
import {notFound} from "next/navigation";
import ProductDetails from "@/app/components/SingleProductPage/ProductDetails";
import Features from "@/app/components/SingleProductPage/FeatureCard";
import ProductOverview from "@/app/components/SingleProductPage/ProductOverview";
import Link from "next/link";
import ProductImage from "@/app/components/SingleProductPage/ProductImage2";
import {Suspense} from "react";
import {Metadata, ResolvingMetadata} from "next";
import {ImageProvider} from "@/context/ImageChangeGrabber";
import "styles/embla.css";
export const dynamic = 'force-dynamic'

type Props = {
  params: {
    slug: string;
    brand: string;
  };
};

export async function generateStaticParams() {
  const {
    data: { brands },
  } = await getClient().query({
    query: GET_BRANDS,
  });
  return brands.nodes.map((p: Brand) => p.slug);
}

async function getData(slug: string, brand: string) {
  try {
    const { data } = await getClient().query({
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
    return {
      product: data.product,
      brand: productBrand,
    };
  } catch (e) {
    // console.log(e);
    return notFound();
  }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // fetch data
  const { product } = await getData(params.slug, params.brand);
  return {
    title: product.name,
  };
}
const Page = async ({ params }: Props) => {
  // return <LoadingBrands/>
  const {
    product,
    brand,
  }: {
    product: SimpleProduct & VariableProduct;
    brand: Brand;
  } = await getData(params.slug, params.brand);

  

  return (
    <div className="mt-5 md:mt-10">
      <main className="container m-auto">
        <div className="md:mt-0 text-sm md:px-5 md:text-lg">
          <Link href="/">Home</Link> &gt;{" "}
          <Link href={`/${brand.slug}`}>{brand.name}</Link> &gt;{" "}
          <Link href={`/${brand.slug}/${product.slug}`}>{product.name}</Link>
        </div>
        <div></div>
        <div className="flex flex-col md:flex-row p-3 rounded-3xl mt-5 md:mt-6 md:p-10 bg-white">

          <ImageProvider>
            <div className="w-full md:w-2/5 flex-col gap-2 md:pr-10">
              <Suspense fallback={<>loading...</>}>
                <ProductImage product={product} />
              </Suspense>
            </div>
            <div className="md:w-2/5 flex flex-col p-2 gap-y-1 md:gap-y-3">
              <ProductDetails brand={brand} product={product} />
            </div>
          </ImageProvider>
          <div className="hidden lg:block w-full md:w-1/5 ">
            <Features />
          </div>
        </div>
        {/* Image Gallery */}
        <ProductOverview product={product} />
        <div className=" lg:hidden w-full lg:w-1/5 p-3 bg-white rounded-3xl my-5">
          <Features />
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