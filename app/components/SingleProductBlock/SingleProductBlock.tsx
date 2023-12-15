import Image from "next/image";
import Link from "next/link";
import ProductImage from "@/public/iphone.webp"


const SingleProductBlock = () => {
  return (
    <>
    <div className="bg-white w-full p-2 rounded-2xl my-2">
      <div className="rounded-2xl border-1 ">
        <Image src={ProductImage} alt="Product" className="object-contain  w-full h-72"/>
        <div className="relative bottom-7 -mb-6 p-1.5 text-center  text-xs text-red-950 bg-red-300 ">Only 3 left in stock</div>
      </div>
      <div className="py-2">
        
        <div className="px-3 text-sm font-medium line-clamp-2">
          iPhone 14 Pro 512GB red green white Silver 5G With FaceTime - Middle East Version
        </div>
      </div>
    </div>

    </>
  );
};

export default SingleProductBlock;
