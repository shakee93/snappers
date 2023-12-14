"use client";
import { MousePointerClick } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import productImage from "@/public/iphone.webp";
import Zoom from "react-img-zoom-gdn";
import Features from "../components/SingleProductPage/FeatureCard";

export default function singleProduct() {

 
  
  return (
    <main className="container  m-auto">
      <div className="flex p-10 bg-white">
        <div className="w-2/5">
          {/* <Image
            src={productImage}
            alt=""
            className=""
          /> */}
          <Zoom img={productImage.src} zoomScale={2} width={450} height={450} />;
        </div>
        <div id="product">

        </div>
        <div className="w-2/5 flex flex-col gap-y-3">
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

          <div className="flex space-x-3.5 py-4">
            <div className="flex items-center justify-center bg-slate-100/70 dark:bg-slate-800/70 px-2 py-1 sm:p-2 rounded-full">
              <div className="nc-NcInputNumber flex items-center justify-between space-x-5 w-full">
                <div className="nc-NcInputNumber__content flex items-center justify-between w-[104px] sm:w-28">
                  <button
                    className="w-8 h-8 rounded-full flex items-center justify-center border border-neutral-400 dark:border-neutral-500 bg-white dark:bg-neutral-900 focus:outline-none hover:border-neutral-700 dark:hover:border-neutral-400 disabled:hover:border-neutral-400 dark:disabled:hover:border-neutral-500 disabled:opacity-50 disabled:cursor-default"
                    type="button"
                    disabled
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                      className="w-4 h-4"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3.75 12a.75.75 0 01.75-.75h15a.75.75 0 010 1.5h-15a.75.75 0 01-.75-.75z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                  </button>
                  <span className="select-none block flex-1 text-center leading-none">
                    1
                  </span>
                  <button
                    className="w-8 h-8 rounded-full flex items-center justify-center border border-neutral-400 dark:border-neutral-500 bg-white dark:bg-neutral-900 focus:outline-none hover:border-neutral-700 dark:hover:border-neutral-400 disabled:hover:border-neutral-400 dark:disabled:hover:border-neutral-500 disabled:opacity-50 disabled:cursor-default"
                    type="button"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                      className="w-4 h-4"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <button className="relative w-56 h-auto inline-flex items-center justify-center rounded-full transition-colors text-sm sm:text-base font-medium py-3 px-4 sm:py-1 sm:px-6 ttnc-ButtonPrimary disabled:bg-opacity-90 bg-primaryColor dark:bg-slate-100 hover:bg-orange-500 text-slate-50 dark:text-slate-800 shadow-xl  flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-6000 dark:focus:ring-offset-0">
              <svg
                className="hidden sm:inline-block w-5 h-5 mb-0.5"
                viewBox="0 0 9 9"
                fill="none"
              >
                <path
                  d="M2.99997 4.125C3.20708 4.125 3.37497 4.29289 3.37497 4.5C3.37497 5.12132 3.87865 5.625 4.49997 5.625C5.12129 5.625 5.62497 5.12132 5.62497 4.5C5.62497 4.29289 5.79286 4.125 5.99997 4.125C6.20708 4.125 6.37497 4.29289 6.37497 4.5C6.37497 5.53553 5.5355 6.375 4.49997 6.375C3.46444 6.375 2.62497 5.53553 2.62497 4.5C2.62497 4.29289 2.79286 4.125 2.99997 4.125Z"
                  fill="currentColor"
                ></path>
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M6.37497 2.625H7.17663C7.76685 2.625 8.25672 3.08113 8.29877 3.66985L8.50924 6.61641C8.58677 7.70179 7.72715 8.625 6.63901 8.625H2.36094C1.2728 8.625 0.413174 7.70179 0.490701 6.61641L0.70117 3.66985C0.743222 3.08113 1.23309 2.625 1.82331 2.625H2.62497L2.62497 2.25C2.62497 1.21447 3.46444 0.375 4.49997 0.375C5.5355 0.375 6.37497 1.21447 6.37497 2.25V2.625ZM3.37497 2.625H5.62497V2.25C5.62497 1.62868 5.12129 1.125 4.49997 1.125C3.87865 1.125 3.37497 1.62868 3.37497 2.25L3.37497 2.625ZM1.82331 3.375C1.62657 3.375 1.46328 3.52704 1.44926 3.72328L1.2388 6.66985C1.19228 7.32107 1.70805 7.875 2.36094 7.875H6.63901C7.29189 7.875 7.80766 7.32107 7.76115 6.66985L7.55068 3.72328C7.53666 3.52704 7.37337 3.375 7.17663 3.375H1.82331Z"
                  fill="currentColor"
                ></path>
              </svg>
              <span className="ml-3">Add to cart</span>
            </button>
          </div>

          <div className="flex gap-1 items-center text-base text-gray-500">
            Category :{" "}
            <span className="bg-primary-100 inline-block py-1 px-2  text-sm rounded-3xl">
              Smart Phones
            </span>
          </div>
        </div>
        <div className="w-1/5">
          <Features/>
        </div>
      </div>
      <div className="bg-white p-10 mt-10">
        <div className="pb-3 border-b-2 border-gray-200">
          <h3 className="text-xl">Overview</h3>
        </div>
        <div className="flex py-5">
          <div className="w-3/5 p-4">
            <div className="text-base py-2">Highlights</div>
            <div>
              <ul className="text-sm flex flex-col gap-1 list-disc pl-4 text-gray-600">
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
            <div className="text-base py-2">Overview</div>
            <div className="text-sm text-gray-600">
              The iPhone 15 Pro features an aerospace‑grade titanium design with
              an all‑new Action button to fast track to your favorite feature.
              The powerful camera system offers multiple focal lengths for
              super‑high‑resolution photos with a new level of detail and color.
            </div>
          </div>
          <div className="w-2/5">
            <div className="text-base py-2 mb-2">Specifications</div>
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
              <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                <tbody>
                  <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                      Charging Type
                    </td>
                    <td className="px-6 py-4">Type-C</td>
                  </tr>
                  <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                      SIM Type
                    </td>
                    <td className="px-6 py-4">Nano + ESIM</td>
                  </tr>
                  <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                      SIM Count
                    </td>
                    <td className="px-6 py-4">Dual SIM</td>
                  </tr>
                  <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                      Operating System
                    </td>
                    <td className="px-6 py-4">IOS</td>
                  </tr>
                  <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                      RAM Size
                    </td>
                    <td className="px-6 py-4">8 GB</td>
                  </tr>
                  <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                      Battery Size
                    </td>
                    <td className="px-6 py-4">3650 MAh</td>
                  </tr>
                  <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                      Internal Memory
                    </td>
                    <td className="px-6 py-4"> 128 GB</td>
                  </tr>
                  <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                      Display Type
                    </td>
                    <td className="px-6 py-4">Dynamic AMOLED</td>
                  </tr>
                  <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                      Version
                    </td>
                    <td className="px-6 py-4">Middle East Version</td>
                  </tr>
                  <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                      Screen Size
                    </td>
                    <td className="px-6 py-4">6.1 In</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
