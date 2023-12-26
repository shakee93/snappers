import MegaMenu from "./CategoriesMenu";

import Link from "next/link";
import { ChevronUp, ChevronDown } from "lucide-react";
import {useQuery} from "@apollo/client";
import {GET_BRANDS} from "@/graphql/defs/products";
import {getClient} from "@/graphql/apollo-ssr";
import {Brand} from "@/graphql/types/graphql";

const getData = async () => {
  const { data } = await getClient().query({
    query: GET_BRANDS,
  })

  return data.brands.nodes
}

const BrandBar = async () => {

  const brands = await getData()

  return (
    <div className="flex border-t z-50 max-w-[calc(100vw-160px)] overflow-x-hidden">
      <div className="w-full flex justify-between overflow-hidden items-center">
        <div  className='text-primaryColor font-semibold flex h-full'>
          <button
            className="hidden uppercase ml-[15px] mr-2  md:flex  w-40 pl-3 justify-center py-2 text-xs xl:text-sm items-center rounded-lg"
          >
            All Categories <ChevronDown className="h-5 ml-1" />
          </button>
        </div>

        <div className="w-full flex justify-between">
          {brands?.map((brand: Brand, index: number) => (
            <Link
              key={index}
              href={`/${brand.slug}`}
              className="flex-1 px-4 whitespace-nowrap py-4 uppercase text-center font-medium text-gray-700 tracking-wide text-sm border-l"
            >
              {brand.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BrandBar;
