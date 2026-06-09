import ProductCard, {
  type ProductCardItem,
} from "@/components/home/ProductCard";

const ACCENT_GREEN = "#B8D962";

export interface SectionDealProductsProps {
  className?: string;
  products?: ProductCardItem[];
}

/** Row of deal product cards shown beneath the deals countdown banner. */
const SectionDealProducts = ({
  className = "",
  products = [],
}: SectionDealProductsProps) => {
  if (!products.length) return null;

  return (
    <section className={`mx-auto w-full max-w-[1368px] px-3 lg:px-0 ${className}`}>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            badgeLabel="Deals"
            accentColor={ACCENT_GREEN}
          />
        ))}
      </div>
    </section>
  );
};

export default SectionDealProducts;
