import {getClient} from "@/graphql/apollo-ssr";
import {GET_ALL_PRODUCTS} from "@/graphql/defs/products";
import InstantSearchWrapper from "@/app/components/InstantSearchWrapper";
import {Category} from "@/graphql/types/graphql";
import Link from "next/link";
import Loading from './loading'

async function getData(categories: number[] | null = null) {
    const { data, error } = await getClient().query({
        query: GET_ALL_PRODUCTS,
    });

    return {
        productCategories: data.productCategories.nodes,
        brands: data.brands.nodes,
    };
}

const Page = async () => {

    const { productCategories } = await getData()

    // return <Loading/>;

    return <div>
        <div className="container py-8 lg:py-12 space-y-16 sm:space-y-20 lg:space-y-28">
            <div className="space-y-4 lg:space-y-14">
                <div className="max-w-screen-sm">
                    <h2 className="block text-2xl sm:text-3xl lg:text-4xl font-semibold">Browse Collections</h2>
                    <span className="block mt-2 lg:mt-4 text-neutral-500 dark:text-neutral-400 text-sm sm:text-base">{ " We not only help you design exceptional products, but also make it\n" +
                        "easy for you to share your designs with more like-minded people."}</span>
                </div>
                <hr className="border-slate-200 dark:border-slate-700 " />
                <main>
                    <div className="flex flex-col lg:flex-row">
                        <ul className="py-2 grid gird-cols-1 md:grid-cols-3 text-left text-sm text-gray-700 dark:text-gray-200">
                            {productCategories?.filter((category: Category) => category.count && category.count > 0).map((category: Category, index: number) => <li key={index}>
                                <Link
                                    href={`/collections/${category.slug}`}
                                    className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                                >
                                    {category.name} ({category.count})
                                </Link>
                                </li>
                            )}
                        </ul>
                    </div>
                </main>
            </div>
        </div>
    </div>
}

export default Page