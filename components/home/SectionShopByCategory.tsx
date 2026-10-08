import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getCategoryPath } from "@/lib/productUrl";
import {
  getShopByCategoryImage,
  NAV_SHARED_CATEGORY_SLUGS,
  SHOP_BY_CATEGORY_EXCLUDED_SLUGS,
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

/** Matches `gap-2` (0.5rem) between tiles - four-up desktop, same width on row two. */
const CATEGORY_TILE_FLEX_CLASS =
  "w-full shrink-0 sm:w-[calc((100%-0.5rem)/2)] lg:w-[calc((100%-3*0.5rem)/4)]";

const categoryImageSrc = (category: CategoryNode): string | undefined =>
  getShopByCategoryImage(category.slug) ??
  category.image?.sourceUrl ??
  undefined;

/**
 * "Shop by Categories" - flex rows (4 + 3) with static artwork;
 * backed by `GET_SHOP_BY_CATEGORIES` for names and slugs.
 */
const SectionShopByCategory = ({
  className = "",
  categories,
}: SectionShopByCategoryProps) => {
  const items = sortByMainNavCategoryOrder(
    (categories ?? []).filter((c): c is CategoryNode => {
      if (!c?.slug || SHARED_ONLY_SLUGS.has(c.slug)) return false;
      if (SHOP_BY_CATEGORY_EXCLUDED_SLUGS.has(c.slug)) return false;
      return !!categoryImageSrc(c);
    }),
  );

  if (items.length === 0) return null;

  const firstRow = items.slice(0, 4);
  const secondRow = items.slice(4);

  const renderCategoryCard = (category: CategoryNode, index: number) => {
    const name = category.name ?? "";
    const pillColor = PILL_COLORS[index % PILL_COLORS.length];
    const imageSrc = categoryImageSrc(category)!;

    return (
      <Link
        key={category.id}
        href={getCategoryPath(category.slug!)}
        className={`group flex flex-col items-center ${CATEGORY_TILE_FLEX_CLASS}`}
      >
        <div className="relative flex h-[200px] w-full items-end justify-center sm:h-[220px] lg:h-[240px]">
          <Image
            src={imageSrc}
            alt={name}
            width={400}
            height={400}
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 240px"
            className="relative z-10 h-full w-full max-w-[280px] object-contain object-bottom transition-transform duration-300 group-hover:scale-105 sm:max-w-[300px] lg:max-w-none"
          />
        </div>

        <div
          style={{ backgroundColor: pillColor }}
          className="mt-1.5 flex w-fit min-w-[160px] items-center justify-between gap-3 rounded-lg px-5 py-3 transition-shadow group-hover:shadow-md"
        >
          <span className="whitespace-nowrap text-sm font-bold text-neutral-900">
            {name}
          </span>
          <ArrowRight className="h-4 w-4 flex-shrink-0 text-neutral-900 transition-transform group-hover:translate-x-1" />
        </div>
      </Link>
    );
  };

  return (
    <section
      className={`mx-auto w-full max-w-[1024px] overflow-visible px-3 lg:px-0 ${className}`}
    >
      <div className="mx-auto max-w-4xl text-center">
        <p className="text-base font-bold uppercase tracking-wider text-[#092412]">
          Shop by Categories
        </p>
        <h2 className="mt-2 text-4xl font-albra font-bold leading-tight text-[#092412] sm:text-6xl md:mt-3 lg:text-nowrap">
          Everything for your{" "}
          <span className="text-[#769F5F]">daily shopping</span>
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-lg font-medium text-black/60 md:mt-3">
          From fresh produce and bakery picks to household essentials and
          chilled favourites - discover what you need, all in one place.
        </p>
      </div>

      <div className="mt-2 flex flex-col gap-y-2 pb-4 sm:mt-3 md:pb-6">
        <div className="flex flex-wrap items-start justify-center gap-2 sm:justify-start lg:flex-nowrap">
          {firstRow.map((category, index) => renderCategoryCard(category, index))}
        </div>
        {secondRow.length > 0 ? (
          <div className="flex flex-wrap items-start justify-center gap-2 lg:flex-nowrap">
            {secondRow.map((category, index) =>
              renderCategoryCard(category, index + firstRow.length),
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default SectionShopByCategory;
