import { MousePointerClick } from "lucide-react";
import Link from "next/link";

const ProductSpecifications = ({ techspecs }) => {

  console.log("tech", techspecs)

  // const techKeyValues =  techspecs.items[0].key_aspects;
  // const techBattery = techspecs.items[0].battery;
  // const techwireless = techspecs.items[0].wireless_&_cellular;
  // const techHardware = techspecs.items[0].hardware
  // const techSim = techspecs.items[0].networking
  // const techDisplay = techspecs.items[0].display
  // const techGeneral = techspecs.items[0].product


  return (
    <>
      <div className="hidden md:block text-sm md:text-base py-2 mb-2">Specifications</div>
      <div className="md:hidden py-3 border-b-2 border-gray-200 mb-4">
        <h3 className="text-lg md:text-xl">Specifications</h3>
      </div>
      <div className="shadow-md sm:rounded-lg">
        <table className="w-full text-xs md:text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <tbody>

            {techspecs !== undefined && <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
              <td className="px-3 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                Charging Type
              </td>
              <td className="px-3 py-2">
                {techspecs?.items?.[0]?.inside?.ports?.usb_type || ""}
              </td>
            </tr>}

            {techspecs && <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
              <td className="px-3 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                SIM Type
              </td>
              <td className="px-3 py-2">
                {/* {techspecs?.items[0]?.inside?.cellular?.sim_slot || ""} */}
              </td>
            </tr>}

            {techspecs && <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
              <td className="px-3 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                SIM Count
              </td>
              <td className="px-3 py-2">
                {/* {techspecs?.items[0]?.inside?.cellular?.sim_type || ""} */}
              </td>
            </tr>}

            {techspecs && <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
              <td className="px-3 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                Operating System
              </td>
              <td className="px-3 py-2">
                {/* {techspecs?.items[0]?.inside?.software?.os || ""} */}
              </td>
            </tr>}

            {techspecs && <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
              <td className="px-3 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                RAM Size
              </td>
              <td className="px-3 py-2">
                {/* {techspecs?.items[0]?.inside?.ram?.capacity || ""} */}
              </td>
            </tr>}

            {techspecs && <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
              <td className="px-3 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                Battery Size
              </td>
              <td className="px-3 py-2">
                {/* {techspecs?.items[0]?.inside?.battery?.capacity || ""} */}
              </td>
            </tr>}

            {techspecs && <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
              <td className="px-3 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                Internal Memory
              </td>
              <td className="px-3 py-2">
                {/* {techspecs?.items[0]?.inside?.storage?.capacity || ""} */}
              </td>
            </tr>}

            {techspecs && <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
              <td className="px-3 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                Refresh Rate
              </td>
              <td className="px-3 py-2">
                {/* {techspecs?.items[0]?.display.refresh_rate || ""} */}
              </td>
            </tr>}

            {techspecs && <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
              <td className="px-3 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                Region
              </td>
              <td className="px-3 py-2">
                {/* {techspecs?.items[0]?.product.region || ""} */}
              </td>
            </tr>}

            {techspecs && <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
              <td className="px-3 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                Screen Size
              </td>
              <td className="px-3 py-2">
                {/* {techspecs?.items[0]?.display.diagonal || ""} */}
              </td>
            </tr>}

          </tbody>
        </table>
      </div>
    </>
  );
};

export default ProductSpecifications;
