import { SimpleProduct, VariableProduct, ProductVariation } from "@/graphql/types/graphql";
import {
  DEALS_ARCHIVE_SORT_OPTIONS,
  type ArchiveFilterState,
} from "@/lib/archiveFilters";

export const HOMEPAGE_DEAL_CAROUSEL_LIMIT = 12;
export const DEALS_PAGE_FETCH_FIRST = 50;
import { filterHiddenProducts } from "@/lib/hidden-products";
import {
  parsePriceString,
  resolveProductSale,
  type SaleResolvableProduct,
} from "@/lib/productSale";

export type DealProduct = SimpleProduct | VariableProduct;

const dealDisplayPrice = (product: DealProduct): number => {
  if (product.type === "VARIABLE") {
    const variations = (product as VariableProduct).variations?.nodes;
    if (variations?.length) {
      const nodes = variations.filter(
        (v): v is ProductVariation => !!v,
      );
      const inStock = nodes.filter((v) => v.stockStatus === "IN_STOCK");
      const pool = inStock.length ? inStock : nodes;
      const prices = pool
        .map((v) => parsePriceString(v.price))
        .filter((p) => p > 0);
      if (prices.length) return Math.min(...prices);
    }
  }

  return parsePriceString(product.price ?? product.regularPrice);
};

/** Client-side sort / price / stock filters over the fixed deal product set. */
export const filterDealProducts = (
  products: DealProduct[],
  filters: ArchiveFilterState,
): DealProduct[] => {
  let result = filterHiddenProducts(products).filter(
    (product) => resolveProductSale(product as SaleResolvableProduct) !== null,
  );

  if (filters.inStock) {
    result = result.filter((product) => product.stockStatus === "IN_STOCK");
  }

  result = result.filter((product) => {
    const price = dealDisplayPrice(product);
    if (!Number.isFinite(price) || price <= 0) return false;
    return price >= filters.minPrice && price <= filters.maxPrice;
  });

  const sortOption =
    DEALS_ARCHIVE_SORT_OPTIONS.find((option) => option.id === filters.sort) ??
    DEALS_ARCHIVE_SORT_OPTIONS[0];

  const sorted = [...result];

  switch (sortOption.id) {
    case "price-asc":
      sorted.sort((a, b) => dealDisplayPrice(a) - dealDisplayPrice(b));
      break;
    case "price-desc":
      sorted.sort((a, b) => dealDisplayPrice(b) - dealDisplayPrice(a));
      break;
    case "name":
      sorted.sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
      break;
    case "newest":
    default:
      break;
  }

  return sorted;
};
