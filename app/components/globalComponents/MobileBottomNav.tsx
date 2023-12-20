"use client";
import { Home, Search, ShoppingBag, LayoutGrid } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const MobileBottomNav = () => {
  const [showSearchForm, setShowSearchForm] = useState(false);

  const router = useRouter();

  return (
    <div className="fixed grid grid-cols-4 shadow-3xl justify-between bottom-0 z-40 bg-white w-full py-3 px-2">
      <div>
        <Link href="#" className="flex flex-col justify-center items-center text-primaryColor gap-1">
          <LayoutGrid />
          <div className="text-xs">Categories</div>
        </Link>
      </div>
      <div>
        <Link href="#" className="flex flex-col justify-center items-center text-primaryColor gap-1">
          <Search />
          <div className="text-xs">Search</div>
        </Link>
      </div>
      <div>
        <Link href="#" className="flex flex-col justify-center items-center text-primaryColor gap-1">
          <Home />
          <div className="text-xs">Profile</div>
        </Link>
      </div>
      <div>
        <Link href="#" className="flex flex-col justify-center items-center text-primaryColor gap-1">
          <ShoppingBag />
          <div className="text-xs">Cart</div>
        </Link>
      </div>
    </div>
  );
};

export default MobileBottomNav;
