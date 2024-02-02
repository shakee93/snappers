import { MousePointerClick } from "lucide-react";
import Link from "next/link";

const ProductSpecifications = ({ techspecs, manualSpecs }: { techspecs?: any; manualSpecs?: any }) => {


  return (
    <>
      {/* <div className="hidden md:block text-sm md:text-base py-2 mb-2">Specifications</div> */}
      <div className="md:hidden py-3 border-b-2 border-gray-200 mb-4">
        <h3 className="text-lg md:text-xl">Specifications</h3>
      </div>
      <div className="shadow-md sm:rounded-lg">
        <table className="w-full text-xs md:text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">


          {manualSpecs && manualSpecs.length > 0 && (
            <tbody>
              {manualSpecs.map(([key, value]: [string, string], index: number) => (
                <tr
                  key={index}
                  className={`${index % 2 === 0
                      ? 'even:bg-gray-50 even:dark:bg-gray-800'
                      : 'odd:bg-white odd:dark:bg-gray-900'
                    } border-b dark:border-gray-700`}
                >
                  <td className="px-3 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    {key}
                  </td>
                  <td className="px-3 py-2">{value}</td>
                </tr>
              ))}
            </tbody>
          )}

          {techspecs && techspecs.items && techspecs.items.length > 0 && (
            <tbody>
              {techspecs && techspecs?.items?.[0]?.inside?.ports?.usb_type && (
                <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
                  <td className="px-3 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    Charging Type
                  </td>
                  <td className="px-3 py-2">
                    {techspecs?.items?.[0]?.inside?.ports?.usb_type || ""}
                  </td>
                </tr>)}

              {techspecs && techspecs?.items[0]?.inside?.cellular?.sim_slot &&
                (<tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
                  <td className="px-3 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    SIM Type
                  </td>
                  <td className="px-3 py-2">
                    {techspecs?.items[0]?.inside?.cellular?.sim_slot || ""}
                  </td>
                </tr>)}

              {techspecs && techspecs?.items[0]?.inside?.cellular?.sim_type && (
                <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
                  <td className="px-3 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    SIM Count
                  </td>
                  <td className="px-3 py-2">
                    {techspecs?.items[0]?.inside?.cellular?.sim_type || ""}
                  </td>
                </tr>)}

              {techspecs && techspecs?.items[0]?.inside?.software && (
                <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
                  <td className="px-3 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    Operating System
                  </td>
                  <td className="px-3 py-2">
                    {techspecs?.items[0]?.inside?.software?.os || techspecs?.items[0]?.inside?.software?.operating_system || ""}
                  </td>
                </tr>)}

              {techspecs && techspecs?.items[0]?.inside?.ram?.capacity &&
                (<tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
                  <td className="px-3 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    RAM Size
                  </td>
                  <td className="px-3 py-2">
                    {techspecs?.items[0]?.inside?.ram?.capacity || ""}
                  </td>
                </tr>)}

              {techspecs && techspecs?.items[0]?.inside?.battery?.capacity &&
                (<tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
                  <td className="px-3 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    Battery Size
                  </td>
                  <td className="px-3 py-2">
                    {techspecs?.items[0]?.inside?.battery?.capacity || ""}
                  </td>
                </tr>)}

              {/* {techspecs && techspecs?.items[0]?.inside?.storage?.capacity &&
                (<tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
                  <td className="px-3 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    Internal Memory
                  </td>
                  <td className="px-3 py-2">
                    {techspecs?.items[0]?.inside?.storage?.capacity || ""}
                  </td>
                </tr>)} */}

              {techspecs && techspecs?.items[0]?.display.refresh_rate &&
                (<tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
                  <td className="px-3 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    Refresh Rate
                  </td>
                  <td className="px-3 py-2">
                    {techspecs?.items[0]?.display.refresh_rate || ""}
                  </td>
                </tr>)}

              {/* {techspecs && techspecs?.items[0]?.product.region &&
                (<tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
                  <td className="px-3 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    Region
                  </td>
                  <td className="px-3 py-2">
                    {techspecs?.items[0]?.product.region || ""}
                  </td>
                </tr>)} */}

              {techspecs && techspecs?.items[0]?.display.diagonal && (
                <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
                  <td className="px-3 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    Screen Size
                  </td>
                  <td className="px-3 py-2">
                    {techspecs?.items[0]?.display.diagonal || ""}
                  </td>
                </tr>)}

              {/* Laptop */}

              {techspecs && techspecs?.items[0]?.inside?.cpu?.number_of_cores && (
                <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
                  <td className="px-3 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    No of Cores
                  </td>
                  <td className="px-3 py-2">
                    {techspecs?.items[0]?.inside?.cpu?.number_of_cores || ""}
                  </td>
                </tr>)}

              {techspecs?.category === 'Laptops' && techspecs?.items[0]?.inside?.ram?.capacity && (
                <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
                  <td className="px-3 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    RAM Capacity
                  </td>
                  <td className="px-3 py-2">
                    {techspecs?.items[0]?.inside?.ram?.capacity || ""}
                  </td>
                </tr>)}

              {techspecs && techspecs?.items[0]?.inside?.gpu?.type && (
                <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
                  <td className="px-3 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    GPU
                  </td>
                  <td className="px-3 py-2">
                    {techspecs?.items[0]?.inside?.gpu?.type || ""}
                  </td>
                </tr>)}

              {techspecs && techspecs?.items[0]?.inside?.ssd?.capacity && (
                <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
                  <td className="px-3 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    SSD
                  </td>
                  <td className="px-3 py-2">
                    {techspecs?.items[0]?.inside?.ssd?.capacity || ""}
                  </td>
                </tr>)}

              {techspecs && techspecs?.items[0]?.inside?.battery?.['capacity_watt-hours'] && (
                <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
                  <td className="px-3 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    Battery
                  </td>
                  <td className="px-3 py-2">
                    {techspecs?.items[0]?.inside?.battery?.['capacity_watt-hours'] || ""}
                  </td>
                </tr>)}

              {techspecs?.category === 'Laptops' && techspecs?.items[0]?.inside?.sensors?.sensors && (
                <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
                  <td className="px-3 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    Sensors
                  </td>
                  <td className="px-3 py-2">
                    {techspecs?.items[0]?.inside?.sensors?.sensors || ""}
                  </td>
                </tr>)}
            </tbody>
          )}

        </table>
      </div>
    </>
  );
};

export default ProductSpecifications;
