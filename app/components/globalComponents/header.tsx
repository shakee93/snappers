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
import SideCart from "../SideCart/SideCart";
import HeaderContent from "./HeaderContent";

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
        <HeaderContent />
      </header>

      <MobileNavLinks />

      <HeaderSearchResults
        productCategories={productCategories}
        brands={brands}
      />

      <div className="lg:hidden">
        <MobileBottomNav categories={productCategories} />
      </div>
    </>
  );
};

export default Header;
