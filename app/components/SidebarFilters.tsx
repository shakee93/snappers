"use client"
import React, {useEffect, useState} from "react";

import Checkbox from "@/app/components/globalComponents/Checkbox/Checkbox";
import Slider from "rc-slider";
import Radio from "shared/Radio/Radio";
import MySwitch from "components/MySwitch";
import {useStore} from "@/store/store";

const DATA_colors = [
  { name: "White" },
  { name: "Beige" },
  { name: "Blue" },
  { name: "Black" },
  { name: "Brown" },
  { name: "Green" },
  { name: "Navy" },
];

const DATA_sizes = [
  { name: "XS" },
  { name: "S" },
  { name: "M" },
  { name: "L" },
  { name: "XL" },
  { name: "2XL" },
];

const DATA_sortOrderRadios = [
  { name: "Most Popular", id: "Most-Popular" },
  { name: "Best Rating", id: "Best-Rating" },
  { name: "Newest", id: "Newest" },
  { name: "Price Low - Hight", id: "Price-low-hight" },
  { name: "Price Hight - Low", id: "Price-hight-low" },
];

const PRICE_RANGE = [1, 500];
//
const SidebarFilters = ({
    categories = [],
    brands = []
                        }: any) => {
  //
  const [isOnSale, setIsIsOnSale] = useState(true);
  const [rangePrices, setRangePrices] = useState([100, 500]);
  const [categoriesState, setCategoriesState] = useState<string[]>([]);
  const [brandsState, setBrandsState] = useState<string[]>([]);
  const [colorsState, setColorsState] = useState<string[]>([]);
  const [sizesState, setSizesState] = useState<string[]>([]);
  const [sortOrderStates, setSortOrderStates] = useState<string>("");

  const { sidebar, syncCategories, syncBrands, setMounted } = useStore()
  
  
  
  
  //
  const handleChangeCategories = (checked: boolean, name: string) => {
    checked
      ? setCategoriesState([...categoriesState, name])
      : setCategoriesState(categoriesState.filter((i) => i !== name));
  };

  const handleChangeBrands = (checked: boolean, name: string) => {
    console.log(checked, name);

    checked
        ? setBrandsState([...brandsState, name])
        : setBrandsState(brandsState.filter((i) => i !== name));
  };

  const handleChangeColors = (checked: boolean, name: string) => {
    checked
      ? setColorsState([...colorsState, name])
      : setColorsState(colorsState.filter((i) => i !== name));
  };

  const handleChangeSizes = (checked: boolean, name: string) => {
    checked
      ? setSizesState([...sizesState, name])
      : setSizesState(sizesState.filter((i) => i !== name));
  };


  useEffect(() => {
    syncCategories(categoriesState)
  }, [categoriesState])

  useEffect(() => {
    syncBrands(brandsState)
  }, [brandsState])

  useEffect(() => {
    setMounted()
  }, [])
  
  const renderTabsPriceRage = () => {
    return (
      <div className="relative flex flex-col py-8 space-y-5 pr-3">
        <div className="space-y-5">
          <span className="font-semibold">Price range</span>
          <Slider
            range
            min={PRICE_RANGE[0]}
            max={PRICE_RANGE[1]}
            step={1}
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
              <span className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-neutral-500 sm:text-sm">
                $
              </span>
              <input
                type="text"
                name="minPrice"
                disabled
                id="minPrice"
                className="block w-32 pr-10 pl-4 sm:text-sm border-neutral-200 dark:border-neutral-700 rounded-full bg-transparent"
                value={rangePrices[0]}
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
              <span className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-neutral-500 sm:text-sm">
                $
              </span>
              <input
                type="text"
                disabled
                name="maxPrice"
                id="maxPrice"
                className="block w-32 pr-10 pl-4 sm:text-sm border-neutral-200 dark:border-neutral-700 rounded-full bg-transparent"
                value={rangePrices[1]}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="divide-y divide-slate-200 dark:divide-slate-700">
      <div className="relative flex flex-col pb-8 space-y-4">
        <h3 className="font-semibold mb-2.5">Collections</h3>
        {categories.filter((c: any) => c.count).map((item: any) => (
            <div key={item.databaseId} className="">
              <Checkbox
                  name={item.databaseId}
                  label={`${item.name} (${item.count})`}
                  defaultChecked={categoriesState.includes(item.databaseId)}
                  sizeClassName="w-5 h-5"
                  labelClassName="text-sm font-normal"
                  onChange={(checked) => handleChangeCategories(checked, item.databaseId)}
              />
            </div>
        ))}
      </div>
      {brands.length > 0 &&
          <div className="relative flex flex-col pb-8 space-y-4">
            <h3 className="font-semibold mb-2.5">Brands</h3>
            {brands.map((item: any) => (
                <div key={item.databaseId} className="">
                  <Checkbox
                      name={item.databaseId}
                      label={`${item.name} (${item.count})`}
                      defaultChecked={brandsState.includes(item.databaseId)}
                      sizeClassName="w-5 h-5"
                      labelClassName="text-sm font-normal"
                      onChange={(checked) => handleChangeBrands(checked, item.databaseId)}
                  />
                </div>
            ))}
          </div>
      }

      {renderTabsPriceRage()}
      <div className="py-8 pr-2">
        <MySwitch
          label="On sale!"
          desc="Products currently on sale"
          enabled={isOnSale}
          onChange={setIsIsOnSale}
        />
      </div>
      <div className="relative flex flex-col py-8 space-y-4">
        <h3 className="font-semibold mb-2.5">Sort order</h3>
        {DATA_sortOrderRadios.map((item) => (
            <Radio
                id={item.id}
                key={item.id}
                name="radioNameSort"
                label={item.name}
                defaultChecked={sortOrderStates === item.id}
                sizeClassName="w-5 h-5"
                onChange={setSortOrderStates}
                className="!text-sm"
            />
        ))}
      </div>
    </div>
  );
};

export default SidebarFilters;
