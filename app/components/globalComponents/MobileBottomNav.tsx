"use client";
import { Home, Search, ShoppingBag, LayoutGrid , UserCircle} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const MobileBottomNav = () => {
  

  const router = useRouter();

  return (
    <div className="fixed grid grid-cols-5 shadow-3xl justify-between bottom-0 z-40 bg-white border-slate-100 border-t-2 pt-2 w-full py-1 px-1">
      <div>
        <Link href="#" className="flex flex-col justify-center items-center text-primaryColor gap-1">
          <LayoutGrid />
          <div className="text-[11px]">Categories</div>
        </Link>
      </div>
      <div>
        <Link href="#" className="flex flex-col justify-center items-center text-primaryColor gap-1">
          <Search />
          <div className="text-[11px]">Search</div>
        </Link>
      </div>
      <div>
        <Link href="#" className="flex flex-col justify-center items-center text-primaryColor gap-1">
          
          <Home />
          <div className="text-[11px]">Home</div>
        </Link>
      </div>
      <div>
        <Link href="#" className="flex flex-col justify-center items-center text-primaryColor gap-1">
          
          <UserCircle />
          <div className="text-[11px]">Profile</div>
        </Link>
      </div>
      <div>
        <Link href="#" className="flex flex-col justify-center items-center text-primaryColor gap-1">
          <ShoppingBag/>
          <div className="text-[11px]">Cart</div>
        </Link>
      </div>
    </div>
  );
};

export default MobileBottomNav;
