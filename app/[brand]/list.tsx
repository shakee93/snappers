import Link from 'next/link';
import { Brand, Product } from './data';

interface ProductListProps {
    brands: Brand[];
}

const ProductList: React.FC<ProductListProps> = ({ brands }) => {
    return (
        <ul>
            {brands.map((brand) => (
                // Check if products is defined before mapping
                brand.products?.map((product) => (
                    <li key={product.id}>
                        <Link
                            href="/[brand]/[item]"
                            as={`/${product.brand.toLowerCase()}/${product.slug}`}
                        >
                            {product.name}
                        </Link>
                    </li>
                )) || [] 
            ))}
        </ul>
    );
};

export default ProductList;
