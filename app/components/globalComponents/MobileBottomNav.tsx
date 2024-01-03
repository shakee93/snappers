"use client";
import {
  Home,
  Search,
  ShoppingBag,
  LayoutGrid,
  UserCircle,
} from "lucide-react";
import Logo from "./Logo";
import { XIcon } from "lucide-react";
import { useState } from "react";
import { Category } from "@/graphql/types/graphql";
import { useRouter } from "next/navigation";
import Link from "next/link";

const MobileBottomNav = ({ categories }: { categories: any }) => {
  const [openCat, setOpenCat] = useState(false);

  const handleCat = () => {
    setOpenCat(!openCat);
  };

  const router = useRouter();

  return (
    <div className="fixed grid grid-cols-4 shadow-3xl  justify-between bottom-0 z-30 bg-white border-slate-100 border-t-2 pt-2 w-full py-1 px-1">
      <div>
        <Link
          href="/"
          className="flex flex-col justify-center items-center text-primaryColor gap-1"
        >
          <Home />
          <div className="text-[11px]">Home</div>
        </Link>
      </div>
      <div>
        <Link
          href="#"
          onClick={handleCat}
          className="flex flex-col justify-center items-center text-primaryColor gap-1 cursor-pointer"
        >
          <LayoutGrid />
          <div className="text-[11px]">Categories</div>
        </Link>
      </div>
      <div>
        <Link
          href="#"
          className="flex flex-col justify-center items-center text-primaryColor gap-1"
        >
          <Search />
          <div className="text-[11px]">Search</div>
        </Link>
      </div>

      {/* <div>
        <Link
          href="#"
          className="flex flex-col justify-center items-center text-primaryColor gap-1"
        >
          <UserCircle />
          <div className="text-[11px]">Profile</div>
        </Link>
      </div> */}
      <div>
        <Link
          href="/cart"
          className="flex flex-col justify-center items-center text-primaryColor gap-1"
        >
          <ShoppingBag />
          <div className="text-[11px]">Cart</div>
        </Link>
      </div>
      {/* Slide-in category panel */}
      <div
        className={`${
          openCat ? "translate-y-0" : "translate-y-full"
        } fixed left-0 bottom-0 w-[100%] h-screen bg-gray-50/90 p-2 ease-in-out duration-300 transform origin-bottom z-20 overflow-y-auto`}
      >
        <div className="flex w-full items-center justify-between">
          <Logo />
          <div onClick={handleCat} className="cursor-pointer">
            <XIcon />
          </div>
        </div>
        <ul className="py-2 text-left text-sm text-gray-700 dark:text-gray-200">
          {categories?.map((category: Category, index: number) => (
            <li key={index}>
              <Link
                onClick={handleCat}
                href={`/collections/${category.slug}`}
                className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
              >
                {category.name}
              </Link>
            </li>
          ))}
          {/* {categories.map((category, index) => (
            <li key={index}>
              <Link
                href={category.link}
                className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
              >
                {category.name}
              </Link>
            </li>
          ))} */}
        </ul>
      </div>
    </div>
  );
};

export default MobileBottomNav;
