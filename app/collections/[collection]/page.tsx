import { getClient } from "@/graphql/apollo-ssr";
import {
    GET_ALL_PRODUCTS, GET_BRAND, GET_BRAND_ARCHIVE,
    GET_CATEGORY, GET_CATEGORY_ARCHIVE,
    GET_VARIATIONS_PRODUCT,
} from "@/graphql/defs/products";
import { notFound } from "next/navigation";
import ArchiveLayout from "@/app/components/ArchiveLayout";
import {Metadata, ResolvingMetadata} from "next";

type Props = { params: { collection: string}}

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


export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    // read route params
    const id = params.collection

    // fetch data
    const { productCategory } = await getData(id)

    return {
        title: productCategory.name,
    }
}

const Page = async ({ params }: Props) => {
    const {  productCategory } = await getData(params.collection);

    return (
        <ArchiveLayout title={productCategory.name} category={productCategory} filters />
    );
};

export default Page;
