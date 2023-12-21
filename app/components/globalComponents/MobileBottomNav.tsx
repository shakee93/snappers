"use client";
import { Home, Search, ShoppingBag, LayoutGrid, UserCircle } from "lucide-react";
import Logo from "./Logo";
import { XIcon } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const MobileBottomNav = () => {
  const [openCat, setOpenCat] = useState(false);

  const handleCat = () => {
    setOpenCat(!openCat);
  };

  const router = useRouter();

  return (
    <div className="fixed grid grid-cols-4 shadow-3xl justify-between bottom-0 z-40 bg-white border-slate-100 border-t-2 pt-2 w-full py-1 px-1">
      <div>
        <Link
          href="#"
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
          href="#"
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
        } fixed left-0 bottom-0 w-[100%] h-screen bg-gray-50 p-5 ease-in-out duration-300 transform origin-bottom z-[40]`}
      >
        <div className="flex w-full items-center justify-between">
          <Logo />
          <div onClick={handleCat} className="cursor-pointer">
            <XIcon />
          </div>
        </div>
        {/* Add your category panel content here */}
      </div>
    </div>
  );
};

export default MobileBottomNav;
