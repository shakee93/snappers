import {getClient} from "@/graphql/apollo-ssr";
import {GET_ALL_PRODUCTS} from "@/graphql/defs/products";
import InstantSearchWrapper from "@/app/components/InstantSearchWrapper";

async function getData(categories: number[] | null = null) {
    const { data, error } = await getClient().query({
        query: GET_ALL_PRODUCTS,
        fetchPolicy: 'no-cache'
    });

    return {
        productCategories: data.productCategories.nodes,
        brands: data.brands.nodes,
    };
}

async function Page() {

    const { productCategories, brands } = await getData();


    return <div className='container py-16'>

        <div className="max-w-screen-sm mb-10">
            <h2 className="block text-2xl sm:text-3xl lg:text-4xl font-semibold">
                Search
            </h2>
            <span className="block mt-4 text-neutral-500 dark:text-neutral-400 text-sm sm:text-base">
                Discover your next favorite find in just a few taps! Our mobile e-commerce platform is engineered for speed, bringing you a seamless shopping experience.
            </span>
        </div>

        <InstantSearchWrapper
            search
            filters
            categories={productCategories}
            brands={brands}
        >

        </InstantSearchWrapper>

    </div>
}

export default Page
