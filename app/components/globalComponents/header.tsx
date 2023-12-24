import { useRouter } from "next/navigation";
import {
  Menu,
  XIcon,
  Facebook,
  Instagram,
  PhoneCall,
} from "lucide-react";
import AvatarDropdown from "../Header/AvatarDropdown";
import CartDropdown from "../Header/CartDropdown";
import Link from "next/link";
import Logo from "./Logo";
import NavLinks from "./NavLinks";
import BrandBar from "./BrandBar";
import SearchBar from "@/app/components/globalComponents/SearchBar";

const Header = () => {
  const iconSize = 18;
  const navLinks = [
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


  return (
    <header
      className={

           "backdrop-blur-md sticky top-0 flex flex-col justify-between bg-white/90 z-50 transition-all duration-1300 border-b"
      }
    >
      <div className="flex justify-between items-center lg:items-stretch">
        <div className="flex items-center relative">
          <Logo />
        </div>
        <div className='hidden lg:flex flex-1 flex-col justify-between'>
          <div className='w-full flex flex-1'>
            <div className="flex pl-5 flex-1 justify-center items-center">
              <SearchBar/>
            </div>
            <div className="w-fit flex items-center justify-end">
              <div className="hidden lg:block">
                <NavLinks />
              </div>
              <div className="hidden md:flex">
                <AvatarDropdown />
                <CartDropdown />
              </div>

            </div>
          </div>
          <BrandBar/>
        </div>
        <div className="block lg:hidden">
          <button
              className="flex px-4 py-4 rounded-full text-slate-700  hover:bg-slate-100  focus:outline-none items-center justify-center"
          >
            <Menu className="text-primary-700 w-8 h-8 sm:w-12 sm:h-12 " />
          </button>
        </div>
      </div>

      <div
        className={
          "fixed left-[-100%] top-0 p-10 h-screen  z-50 ease-in duration-200"
        }
      >
        <div className="flex w-full items-center justify-between">
          <Logo />
          <div className="cursor-pointer">
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
