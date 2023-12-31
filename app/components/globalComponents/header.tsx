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
import {getClient} from "@/graphql/apollo-ssr";
import {GET_ALL_PRODUCTS} from "@/graphql/defs/products";
import HeaderSearchResults from "@/app/components/globalComponents/HeaderSearchResults";
import {Brand} from "@/graphql/types/graphql";
import BackdropSpinner from "@/app/components/BackdropSpinner";

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
                <SearchBar />
              </div>
              <div className="w-fit flex items-center justify-end pr-3">
                <div className="hidden lg:block">
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
          <MobileNavLinks/>
        </div>
      </header>
      <HeaderSearchResults productCategories={productCategories} brands={brands} />
    </>
  );
};

export default Header;
