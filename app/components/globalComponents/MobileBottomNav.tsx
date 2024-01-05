"use client";
import {
    Home,
    Search,
    ShoppingBag,
    LayoutGrid,
    UserCircle, Codesandbox, Menu,
} from "lucide-react";
import Logo from "./Logo";
import { XIcon } from "lucide-react";
import { useState } from "react";
import { Category } from "@/graphql/types/graphql";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {useCart} from "@/context/CartProvider";
import {useStore} from "@/store/store";

const MobileBottomNav = ({ categories }: { categories: any }) => {
  const [openCat, setOpenCat] = useState(false);
    const {cart} = useCart();
    const { mobileMenu, toggleMobileMenu } = useStore()

  const handleCat = () => {
    setOpenCat(!openCat);
  };

  const router = useRouter();

  return (
    <div className="fixed grid grid-cols-5 shadow-3xl justify-between bottom-0 z-[100] bg-white border-slate-100 border-t-2 w-full py-3 px-1">
      <div>
          <Logo className='flex items-center justify-center' imageClass='h-[45px] p-0' />
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
                onClick={handleCat}
                className="flex flex-col justify-center items-center text-primaryColor gap-1 cursor-pointer"
            >
                <Codesandbox />
                <div className="text-[11px]">Brands</div>
            </Link>
        </div>
      <div>
        <Link
          href="/cart"
          className="flex flex-col justify-center items-center text-primaryColor gap-1"
        >
           <div className='relative'>
               {!!cart?.contents?.itemCount &&
                   <div className="w-4 h-4 flex items-center justify-center bg-primary-500 absolute -top-1 -right-1.5 rounded-full text-[10px] leading-none text-white font-medium">
                       <span className="mt-[1px]">{cart?.contents?.itemCount}</span>
                   </div>
               }
               <ShoppingBag />
           </div>
          <div className="text-[11px]">Cart</div>
        </Link>
      </div>

        <div>
            <div
                onClick={e => toggleMobileMenu()}
                className="flex flex-col justify-center items-center text-primaryColor gap-1"
            >
                {mobileMenu ?  <XIcon /> : <Menu /> }
                <div className="text-[11px]">Menu</div>
            </div>
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
        </ul>
      </div>
    </div>
  );
};

export default MobileBottomNav;
