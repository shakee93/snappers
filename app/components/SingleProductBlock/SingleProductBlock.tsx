import Image from "next/image";
import Link from "next/link";
import ProductImage from "@/public/iphone.webp";
import { Sparkles } from "lucide-react";

const SingleProductBlock = () => {
  return (
    <>
      <div className="bg-white w-full p-2 rounded-2xl my-2">
        <div className="rounded-2xl border-1 ">
          <div className="flex gap-1 relative top-3 left-2 bg-yellow-100 w-max p-1 px-2 rounded-3xl ">
            <Sparkles className="w-5 " />
            <span>New</span>
          </div>
          <Image
            src={ProductImage}
            alt="Product"
            className="object-contain  w-full h-72 -mt-[32px]"
          />
          <div className="relative bottom-7 -mb-6 p-1.5 text-center  text-xs text-red-950 bg-red-300 ">
            Only 3 left in stock
          </div>
        </div>
        <div className="py-2 px-3">
          <div className="text-sm font-medium line-clamp-2 ">
            iPhone 14 Pro 512GB red green white Silver 5G With FaceTime - Middle
            East Version
          </div>
          <div className=" text-base py-2 flex-wrap md:text-lg font-medium text-gray-500">
            Rs.379,900.00{" "}
            <span className="text-red-300 text-sm ml-1">
              <s>389,900.00</s>
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default SingleProductBlock;
