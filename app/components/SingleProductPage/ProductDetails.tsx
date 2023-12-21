'use client'
import { MousePointerClick } from "lucide-react";
import Link from "next/link";
import ProductAddToCart from "./ProductAddToCart";
import {Brand, Category, Product, SimpleProduct, VariableProduct} from "@/graphql/types/graphql";
import {useEffect} from "react";

const ProductDetails = ({
    product, brand
                        }: {
    product: SimpleProduct | VariableProduct,
    brand: Brand
}) => {

  return (
    <>
      <div className="bg-orange-500 flex w-28 p-1 rounded-3xl text-white items-center justify-center gap-1 text-xs">
        Best Seller <MousePointerClick className="text-white" size={14} />
      </div>
      <div className="flex gap-1  text-sm text-gray-500">
        Brand : <span className="">{ brand?.name }</span>
      </div>

      <div className="text-base md:text-lg font-medium ">
          {product.name}
      </div>


        {product.type === 'VARIABLE' &&
            <>
                <div className="py-2 text-gray-500">
                    <div className="text-sm py-2">Color:</div>
                    <ul className="flex gap-2 flex-wrap text-sm items-center">
                        <li className="bg-gray-300 inline-block py-1 px-3  text-xs md:text-sm rounded-3xl">
                            <Link href="/"> Black </Link>
                        </li>
                        <li className="bg-gray-100 inline-block py-1 px-3  text-xs md:text-sm rounded-3xl">
                            <Link href="/"> Blue </Link>
                        </li>
                        <li className="bg-gray-100 inline-block py-1 px-3 text-xs md:text-sm rounded-3xl">
                            <Link href="/"> Red </Link>
                        </li>
                        <li className="bg-gray-100 inline-block py-1 px-3  text-xs md:text-sm rounded-3xl">
                            <Link href="/"> Green </Link>
                        </li>
                    </ul>
                </div>
                <div className="py-2 text-gray-500">
                    <div className="text-sm py-2">Storage:</div>
                    <ul className="flex gap-2 flex-wrap text-sm items-center">
                        <li className="bg-gray-100 inline-block py-1 px-3  text-xs md:text-sm rounded-3xl">
                            <Link href="/"> 64GB </Link>
                        </li>
                        <li className="bg-gray-100 inline-block py-1 px-3  text-xs md:text-sm rounded-3xl">
                            <Link href="/"> 128Gb </Link>
                        </li>
                        <li className="bg-gray-300 inline-block py-1 px-3  text-xs md:text-sm rounded-3xl">
                            <Link href="/"> 256GB </Link>
                        </li>
                    </ul>
                </div>
            </>
        }


        {product.stockStatus === 'IN_STOCK' ?

      // <div className="w-max px-4 bg-green-300  text-center rounded-full  text-gray-700 text-xs md:text-sm py-1">
      //   In Stock
      // </div> :
            <div></div> :
            <div className="w-max px-4 bg-red-200  text-center rounded-full  text-gray-500 text-xs md:text-sm py-1">
                Out of Stock
            </div>
        }

      <div className=" text-base py-2 flex-wrap md:text-lg font-medium text-gray-600">
          {product.price}

          {!!product.salePrice &&
              <span className="text-red-400 ml-2">
                  <s>{product.salePrice}</s>
              </span>
          }

      </div>
      <ProductAddToCart product={product} />
      <div className="flex gap-1 items-center text-sm md:text-base text-gray-500">
      <div className="text-sm py-2">Category:</div>
          {product.productCategories?.edges.map((category: any, index: number) =>
                  <Link href={`/collections/${category.node.slug}`} key={index} className="bg-primary-100 inline-block py-1 px-2  text-xs md:text-sm rounded-3xl">
                      {category.node.name}
                  </Link>
          )}

      </div>
    </>
  );
};

export default ProductDetails;
