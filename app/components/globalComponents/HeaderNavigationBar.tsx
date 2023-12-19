"use client";
import Logo from "./Logo";
import { XIcon, Search, UserRound, ShoppingBag, ChevronDown  } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import NavLinks from "./NavLinks";

const HeaderNavigationBar = () => {
  const [showSearchForm, setShowSearchForm] = useState(false);

  const router = useRouter();

  return (
    <div className="flex justify-between  shadow-sm bg-white z-40 m-auto p-4">
      <div className="w-1/3 flex items-center">
        <Logo />
        <button className="ml-[50px] bg-primaryColor flex text-white px-4 justify-center py-2 text-sm items-center rounded-lg">All Categories <ChevronDown className="h-5"/></button>
      </div>
      <div className="w-1/3 flex justify-center">
        <form
          className="flex-1 py-2 text-primary-700"
          onSubmit={(e) => {
            e.preventDefault();
            router.push("/page-search");
          }}
        >
          <div className="bg-slate-100 border-slate-900  flex items-center space-x-1.5 px-3 rounded-2xl h-full ">
            <Search />
            <input
              type="text"
              placeholder="Type and press enter"
              className="border-none bg-transparent focus:outline-none focus:ring-0 w-full text-sm"
              autoFocus
            />
            <button type="button" onClick={() => setShowSearchForm(false)}>
              <XIcon size={15} />
            </button>
          </div>
          <input type="submit" hidden value="" />
        </form>
      </div>
      <div className=""></div>
      <div className="w-1/3 flex items-center justify-end">
        <NavLinks />
        <div className="flex">
          <button className=" lg:flex w-10 h-10 sm:w-12 sm:h-12 rounded-full text-slate-700  hover:bg-slate-100  focus:outline-none items-center justify-center">
            <UserRound className="text-primary-700" />
          </button>
          <button className=" lg:flex w-10 h-10 sm:w-12 sm:h-12 rounded-full text-slate-700  hover:bg-slate-100  focus:outline-none items-center justify-center">
            <ShoppingBag className="text-primary-700" />
            <span className="w-4 h-4 flex items-center justify-center bg-red-500 relative mt-[-20px] ml-[-9px]  rounded-full text-[10px] leading-none text-white font-medium">
              99
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeaderNavigationBar;
