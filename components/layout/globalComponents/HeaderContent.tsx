"use client";

import { useState, useEffect } from "react";
import { ProductCategory } from "@/graphql/types/graphql";
import AvatarDropdown from "../Header/AvatarDropdown";
import Logo from "./Logo";
import NavLinks from "./NavLinks";
import SearchBar from "./SearchBar";
import SideCart from "../SideCart/SideCart";
import HeaderUtilityIcons from "./HeaderUtilityIcons";

interface HeaderContentProps {
  navCategories: ProductCategory[];
}

const HeaderContent = ({ navCategories }: HeaderContentProps) => {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [showNavLinks, setShowNavLinks] = useState(true);

  const handleSearchExpand = (expanded: boolean) => {
    setIsSearchExpanded(expanded);

    if (expanded) {
      // Hide nav links immediately when search expands
      setShowNavLinks(false);
    } else {
      // Show nav links after search animation completes (300ms)
      setTimeout(() => {
        setShowNavLinks(true);
      }, 300);
    }
  };

  return (
    <div className="py-0 xl:container flex justify-between items-center lg:items-stretch lg:py-2 px-0">
      <div className="lg:hidden lg:px-2 gap-2  lg:py-2 flex-1 justify-center items-center">
        <SearchBar onSearchExpand={handleSearchExpand} />
      </div>

      <div className="hidden lg:flex relative items-center justify-between w-full px-3">
        {/* Left side: Logo */}
        <div className="flex items-center mr-10">
          <Logo />
        </div>

        {/* Center area: Navigation Links */}
        <div className={`flex items-center flex-1 justify-between transition-all duration-300 ease-in-out ${isSearchExpanded ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 w-auto'}`}>
          {/* Navigation Links - Hidden when search is expanded */}
          <div className={`hidden lg:flex items-center relative px-4 transition-all duration-300 ease-in-out ${showNavLinks ? 'opacity-100' : 'opacity-0'}`}>
            <div className="lg:block">
              <NavLinks navCategories={navCategories} />
            </div>
          </div>
        </div>

        {/* Right side: Search and User Actions */}
        <div className={`flex items-center gap-4 transition-all duration-300 ease-in-out ${isSearchExpanded ? 'w-full' : 'w-auto'}`}>
          {/* Search Bar - Takes full remaining width when expanded */}
          <div className={`relative transition-all duration-300 ease-in-out ${isSearchExpanded ? 'w-full' : 'w-auto'}`}>
            <SearchBar onSearchExpand={handleSearchExpand} />
          </div>

          {/* User Actions - Fixed position */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <HeaderUtilityIcons />
            <AvatarDropdown />
            <SideCart />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderContent;
