"use client";

import Image from "next/image";
import Link from "next/link";
import { getCategoryPath } from "@/lib/productUrl";
import type { ProductTag } from "@/graphql/types/graphql";

export type PdpSidebarCategory = {
  name?: string | null;
  slug?: string | null;
  parentDatabaseId?: number | null;
};

type ProductPdpSidebarProps = {
  categories?: PdpSidebarCategory[] | null;
  productTags?: ({ slug?: string | null; name?: string | null } | null)[] | null;
};

const PROMO_IMAGE = "/homepage/snappers-exciting-offers.jpg";

const ProductPdpSidebar = ({
  categories = [],
  productTags = [],
}: ProductPdpSidebarProps) => {
  const topCategories =
    categories?.filter(
      (c) => c?.slug && c.name && (c.parentDatabaseId ?? 0) === 0,
    ) ?? [];

  const tags = (productTags ?? []).filter(
    (t): t is ProductTag => !!t?.slug && !!t?.name,
  );

  return (
    <aside className="flex flex-col gap-5 lg:gap-6">
      <Link
        href="/deals"
        className="relative block overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm"
      >
        <div className="relative aspect-[4/5] w-full min-h-[220px]">
          <Image
            src={PROMO_IMAGE}
            alt="Enjoy exciting offers from Snappers"
            fill
            className="object-cover object-top"
            sizes="(max-width: 1024px) 100vw, 280px"
          />
        </div>
      </Link>

      {topCategories.length > 0 && (
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5">
          <h2 className="text-base font-bold text-[#253D4E]">Categories</h2>
          <ul className="mt-3 space-y-2">
            {topCategories.slice(0, 10).map((category) => (
              <li key={category.slug}>
                <Link
                  href={getCategoryPath(category.slug!)}
                  className="flex items-center justify-between gap-2 text-sm text-neutral-600 transition-colors hover:text-[#3BB77E]"
                >
                  <span>{category.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tags.length > 0 && (
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5">
          <h2 className="text-base font-bold text-[#253D4E]">Tags</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {tags.slice(0, 12).map((tag) => (
              <Link
                key={tag.slug}
                href={`/tag/${tag.slug}`}
                className="inline-flex items-center rounded-md border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs font-medium text-neutral-600 transition-colors hover:border-[#3BB77E]/40 hover:text-[#3BB77E]"
              >
                {tag.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
};

export default ProductPdpSidebar;
