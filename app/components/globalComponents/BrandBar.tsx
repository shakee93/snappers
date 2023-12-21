import React, { useState } from "react";
import MegaMenu from "./CategoriesMenu";

import Link from "next/link";
import { ChevronUp, ChevronDown } from "lucide-react";
const BrandBar = () => {
  const [showMegaMenu, setShowMegaMenu] = useState(false);

  const handleAllCategoriesClick = () => {
    setShowMegaMenu((prevShowMegaMenu) => !prevShowMegaMenu);
  };
  const handleMegaMenuLeave = () => {
    setShowMegaMenu(false);
  };

  const categories = [
    {
      id: "1",
      name: "Category 1",
      brands: [
        { id: "1.1", name: "Brand 1.1", logoSrc: "/brand1.1-logo.png" },
        { id: "1.2", name: "Brand 1.2", logoSrc: "/brand1.2-logo.png" },
      ],
    },
    {
      id: "2",
      name: "Category 2",
      brands: [
        { id: "2.1", name: "Brand 2.1", logoSrc: "/brand2.1-logo.png" },
        { id: "2.2", name: "Brand 2.2", logoSrc: "/brand2.2-logo.png" },
      ],
    },
    {
      id: "3",
      name: "Category 3",
      brands: [
        { id: "3.1", name: "Brand 3.1", logoSrc: "/brand3.1-logo.png" },
        { id: "3.2", name: "Brand 3.2", logoSrc: "/brand3.2-logo.png" },
      ],
    },
  ];
  const brands = [
    { name: "Apple", link: "/" },
    { name: "Bose", link: "/" },
    { name: "Samsung", link: "/" },
    { name: "OnePlus", link: "/" },
    { name: "Google", link: "/" },
    { name: "Amazfit", link: "/" },
    { name: "Honor", link: "/" },
    { name: "Huawei", link: "/" },
    { name: "Beats", link: "/" },
    { name: "ZTE", link: "/" },
    { name: "JBL", link: "/" },
    { name: "Xiaomi", link: "/" },
    { name: "Asus", link: "/" },
    { name: "Fitbit", link: "/" },
    { name: "Microsoft", link: "/" },
    { name: "Oppo", link: "/" },
    { name: "Tecno", link: "/" },
    { name: "Sony", link: "/" },
    // Add more brands as needed
  ];

  return (
    <div className="hidden md:flex">
      <div className="w-44 hidden lg:block"></div>
      <div className="w-full flex justify-between overflow-hidden px-2 py-1 items-center">
        <div>
          <button
            onClick={handleAllCategoriesClick}
            className="hidden ml-[15px] mr-2 bg-primaryColor md:flex text-white w-40 pl-3 justify-center py-2 text-xs xl:text-sm items-center rounded-lg"
          >
            All Categories{" "}
            {showMegaMenu ? (
              <ChevronUp className="h-5 ml-1" />
            ) : (
              <ChevronDown className="h-5 ml-1" />
            )}
          </button>
        </div>
        {showMegaMenu && (
          <MegaMenu
            categories={categories}
            isVisible={showMegaMenu}
            onMouseLeave={handleMegaMenuLeave}
          />
        )}
        <div className="w-full flex justify-between">
          {brands.map((brand, index) => (
            <Link
              key={index}
              href={brand.link}
              className="px-4   font-medium text-gray-500 text-sm border-x-[1px]"
            >
              {brand.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BrandBar;
