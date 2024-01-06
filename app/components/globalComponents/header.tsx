import { useRouter } from "next/navigation";
import {
  Menu,
  XIcon,
  Facebook,
  Instagram,
  PhoneCall, ChevronLeft,
} from "lucide-react";
import AvatarDropdown from "../Header/AvatarDropdown";
import CartDropdown from "../Header/CartDropdown";
import Link from "next/link";
import Logo from "./Logo";
import NavLinks from "./NavLinks";
import BrandBar from "./BrandBar";
import SearchBar from "@/app/components/globalComponents/SearchBar";
import MobileNavLinks from "./MobileNavLinks";
import {getClient} from "@/graphql/apollo-ssr";
import {GET_ALL_PRODUCTS} from "@/graphql/defs/products";
import HeaderSearchResults from "@/app/components/globalComponents/HeaderSearchResults";
import {Brand} from "@/graphql/types/graphql";
import BackdropSpinner from "@/app/components/BackdropSpinner";
import MobileBottomNav from "@/app/components/globalComponents/MobileBottomNav";

async function getData(categories: number[] | null = null) {
  const { data, error } = await getClient().query({
    query: GET_ALL_PRODUCTS,
  });

  return {
    productCategories: data.productCategories.nodes,
    brands: data.brands.nodes as Brand[],
  };
}

const Header = async () => {
  const { productCategories, brands } = await getData();

  return (
    <>
      <header
          className={
            "backdrop-blur-md sticky top-0 flex flex-col justify-between bg-white/90 z-30 transition-all duration-1300 shadow-xl md:border-b"
          }
      >
        <div className="flex justify-between items-center md:items-stretch">


          <div className="flex md:hidden px-2 gap-2 bg-primaryColor py-2 flex-1 justify-center items-center">

            <SearchBar />
          </div>

          <div className="hidden md:flex items-center relative">
            <Logo />
          </div>

          <div className='hidden md:flex flex-1 flex-col justify-between'>
            <div className='w-full flex flex-1'>
              <div className="flex pl-5 flex-1 justify-center items-center">
                <SearchBar />
              </div>
              <div className="w-fit flex items-center justify-end pr-3">
                <div className="hidden md:block">
                  <NavLinks />
                </div>
                <div className="hidden md:flex">
                  <AvatarDropdown />
                  <CartDropdown />
                </div>
              </div>
            </div>
            <BrandBar categories={productCategories} brands={brands}/>
          </div>



        </div>
      </header>
      <MobileNavLinks/>
      <HeaderSearchResults productCategories={productCategories} brands={brands} />
      <div className="md:hidden">
        <MobileBottomNav categories={productCategories}/>
      </div>
    </>
  );
};

export default Header;
