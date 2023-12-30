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
import ArchiveLayout from "@/app/components/ArchiveLayout";


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
        brand: data.brand,
    }
}

const Page = async ({ params } : {
    params: {
        brand: string
    }
}) => {

    const { brand } = await getData(params.brand)

    return (
        <ArchiveLayout title={brand.name} brand={brand} filters />
    );
}



export default Page;
