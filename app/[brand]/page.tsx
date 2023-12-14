import ProductList from './list';
import { brands } from './data';

const ProductsPage: React.FC = () => {
    return (
        <div>
            <h1>All Products</h1>
            <ProductList brands={brands} />
        </div>
    );
};

export default ProductsPage;
