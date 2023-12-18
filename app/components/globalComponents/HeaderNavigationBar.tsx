"use client"
import Logo from "./Logo";
import { XIcon, Search, UserRound,ShoppingBag } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import NavLinks from "./NavLinks";

const HeaderNavigationBar = () => {
  const [showSearchForm, setShowSearchForm] = useState(false);

  const router = useRouter();

  const renderSearchForm = () => {
    return (
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
    );
  };
  

  return (
    <div className="flex justify-between container m-auto p-2">
      <div className="w-1/3">
        <Logo />
      </div>
      <div className="w-1/3 flex justify-center">
        {showSearchForm && (
          <div className="flex-[2] flex !mx-auto px-10">
            {renderSearchForm()}
          </div>
        )}
      </div>
      <div className=""></div>
      <div className="w-1/3 flex items-center justify-end">
        {!showSearchForm && <NavLinks />}
        <div className="flex">
        {!showSearchForm && (
          <button
            className="hidden lg:flex w-10 h-10 sm:w-12 sm:h-12 rounded-full text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none items-center justify-center"
            onClick={() => setShowSearchForm(!showSearchForm)}
          >
            <Search className="text-primary-700" />
          </button>
        )}
        <button className=" lg:flex w-10 h-10 sm:w-12 sm:h-12 rounded-full text-slate-700  hover:bg-slate-100  focus:outline-none items-center justify-center">
          <UserRound className="text-primary-700" />
        </button>
        <button className=" lg:flex w-10 h-10 sm:w-12 sm:h-12 rounded-full text-slate-700  hover:bg-slate-100  focus:outline-none items-center justify-center">
          <ShoppingBag className="text-primary-700" />
          <span className="w-4 h-4 flex items-center justify-center bg-red-500 relative mt-[-20px] ml-[-9px]  rounded-full text-[10px] leading-none text-white font-medium">99</span>
        </button>
        </div>
      </div>
    </div>
  );
};

export default HeaderNavigationBar;
