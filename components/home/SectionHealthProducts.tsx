import { type ProductCardItem } from "@/components/home/ProductCard";
import HealthProductCarousel from "@/components/home/HealthProductCarousel";
import SectionHealthBanner from "@/components/home/SectionHealthBanner";
import type { HeroSettingsFields } from "@/components/home/SectionHeroPets";

export interface SectionHealthProductsProps {
  className?: string;
  /** Curated health entries from `heroSettings.healthSectionSettings`. */
  healthSectionSettings?: HeroSettingsFields["healthSectionSettings"];
}

const mapHealthEntries = (
  settings?: HeroSettingsFields["healthSectionSettings"],
) =>
  (settings?.healthProduct ?? [])
    .map((entry) => ({
      product: entry?.healthProduct?.edges?.[0]?.node ?? null,
      featureImage: entry?.featureImage?.node?.sourceUrl ?? "",
    }))
    .filter(
      (entry): entry is { product: ProductCardItem; featureImage: string } =>
        !!entry.product,
    );

export const hasHealthSectionProducts = (
  settings?: HeroSettingsFields["healthSectionSettings"],
): boolean => mapHealthEntries(settings).length > 0;

/** Health banner plus centre-aligned product carousel from hero settings ACF. */
const SectionHealthProducts = ({
  className = "",
  healthSectionSettings,
}: SectionHealthProductsProps) => {
  const entries = mapHealthEntries(healthSectionSettings);
  if (!entries.length) return null;

  const products = entries.map((entry) => entry.product);
  const featureImages = entries.map((entry) => entry.featureImage);

  return (
    <section className={`w-full ${className}`}>
      <SectionHealthBanner />

      <div className="mt-8 w-full max-w-[100%] overflow-x-clip overflow-y-visible md:mt-10">
        <HealthProductCarousel products={products} featureImages={featureImages} />
      </div>
    </section>
  );
};

export default SectionHealthProducts;
