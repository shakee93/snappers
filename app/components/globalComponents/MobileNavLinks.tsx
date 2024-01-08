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
import {useStore} from "@/store/store";

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

  const { mobileMenu, toggleMobileMenu } = useStore()


  return (
    <div className='w-full'>
      <div
        className={`${
            mobileMenu ?
                "bottom-[95px] translate-y-0 opacity-1 scale-100" : 
                "translate-y-full opacity-0 bottom-0 scale-50"
        } fixed left-0  shadow-xl rounded-3xl left-1/2 -translate-x-1/2 w-11/12 border border-gray-30
        0 h-fit pt-4 pb-8 bg-white ease-in-out duration-150 transform origin-center z-50`}
      >
        <div className="bg-gray-300 m-auto py-0.5 w-1/5 rounded-xl"></div>

        <div className="flex flex-col gap-5 mt-3">
          <ul className="gap-1 text-base text-center items-center font-medium  text-primaryColor ">
            {navLinks.map((item) => (
              <li
                key={item.id}
                className="rounded-3xl px-1 xl:px-3 py-1 "
              >
                <Link
                    onClick={e => toggleMobileMenu()}
                    href={item.href}>{item.name}</Link>
              </li>
            ))}
          </ul>


          <div className="flex  justify-center text-primaryColor text-base gap-2 items-center">
            <Link
              href={"tel:0777555665"}
              className="flex  gap-2 items-center justify-center"
            >
              <PhoneCall size={iconSize} /> 0777555665
            </Link>
            <div>|</div>
            <Link
              href={"tel:0777988665"}
              className="flex gap-2 items-center justify-center"
            >
              <PhoneCall size={iconSize} />
              0777988665
            </Link>
          </div>

          <div className="flex gap-2 justify-center text-primaryColor">
            <Link href={"https://www.facebook.com/gqmobilestore"}>
              <Facebook size={24} />
            </Link>
            <Link href={"https://www.instagram.com/gqthemobilestoreunlimited"}>
              <Instagram size={24} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileNavLinks;
