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
import {
  sectionEyebrowClass,
  sectionDescriptionClass,
  sectionTitleClass,
} from "@/lib/sectionTypography";
import { cn } from "@/lib/utils";

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

/** 2-up → 3-up (`md`) → 5-up (`lg` / 1024px) → one row (`xl`). */
const CATEGORY_TILE_FLEX_CLASS =
  "w-[calc((100%-0.5rem)/2)] shrink-0 md:w-[calc((100%-1rem)/3)] lg:w-[calc((100%-2rem)/5)] xl:max-w-none xl:w-0 xl:min-w-0 xl:flex-1 xl:shrink";

const categoryImageSrc = (category: CategoryNode): string | undefined =>
  getShopByCategoryImage(category.slug) ??
  category.image?.sourceUrl ??
  undefined;

/**
 * "Shop by Categories" - single row of category tiles;
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
        <div className="relative flex h-[110px] w-full items-end justify-center md:h-[140px] lg:h-[160px]">
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
          className="mt-1.5 flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 transition-shadow group-hover:shadow-md xl:w-fit xl:min-w-[160px] xl:gap-3 xl:px-5 xl:py-3"
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
      className={`mx-auto w-full max-w-[1368px] overflow-visible px-4 ${className}`}
    >
      <div className="w-full">
        <p className={sectionEyebrowClass}>Shop by Categories</p>
        <h2
          className={cn(
            sectionTitleClass,
            "mt-2 md:mt-3",
          )}
        >
          Everything for your daily shopping
        </h2>
        <p className={sectionDescriptionClass}>
          From fresh produce and bakery picks to household essentials and
          chilled favourites - discover what you need, all in one place.
        </p>
      </div>

      <div className="mt-2 flex flex-wrap items-start justify-start gap-2 pb-4 sm:mt-3 md:pb-6 xl:flex-nowrap">
        {items.map((category, index) => renderCategoryCard(category, index))}
      </div>
    </section>
  );
};

export default SectionShopByCategory;
