import { GetStaticPaths, GetStaticProps, GetStaticPropsContext } from 'next';
import { brands, Product, Brand } from '../data';

type ProductPageParams = {
    params: {
        brand: string;
        item: string;
    };
};

interface ProductPageProps {
    product: Product;
}

type ProductDetails = {
    name: string;
    description: string;
    category: string;
};

const extractProductDetails = (brand: string, item: string): ProductDetails | null => {
    const brandData = brands.find(b => b.name.toLowerCase() === brand);

    if (brandData && brandData.products) {
        const product = brandData.products.find(p => p.slug === item);

        if (product) {
            const { name, description, category } = product;
            return { name, description, category };
        }
    }

    return null;
};

const ProductPage = ({ params, product }: ProductPageParams & ProductPageProps) => {
    console.log(params);
    console.log({product});
    const extractedProductDetails = extractProductDetails(params.brand, params.item);

    if (!extractedProductDetails) {
        return <div>Loading...</div>;
    }

    const { name, description, category } = extractedProductDetails;

    return (
        <div className={`flex flex-col gap-2 bg-red-500 p-20`}>
            <h1>{name}</h1>
            <p>{description}</p>
            <p>{category}</p>
        </div>
    );
};

export async function generateStaticParams() {
    const brands: Brand[] = await import('../data').then((module) => module.brands);

    // return brands.map((product) => ({
    //     params: {brand: product.brand.toLowerCase(), item: product.slug},
    // }));

    const staticParams = [];

    for (const brand of brands) {
        if (brand.products) {
            for (const product of brand.products) {
                const params = {
                    params: {
                        brand: brand.name.toLowerCase(),
                        item: product.slug,
                    },
                };
                staticParams.push(params);
            }
        }
    }

    return staticParams;
}

export default ProductPage;
