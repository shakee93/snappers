import {getClient} from "@/graphql/apollo-ssr";
import {
    GET_BRAND, GET_BRANDS,
} from "@/graphql/defs/products";
import {notFound} from "next/navigation";

import ArchiveLayout from "@/app/components/ArchiveLayout";
import {Brand} from "@/graphql/types/graphql";

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
