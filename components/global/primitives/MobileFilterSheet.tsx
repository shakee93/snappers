import { Dialog, Transition } from "@headlessui/react";
import React, { Fragment, useMemo, useState } from "react";
import ButtonClose from "@/shared/ButtonClose/ButtonClose";
import Checkbox from "@/shared/Checkbox/Checkbox";
import { twMerge } from "tailwind-merge";
import { XIcon } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import ButtonThird from "@/shared/Button/ButtonThird";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import { useStore } from "@/store/store";
import { Brand, ProductCategory } from "@/graphql/types/graphql";
import { useRefinementList, useInstantSearch } from "react-instantsearch";
import { UiState } from "instantsearch.js";
import {
  filterPanelTitleClassName,
  filterMobileTriggerActiveClassName,
  filterCheckboxLabelClassName,
} from "@/components/global/primitives/Filters/filterStyles";
import { PRICE_RANGE } from "@/components/global/primitives/Filters/PriceFilter";
import FilterResetButton from "./Filters/FilterResetButton";
import SubCategoryFilter from "@/components/global/primitives/Filters/SubCategoryFilter";

interface TabFilterProps {
    categories?: ProductCategory[];
    subCategories?: ProductCategory[];
    category?: ProductCategory;
    brands?: Brand[];
    brand?: Brand;
    sort?: Boolean;
    inStockOnly?: boolean;
    defaultSort?: string;
    resetDealsFilter?: boolean;
    resetSearchQuery?: boolean;
}

const MobileFilterSheet = ({
    categories = [],
    subCategories = [],
    brands = [],
    brand,
    category,
    inStockOnly = false,
    defaultSort = "",
    resetDealsFilter = false,
    resetSearchQuery = false,
}: TabFilterProps) => {

    const [isOpenMoreFilter, setisOpenMoreFilter] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { setUiState } = useInstantSearch<UiState & { product?: Record<string, unknown> }>();

    const {
        sidebar,
        syncCategories,
        syncBrands,
        resetSidebarFilters,
        setSearch,
    } = useStore();

    const brandsState = sidebar.brands;
    const categoriesState = sidebar.categories;

    const filterCount = useMemo(
        () => categoriesState.length + brandsState.length,
        [categoriesState, brandsState],
    );

    const { items: categoriesFacet } = useRefinementList({
        attribute: 'categories_facet',
    });

    const { items: brandsFacet } = useRefinementList({
        attribute: 'brands_facet',
        limit: 20,
    });

    // Snapshot the facet list on first non-empty result and keep it stable.
    // Once a brand is selected the InstantSearchWrapper filter narrows results
    // to that brand, so brandsFacet collapses to just the selected value and
    // every other checkbox would disappear — blocking multi-select. Pinning
    // the initial facet keeps the full list (and counts) visible while the
    // user is making selections. Same reasoning for categories. setState
    // during render is React's recommended pattern for derived snapshot
    // state — guarded so it only fires once when the facet first populates.
    const [firstBrandsFacet, setFirstBrandsFacet] = useState<typeof brandsFacet>([]);
    if (firstBrandsFacet.length === 0 && brandsFacet.length > 0) {
        setFirstBrandsFacet(brandsFacet);
    }
    const [firstCategoriesFacet, setFirstCategoriesFacet] = useState<typeof categoriesFacet>([]);
    if (firstCategoriesFacet.length === 0 && categoriesFacet.length > 0) {
        setFirstCategoriesFacet(categoriesFacet);
    }

    const brandsFacetView = firstBrandsFacet.length > 0 ? firstBrandsFacet : brandsFacet;
    const categoriesFacetView = firstCategoriesFacet.length > 0 ? firstCategoriesFacet : categoriesFacet;

    const facetedBrands = useMemo(() => {
        const ids = brandsFacetView.map(f => Number(f.value));
        return brands.filter(b => ids.includes(b.databaseId));
    }, [brands, brandsFacetView])

    const facetedCategories = useMemo(() => {
        const ids = categoriesFacetView.map(f => Number(f.value));
        const sortedCategories = categories.filter(b => ids.includes(b.databaseId));

        // Sort categories to have 1484 first and 1483 second
        sortedCategories.sort((a, b) => {
            if (a.databaseId === 1484) return -1;
            if (b.databaseId === 1484) return 1;
            if (a.databaseId === 1483) return -1;
            if (b.databaseId === 1483) return 1;
            if (a.databaseId === 1485) return -1;
            if (b.databaseId === 1485) return 1;
            return 0;
        });

        return sortedCategories;
    }, [categoriesFacetView, categories])

    const closeModalMoreFilter = () => setisOpenMoreFilter(false);
    const openModalMoreFilter = () => setisOpenMoreFilter(true);

    const handleClearFilters = () => {
        resetSidebarFilters(defaultSort);
        if (resetSearchQuery) {
            setSearch("");
            setUiState((prev) => ({
                ...prev,
                product: {
                    ...(prev.product || {}),
                    query: "",
                    page: 1,
                    categories: [],
                    brands: [],
                    priceRange: PRICE_RANGE,
                    on_sale: false,
                    in_stock: false,
                    sort: defaultSort,
                    variations: {},
                },
            }));
        }
        if (resetDealsFilter && searchParams.get("filter")) {
            router.push(pathname, { scroll: false });
        }
        closeModalMoreFilter();
    };

    const handleChangeCategories = (checked: boolean, name: number) => {
        if (name === 0 && checked) {
            syncCategories([]);
            return;
        }

        const newCategories = checked
            ? [...categoriesState, name]
            : categoriesState.filter((i) => i !== name);

        syncCategories(newCategories);
    };

    const handleChangeBrands = (checked: boolean, name: number) => {
        if (name === 0 && checked) {
            syncBrands([]);
            return;
        }

        const newBrands = checked
            ? [...brandsState, name]
            : brandsState.filter((i) => i !== name);

        syncBrands(newBrands);
    };

    const renderXClear = () => {
        const handleXClearClick = () => {
            handleClearFilters();
        };
        return (
            <span
                className="flex-shrink-0 w-4 h-4 rounded-full bg-header-action text-header-green flex items-center justify-center ml-3 cursor-pointer">
                <XIcon className="p-0.5" onClick={handleXClearClick} />
            </span>
        );
    };

    return (
        <div className="w-full">
            <div
                className={`flex bg-white w-full flex-shrink-0 items-center justify-center px-4 py-2 text-sm rounded-full border focus:outline-none cursor-pointer select-none
          ${filterCount
                        ? filterMobileTriggerActiveClassName
                        : "border border-[#E8E8E8] text-header-green hover:border-header-green/40"
                    }`}
                onClick={openModalMoreFilter}
            >
                <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M22 6.5H16"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeMiterlimit="10"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M6 6.5H2"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeMiterlimit="10"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M10 10C11.933 10 13.5 8.433 13.5 6.5C13.5 4.567 11.933 3 10 3C8.067 3 6.5 4.567 6.5 6.5C6.5 8.433 8.067 10 10 10Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeMiterlimit="10"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M22 17.5H18"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeMiterlimit="10"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M8 17.5H2"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeMiterlimit="10"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M14 21C15.933 21 17.5 19.433 17.5 17.5C17.5 15.567 15.933 14 14 14C12.067 14 10.5 15.567 10.5 17.5C10.5 19.433 12.067 21 14 21Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeMiterlimit="10"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>

                <span className="ml-2">
                    {filterCount > 0
                        ? `Products filters (${filterCount})`
                        : "Products filters"}
                </span>
                {filterCount > 0 && renderXClear()}
            </div>

            <Transition appear show={isOpenMoreFilter} as={Fragment}>
                <Dialog
                    as="div"
                    className="fixed inset-0 z-[200] overflow-y-auto"
                    onClose={closeModalMoreFilter}
                >
                    <div className="min-h-screen text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-40 dark:bg-opacity-60" />
                        </Transition.Child>

                        <span
                            className="inline-block h-screen align-middle"
                            aria-hidden="true"
                        >
                            &#8203;
                        </span>
                        <Transition.Child
                            className="fixed inset-0 h-screen w-full max-w-4xl"
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <div
                                className="fixed inset-0 w-full text-left align-middle transition-all transform bg-white dark:bg-neutral-900 dark:border dark:border-neutral-700 dark:text-neutral-100 h-full">
                                <div
                                    className="fixed top-0 z-[100] w-full px-6 py-4 bg-white border-b border-neutral-200 dark:border-neutral-800 text-center">
                                    <span className="absolute left-3 top-3">
                                        <ButtonClose onClick={closeModalMoreFilter} />
                                    </span>
                                    <Dialog.Title
                                        as="h3"
                                        className="text-lg font-medium leading-6 text-header-green"
                                    >
                                        Products filters
                                    </Dialog.Title>
                                    <span className="absolute right-3 top-3">
                                        <FilterResetButton
                                            defaultSort={defaultSort}
                                            resetDealsFilter={resetDealsFilter}
                                            ignoreInStock={inStockOnly}
                                            resetSearchQuery={resetSearchQuery}
                                        />
                                    </span>
                                </div>

                                <div className="overflow-y-auto h-[calc(100vh-70px)] pt-12">
                                    <div
                                        className="px-6 sm:px-8 md:px-10 divide-y divide-neutral-200 dark:divide-neutral-800">
                                        {!category && (
                                            <div className="py-7">
                                                <h3 className={filterPanelTitleClassName}>Categories</h3>
                                                <div className="relative ">
                                                    <div className="relative flex flex-col  py-6 space-y-5">
                                                        <Checkbox
                                                            name="All Categories"
                                                            label="All Categories"
                                                            labelClassName={filterCheckboxLabelClassName}
                                                            defaultChecked={categoriesState.length === 0}
                                                            onChange={(checked) =>
                                                                handleChangeCategories(checked, 0)
                                                            }
                                                        />
                                                        <div
                                                            className="w-full border-b  border-neutral-200 dark:border-neutral-700" />
                                                        <div className={twMerge(
                                                            "grid grid-cols-1 gap-2",
                                                            facetedCategories.length > 4 && 'grid-cols-1'
                                                        )}>
                                                            {facetedCategories.length > 0 ?
                                                                <>
                                                                    {facetedCategories.map((item) => (
                                                                        <div key={item.databaseId} className="">
                                                                            <Checkbox
                                                                                name={item.slug || ""}
                                                                                label={`${item.name} (${categoriesFacetView.find(f => item.databaseId === Number(f.value))?.count ?? 0})`}
                                                                                labelClassName={filterCheckboxLabelClassName}
                                                                                defaultChecked={categoriesState.includes(
                                                                                    item.databaseId
                                                                                )}
                                                                                onChange={(checked) =>
                                                                                    handleChangeCategories(
                                                                                        checked,
                                                                                        item.databaseId
                                                                                    )
                                                                                }
                                                                            />
                                                                        </div>
                                                                    ))}
                                                                </>
                                                                :
                                                                <div className='text-sm'>No Categories found for this search.</div>
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {!brand && (
                                            <div className="py-4">
                                                <h3 className={filterPanelTitleClassName}>Brands</h3>
                                                <div className="mt-1 relative ">
                                                    <div className="relative flex flex-col  py-6 space-y-5">
                                                        <Checkbox
                                                            name="All Brands"
                                                            label="All Brands"
                                                            labelClassName={filterCheckboxLabelClassName}
                                                            defaultChecked={brandsState.length === 0}
                                                            onChange={(checked) =>
                                                                handleChangeBrands(checked, 0)
                                                            }
                                                        />

                                                        <div
                                                            className="w-full border-b  border-neutral-200 dark:border-neutral-700" />
                                                        <div className={twMerge(
                                                            "grid grid-cols-1 gap-2",
                                                            facetedBrands.length > 4 && 'grid-cols-2'
                                                        )}>
                                                            {facetedBrands.length > 0 ?
                                                                <>

                                                                    {facetedBrands.map((item) => (
                                                                        <div key={item.databaseId} className="">
                                                                            <Checkbox
                                                                                name={item.slug || ""}
                                                                                label={`${item.name} (${brandsFacetView.find(f => item.databaseId === Number(f.value))?.count ?? 0})`}
                                                                                labelClassName={filterCheckboxLabelClassName}
                                                                                defaultChecked={brandsState.includes(
                                                                                    item.databaseId
                                                                                )}
                                                                                onChange={(checked) =>
                                                                                    handleChangeBrands(
                                                                                        checked,
                                                                                        item.databaseId
                                                                                    )
                                                                                }
                                                                            />
                                                                        </div>
                                                                    ))}
                                                                </> :
                                                                <div className='text-sm'>No Brands found for this search.</div>
                                                            }

                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {subCategories.length > 0 ? (
                                            <div className="py-4 w-full">
                                                <SubCategoryFilter subCategories={subCategories} />
                                            </div>
                                        ) : null}
                                    </div>
                                </div>

                                <div
                                    className="px-6 py-3 flex-shrink-0 bg-neutral-50
                                        dark:bg-neutral-900 dark:border-t dark:border-neutral-800 flex
                                         fixed bottom-0 z-[1000] w-full
                                         items-center justify-between border-t">
                                    <ButtonThird
                                        onClick={handleClearFilters}
                                        sizeClass="py-2.5 px-5"
                                    >
                                        Reset
                                    </ButtonThird>
                                    <ButtonPrimary
                                        onClick={closeModalMoreFilter}
                                        sizeClass="py-2.5 px-5"
                                    >
                                        Apply
                                    </ButtonPrimary>
                                </div>
                            </div>
                        </Transition.Child>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
};

export default MobileFilterSheet