import ProductList from './list';
import { products } from './data';

const ProductsPage: React.FC = () => {
    return (
        <div>
            <h1>All Products</h1>
            <ProductList products={products} />
        </div>
    );
};

export default ProductsPage;
