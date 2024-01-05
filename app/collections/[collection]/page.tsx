import { getClient } from "@/graphql/apollo-ssr";
import {
    GET_ALL_PRODUCTS, GET_BRAND, GET_BRAND_ARCHIVE,
    GET_CATEGORY, GET_CATEGORY_ARCHIVE,
    GET_VARIATIONS_PRODUCT,
} from "@/graphql/defs/products";
import { notFound } from "next/navigation";
import ArchiveLayout from "@/app/components/ArchiveLayout";

async function getData(slug : string | null = null)  {

    const {data} = await getClient().query(
        {
            query: GET_CATEGORY,
            variables:   {
                categoryId: slug
            },
        }
    );

    if (!data.productCategory) {
        return notFound()
    }

    return {
        productCategory: data.productCategory,
    }
}

const Page = async ({ params }: { params: { collection: string}}) => {
    const {  productCategory } = await getData(params.collection);

    return (
        <ArchiveLayout title={productCategory.name} category={productCategory} filters />
    );
};

export default Page;
