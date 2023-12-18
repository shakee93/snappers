import {getClient} from "@/lib/apollo-ssr";
import {notFound} from 'next/navigation'
import {GET_POST, GET_POST_SLUGS} from "@/lib/graphql/posts";
import {Post, ProductCategory} from "@/lib/graphql/types/graphql";
import parseHTML from "html-react-parser";
import {GET_CATEGORY, GET_CATEGORY_SLUGS} from "@/lib/graphql/products";
import Image from "next/image";

export async function generateStaticParams() {

    const {data: {productCategories}} = await getClient().query({
        query: GET_CATEGORY_SLUGS
    });

    return productCategories.nodes.map((p: ProductCategory) => p.slug);
}

async function getData(slug: string) {
    const {data} = await getClient().query(
        {
            query: GET_CATEGORY,
            variables: {
                categoryId: slug
            }
        }
    );


    if (!data.productCategory) {
        return undefined
    }

    return data.productCategory
}

const Brand = async ({params}: { params: { brand: string} }) => {
    const post = await getData(params.brand)

    if (!post) {
        notFound()
    }

    return <div>
        <div>
            {parseHTML(post.name)}
        </div>
    </div>
}

export default Brand