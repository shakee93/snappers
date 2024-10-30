import AvatarDropdown from "../Header/AvatarDropdown";
import CartDropdown from "../Header/CartDropdown";
import Logo from "./Logo";
import NavLinks from "./NavLinks";
import BrandBar from "./BrandBar";
import SearchBar from "@/app/components/globalComponents/SearchBar";
import MobileNavLinks from "./MobileNavLinks";
import { getClient } from "@/graphql/apollo-ssr";
import { GET_ALL_PRODUCTS } from "@/graphql/defs/products";
import { GET_OPTIONS } from "@/graphql/defs/options";
import HeaderSearchResults from "@/app/components/globalComponents/HeaderSearchResults";
import { Brand } from "@/graphql/types/graphql";
import MobileBottomNav from "@/app/components/globalComponents/MobileBottomNav";
import { isPaymentPage } from "./paymentPageCheckUtils";
import TopBarPromotion from "@/components/TopBarPromotion";

// Fetch all products and categories
async function getData(categories: number[] | null = null) {
  const { data, error } = await getClient().query({
    query: GET_ALL_PRODUCTS,
  });

  return {
    productCategories: data.productCategories?.nodes,
    brands: data.brands?.nodes as Brand[],
  };
}

// Fetch options data for TopBarPromotion
async function getOptionsData() {
  const { data } = await getClient().query({
    query: GET_OPTIONS,
  });
  return data;
}

const Header = async () => {
  const { productCategories, brands } = await getData();
  const options = await getOptionsData();

  if (isPaymentPage()) {
    return <></>;
  }

  return (
    <>
      <header
        className={
          "sticky top-0  mt-[-9px] flex flex-col justify-between bg-white z-30 transition-all duration-1300 md:border-b"
        }
      >
        <TopBarPromotion options={options} />
        <div className="md:container flex justify-between items-center md:items-stretch py-2 px-0">
          <div className="hidden md:hidden px-2 gap-2 bg-gradient-to-br from-sky-500 to-primaryColor py-2 flex-1 justify-center items-center">
            <SearchBar />
          </div>

          <div className="relative flex items-center justify-between w-full px-3">
            <div className="-left-12 hidden md:flex items-center mr-4">
              <Logo />
            </div>

            <div className="hidden md:flex items-center relative px-4">
              <div className="md:block">
                <NavLinks />
              </div>
            </div>

            <div className="flex-1">
              <SearchBar />
            </div>

            <div className="hidden ml-5 md:flex">
              <AvatarDropdown />
              <CartDropdown />
            </div>
          </div>
        </div>
      </header>

      <MobileNavLinks />

      <HeaderSearchResults productCategories={productCategories} brands={brands} />

      <div className="md:hidden">
        <MobileBottomNav categories={productCategories} />
      </div>
    </>
  );
};

export default Header;
