import {getClient} from "@/graphql/apollo-ssr";
import {GET_ALL_PRODUCTS} from "@/graphql/defs/products";
import InstantSearchWrapper from "@/app/components/InstantSearchWrapper";

//
// const fetchData = async () => {
//     const startTime = new Date().getTime();
//
//     const response = await fetch('https://randomuser.me/api/',
//         // {
//         { cache: 'no-store' }
//         //     next: {
//         //         revalidate: 10
//         //     }
//         // }
//         );
//     const jsonData = await response.json();
//
//     const endTime = new Date().getTime();
//     const executionedTime = endTime - startTime;
//
//     return {
//         jsonData,
//         executionedTime
//     }
// };
async function getData(categories: number[] | null = null) {
    const startTime = new Date().getTime(); // Record the start time

    const { data, error } = await getClient().query({
        query: GET_ALL_PRODUCTS,
        // fetchPolicy: 'cache-and-network',
        // context:{
        //     fetchOptions:{
        //         next: {
        //             revalidate: 10
        //         }
        //     }
        // },
    });

    const endTime = new Date().getTime();
    const executionTime = endTime - startTime; 

    console.log(`getData function execution time: ${executionTime}ms`);

    return {
        productCategories: data.productCategories.nodes,
        brands: data.brands.nodes,
        executionTime
    };
}


async function Page() {

    const { productCategories, brands, executionTime } = await getData();
    console.log("execution time: ", executionTime);
    // const [client] = await Promise.all([getClient()]);
    // let resetStore = true
    // if (resetStore) await client.clearStore();
    // if (resetStore) await client.resetStore();
    // resetStore && console.log("Resettled Store");

    // const { jsonData, executionedTime } = await fetchData();
    // console.log("execution time for fetch: ", executionedTime);

    return <div className='container py-16'>

        {executionTime}

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
