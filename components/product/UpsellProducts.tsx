import ProductCard from "@/components/home/ProductCard";
import upsellContent from "@/content/product-upsell.json";
import { filterHiddenProducts } from "@/lib/hidden-products";
import type {
  ProductVariation,
  SimpleProduct,
  VariableProduct,
} from "@/graphql/types/graphql";

const DISPLAY_LIMIT = 4;

type UpsellProduct = SimpleProduct | VariableProduct;

const hasDisplayPrice = (product: UpsellProduct): boolean => {
  if (product.price || product.regularPrice || product.salePrice) {
    return true;
  }

  const variationNodes =
    "variations" in product && product.variations
      ? (product.variations.nodes ?? []).filter(
          (variation): variation is ProductVariation => !!variation,
        )
      : [];

  return variationNodes.some(
    (variation) =>
      variation.price || variation.regularPrice || variation.salePrice,
  );
};

const UpsellProducts = ({
  relatedProducts,
}: {
  relatedProducts: UpsellProduct[];
}) => {
  const products = filterHiddenProducts(relatedProducts)
    .filter(hasDisplayPrice)
    .slice(0, DISPLAY_LIMIT);

  if (!products.length) {
    return null;
  }

  const { description } = upsellContent as { description: string };

  return (
    <section className="w-full bg-white px-3 py-12 md:py-16 lg:px-6">
      <div className="mx-auto w-full max-w-[1368px]">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-albra text-3xl font-bold leading-tight text-[#092412] sm:text-4xl md:text-5xl lg:text-6xl">
            You May Also <span className="text-[#769F5F]">Want</span>
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-neutral-600 md:mt-5 md:text-base">
            {description}
          </p>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 md:mt-10 lg:mt-12 lg:grid-cols-5 lg:gap-4">
          {products.map((product) => (
            <ProductCard key={product.id ?? product.slug} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default UpsellProducts;
