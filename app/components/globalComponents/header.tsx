import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Menu,
  XIcon,
  Facebook,
  Instagram,
  PhoneCall,
  MapPin,
  ChevronDown,
  ChevronUp,
  Search,
} from "lucide-react";
import AvatarDropdown from "../Header/AvatarDropdown";
import CartDropdown from "../Header/CartDropdown";
import Link from "next/link";
import Image from "next/image";
import MegaMenu from "@/app/components/GlobalComponents/CategoriesMenu";
import Logo from "@/app/components/GlobalComponents/Logo";
import { useQuery } from "@apollo/client";
import { GET_ALL_PRODUCTS, GET_CATEGORY, GET_VARIATIONS_PRODUCT } from "@/graphql/defs/products";
import { useStore } from "@/store/store";
import { Product } from "@/graphql/defs/types/graphql";

const Header = () => {

  const { sidebar: { categories } } = useStore();
  const [_products, setProducts] = useState(null);
  let { loading, error, data, refetch } = useQuery(GET_ALL_PRODUCTS, {
    variables: {
      categoryIdIn: categories,
    },
  });

  useEffect(() => {
    refetch();
  }, [categories]);

  useEffect(() => {
    if (data?.products.edges.length > 0) {
      setProducts(data.products.edges);
    }
  }, [data]);


  console.log('categories', data?.productCategories.nodes.map((variant, index) => console.log(variant.name)));

  const iconSize = 18;

  const navLinks = [
    {
      id: 1,
      href: "/",
      name: "Home",
    },
    {
      id: 2,
      href: "/collections/all",
      name: "Shop",
    },
    {
      id: 3,
      href: "/page-collection-2",
      name: "About Us",
    },

    {
      id: 4,
      href: "/page-collection-2",
      name: "Contact Us",
    },
  ];
  const categoriesdump = [
    {
      id: "1",
      name: "Category 1",
      brands: [
        { id: "1.1", name: "Brand 1.1", logoSrc: "/brand1.1-logo.png" },
        { id: "1.2", name: "Brand 1.2", logoSrc: "/brand1.2-logo.png" },
      ],
    },
    {
      id: "2",
      name: "Category 2",
      brands: [
        { id: "2.1", name: "Brand 2.1", logoSrc: "/brand2.1-logo.png" },
        { id: "2.2", name: "Brand 2.2", logoSrc: "/brand2.2-logo.png" },
      ],
    },
    {
      id: "3",
      name: "Category 3",
      brands: [
        { id: "3.1", name: "Brand 3.1", logoSrc: "/brand3.1-logo.png" },
        { id: "3.2", name: "Brand 3.2", logoSrc: "/brand3.2-logo.png" },
      ],
    },
  ];
  const router = useRouter();

  const [showMegaMenu, setShowMegaMenu] = useState(false);

  const [header, setHeader] = useState(false);

  const [menuOpen, setMenuOpen] = useState(false);

  const menuHandler = () => {
    setMenuOpen(!menuOpen);
  };

  const scrollHeader = () => {
    if (window.scrollY >= 150) {
      setHeader(true);
    } else {
      setHeader(false);
    }
  };
  const handleAllCategoriesClick = () => {
    setShowMegaMenu((prevShowMegaMenu) => !prevShowMegaMenu);
  };

  const handleMegaMenuLeave = () => {
    setShowMegaMenu(false);
  };
  useEffect(() => {
    window.addEventListener("scroll", scrollHeader);

    return () => {
      window.removeEventListener("scroll", scrollHeader);
    };
  }, []);

  return (
    <header
      className={
        header
          ? "fixed w-full flex flex-col justify-between top-0 bg-red-500 z-50 transition-all duration-1400"
          : "flex flex-col justify-between top-0 bg-white z-50 transition-all duration-1300"
      }
    >
      {menuOpen && (
        <div
          className="fixed top-0 left-0 w-full h-screen bg-black opacity-70 z-50"
          onClick={menuHandler}
        ></div>
      )}

      <div className="">

        {/* header top bar */}

        <div className="hidden lg:flex flex-row justify-between bg-primaryColor con p-2 text-xs text-white">
          <div className="flex gap-2 xl:w-48"></div>
          <div className="flex gap-2 items-center w-4/12">
            Contact Us :
            <Link
              href={"tel:0777555665"}
              className="flex gap-2 items-center justify-center"
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

          <div className=" gap-2  xl:w-2/12 items-center hidden xl:flex justify-center text-xs">
            Social Media :
            <Link href={"https://www.facebook.com/gqmobilestore"}>
              <Facebook size={iconSize} />
            </Link>
            <Link href={"https://www.instagram.com/gqthemobilestoreunlimited"}>
              <Instagram size={iconSize} />
            </Link>
          </div>
          <div className="flex gap-2 xl:w-4/12 items-center justify-end">
            Address :
            <MapPin size={iconSize} />
            250/54, Ground Floor, Liberty Plaza, Colombo 03.
          </div>
        </div>

        {/* header navigation bar */}

        <div className="flex justify-between shadow-sm bg-white z-40 m-auto p-2 md:p-4 relative">
          <div className="w-1/3 flex items-center relative">
            <Logo />
            <button
              onClick={handleAllCategoriesClick}
              className="hidden ml-[15px] xl:ml-[50px] bg-primaryColor lg:flex text-white px-4 justify-center py-2 text-xs xl:text-sm items-center rounded-lg"
            >
              All Categories{" "}
              {showMegaMenu ? (
                <ChevronUp className="h-5 ml-1" />
              ) : (
                <ChevronDown className="h-5 ml-1" />
              )}
            </button>
          </div>
          {showMegaMenu && (
            <MegaMenu
              categories={categories}
              isVisible={showMegaMenu}
              onMouseLeave={handleMegaMenuLeave}
            />
          )}
          <div className="hidden w-1/3 md:flex justify-center">
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
              </div>
              <input type="submit" hidden value="" />
            </form>
          </div>
          <div className=""></div>
          <div className="w-1/3 flex items-center justify-end">
            <ul className="hidden lg:flex gap-1 xl:gap-2 text-[12px] xl:text-[13px] items-center font-medium justify-end text-primary-700 xl:mr-5 w-full">
              {navLinks.map((item) => (
                <li
                  key={item.id}
                  className="hover:bg-slate-200 rounded-3xl px-1 xl:px-3  py-1 text-center"
                >
                  <Link href={item.href}>{item.name}</Link>
                </li>
              ))}
            </ul>
            <div className="hidden md:flex">
              <AvatarDropdown />
              <CartDropdown />

            </div>
            <div className="block lg:hidden">
              <button
                onClick={menuHandler}
                className=" flex w-10 h-10 sm:w-12 sm:h-12 rounded-full text-slate-700  hover:bg-slate-100  focus:outline-none items-center justify-center"
              >
                <Menu className="text-primary-700" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className={
          menuOpen
            ? "fixed left-0 top-0 w-[70%] sm:hidden h-screen bg-gray-100 py-5 px-3 ease-in duration-300 z-50"
            : "fixed left-[-100%] top-0 p-10 h-screen  z-50 ease-in duration-200"
        }
      >
        <div className="flex w-full items-center justify-between">
          <Logo />
          <div onClick={menuHandler} className="cursor-pointer">
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
      <div className="block sm:hidden">{/* <MobileBottomNav /> */}</div>
    </header>
  );
};

export default Header;
