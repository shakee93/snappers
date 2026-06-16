import DealProductCarousel from "@/components/home/DealProductCarousel";
import { type ProductCardItem } from "@/components/home/ProductCard";

export interface SectionDealProductsProps {
  className?: string;
  products?: ProductCardItem[];
}

/** Deal product carousel shown beneath the deals countdown banner. */
const SectionDealProducts = ({
  className = "",
  products = [],
}: SectionDealProductsProps) => {
  if (!products.length) return null;

  return (
    <section className={`mx-auto w-full max-w-[1368px] px-3 lg:px-0 ${className}`}>
      <DealProductCarousel products={products} />
    </section>
  );
};

export default SectionDealProducts;
