import { MousePointerClick } from "lucide-react";
import Link from "next/link";

const ProductSpecifications = () => {
  return (
    <>
      <div className="text-sm md:text-base py-2 mb-2">Specifications</div>
      <div className="shadow-md sm:rounded-lg">
        <table className="w-full text-xs md:text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <tbody>
            <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
              <td className="px-3 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                Charging Type
              </td>
              <td className="px-3 py-2">Type-C</td>
            </tr>
            <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
              <td className="px-3 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                SIM Type
              </td>
              <td className="px-3 py-2">Nano + ESIM</td>
            </tr>
            <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
              <td className="px-3 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                SIM Count
              </td>
              <td className="px-3 py-2">Dual SIM</td>
            </tr>
            <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
              <td className="px-3 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                Operating System
              </td>
              <td className="px-3 py-2">IOS</td>
            </tr>
            <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
              <td className="px-3 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                RAM Size
              </td>
              <td className="px-3 py-2">8 GB</td>
            </tr>
            <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
              <td className="px-3 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                Battery Size
              </td>
              <td className="px-3 py-2">3650 MAh</td>
            </tr>
            <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
              <td className="px-3 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                Internal Memory
              </td>
              <td className="px-3 py-2"> 128 GB</td>
            </tr>
            <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
              <td className="px-3 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                Display Type
              </td>
              <td className="px-3 py-2">Dynamic AMOLED</td>
            </tr>
            <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
              <td className="px-3 py-2font-medium text-gray-900 whitespace-nowrap dark:text-white">
                Version
              </td>
              <td className="px-3 py-2">Middle East Version</td>
            </tr>
            <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
              <td className="px-3 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                Screen Size
              </td>
              <td className="px-3 py-2">6.1 In</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
};

export default ProductSpecifications;
