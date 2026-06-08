import PromoProductCard, {
  type PromoProduct,
} from "@/components/home/PromoProductCard";

const ACCENT_TEAL = "#2D8B7B";

export interface SectionHealthProductsProps {
  className?: string;
  products?: PromoProduct[];
}

/** Row of health product cards shown beneath the health banner. */
const SectionHealthProducts = ({
  className = "",
  products = [],
}: SectionHealthProductsProps) => {
  if (!products.length) return null;

  return (
    <section className={`mx-auto w-full max-w-[1368px] px-3 lg:px-0 ${className}`}>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
        {products.map((product) => (
          <PromoProductCard
            key={product.id}
            product={product}
            badgeLabel="Health"
            accentColor={ACCENT_TEAL}
          />
        ))}
      </div>
    </section>
  );
};

export default SectionHealthProducts;
