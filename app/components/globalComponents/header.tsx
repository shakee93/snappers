import AvatarDropdown from "../Header/AvatarDropdown";
import CartDropdown from "../Header/CartDropdown";
import Logo from "./Logo";
import NavLinks from "./NavLinks";
import BrandBar from "./BrandBar";
import SearchBar from "@/app/components/globalComponents/SearchBar";
import MobileNavLinks from "./MobileNavLinks";
import { getClient } from "@/graphql/apollo-ssr";
import { GET_ALL_PRODUCTS } from "@/graphql/defs/products";
import HeaderSearchResults from "@/app/components/globalComponents/HeaderSearchResults";
import { Brand } from "@/graphql/types/graphql";
import MobileBottomNav from "@/app/components/globalComponents/MobileBottomNav";
import { isPaymentPage } from "./paymentPageCheckUtils";

async function getData(categories: number[] | null = null) {
  const { data, error } = await getClient().query({
    query: GET_ALL_PRODUCTS,
  });

  return {
    productCategories: data.productCategories?.nodes,
    brands: data.brands?.nodes as Brand[],
  };
}

const Header = async () => {
  const { productCategories, brands } = await getData();

  if (isPaymentPage()) {
    return <></>;
  }

  return (
    <>
      <header
        className={
          "sticky top-0  mt-[-10px] flex flex-col justify-between bg-white z-30 transition-all duration-1300 md:border-b"
        }
      >
        <div className="bg-black/80 px-2 py-5 md:p-3">
          <div className="items-between flex flex-col gap-4 md:flex-row md:items-center md:gap-3">
            <div className="flex w-full flex-col items-center justify-center gap-2 md:flex-row">
              <div className="flex-col md:flex-row flex gap-5 justify-center text-center items-center">
                <div className="text-sm font-semibold text-white md:text-xs lg:text-sm">
                  <span className="font-bold">The ALL NEW</span>{" "}
                  <span> Exclusive</span>
                  <span className="text-orange-400"> iPhone 16 Series</span> {" "}
                  <span>Available!</span> {" "}
                </div>
                <div className="text-xs">
                  <a
                    href="https://gqmobiles.lk//apple/apple-iphone-16"
                    className="bg-blue-700 text-white font-semibold py-1 px-4 rounded transition duration-300 ease-in-out hover:bg-blue-800"
                  >
                    Shop Now
                  </a>
                </div>
              </div>

            </div>
          </div>
        </div>
        <div className="md:container flex justify-between items-center md:items-stretch py-2 px-0">

          <div className="hidden md:hidden px-2 gap-2 bg-gradient-to-br from-sky-500 to-primaryColor py-2 flex-1 justify-center items-center">
            <SearchBar />
          </div>

          <div className="relative flex items-center justify-between w-full pr-3">

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



      <HeaderSearchResults
        productCategories={productCategories}
        brands={brands}
      />

      <div className="md:hidden">
        <MobileBottomNav categories={productCategories} />
      </div>

    </>
  );
};

export default Header;
