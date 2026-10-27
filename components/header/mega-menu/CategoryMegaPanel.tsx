"use client";

import Image from "next/image";
import Link from "next/link";
import { createElement } from "react";
import { ArrowRight } from "lucide-react";
import {
  isHeaderCompactMegaMenu,
  isHeaderSplitMegaMenu,
  type MegaMenuPanelData,
} from "@/lib/megaMenu";
import { getMegaMenuCategoryIcon } from "@/lib/megaMenuIcons";
import { getCategoryPath } from "@/lib/productUrl";
import type { CategoryTreeNode } from "@/lib/categoryTree";

type CategoryMegaPanelProps = {
  data: MegaMenuPanelData;
  onClose: () => void;
  /** Header category bar - white panel, column headings like storefront reference. */
  variant?: "default" | "header";
};

/** Header mega menus - shared link typography (compact, split, multi-column). */
const HEADER_MEGA_MENU_LINK_CLASS =
  "block whitespace-nowrap rounded-md px-3 py-1.5 text-[13px] font-semibold leading-snug text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-header-green";

const HEADER_MEGA_MENU_BULLET_LINK_CLASS =
  "inline-block rounded-md px-1 py-0.5 pr-2 text-[13px] font-semibold leading-snug text-neutral-600 transition-colors hover:text-header-green";

const HEADER_MEGA_MENU_BULLET_LIST_CLASS =
  "mt-0.5 list-disc space-y-0 pl-6 pr-1 marker:text-header-green/50";

const HEADER_MEGA_MENU_GRID_CLASS =
  "grid w-max max-w-full gap-x-6 gap-y-0";

const HEADER_MEGA_MENU_COLUMN_CLASS =
  "flex w-max min-w-[150px] shrink-0 flex-col";

function HeaderMegaMenuBulletTree({
  categories,
  onClose,
}: {
  categories: CategoryTreeNode[];
  onClose: () => void;
}) {
  return (
    <ul className={HEADER_MEGA_MENU_BULLET_LIST_CLASS}>
      {categories.map((child) => (
        <li key={child.slug ?? child.databaseId}>
          <HeaderMegaMenuNestedLink category={child} onClose={onClose} />
        </li>
      ))}
    </ul>
  );
}

function HeaderMegaMenuNestedLink({
  category,
  onClose,
}: {
  category: CategoryTreeNode;
  onClose: () => void;
}) {
  return (
    <>
      <Link
        href={getCategoryPath(category.slug ?? "")}
        onClick={onClose}
        className={HEADER_MEGA_MENU_BULLET_LINK_CLASS}
      >
        {category.name}
      </Link>
      {category.children.length > 0 ? (
        <HeaderMegaMenuBulletTree
          categories={category.children}
          onClose={onClose}
        />
      ) : null}
    </>
  );
}

function HeaderMegaMenuCategoryItem({
  category,
  onClose,
}: {
  category: CategoryTreeNode;
  onClose: () => void;
}) {
  if (category.children.length === 0) {
    return (
      <Link
        href={getCategoryPath(category.slug ?? "")}
        onClick={onClose}
        className={HEADER_MEGA_MENU_LINK_CLASS}
      >
        {category.name}
      </Link>
    );
  }

  return (
    <div>
      <Link
        href={getCategoryPath(category.slug ?? "")}
        onClick={onClose}
        className={HEADER_MEGA_MENU_LINK_CLASS}
      >
        {category.name}
      </Link>
      <HeaderMegaMenuBulletTree
        categories={category.children}
        onClose={onClose}
      />
    </div>
  );
}

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

  return (
    <span className="inline-flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-md bg-header-cream text-header-green">
      {createElement(getMegaMenuCategoryIcon(category), {
        className: "h-3.5 w-3.5",
        "aria-hidden": true,
      })}
    </span>
  );
}

function CategoryGroup({
  category,
  onClose,
  variant,
}: {
  category: CategoryTreeNode;
  onClose: () => void;
  variant: "default" | "header";
}) {
  const headingClass =
    variant === "header"
      ? HEADER_MEGA_MENU_LINK_CLASS
      : "inline-flex items-center gap-2 text-sm font-semibold text-header-green transition-colors hover:text-header-green/75";

  return (
    <div className="min-w-0 w-full">
      <Link
        href={getCategoryPath(category.slug ?? "")}
        onClick={onClose}
        className={headingClass}
      >
        {variant === "default" ? <CategoryIcon category={category} /> : null}
        <span>{category.name}</span>
      </Link>
      {category.children.length > 0 ? (
        variant === "header" ? (
          <HeaderMegaMenuBulletTree
            categories={category.children}
            onClose={onClose}
          />
        ) : (
          <ul className="mt-3 space-y-2">
            {category.children.map((child) => (
              <li key={child.slug ?? child.databaseId}>
                <Link
                  href={getCategoryPath(child.slug ?? "")}
                  onClick={onClose}
                  className="text-sm leading-snug text-neutral-600 transition-colors hover:text-header-green"
                >
                  {child.name}
                </Link>
              </li>
            ))}
          </ul>
        )
      ) : null}
    </div>
  );
}

function MegaMenuFeatureImage({
  href,
  src,
  label,
  onClose,
  className,
}: {
  href: string;
  src?: string;
  label: string;
  onClose: () => void;
  className?: string;
}) {
  if (!src) {
    return (
      <div
        className={`flex shrink-0 flex-col items-center justify-center bg-header-cream px-4 text-center ${className ?? ""}`}
        aria-hidden
      >
        <span className="text-sm font-semibold text-header-green/70">
          Feature image
        </span>
        <span className="mt-1 text-xs text-neutral-500">{label}</span>
      </div>
    );
  }

  return (
    <Link
      href={href}
      onClick={onClose}
      className={`relative block overflow-hidden ${className ?? ""}`}
      aria-label={label}
    >
      <Image src={src} alt="" fill className="object-cover" sizes="200px" />
      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent px-3 pb-3 pt-8 text-sm font-semibold text-white">
        {label}
      </span>
    </Link>
  );
}

function HeaderSplitMenuLinks({
  root,
  onClose,
  nested,
}: {
  root: MegaMenuPanelData["root"];
  onClose: () => void;
  nested: boolean;
}) {
  if (!nested) {
    return (
      <ul className="flex w-max min-w-[150px] max-h-[min(420px,70vh)] max-w-[min(320px,calc(100vw-2rem))] flex-col overflow-y-auto px-2 py-2">
        {root.children.map((child) => (
          <li key={child.slug ?? child.databaseId}>
            <HeaderMegaMenuCategoryItem category={child} onClose={onClose} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="max-h-[min(420px,70vh)] overflow-y-auto px-2 py-2">
      <div className={HEADER_MEGA_MENU_COLUMN_CLASS}>
        {root.children.map((category) => (
          <HeaderMegaMenuCategoryItem
            key={category.slug ?? category.databaseId}
            category={category}
            onClose={onClose}
          />
        ))}
      </div>
    </div>
  );
}

export default function CategoryMegaPanel({
  data,
  onClose,
  variant = "default",
}: CategoryMegaPanelProps) {
  const {
    columns,
    root,
    featureImage,
    featuredLinks,
    shopAllHref,
    shopAllLabel,
  } = data;

  const isFlatLeafMenu = root.children.every(
    (category) => category.children.length === 0,
  );

  const isFlatList = isFlatLeafMenu && columns.length === 1;

  const isCompactHeader =
    variant === "header" && isHeaderCompactMegaMenu(data);

  const isSplitHeader =
    variant === "header" && isHeaderSplitMegaMenu(data);

  const splitHasNestedGroups = root.children.some(
    (category) => category.children.length > 0,
  );

  // Cat & Dog have the densest trees - same wide equal-column panel.
  const isWidePanel =
    (variant === "header" && !isCompactHeader && !isSplitHeader) ||
    data.navSlug === "cat" ||
    data.navSlug === "dog";

  const panelShellClass = isCompactHeader
    ? "mega-menu-panel w-max max-w-[min(calc(100vw-2rem),100%)] rounded-xl border border-neutral-200/80 bg-white py-2 shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
    : isSplitHeader
      ? "mega-menu-panel w-[min(640px,calc(100vw-2rem))] overflow-hidden rounded-xl border border-neutral-200/80 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
    : variant === "header"
      ? "mega-menu-panel w-max max-w-[min(1080px,calc(100vw-2rem))] overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-lg"
      : isWidePanel
        ? "mega-menu-panel w-[min(1020px,calc(100vw-2rem))] rounded-[14px] bg-[#FFFCFA]"
        : "mega-menu-panel w-max max-w-[min(920px,calc(100vw-2rem))] rounded-[14px] bg-[#FFFCFA]";

  if (isCompactHeader) {
    return (
      <div className={panelShellClass}>
        <ul className="flex w-max min-w-[150px] flex-col px-2 py-2">
          {root.children.map((child) => (
            <li key={child.slug ?? child.databaseId}>
              <HeaderMegaMenuCategoryItem category={child} onClose={onClose} />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (isSplitHeader) {
    return (
      <div className={panelShellClass}>
        <div className="grid min-h-[240px] grid-cols-[minmax(150px,max-content)_minmax(0,1fr)] items-stretch">
          <div className="w-max min-w-[150px] max-w-[min(320px,calc(100vw-2rem))] shrink-0 border-r border-neutral-100">
            <HeaderSplitMenuLinks
              root={root}
              onClose={onClose}
              nested={splitHasNestedGroups}
            />
          </div>
          <MegaMenuFeatureImage
            href={shopAllHref}
            src={featureImage}
            label={root.name ?? shopAllLabel}
            onClose={onClose}
            className="relative min-h-[240px] w-full min-w-0"
          />
        </div>
      </div>
    );
  }

  const headerFeatureColumn =
    variant === "header" && !!featureImage && isWidePanel;

  return (
    <div className={panelShellClass}>
      <div
        className={
          headerFeatureColumn
            ? "grid min-h-[240px] w-max max-w-full grid-cols-[max-content_minmax(240px,360px)] items-stretch"
            : "flex items-start gap-6 px-6 py-5"
        }
      >
        <div
          className={
            headerFeatureColumn
              ? "w-max max-w-full shrink-0 overflow-x-auto border-r border-neutral-100 px-5 py-4"
              : isWidePanel
                ? "min-w-0 flex-1"
                : "min-w-0"
          }
        >
          {variant === "default" ? (
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
          ) : null}

          <div
            className={
              variant === "header"
                ? HEADER_MEGA_MENU_GRID_CLASS
                : isFlatList
                  ? "flex flex-col gap-3"
                  : "grid w-full gap-x-8 gap-y-5"
            }
            style={
              variant === "header"
                ? {
                    gridTemplateColumns: `repeat(${Math.max(columns.length, 1)}, max-content)`,
                  }
                : isFlatList
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
                  variant === "header"
                    ? HEADER_MEGA_MENU_COLUMN_CLASS
                    : isFlatList
                      ? "flex flex-col gap-3"
                      : "flex min-w-0 flex-col gap-5"
                }
              >
                {columnItems.map((category) =>
                  variant === "header" ? (
                    <HeaderMegaMenuCategoryItem
                      key={category.slug ?? category.databaseId}
                      category={category}
                      onClose={onClose}
                    />
                  ) : (
                    <CategoryGroup
                      key={category.slug ?? category.databaseId}
                      category={category}
                      onClose={onClose}
                      variant={variant}
                    />
                  ),
                )}
              </div>
            ))}
          </div>
        </div>

        {featureImage ? (
          <MegaMenuFeatureImage
            href={shopAllHref}
            src={featureImage}
            label={root.name ?? shopAllLabel}
            onClose={onClose}
            className={
              headerFeatureColumn
                ? "relative h-full min-h-[240px] w-full min-w-0 self-stretch"
                : "relative hidden h-[180px] w-[150px] rounded-xl lg:block"
            }
          />
        ) : null}
      </div>
    </div>
  );
}
