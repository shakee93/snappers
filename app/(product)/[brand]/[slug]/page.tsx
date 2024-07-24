import { getClient } from "@/graphql/apollo-ssr";
import { GET_BRANDS, GET_PRODUCT } from "@/graphql/defs/products";
import { Brand, SimpleProduct, VariableProduct } from "@/graphql/types/graphql";
import { notFound } from "next/navigation";
import ProductDetails from "@/app/components/SingleProductPage/ProductDetails";
import Features from "@/app/components/SingleProductPage/FeatureCard";
import ProductOverview from "@/app/components/SingleProductPage/ProductOverview";
import Link from "next/link";
import ProductImage from "@/app/components/SingleProductPage/ProductImage2";
import { Suspense } from "react";
import { Metadata, ResolvingMetadata } from "next";
import { ImageProvider } from "@/context/ImageChangeGrabber";

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
  const { product, brand } = await getData(params.slug, params.brand);
  // const price = product.price || "the best price";
  const price = product.price ? product.price.replace(/₨|&nbsp;/g, '') : "the best price";

  return {
    title: product.name,
    // description: `This ${product.name} is at GQMobile.lk. The best price in Sri Lanka for ${brand.name} priced at ${price}.`,
    description: `This ${product.name} is at GQMobile.lk. The best price in Sri Lanka for ${brand.name} priced at Rs.${price}.`,

    openGraph: {
      title: product.name,
      description:  "Check out this product!",
      url: `https://gqmobiles.lk/${params.brand}/${params.slug}`,
      images: [
        {
          url: product.image?.sourceUrl || 'https://gqmobiles.lk/default-og-image.jpg',
          width: 800,
          height: 600,
          alt: "GQ Mobiles",
        },
      ],
    },
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
        <div className="md:mt-0 text-sm md:px-5 md:text-[0.95rem] md:ml-4">
          <Link href="/">Home</Link> &gt;{" "}
          <Link href={`/${brand.slug}`}>{brand.name}</Link> &gt;{" "}
          <Link href={`/${brand.slug}/${product.slug}`}>{product.name}</Link>
        </div>
        <div></div>
        <div className="flex flex-col md:flex-row p-3 rounded-3xl mt-5 md:mt-3 md:p-6 md:py-6 bg-white ">
          <ImageProvider>
            <div className="w-full md:w-6/12 flex-col gap-6 md:pr-10">
              <Suspense fallback={<>loading...</>}>
                <ProductImage product={product} />
              </Suspense>
              <div className="hidden lg:block w-full mt-6">
                <Features />
              </div>
            </div>
            <div className="md:w-6/12 flex flex-col p-2 gap-y-1 md:gap-y-1.5">
              <ProductDetails brand={brand} product={product} />
            </div>
          </ImageProvider>
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