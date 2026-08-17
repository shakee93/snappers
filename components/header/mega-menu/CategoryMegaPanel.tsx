"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { MegaMenuPanelData } from "@/lib/megaMenu";
import { getMegaMenuCategoryIcon } from "@/lib/megaMenuIcons";
import { getCategoryPath } from "@/lib/productUrl";
import type { CategoryTreeNode } from "@/lib/categoryTree";

type CategoryMegaPanelProps = {
  data: MegaMenuPanelData;
  onClose: () => void;
};

function CategoryIcon({ category }: { category: CategoryTreeNode }) {
  if (category.image?.sourceUrl) {
    return (
      <Image
        src={category.image.sourceUrl}
        alt=""
        width={18}
        height={18}
        className="h-[18px] w-[18px] shrink-0 rounded-full object-contain"
        aria-hidden
      />
    );
  }

  const Icon = getMegaMenuCategoryIcon(category);
  return (
    <span className="inline-flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-md bg-header-cream text-header-green">
      <Icon className="h-3.5 w-3.5" aria-hidden />
    </span>
  );
}

function CategoryGroup({
  category,
  onClose,
}: {
  category: CategoryTreeNode;
  onClose: () => void;
}) {
  return (
    <div className="min-w-0 w-full">
      <Link
        href={getCategoryPath(category.slug ?? "")}
        onClick={onClose}
        className="inline-flex items-center gap-2 text-sm font-semibold text-header-green transition-colors hover:text-header-green/75"
      >
        <CategoryIcon category={category} />
        <span>{category.name}</span>
      </Link>
      {category.children.length > 0 ? (
        <ul className="mt-2 space-y-1.5">
          {category.children.map((child) => (
            <li key={child.slug ?? child.databaseId} className="flex gap-2">
              <span
                className="mt-[8px] h-1 w-1 shrink-0 rounded-full bg-header-green/35"
                aria-hidden
              />
              <Link
                href={getCategoryPath(child.slug ?? "")}
                onClick={onClose}
                className="text-sm text-neutral-600 transition-colors hover:text-header-green"
              >
                {child.name}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export default function CategoryMegaPanel({
  data,
  onClose,
}: CategoryMegaPanelProps) {
  const {
    columns,
    root,
    featureImage,
    featuredLinks,
    shopAllHref,
    shopAllLabel,
  } = data;

  const isFlatList =
    columns.length === 1 &&
    root.children.every((category) => category.children.length === 0);

  // Cat & Dog have the densest trees — same wide equal-column panel.
  const isWidePanel = data.navSlug === "cat" || data.navSlug === "dog";

  return (
    <div
      className={
        isWidePanel
          ? "mega-menu-panel w-[min(1020px,calc(100vw-2rem))] rounded-[14px] bg-[#FFFCFA]"
          : "mega-menu-panel w-max max-w-[min(920px,calc(100vw-2rem))] rounded-[14px] bg-[#FFFCFA]"
      }
    >
      <div className="flex items-start gap-6 px-5 py-4">
        <div className={isWidePanel ? "min-w-0 flex-1" : "min-w-0"}>
          <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-header-green/10 pb-2.5">
            <Link
              href={shopAllHref}
              onClick={onClose}
              className="inline-flex items-center gap-1 text-sm font-semibold text-header-green hover:underline"
            >
              {shopAllLabel}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            {featuredLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className="text-sm text-neutral-500 transition-colors hover:text-header-green"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div
            className={
              isFlatList
                ? "flex flex-col gap-3"
                : "grid w-full gap-x-8 gap-y-5"
            }
            style={
              isFlatList
                ? undefined
                : {
                    gridTemplateColumns: `repeat(${Math.max(columns.length, 1)}, minmax(0, 1fr))`,
                  }
            }
          >
            {columns.map((columnItems, colIndex) => (
              <div
                key={`mega-col-${colIndex}`}
                className={
                  isFlatList
                    ? "flex flex-col gap-3"
                    : "flex min-w-0 flex-col gap-5"
                }
              >
                {columnItems.map((category) => (
                  <CategoryGroup
                    key={category.slug ?? category.databaseId}
                    category={category}
                    onClose={onClose}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {featureImage ? (
          <Link
            href={shopAllHref}
            onClick={onClose}
            className="relative hidden h-[180px] w-[150px] shrink-0 overflow-hidden rounded-xl lg:block"
            aria-label={shopAllLabel}
          >
            <Image
              src={featureImage}
              alt=""
              fill
              className="object-cover"
              sizes="150px"
            />
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent px-3 pb-3 pt-8 text-sm font-semibold text-white">
              {root.name}
            </span>
          </Link>
        ) : null}
      </div>
    </div>
  );
}
