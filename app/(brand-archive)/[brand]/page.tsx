import {getClient} from "@/graphql/apollo-ssr";
import {GET_BRAND,} from "@/graphql/defs/products";
import {notFound} from "next/navigation";

import ArchiveLayout from "@/app/components/archive/ArchiveLayout";
import {Metadata, ResolvingMetadata} from "next";

// export const dynamic = 'force-dynamic';

// export async function generateStaticParams() {
//     const {data} = await getClient().query(
//         {
//             query: GET_BRANDS,
//         }
//     );
//
//     return data.brands.nodes.map((brand: Brand) => ({
//         brand: brand.slug,
//     }))
// }

type Props = {
    params: { brand: string }
}



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

export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    // read route params
    const id = params.brand

    // fetch data
    const { brand } = await getData(id)

    return {
        title: brand.name,
    }
}

const Page = async ({ params } : {
    params: {
        brand: string
    }
}) => {
    const { brand } = await getData(params.brand)
    return (
        <ArchiveLayout title={brand.name} description={brand.description} brand={brand} filters />
    );
}



export default Page;
