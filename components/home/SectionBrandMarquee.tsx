import Image from "next/image";
import Link from "next/link";
import { getBrandPath } from "@/lib/productUrl";

export interface BrandMarqueeItem {
  id?: string | null;
  name?: string | null;
  slug?: string | null;
  brandImage?: string | null;
  count?: number | null;
}

export interface SectionBrandMarqueeProps {
  className?: string;
  brands?: BrandMarqueeItem[] | null;
}

const MIN_LOGOS_PER_HALF = 10;

/**
 * Infinite left-scrolling brand logo strip, fed by `GET_ALL_BRANDS` on the
 * homepage (same query as `/brands`).
 */
const SectionBrandMarquee = ({
  className = "",
  brands = [],
}: SectionBrandMarqueeProps) => {
  const logos = (brands ?? []).filter(
    (brand): brand is BrandMarqueeItem & { slug: string; brandImage: string } =>
      !!brand?.slug &&
      !!brand.brandImage?.trim() &&
      (brand.count ?? 0) > 0
  );

  if (logos.length === 0) return null;

  const repeats = Math.ceil(MIN_LOGOS_PER_HALF / logos.length);
  const row = {
    sourceLength: logos.length,
    items: Array.from({ length: repeats }, () => logos).flat(),
  };

  return (
    <section
      className={`w-full overflow-hidden bg-white py-10 md:py-14 ${className}`}
      aria-label="Shop by brand"
    >
      <div className="overflow-hidden">
        <div className="flex w-max animate-marquee-left hover:[animation-play-state:paused]">
          {[0, 1].map((half) => (
            <div
              key={half}
              aria-hidden={half === 1}
              className="flex items-center gap-10 pr-10 md:gap-16 md:pr-16"
            >
              {row.items.map((brand, index) => {
                const isHidden = half === 1 || index >= row.sourceLength;

                return (
                <Link
                  key={`${brand.slug}-${half}-${index}`}
                  href={getBrandPath(brand.slug)}
                  aria-hidden={isHidden || undefined}
                  tabIndex={isHidden ? -1 : undefined}
                  className="flex h-16 w-28 shrink-0 items-center justify-center sm:h-20 sm:w-36 md:h-24 md:w-44"
                >
                  <Image
                    src={brand.brandImage}
                    alt={brand.name ?? "Brand"}
                    width={176}
                    height={96}
                    className="h-full w-full object-contain"
                  />
                </Link>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SectionBrandMarquee;
