import {getClient} from "@/graphql/apollo-ssr";
import {GET_POST} from "@/graphql/defs/posts";
import {GET_CATEGORY_SLUGS, GET_PRODUCT, GET_PRODUCT_SLUGS} from "@/graphql/defs/products";
import {Product, ProductCategory} from "@/graphql/defs/types/graphql";
import {notFound} from "next/navigation";
import Image from "next/image";
import {useQuery} from "@apollo/client";
import AddToCart from "@/app/components/AddToCart";


export async function generateStaticParams() {

    const {data: {products}} = await getClient().query({
        query: GET_PRODUCT_SLUGS
    });

    return products.nodes.map((p: ProductCategory) => p.slug);
}


async function getData(slug: string) {

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

        return data.product

    } catch (e ) {
        console.log(e);
        return notFound();
    }
}

const Page = async ({ params }: any) => {

    const product: Product = await getData(params.slug)

    return <div className='mt-24'>
        <ul>
            <li> {product.name}</li>
            <li>
                <Image width={300} height={300} src={product.image?.sourceUrl || ''}
                       alt={product.name || ''}/>
            </li>

           <AddToCart product={product}/>

        </ul>
    </div>;
}

export default Page