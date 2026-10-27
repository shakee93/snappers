"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";
import { ChevronDown, LayoutGrid } from "lucide-react";
import type { ProductCategory } from "@/graphql/types/graphql";
import CategoryMegaPanel from "@/components/header/mega-menu/CategoryMegaPanel";
import {
  getCategoryArchiveHref,
  getHeaderCategoryIconSrc,
  HEADER_CATEGORY_ICON_OVERRIDES,
} from "@/lib/headerCategories";
import {
  getMegaMenuPanelData,
  isHeaderCompactMegaMenu,
  isHeaderViewportCenteredMegaMenu,
  navItemHasMegaMenu,
} from "@/lib/megaMenu";

type HeaderCategoryNavItemProps = {
  category: ProductCategory;
  navCategories: ProductCategory[];
  isLastInBar?: boolean;
};

function CategoryIcon({ category }: { category: ProductCategory }) {
  const sourceUrl = getHeaderCategoryIconSrc(category);
  const slug = category.slug ?? "";
  const isLocalOverride = slug in HEADER_CATEGORY_ICON_OVERRIDES;

  if (sourceUrl) {
    return (
      <Image
        src={sourceUrl}
        alt=""
        width={32}
        height={32}
        className={
          isLocalOverride
            ? "h-6 w-6 shrink-0 object-contain xl:h-8 xl:w-8"
            : "header-brand-icon-tint h-6 w-6 shrink-0 object-contain xl:h-8 xl:w-8"
        }
        aria-hidden
      />
    );
  }

  return (
    <LayoutGrid
      className="h-6 w-6 shrink-0 stroke-[1.75] text-header-green xl:h-8 xl:w-8"
      aria-hidden
    />
  );
}

export default function HeaderCategoryNavItem({
  category,
  navCategories,
  isLastInBar = false,
}: HeaderCategoryNavItemProps) {
  const slug = category.slug;
  const href = slug ? getCategoryArchiveHref(slug) : "/";
  const anchorRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [open, setOpen] = useState(false);
  const [panelPos, setPanelPos] = useState<{
    top: number;
    left: number;
    anchor: "viewport-center" | "nav-start" | "nav-center" | "nav-end";
    maxWidth?: number;
  } | null>(null);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const hasMegaMenu = useMemo(
    () => (slug ? navItemHasMegaMenu(navCategories, href) : false),
    [navCategories, href, slug],
  );

  const panelData = useMemo(
    () => (hasMegaMenu ? getMegaMenuPanelData(navCategories, href) : null),
    [hasMegaMenu, navCategories, href],
  );

  const updatePanelPosition = useCallback(() => {
    const el = anchorRef.current;
    if (!el || !panelData) return;
    const rect = el.getBoundingClientRect();
    const shell = el.closest("[data-header-category-shell]");
    const shellRect = shell?.getBoundingClientRect();

    if (panelData.navSlug === "groceries") {
      setPanelPos({
        top: rect.bottom + 4,
        left: shellRect?.left ?? rect.left,
        anchor: "nav-start",
        maxWidth: shellRect?.width,
      });
      return;
    }

    const viewportCenter = isHeaderViewportCenteredMegaMenu(panelData);
    const compact = isHeaderCompactMegaMenu(panelData);

    let left = window.innerWidth / 2;
    let anchor: "viewport-center" | "nav-start" | "nav-center" | "nav-end" =
      "viewport-center";

    if (!viewportCenter) {
      if (isLastInBar) {
        const rightEdge = shellRect?.right ?? rect.right;
        left = Math.min(rect.right, rightEdge);
        anchor = "nav-end";
      } else if (compact) {
        left = Math.max(rect.left, shellRect?.left ?? rect.left);
        anchor = "nav-start";
      } else {
        left = rect.left + rect.width / 2;
        anchor = "nav-center";
      }
    }

    setPanelPos({
      top: rect.bottom + 4,
      left,
      anchor,
    });
  }, [panelData, isLastInBar]);

  const showPanel = useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    updatePanelPosition();
    setOpen(true);
  }, [updatePanelPosition]);

  const scheduleHidePanel = useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setOpen(false), 120);
  }, []);

  useEffect(() => {
    if (!open) return;

    const onScrollOrResize = () => updatePanelPosition();
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [open, updatePanelPosition]);

  const label = (
    <>
      <CategoryIcon category={category} />
      <span className="whitespace-nowrap text-[14px] font-bold leading-none text-header-green">
        {category.name}
      </span>
      {hasMegaMenu ? (
        <ChevronDown
          className="h-3 w-3 shrink-0 text-header-green/70 xl:h-3.5 xl:w-3.5"
          aria-hidden
        />
      ) : null}
    </>
  );

  if (!hasMegaMenu || !panelData) {
    return (
      <Link
        href={href}
        className="flex shrink-0 items-center gap-1 lg:gap-1.5 xl:gap-2 transition-opacity hover:opacity-80"
      >
        {label}
      </Link>
    );
  }

  const megaMenuPortal =
    mounted &&
    open &&
    panelPos &&
    createPortal(
      <div
        className={
          panelPos.anchor === "nav-start"
            ? "header-category-mega fixed z-[500] w-max"
            : panelPos.anchor === "nav-end"
              ? "header-category-mega fixed z-[500] w-max -translate-x-full"
              : "header-category-mega fixed z-[500] w-max -translate-x-1/2"
        }
        style={{
          top: panelPos.top,
          left: panelPos.left,
          ...(panelPos.maxWidth != null ? { maxWidth: panelPos.maxWidth } : {}),
        }}
        onMouseEnter={showPanel}
        onMouseLeave={scheduleHidePanel}
      >
        <CategoryMegaPanel
          data={panelData}
          variant="header"
          onClose={() => setOpen(false)}
        />
      </div>,
      document.body,
    );

  return (
    <>
      <div
        ref={anchorRef}
        className="relative shrink-0"
        onMouseEnter={showPanel}
        onMouseLeave={scheduleHidePanel}
      >
        <Link
          href={href}
          className="flex shrink-0 items-center gap-1 lg:gap-1.5 xl:gap-2 transition-opacity hover:opacity-80"
          aria-haspopup="true"
          aria-expanded={open}
        >
          {label}
        </Link>
      </div>
      {megaMenuPortal}
    </>
  );
}
