"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { Brand, ProductCategory } from "@/graphql/types/graphql";
import HeaderContent from "./HeaderContent";
import HeaderAnnouncementBar from "./HeaderAnnouncementBar";
import HeaderUtilityBar from "./HeaderUtilityBar";
import HeaderSearchResults from "@/components/header/HeaderSearchResults";
import MobileNavLinks from "./MobileNavLinks";
import MobileBottomNav from "@/components/header/MobileBottomNav";
import {
  ADD_TO_CART_DISABLED,
  CHECKOUT_PAUSED_NOTICE,
} from "@/lib/addToCartDisabled";
import { registerArchiveSlugs } from "@/lib/archiveSlugRegistry";

interface HeaderClientWrapperProps {
  productCategories: ProductCategory[];
  brands: Brand[];
  options: any;
  navCategories: ProductCategory[];
}

const HeaderClientWrapper = ({
  productCategories,
  brands,
  navCategories
}: HeaderClientWrapperProps) => {
  const [isHeaderSticky, setIsHeaderSticky] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const stickyOffsetRef = useRef(0);

  const archiveSlugsFromNav = useMemo(
    () => [
      ...productCategories.map((category) => category.slug),
      ...navCategories.map((category) => category.slug),
      ...brands.map((brand) => brand.slug),
    ],
    [productCategories, brands, navCategories],
  );

  useEffect(() => {
    registerArchiveSlugs(archiveSlugsFromNav);
  }, [archiveSlugsFromNav]);

  // Handle scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      if (!headerRef.current) return;

      if (!stickyOffsetRef.current) {
        stickyOffsetRef.current = headerRef.current.offsetTop;
      }

      const currentScrollY = window.scrollY;

      // Handle header stickiness
      if (currentScrollY > stickyOffsetRef.current) {
        setIsHeaderSticky(true);
      } else {
        setIsHeaderSticky(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header
        ref={headerRef}
        className={`
          ${isHeaderSticky ? "fixed top-0 left-0 right-0" : "relative"}
          z-[100] flex flex-col justify-between overflow-visible bg-header-green transition-all duration-100 lg:bg-white
        `}
      >
        {/* Checkout-paused notice - always visible (does not hide on scroll) */}
        {ADD_TO_CART_DISABLED && (
          <div className="bg-amber-500 text-slate-900 text-center text-xs md:text-sm font-semibold px-3 py-2 leading-snug">
            {CHECKOUT_PAUSED_NOTICE}
          </div>
        )}

        {/* Top announcement · main header row · category bar */}
        <HeaderAnnouncementBar />
        <HeaderContent />
        <HeaderUtilityBar navCategories={navCategories} />
      </header>

      {/* Sticky-header spacer: announcement bar + HeaderContent + category bar.
          ~100px mobile / ~200px desktop (checkout notice adds ~32px when shown). */}
      {isHeaderSticky && (
        <div
          className={
            ADD_TO_CART_DISABLED ? "h-[132px] lg:h-[254px]" : "h-[100px] lg:h-[214px]"
          }
        ></div>
      )}

      <MobileNavLinks navCategories={navCategories} />

      <HeaderSearchResults
        productCategories={productCategories}
        brands={brands}
      />

      <div className="lg:hidden">
        <MobileBottomNav />
      </div>
    </>
  );
};

export default HeaderClientWrapper; 