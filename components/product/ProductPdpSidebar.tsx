"use client";

import Link from "next/link";
import type { ProductTag } from "@/graphql/types/graphql";

type ProductPdpSidebarProps = {
  productTags?: ({ slug?: string | null; name?: string | null } | null)[] | null;
};

const ProductPdpSidebar = ({ productTags = [] }: ProductPdpSidebarProps) => {
  const tags = (productTags ?? []).filter(
    (t): t is ProductTag => !!t?.slug && !!t?.name,
  );

  if (tags.length === 0) {
    return null;
  }

  return (
    <aside className="flex flex-col gap-5 lg:gap-6">
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
    </aside>
  );
};

export default ProductPdpSidebar;
