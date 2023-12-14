// pages/[brand]/page.tsx
import Link from 'next/link';
import { Product } from './data';

interface ProductListProps {
    products: Product[];
}

const ProductList: React.FC<ProductListProps> = ({ products }) => {
    return (
        <ul>
            {products.map((product) => (
                <li key={product.id}>
                    <Link
                        href="/[brand]/[item]"
                        as={`/${product.brand.toLowerCase()}/${product.slug}`}
                    >
                        {product.name}
                    </Link>
                </li>
            ))}
        </ul>
    );
};

export default ProductList;
