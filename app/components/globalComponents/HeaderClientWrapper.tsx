"use client";

import { useEffect, useState, useRef } from "react";
import { Brand, ProductCategory } from "@/graphql/types/graphql";
import TopBarPromotion from "@/components/TopBarPromotion";
import HeaderContent from "./HeaderContent";
import HeaderSearchResults from "@/app/components/globalComponents/HeaderSearchResults";
import MobileNavLinks from "./MobileNavLinks";
import MobileBottomNav from "@/app/components/globalComponents/MobileBottomNav";
import {
  ADD_TO_CART_DISABLED,
  CHECKOUT_PAUSED_NOTICE,
} from "@/lib/addToCartDisabled";

interface HeaderClientWrapperProps {
  productCategories: ProductCategory[];
  brands: Brand[];
  options: any;
  navCategories: ProductCategory[];
}

const HeaderClientWrapper = ({
  productCategories,
  brands,
  options,
  navCategories
}: HeaderClientWrapperProps) => {
  const [isDesktop, setIsDesktop] = useState(false);
  const [isTopBarVisible, setIsTopBarVisible] = useState(true);
  const [isHeaderSticky, setIsHeaderSticky] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const stickyOffsetRef = useRef(0);

  // Extract background color from options
  const topBarBgColor = options?.topBarBgColor || 'white';

  // Check if device is desktop (lg and above)
  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 1024); // lg breakpoint
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Handle scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      if (!headerRef.current) return;

      if (!stickyOffsetRef.current) {
        stickyOffsetRef.current = headerRef.current.offsetTop;
      }

      const currentScrollY = window.scrollY;
      const scrollThreshold = 50; // When to start hiding top bar

      // Handle top bar visibility
      if (currentScrollY > scrollThreshold) {
        setIsTopBarVisible(false);
      } else {
        setIsTopBarVisible(true);
      }

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
        style={{
          backgroundColor: !isDesktop ? 'transparent' : 'white'
        }}
        className={`
          ${isHeaderSticky ? 'fixed top-0 left-0 right-0' : 'relative'}
          flex flex-col justify-between bg-transparent z-[100] transition-all duration-100 md:border-b
        `}
      >
        {/* Checkout-paused notice - always visible (does not hide on scroll) */}
        {ADD_TO_CART_DISABLED && (
          <div className="bg-amber-500 text-slate-900 text-center text-xs md:text-sm font-semibold px-3 py-2 leading-snug">
            {CHECKOUT_PAUSED_NOTICE}
          </div>
        )}

        {/* TopBarPromotion - hides on scroll */}
        <div
          style={{
            backgroundColor: !isDesktop ? topBarBgColor : 'white'
          }}
          className={`
            transition-all duration-500 ease-out overflow-hidden
            ${isTopBarVisible ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'}
          `}
        >
          <TopBarPromotion options={options} />
        </div>

        {/* HeaderContent - always visible when sticky */}
        <HeaderContent navCategories={navCategories} />
      </header>

      {/* Add padding to content when header is sticky */}
      {isHeaderSticky && (
        <div className={ADD_TO_CART_DISABLED ? "h-24" : "h-16"}></div>
      )}

      <MobileNavLinks />

      <HeaderSearchResults
        productCategories={productCategories}
        brands={brands}
      />

      <div className="lg:hidden">
        <MobileBottomNav categories={productCategories} />
      </div>
    </>
  );
};

export default HeaderClientWrapper; 