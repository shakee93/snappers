import { getClient } from "@/graphql/apollo-ssr";
import { GET_ALL_PRODUCTS } from "@/graphql/defs/products";
import { GET_OPTIONS } from "@/graphql/defs/options";
import { Brand, ProductCategory } from "@/graphql/types/graphql";
import { isPaymentPage } from "./paymentPageCheckUtilsServer";
import TopBarPromotion from "@/components/TopBarPromotion";
import HeaderContent from "./HeaderContent";
import HeaderSearchResults from "@/app/components/globalComponents/HeaderSearchResults";
import MobileNavLinks from "./MobileNavLinks";
import MobileBottomNav from "@/app/components/globalComponents/MobileBottomNav";
import HeaderClientWrapper from "./HeaderClientWrapper";

const getData = async () => {
  const { data: productsData } = await getClient().query({
    query: GET_ALL_PRODUCTS,
  });

  const { data: optionsData } = await getClient().query({
    query: GET_OPTIONS,
  });

  return {
    productCategories: productsData?.productCategories?.nodes || [],
    brands: productsData?.brands?.nodes || [],
    options: optionsData || {},
  };
};

const Header = async () => {
  if (isPaymentPage()) {
    return <></>;
  }

  const { productCategories, brands, options } = await getData();

  return (
    <HeaderClientWrapper
      productCategories={productCategories}
      brands={brands}
      options={options}
    />
  );
};

export default Header;
