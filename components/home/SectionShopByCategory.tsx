import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getCategoryPath } from "@/lib/productUrl";
import {
  NAV_SHARED_CATEGORY_SLUGS,
  sortByMainNavCategoryOrder,
} from "@/lib/browseCategories";

interface CategoryNode {
  id: string;
  databaseId?: number | null;
  name?: string | null;
  slug?: string | null;
  image?: { sourceUrl?: string | null } | null;
}

export interface SectionShopByCategoryProps {
  className?: string;
  categories?: (CategoryNode | null)[] | null;
}

// Rotating pill colors so each card's label bar picks up a soft accent.
const PILL_COLORS = ["#F0E7D6", "#FBEAC9", "#E7EAD9", "#F8DECB", "#DCEAF2"];

const SHARED_ONLY_SLUGS = new Set(
  Object.values(NAV_SHARED_CATEGORY_SLUGS).flat(),
);

/**
 * "Shop by categories" grid of pet categories, each rendered with its category
 * image and a label/CTA pill. Backed by `GET_SHOP_BY_CATEGORIES`.
 */
const SectionShopByCategory = ({
  className = "",
  categories,
}: SectionShopByCategoryProps) => {
  const items = sortByMainNavCategoryOrder(
    (categories ?? []).filter(
      (c): c is CategoryNode =>
        !!c?.image?.sourceUrl &&
        !!c?.slug &&
        !SHARED_ONLY_SLUGS.has(c.slug),
    ),
  );

  if (items.length === 0) return null;

  return (
    <section
      className={`mx-auto w-full max-w-[1024px] px-3 lg:px-0 ${className}`}
    >
      <div className="mx-auto max-w-4xl text-center">
        <p className="text-base font-bold uppercase tracking-wider text-[#092412]">
          Shop by Categories
        </p>
        <h2 className="mt-3 text-4xl font-albra font-bold leading-tight text-[#092412] sm:text-6xl md:mt-5 lg:text-nowrap">
          Everything for every <span className="text-[#769F5F]">pet parent</span>
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg font-medium text-black/60">
          From premium food and fun toys to grooming and beyond, discover
          everything your pet needs, all in one place.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((category, index) => {
          const name = category.name ?? "";
          const pillColor = PILL_COLORS[index % PILL_COLORS.length];

          return (
            <Link
              key={category.id}
              href={getCategoryPath(category.slug!)}
              className="group flex flex-col items-center"
            >
              <div className="relative flex h-[200px] w-full items-end justify-center">
                <Image
                  src={category.image!.sourceUrl!}
                  alt={name}
                  width={320}
                  height={320}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="relative z-10 h-full w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              <div
                style={{ backgroundColor: pillColor }}
                className="mt-5 flex w-fit min-w-[160px] items-center justify-between gap-3 rounded-lg px-5 py-3 transition-shadow group-hover:shadow-md"
              >
                <span className="whitespace-nowrap text-sm font-bold text-neutral-900">
                  {name}
                </span>
                <ArrowRight className="h-4 w-4 flex-shrink-0 text-neutral-900 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default SectionShopByCategory;
