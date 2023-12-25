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
import MobileNavLinks from "./MobileNavLinks";

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

           "backdrop-blur-md sticky top-0 flex flex-col justify-between bg-white/90 z-30 transition-all duration-1300 border-b"
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
        <MobileNavLinks/>
      </div>

      
      <div className="block sm:hidden">{/* <MobileBottomNav /> */}</div>
    </header>
  );
};

export default Header;
