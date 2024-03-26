"use client";
import { Popover, Transition } from "@headlessui/react";
import React, { Fragment, useState } from "react";
import { twMerge } from "tailwind-merge";
import Link from "next/link"
import { ChevronDown } from "lucide-react";

const categories: {
  [key: string]: {
    link: string;
    subcategories: {
      [key: string]: string;
    };
  };
} = {
  "Mobile Phones": {
    link: "/collections/smart-phones",
    subcategories: {
      "Samsung": "/samsung",
      "Apple": "/apple",
      "Redmi": "/redmi",
      "Google Pixel": "/google-pixel",
      "OnePlus": "/oneplus",
    },
  },
  "Mobile Accessories": {
    link: "/collections/mobile-accessories",
    subcategories: {
      "Phone Cases": "/mobile-accessories/cases",
      "Screen Protectors": "/mobile-accessories/screen-protectors",
      "Chargers": "/mobile-accessories/chargers",
      "Headphones": "/mobile-accessories/headphones",
      "Headsets": "/mobile-accessories/headsets",
      "Speakers": "/mobile-accessories/speakers",
      "Phone Protectors": "/mobile-accessories/phone-protectors",
      "Power Banks": "/mobile-accessories/power-banks",
    },
  },
  Cameras: {
    link: "/collections/cameras",
    subcategories: {
      "DSLR": "/cameras/dslr",
      "Mirrorless": "/cameras/mirrorless",
      "Point & Shoot": "/cameras/point-shoot",
      "Action Cameras": "/cameras/action-cameras",
      "Instant Cameras": "/cameras/instant-cameras",
    },
  },
  Laptops: {
    link: "/collections/laptops",
    subcategories: {
      "Apple": "/laptops/apple",
      "Dell": "/laptops/dell",
      "HP": "/laptops/hp",
      "Lenovo": "/laptops/lenovo",
      "Asus": "/laptops/asus",
    },
  },
  "Laptop Accessories": {
    link: "/collections/laptop-accessories",
    subcategories: {
      "Bags & Cases": "/laptop-accessories/bags-cases",
      "Docking Stations": "/laptop-accessories/docking-stations",
      "External Hard Drives": "/laptop-accessories/external-hard-drives",
      "Keyboards & Mice": "/laptop-accessories/keyboards-mice",
      "Laptop Chargers": "/laptop-accessories/chargers",
    },
  },
  "Smart Watches": {
    link: "/smart-watches",
    subcategories: {
      "Apple Watch": "/smart-watches/apple",
      "Samsung Galaxy Watch": "/smart-watches/samsung",
      "Fitbit": "/smart-watches/fitbit",
      "Garmin": "/smart-watches/garmin",
      "Xiaomi Mi Band": "/smart-watches/mi-band",
    },
  },
};

const CategoryWithSubcategories = () => {
  const [activeTab, setActiveTab] = useState<
    keyof typeof categories | null
  >(null);

  const handleMouseEnter = (tabName: keyof typeof categories) => {
    setActiveTab(tabName);
  };

  const handleMouseLeave = () => {
    setActiveTab(null);
  };

  return (
    <Popover className="relative">
      {({ open, close }) => (
        <>
          <Popover.Button className="hidden uppercase md:flex whitespace-nowrap focus:outline-0 py-4 pl-6  pr-4 h-full justify-center text-xs xl:text-sm items-center">
            All Categories 
            <ChevronDown
                className={twMerge(
                  `h-5 ml-1 transition-all duration-500`,
                  open && "rotate-180"
                )}
              />
          </Popover.Button>
          <Transition
            as={React.Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Popover.Panel
              className={twMerge(
                "absolute z-[350] w-screen max-w-sm mt-3   lg:max-w-max p-3 shadow-2xl text-sm font-normal bg-white rounded-lg"
              )}
            >
              
              <div className="flex min-w-max" onMouseLeave={handleMouseLeave}>
                <div className="min-w-[200px]">
                  <ul className="">
                    {Object.keys(categories).map((category) => (
                      <li
                        key={category}
                        className={`cursor-pointer py-2 px-4 border-l-4 ${
                          activeTab === category
                            ? "border-blue-500 bg-blue-100"
                            : "border-transparent"
                        }`}
                        onMouseEnter={() =>
                          handleMouseEnter(category as keyof typeof categories)
                        }
                      >
                        {category}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className={`w-full  ${activeTab ? 'block' : 'hidden'}`}>
                  {/* Content for the active tab */}
                  {activeTab && (
                    <ul className=" grid grid-rows-6 grid-flow-col bg-blue-100" >
                      {Object.entries(categories[activeTab].subcategories).map(
                        ([subcategory, link]) => (
                          <li key={subcategory} className="py-2 px-4 min-w-max hover:bg-primaryColor hover:text-white">
                            <Link href={link}>{subcategory}</Link>
                          </li>
                        )
                      )}
                    </ul>
                  )}
                </div>
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
};

export default CategoryWithSubcategories;