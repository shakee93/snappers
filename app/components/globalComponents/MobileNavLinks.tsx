"use client";
import {
  Home,
  Search,
  ShoppingBag,
  LayoutGrid,
  UserCircle,
} from "lucide-react";
import Logo from "./Logo";
import { Menu, XIcon, Facebook, Instagram, PhoneCall } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const MobileNavLinks = () => {
  const iconSize = 18;
  const navLinks = [
    {
      id: 2,
      href: "/collections/all",
      name: "Shop",
    },
    {
      id: 3,
      href: "/about",
      name: "About Us",
    },

    {
      id: 4,
      href: "/contact",
      name: "Contact Us",
    },
  ];
  const [openMenu, setOpenMenu] = useState(false);

  const handleMunu = () => {
    setOpenMenu(!openMenu);
  };

  const router = useRouter();

  return (
    <div>
      <div className="block lg:hidden">
        <button
          onClick={handleMunu}
          className="flex px-4 py-4 rounded-full text-slate-700  hover:bg-slate-100  focus:outline-none items-center justify-center"
        >
          <Menu className="text-primary-700 w-8 h-8 sm:w-12 sm:h-12 " />
        </button>
      </div>
      <div
        className={`${
          openMenu ? "translate-x-0" : "-translate-x-full"
        } fixed left-0 top-0 w-[100%] h-screen bg-gray-50  ease-in-out duration-300 transform origin-left z-50`}
      >
        <div className="flex w-full items-center justify-between">
          <Logo />
          <div  onClick={handleMunu}  className="cursor-pointer pr-4">
            <XIcon />
          </div>
        </div>
        <div className="flex flex-col gap-5">
          <ul className="gap-1 text-base mt-12 text-center items-center font-medium  text-primary-700 ">
            {navLinks.map((item) => (
              <li
                key={item.id}
                className="hover:bg-slate-200 rounded-3xl px-1 xl:px-3  py-1 "
              >
                <Link href={item.href}>{item.name}</Link>
              </li>
            ))}
          </ul>

          <div className="bg-gray-200 m-auto py-0.5 w-2/5 rounded-xl"></div>

          <div className="flex flex-col justify-center text-primaryColor text-sm gap-2 items-center">
            <Link
              href={"tel:0777555665"}
              className="flex  gap-2 items-center justify-center"
            >
              <PhoneCall size={iconSize} /> 0777555665
            </Link>
            <Link
              href={"tel:0777988665"}
              className="flex gap-2 items-center justify-center"
            >
              <PhoneCall size={iconSize} />
              0777988665
            </Link>
          </div>

          <div className="bg-gray-200 m-auto py-0.5 w-2/5 rounded-xl"></div>
          <div className="flex justify-center text-primaryColor">
            <Link href={"https://www.facebook.com/gqmobilestore"}>
              <Facebook size={iconSize} />
            </Link>
            <Link href={"https://www.instagram.com/gqthemobilestoreunlimited"}>
              <Instagram size={iconSize} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileNavLinks;
