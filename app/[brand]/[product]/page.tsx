import {getClient} from "@/lib/apollo-ssr";
import {GET_POST} from "@/lib/graphql/posts";
import {GET_CATEGORY_SLUGS, GET_PRODUCT, GET_PRODUCT_SLUGS} from "@/lib/graphql/products";
import {Product, ProductCategory} from "@/lib/graphql/types/graphql";
import {notFound} from "next/navigation";
import Image from "next/image";


export async function generateStaticParams() {

    const {data: {products}} = await getClient().query({
        query: GET_PRODUCT_SLUGS
    });

    return products.nodes.map((p: ProductCategory) => p.slug);
}

async function getData(slug: string, categorySlug: string) {

    try {
        const {data} = await getClient().query(
            {
                query: GET_PRODUCT,
                variables: {
                    productId: slug,
                    categoryId: categorySlug
                }
            }
        );

        if (!data.productCategory) {
            return notFound();
        }

        if (!data.product) {
            return notFound();
        }

        return data.product

    } catch (e ) {
        console.log(e);
        return notFound();
    }
}

const Page = async ({ params }: any) => {

    const product: Product = await getData(params.product, params.brand)

    return <div>
        <ul>
            <li>{product.name}</li>
            <li>
                <img width={100} height={100} src={product.image?.link || ''} alt={product.name || ''}/>
            </li>
        </ul>
    </div>
}

export default Page