import { MousePointerClick } from "lucide-react";
import Link from "next/link";
import ProductAddToCart from "./ProductAddToCart";

const ProductDetails = () => {
  return (
    <>
      <div className="bg-orange-500 flex w-28 p-1 rounded-3xl text-white items-center justify-center gap-1 text-xs">
        Best Seller <MousePointerClick className="text-white" size={14} />
      </div>
      <div className="flex gap-1  text-sm text-gray-500">
        Brand : <span className="">Apple</span>
      </div>

      <div className="text-lg font-medium ">
        iPhone 15 Pro 128GB Black Titanium 5G With FaceTime
      </div>

      <div className="py-2">
        <ul className="flex gap-2 text-sm items-center">
          Color :
          <li className="bg-gray-300 inline-block py-1 px-3  text-sm rounded-3xl">
            <Link href="/"> Black </Link>
          </li>
          <li className="bg-gray-100 inline-block py-1 px-3  text-sm rounded-3xl">
            <Link href="/"> Blue </Link>
          </li>
          <li className="bg-gray-100 inline-block py-1 px-3  text-sm rounded-3xl">
            <Link href="/"> Red </Link>
          </li>
          <li className="bg-gray-100 inline-block py-1 px-3  text-sm rounded-3xl">
            <Link href="/"> Green </Link>
          </li>
        </ul>
      </div>
      <div className="py-2">
        <ul className="flex gap-2 text-sm items-center">
          Storage :
          <li className="bg-gray-100 inline-block py-1 px-3  text-sm rounded-3xl">
            <Link href="/"> 64GB </Link>
          </li>
          <li className="bg-gray-100 inline-block py-1 px-3  text-sm rounded-3xl">
            <Link href="/"> 128Gb </Link>
          </li>
          <li className="bg-gray-300 inline-block py-1 px-3  text-sm rounded-3xl">
            <Link href="/"> 256GB </Link>
          </li>
        </ul>
      </div>
      <div className="text-lg font-medium text-gray-600">
        Rs. 379,900.00{" "}
        <span className="text-red-400 ml-2">
          <s>Rs. 389,900.00</s>
        </span>
      </div>
      <ProductAddToCart />
      <div className="flex gap-1 items-center text-base text-gray-500">
        Category :{" "}
        <span className="bg-primary-100 inline-block py-1 px-2  text-sm rounded-3xl">
          Smart Phones
        </span>
      </div>
    </>
  );
};

export default ProductDetails;
