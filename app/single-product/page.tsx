"use client";
import { MousePointerClick } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import productImage from "@/public/iphone.webp";
import Zoom from "react-img-zoom-gdn";
import { useState } from 'react';
import ImageGallery from "./imageGallery";


export default function singleProduct() {

  const images = [
    {
      original: "https://picsum.photos/id/1018/1000/600/",
      thumbnail: "https://picsum.photos/id/1018/250/150/",
    },
    {
      original: "https://picsum.photos/id/1015/1000/600/",
      thumbnail: "https://picsum.photos/id/1015/250/150/",
    },
    {
      original: "https://picsum.photos/id/1019/1000/600/",
      thumbnail: "https://picsum.photos/id/1019/250/150/",
    },
    {
      original: "https://picsum.photos/id/1018/1000/600/",
      thumbnail: "https://picsum.photos/id/1018/250/150/",
    },
    {
      original: "https://picsum.photos/id/1015/1000/600/",
      thumbnail: "https://picsum.photos/id/1015/250/150/",
    },
  ];


  const [selectedImage, setSelectedImage] = useState(images[0]);
  

  const handleThumbnailClick = (newImageSrc: string) => {
    setSelectedImage({ original: newImageSrc, thumbnail: newImageSrc });
    console.log(selectedImage.original)
  };


  return (
    <main className="container  m-auto">
      <div className="flex p-10 bg-white">
        <div className="w-1/6 overflow-y-auto max-h-full">
          <ImageGallery images={images} onThumbnailClick={handleThumbnailClick} selectedImage={selectedImage}/>
        </div>

        <div className="w-2/6 flex items-center justify-center">
          {selectedImage && (
            <Zoom key={selectedImage.original}  img={selectedImage.original} zoomScale={2} width={300} height={300} />
          )}
        </div>
        <div className="w-2/6 flex flex-col gap-y-3">
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

          <div className="flex gap-1 items-center text-base text-gray-500">
            Category :{" "}
            <span className="bg-primary-100 inline-block py-1 px-2  text-sm rounded-3xl">
              Smart Phones
            </span>
          </div>
        </div>
        <div className="w-1/6">Services</div>
      </div>
      <div className="bg-white p-10 mt-10">
        <div className="pb-3 border-b-2 border-gray-200">
          <h3 className="text-xl">Overview</h3>
        </div>
        <div className="flex py-5">
          <div className="w-3/5">
            <div className="text-base py-2">Highlights</div>
            <div>
              <ul className="text-sm flex flex-col gap-1">
                <li>
                  A17 Pro game-changing chip for a groundbreaking performance.
                </li>
                <li>
                  6.1” Super Retina XDR display with ProMotion Technology.
                </li>
                <li>
                  Megapowerful 48MP camera capable for a 3x optical zoom and 15x
                  digital zoom.
                </li>
                <li>Up to 23 hours video playback.</li>
                <li>
                  Facetime is available on the product &amp; would be accessible
                  in regions where facetime is permitted by telecom operators
                </li>
              </ul>
            </div>
          </div>
          <div className="w-2/5"></div>
        </div>
      </div>
    </main>
  );
}
