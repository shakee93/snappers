import {Dialog, Transition} from "@headlessui/react";
import React, {Fragment, useEffect, useMemo, useState} from "react";
import ButtonClose from "@/shared/ButtonClose/ButtonClose";
import Checkbox from "@/shared/Checkbox/Checkbox";
import {twMerge} from "tailwind-merge";
import Slider from "rc-slider";
import Radio from "@/shared/Radio/Radio";
import {XIcon} from "lucide-react";
import ButtonThird from "@/shared/Button/ButtonThird";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import {useStore} from "@/store/store";
import {Brand, ProductCategory} from "@/graphql/types/graphql";
import {useRefinementList} from "react-instantsearch";

interface TabFilterProps {
    categories?: ProductCategory[];
    category?: ProductCategory;
    brands?: Brand[];
    brand?: Brand;
    sort?:Boolean;
}

const DATA_sortOrderRadios = [
    {name: "Name", id: "name:asc"},
    {name: "Most Popular", id: "totalSales(missing_values: last):desc"},
    {name: "Best Rating", id: "reviewCount(missing_values: last):desc"},
    {name: "Newest", id: "databaseId:desc"},
    {
        name: "Price Low - High",
        id: "rawPriceNumber(missing_values: last):asc",
    },
    {
        name: "Price High - Low",
        id: "rawPriceNumber(missing_values: last):desc",
    },
];

const PRICE_RANGE = [500, 500000];

const MobileFilterSheet = ({
                               categories = [],
                               brands = [],
                               brand,
                               category,
                               sort,
                           }: TabFilterProps) => {


    const [isOpenMoreFilter, setisOpenMoreFilter] = useState(false);
    const [isOnSale, setIsIsOnSale] = useState(false);
    const [rangePrices, setRangePrices] = useState([500, 500000]);
    const [colorsState, setColorsState] = useState<string[]>([]);
    const [sizesState, setSizesState] = useState<string[]>([]);
    const [sortOrderStates, setSortOrderStates] = useState<string>(
        sort ? "databaseId:desc" : ""
    );
    const [brandsState, setBrandsState] = useState<number[]>([]);
    const [categoriesState, setCategoriesState] = useState<number[]>([]);
    const [inStock, setInStockState] = useState(true);

    const {
        sidebar,
        syncCategories,
        syncBrands,
        setMounted,
        synPriceRange,
        syncOnSale,
        setInStock,
        setSort,
    } = useStore();


    const filterCount = useMemo(() => {

        return categoriesState.length +
            brandsState.length +
            colorsState.length +
            sizesState.length +
            (isOnSale ? 1 : 0) +
            (sortOrderStates ? 1 : 0) +
            (rangePrices.join('') !== PRICE_RANGE.join('') ? 1 : 0);

    }, [
        categoriesState,
        brandsState,
        colorsState,
        sizesState,
        isOnSale,
        inStock,
        sortOrderStates,
        rangePrices,
    ])

    const {items: categoriesFacet} = useRefinementList({
        attribute: 'categories_facet',
    });

    const {items: brandsFacet} = useRefinementList({
        attribute: 'brands_facet',
    });

    const facetedBrands = useMemo(() => {
        return brands.filter(b =>
            brandsFacet.map(f =>  Number(f.value)).includes(b.databaseId)
        )
    }, [brands, brandsFacet])

    const facetedCategories = useMemo(() => {
        return categories.filter(b =>
            categoriesFacet.map(f =>  Number(f.value)).includes(b.databaseId)
        )
    }, [categoriesFacet, categories])

    useEffect(() => {

        if (rangePrices.join('') === PRICE_RANGE.join('')) {
            return;
        }

        synPriceRange(rangePrices);
    }, [rangePrices]);

    useEffect(() => {
        syncOnSale(isOnSale);
    }, [isOnSale]);

    useEffect(() => {
        setInStock(inStock);
    }, [inStock]);

    useEffect(() => {
        setSort(sortOrderStates);
    }, [sortOrderStates]);

    const closeModalMoreFilter = () => setisOpenMoreFilter(false);
    const openModalMoreFilter = () => setisOpenMoreFilter(true);

    //Handling Clear Filters

    const handleClearFilters = () => {
        setRangePrices(PRICE_RANGE);
        setColorsState([]);
        setSortOrderStates("");
        setBrandsState([]);
        syncBrands([]);
        setCategoriesState([]);
        syncCategories([]);
        setIsIsOnSale(false);
        setInStockState(false);
        setSortOrderStates("");
        setSort("");
        closeModalMoreFilter();
    };

    const handleChangeCategories = (checked: boolean, name: number) => {
        if (name === 0 && checked) {
            setCategoriesState([]);
            syncCategories([]);
            return;
        }

        checked
            ? setCategoriesState([...categoriesState, name])
            : setCategoriesState(categoriesState.filter((i) => i !== name));

    };

    const handleChangeBrands = (checked: boolean, name: number) => {
        if (name === 0 && checked) {
            setBrandsState([]);
            syncBrands([]);
            return;
        }

        checked
            ? setBrandsState([...brandsState, name])
            : setBrandsState(brandsState.filter((i) => i !== name));
    };


    // OK
    const renderXClear = () => {
        const handleXClearClick = () => {
            handleClearFilters();
        };
        return (
            <span
                className="flex-shrink-0 w-4 h-4 rounded-full bg-primary-500 text-white flex items-center justify-center ml-3 cursor-pointer">
        <XIcon className="p-0.5" onClick={handleXClearClick}/>
      </span>
        );
    };



    return (
        <div className="w-full">
            <div
                className={`flex bg-white w-full flex-shrink-0 items-center justify-center px-4 py-2 text-sm rounded-full border focus:outline-none cursor-pointer select-none
          ${
                    filterCount
                        ? "border border-primary-500 bg-primary-50 text-primary-900 focus:outline-none cursor-pointer select-none"
                        : "border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-neutral-400 dark:hover:border-neutral-500"
                }`}
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

                <span className="ml-2" onClick={openModalMoreFilter}>
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
                            <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-40 dark:bg-opacity-60"/>
                        </Transition.Child>

                        {/* This element is to trick the browser into centering the modal contents. */}
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
                                    <Dialog.Title
                                        as="h3"
                                        className="text-lg font-medium leading-6 text-gray-900"
                                    >
                                        Products filters
                                    </Dialog.Title>
                                    <span className="absolute left-3 top-3">
                      <ButtonClose onClick={closeModalMoreFilter}/>
                    </span>
                                </div>

                                <div className="overflow-y-auto h-[calc(100vh-70px)] pt-12">
                                    <div
                                        className="px-6 sm:px-8 md:px-10 divide-y divide-neutral-200 dark:divide-neutral-800">
                                        {/* --------- */}
                                        {/* ---- */}
                                        {!category && (
                                            <div className="py-7">
                                                <h3 className="text-md font-medium">Categories</h3>
                                                <div className="relative ">
                                                    <div className="relative flex flex-col  py-6 space-y-5">
                                                        <Checkbox
                                                            name="All Categories"
                                                            label="All Categories"
                                                            defaultChecked={categoriesState.length === 0}
                                                            onChange={(checked) =>
                                                                handleChangeCategories(checked, 0)
                                                            }
                                                        />
                                                        <div
                                                            className="w-full border-b  border-neutral-200 dark:border-neutral-700"/>
                                                        <div className={twMerge(
                                                            "grid grid-cols-1 gap-2",
                                                            facetedCategories.length > 4 && 'grid-cols-2'
                                                        )}>
                                                            {facetedCategories.length > 0 ?
                                                                <>
                                                                    {facetedCategories.map((item) => (
                                                                        <div key={item.databaseId} className="">
                                                                            <Checkbox
                                                                                name={item.slug || ""}
                                                                                label={`${item.name} (${categoriesFacet.find(f => item.databaseId === Number(f.value))?.count})`}
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
                                            <div className="py-7">
                                                <h3 className="text-md font-medium">Brands</h3>
                                                <div className="mt-1 relative ">
                                                    {/*{renderMoreFilterItem(categories)}*/}
                                                    <div className="relative flex flex-col  py-6 space-y-5">
                                                        <Checkbox
                                                            name="All Brands"
                                                            label="All Brands"
                                                            defaultChecked={brandsState.length === 0}
                                                            onChange={(checked) =>
                                                                handleChangeBrands(checked, 0)
                                                            }
                                                        />

                                                        <div
                                                            className="w-full border-b  border-neutral-200 dark:border-neutral-700"/>
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
                                                                                // label={`${item.name} (${item.count})`}
                                                                                label={`${item.name} (${brandsFacet.find(f => item.databaseId === Number(f.value))?.count})`}
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
                                        {/* --------- */}
                                        {/* ---- */}
                                        <div className="py-7">
                                            <div className="relative flex flex-col px-5  space-y-8">
                                                <div className="space-y-5">
                                                    <span className="text-md font-medium">Price range</span>
                                                    <br/>
                                                    <span className="pt-1">
                              LKR {rangePrices[0].toLocaleString()} - LKR{" "}
                                                        {rangePrices[1].toLocaleString()}
                            </span>
                                                    <Slider
                                                        range
                                                        min={PRICE_RANGE[0]}
                                                        max={PRICE_RANGE[1]}
                                                        step={1}
                                                        handleStyle={{
                                                            height: 30,
                                                            width: 30,
                                                            marginTop: -13,
                                                        }}
                                                        defaultValue={[rangePrices[0], rangePrices[1]]}
                                                        allowCross={false}
                                                        onChange={(_input: number | number[]) =>
                                                            setRangePrices(_input as number[])
                                                        }
                                                    />
                                                </div>

                                                <div className="flex justify-between space-x-5">
                                                    <div>
                                                        <label
                                                            htmlFor="minPrice"
                                                            className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
                                                        >
                                                            Min price
                                                        </label>
                                                        <div className="mt-1 relative rounded-md">
                                <span
                                    className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-neutral-500 sm:text-sm">
                                  LKR
                                </span>
                                                            <input
                                                                type="number"
                                                                max={PRICE_RANGE[1]}
                                                                min={PRICE_RANGE[0]}
                                                                name="minPrice"
                                                                id="minPrice"
                                                                className="block w-32 pr-10 pl-4 sm:text-sm border-neutral-200 dark:border-neutral-700 rounded-full bg-transparent"
                                                                value={rangePrices[0]}
                                                                onChange={(e) =>
                                                                    setRangePrices([
                                                                        e.target.value as unknown as number,
                                                                        rangePrices[1],
                                                                    ])
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label
                                                            htmlFor="maxPrice"
                                                            className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
                                                        >
                                                            Max price
                                                        </label>
                                                        <div className="mt-1 relative rounded-md">
                                <span
                                    className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-neutral-500 sm:text-sm">
                                  LKR
                                </span>
                                                            <input
                                                                type="number"
                                                                max={PRICE_RANGE[1]}
                                                                min={PRICE_RANGE[0]}
                                                                name="maxPrice"
                                                                id="maxPrice"
                                                                className="block w-32 pr-10 pl-4 sm:text-sm border-neutral-200 dark:border-neutral-700 rounded-full bg-transparent"
                                                                value={rangePrices[1]}
                                                                onChange={(e) =>
                                                                    setRangePrices([
                                                                        rangePrices[0],
                                                                        e.target.value as unknown as number,
                                                                    ])
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* --------- */}
                                        {/* ---- */}
                                        <div className="py-7">
                                            <h3 className="text-md font-medium">Sort Order</h3>
                                            <div className="mt-6 relative ">
                                                <div className="relative flex flex-col space-y-3">
                                                    {DATA_sortOrderRadios.map((item) => (
                                                        <Radio
                                                            id={item.id}
                                                            key={item.id}
                                                            name="radioNameSort"
                                                            label={item.name}
                                                            defaultChecked={sortOrderStates === item.id}
                                                            onChange={(v) => {
                                                                setSortOrderStates(v);
                                                            }}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>


                                        <div className='flex gap-4 pb-24 w-full justify-between'>
                                            <div className="py-7 w-1/2">
                                                <h3 className="text-md font-medium">On sale!</h3>
                                                <div className="mt-3 relative ">
                                                    <div
                                                        className={`flex h-[42px] items-center justify-center px-4 py-2 text-sm rounded-full border focus:outline-none cursor-pointer select-none ${
                                                            isOnSale
                                                                ? "border-primary-500 bg-primary-50 text-primary-900"
                                                                : "border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-neutral-400 dark:hover:border-neutral-500"
                                                        }`}
                                                        onClick={() => setIsIsOnSale(!isOnSale)}
                                                    >
                                                        <svg
                                                            className="w-4 h-4"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                        >
                                                            <path
                                                                d="M3.9889 14.6604L2.46891 13.1404C1.84891 12.5204 1.84891 11.5004 2.46891 10.8804L3.9889 9.36039C4.2489 9.10039 4.4589 8.59038 4.4589 8.23038V6.08036C4.4589 5.20036 5.1789 4.48038 6.0589 4.48038H8.2089C8.5689 4.48038 9.0789 4.27041 9.3389 4.01041L10.8589 2.49039C11.4789 1.87039 12.4989 1.87039 13.1189 2.49039L14.6389 4.01041C14.8989 4.27041 15.4089 4.48038 15.7689 4.48038H17.9189C18.7989 4.48038 19.5189 5.20036 19.5189 6.08036V8.23038C19.5189 8.59038 19.7289 9.10039 19.9889 9.36039L21.5089 10.8804C22.1289 11.5004 22.1289 12.5204 21.5089 13.1404L19.9889 14.6604C19.7289 14.9204 19.5189 15.4304 19.5189 15.7904V17.9403C19.5189 18.8203 18.7989 19.5404 17.9189 19.5404H15.7689C15.4089 19.5404 14.8989 19.7504 14.6389 20.0104L13.1189 21.5304C12.4989 22.1504 11.4789 22.1504 10.8589 21.5304L9.3389 20.0104C9.0789 19.7504 8.5689 19.5404 8.2089 19.5404H6.0589C5.1789 19.5404 4.4589 18.8203 4.4589 17.9403V15.7904C4.4589 15.4204 4.2489 14.9104 3.9889 14.6604Z"
                                                                stroke="currentColor"
                                                                strokeWidth="1.5"
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                            />
                                                            <path
                                                                d="M9 15L15 9"
                                                                stroke="currentColor"
                                                                strokeWidth="1.5"
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                            />
                                                            <path
                                                                d="M14.4945 14.5H14.5035"
                                                                stroke="currentColor"
                                                                strokeWidth="2"
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                            />
                                                            <path
                                                                d="M9.49451 9.5H9.50349"
                                                                stroke="currentColor"
                                                                strokeWidth="2"
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                            />
                                                        </svg>
                                                        {" "}
                                                        <span className="line-clamp-1 ml-2">On sale</span>
                                                        {isOnSale && (
                                                            <div
                                                                className="flex-shrink-0 w-4 h-4 rounded-full bg-primary-500 text-white flex items-center justify-center ml-3 cursor-pointer">
                                                                <XIcon className="p-0.5"/>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/*<div className="py-7 w-1/2">*/}
                                            {/*    <h3 className="text-md font-medium">In Stock!</h3>*/}
                                            {/*    <div className="mt-3 relative ">*/}
                                            {/*        <div*/}
                                            {/*            className={`flex items-center justify-center px-4 py-2 text-sm rounded-full border focus:outline-none cursor-pointer select-none ${*/}
                                            {/*                inStock*/}
                                            {/*                    ? "border-primary-500 bg-primary-50 text-primary-900"*/}
                                            {/*                    : "border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-neutral-400 dark:hover:border-neutral-500"*/}
                                            {/*            }`}*/}
                                            {/*            onClick={() => setInStockState(!inStock)}*/}
                                            {/*        >*/}
                                            {/*            <Package className="stroke-1 w-4"/>*/}
                                            {/*            <span className="line-clamp-1 ml-2">In Stock</span>*/}
                                            {/*            {inStock && (*/}
                                            {/*                <div*/}
                                            {/*                    className="flex-shrink-0 w-4 h-4 rounded-full bg-primary-500 text-white flex items-center justify-center ml-3 cursor-pointer">*/}
                                            {/*                    <XIcon className="p-0.5"/>*/}
                                            {/*                </div>*/}
                                            {/*            )}*/}
                                            {/*        </div>*/}
                                            {/*    </div>*/}
                                            {/*</div>*/}
                                        </div>
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
                                        Clear
                                    </ButtonThird>
                                    <ButtonPrimary
                                        onClick={() => {
                                            syncBrands(brandsState);
                                            syncCategories(categoriesState);
                                            closeModalMoreFilter();
                                        }}
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