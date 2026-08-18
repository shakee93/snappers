"use client";
import { Brand, Category, Product } from "@/graphql/types/graphql";
import { useStore } from "@/store/store";
import { useEffect, useMemo } from "react";
import { useProductListingImages } from "@/hooks/useProductListingImages";
import ProductCard, {
  type ProductCardItem,
} from "@/components/home/ProductCard";
import {
  buildListingImagePatchByProductId,
  collectProductIdsNeedingImageBackfill,
} from "@/lib/listingImagePatch";
import { useHits, useInstantSearch } from "react-instantsearch";
import Pagination from "@/shared/Pagination/Pagination";
import Image from "next/image";
import NotFound from "@/public/not_found.svg";
import {
  INSTANT_SEARCH_PRODUCT_GRID_CLASS_NAME,
  ProductCardsSkeleton,
} from "@/components/global/primitives/Loading/ProductCardLoading";
import FilterSelect from "@/components/global/primitives/Filters/FilterSelect";
import { filterHiddenProducts } from "@/lib/hidden-products";
import { getDatabaseIdFromProductLike } from "@/lib/bogo";
import { resolveProductSale, type SaleResolvableProduct } from "@/lib/productSale";

interface ProductGridProps {
  products?: { node: Product }[];
  brand?: Brand;
  category?: Category;
  pages?: number;
  hitsPerPage?: number;
  setHitsPerPage?: (hitsPerPage: number) => void;
}

function getProductHitKey(item: unknown, index: number): string {
  const hit = item as { objectID?: string; slug?: string | null };
  if (hit.objectID) return hit.objectID;

  const databaseId = getDatabaseIdFromProductLike(item);
  if (databaseId) return `product-${databaseId}`;

  if (hit.slug) return `${hit.slug}-${index}`;

  return `product-hit-${index}`;
}

const ProductGridInstant = ({
  products,
  brand,
  category,
  pages,
  hitsPerPage,
  setHitsPerPage,
}: ProductGridProps) => {
  const { hits, results } = useHits();
  const { status: statusState } = useInstantSearch();
  const { setSearchStatus, search, search_status, navigation, sidebar } = useStore();

  const imageBackfillIds = useMemo(
    () =>
      collectProductIdsNeedingImageBackfill(
        hits as Array<{
          databaseId?: number | null;
          image?: { sourceUrl?: string | null } | null;
          variations?: {
            nodes?: Array<{
              image?: { sourceUrl?: string | null } | null;
              stockStatus?: string | null;
            } | null> | null;
          } | null;
        }>
      ),
    [hits]
  );

  const { data: listingImagesData } = useProductListingImages(imageBackfillIds);

  const listingImageByProductId = useMemo(
    () =>
      buildListingImagePatchByProductId(
        listingImagesData?.products?.nodes
      ),
    [listingImagesData]
  );

  // When the On Sale filter is active, Typesense returns every product whose
  // `onSale` flag is true — but that flag stays true even after the last
  // in-stock variation discount expires, so products like Sony WH-1000XM5
  // and Apple AirPods Max leak in with no visible % OFF. Post-filter on the
  // same discount-resolution the card uses so the grid only shows products
  // that would actually render a badge. (Backend WP→Typesense sync needs to
  // recompute `onSale` from live variation prices to fix at the root.)
  //
  // Known tradeoff (QA): `results.nbHits` / `results.nbPages` are pre-filter,
  // so an On-Sale page can render fewer than `hitsPerPage` cards, and in the
  // worst case the empty state can show for a single page while later pages
  // still have results. Acceptable while the backend `onSale` flag is mostly
  // correct (this is cleanup for stragglers); the WP→Typesense sync fix is
  // the long-term resolution.
  const visibleHits = useMemo(() => {
    const filtered = filterHiddenProducts(hits as Array<{ slug?: string | null }>);
    if (!sidebar.on_sale) return filtered;
    return filtered.filter((hit) => resolveProductSale(hit as SaleResolvableProduct) !== null);
  }, [hits, sidebar.on_sale]);

  // useEffect(() => {
  //     setSearchStatus(statusState)
  // }, [statusState])

  // if ((search.length > 0 || navigation.length > 1) && (statusState === 'stalled' ) ) {
  //     return <div className='flex-1 grid  grid-cols-2 lg:grid-cols-4 gap-x-2 gap-y-5 lg:gap-x-8 lg:gap-y-10'>
  //         {Array(grid).fill(null).map((x, index) =>
  //             <div key={index} className="space-y-3">
  //                 <div className="h-52 bg-gray-200 rounded-md animate-pulse"></div>
  //                 <div className="h-4 bg-gray-300 rounded-md"></div>
  //                 <div className="h-4 bg-gray-300 rounded-md w-2/3"></div>
  //                 <div className="h-8 bg-gray-300 rounded-md w-1/4"></div>
  //             </div>
  //         )}
  //     </div>
  // }


  useEffect(() => {
  }, [statusState])


  // Keep hits mounted whenever we have any. InstantSearch flips status to
  // 'loading'/'stalled' on cache reads and widget churn even without a real
  // network round-trip; unmounting the grid for those transitions causes a
  // visible flicker. Only show the skeleton on the very first load.
  const showSkeleton = visibleHits.length === 0 && (statusState === 'stalled' || statusState === 'loading');

  return (
    <>
      {visibleHits.length > 0 && (
        <div className={INSTANT_SEARCH_PRODUCT_GRID_CLASS_NAME}>
          {visibleHits.map((item, index) => (
            <ProductCard
              key={getProductHitKey(item, index)}
              product={item as unknown as ProductCardItem}
              listingImageByProductId={listingImageByProductId}
            />
          ))}
        </div>
      )}

      {showSkeleton && (
        <ProductCardsSkeleton
          count={12}
          className={INSTANT_SEARCH_PRODUCT_GRID_CLASS_NAME}
        />
      )}

      {(visibleHits.length === 0 && statusState === 'idle') && (
        <div className="text-center text-slate-500 flex flex-col items-center gap-20 py-12">
          <div>
            <Image className="w-64" src={NotFound} alt="No Search Results" />
          </div>
          <div>We couldn&lsquo;t find any products :(</div>
        </div>
      )}


      {/* `nbHits` / `nbPages` are pre-filter counts from Typesense. We gate
          pagination on visible hits to avoid rendering controls on a hidden-only page. */}
      {results && visibleHits.length > 0 && results?.nbHits > results?.hitsPerPage && (
        <>
          <hr className="border-slate-200 mb-2 lg:my-6 lg:mb-0 dark:border-slate-700" />

          <div className="flex justify-between items-center gap-4">
            <Pagination />
            <div className="flex items-center gap-2">
              {results && results.nbPages > 1 && results.nbHits > 0 && (
                <div className="text-right py-6 text-sm rounded-xl border-none focus:outline-none select-none">
                  <label htmlFor="hitsPerPage" className="mr-2 text-header-green">Results per page:</label>
                  <FilterSelect
                    id="hitsPerPage"
                    aria-label="Results per page"
                    value={String(hitsPerPage)}
                    buttonClassName="min-w-[4.5rem]"
                    options={[
                      { id: "12", label: "12" },
                      { id: "24", label: "24" },
                      { id: "48", label: "48" },
                      { id: "96", label: "96" },
                    ]}
                    onChange={(value) => setHitsPerPage?.(Number(value))}
                  />
                </div>
              )}
            </div>
          </div>


        </>
      )}
    </>
  );
};

export default ProductGridInstant;
