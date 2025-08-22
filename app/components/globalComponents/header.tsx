'use client'
import AvatarDropdown from "../Header/AvatarDropdown";
import CartDropdown from "../Header/CartDropdown";
import Logo from "./Logo";
import NavLinks from "./NavLinks";
import BrandBar from "./BrandBar";
import SearchBar from "@/app/components/globalComponents/SearchBar";
import MobileNavLinks from "./MobileNavLinks";
import { GET_ALL_PRODUCTS } from "@/graphql/defs/products";
import { GET_OPTIONS } from "@/graphql/defs/options";
import HeaderSearchResults from "@/app/components/globalComponents/HeaderSearchResults";
import { Brand, ProductCategory } from "@/graphql/types/graphql";
import MobileBottomNav from "@/app/components/globalComponents/MobileBottomNav";
import { isPaymentPageClient } from "./paymentPageCheckUtils";
import TopBarPromotion from "@/components/TopBarPromotion";
import SideCart from "../SideCart/SideCart";
import HeaderContent from "./HeaderContent";
import { useEffect, useState, useRef } from "react";
import { useQuery } from "@apollo/client";

const Header = () => {
  const [isDesktop, setIsDesktop] = useState(false);
  const [isTopBarVisible, setIsTopBarVisible] = useState(true);
  const [isHeaderSticky, setIsHeaderSticky] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const stickyOffsetRef = useRef(0);

  // Use Apollo hooks for client-side data fetching
  const { data: productsData, loading: productsLoading } = useQuery(GET_ALL_PRODUCTS);
  const { data: optionsData, loading: optionsLoading } = useQuery(GET_OPTIONS);

  const productCategories = productsData?.productCategories?.nodes || [];
  const brands = productsData?.brands?.nodes || [];
  const options = optionsData || {};
  
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

  if (isPaymentPageClient()) {
    return <></>;
  }

  // Show loading state if data is still loading
  if (productsLoading || optionsLoading) {
    return (
      <header className="sticky top-0 mt-[-9px] flex flex-col justify-between bg-white z-30 transition-all duration-300 md:border-b">
        <div className="py-0 lg:container flex justify-between items-center lg:items-stretch lg:py-2 px-0">
          <div className="animate-pulse bg-gray-200 h-16 w-full"></div>
        </div>
      </header>
    );
  }

  return (
    <>
      <header
        ref={headerRef}
        style={{ 
          backgroundColor: !isDesktop ? topBarBgColor : 'white' 
        }}
        className={`
          ${isHeaderSticky ? 'fixed top-0 left-0 right-0' : 'relative'}
          flex flex-col justify-between bg-transparent z-30 transition-all duration-100 md:border-b
        `}
      >
        {/* TopBarPromotion - hides on scroll */}
        <div 
          className={`
            transition-all duration-500 ease-out overflow-hidden
            ${isTopBarVisible ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'}
          `}
        >
          <TopBarPromotion options={options} />
        </div>

        {/* HeaderContent - always visible when sticky */}
        <HeaderContent />
      </header>

      {/* Add padding to content when header is sticky */}
      {isHeaderSticky && <div className="h-16"></div>}

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

export default Header;
