import React, { FC } from "react";
import Link from "next/link";

async function measureRequestDuration() {
  try {
    const start = performance.now(); // Start timing

    const response = await fetch("https://httpbin.org/delay/3", {
      cache: "force-cache",
    }); // Send the fetch request

    // Check if the fetch request was successful
    if (!response.ok) {
      throw new Error(`HTTP error!     status: ${response.status}`);
    }

    const end = performance.now(); // End timing

    const duration = end - start; // Calculate the duration

    // console.log(`Request to took ${duration.toFixed(0)}ms`); // Log duration to console

    return await response.json();
  } catch (error: any) {
    console.error("Fetch error:", error.message); // Log any errors that occur
  }
}
export default async function Warranty() {
  let data = await measureRequestDuration();

  return (
    <div className={`overflow-hidden relative`} data-nc-id="PageAbout">
      {/* {JSON.stringify(data)} */}
      <title>Warranty Terms </title>

      <div className="container py-10 lg:py-10 space-y-16 lg:space-y-28">
        <div className="py-8">
          <h2 className="text-3xl !leading-tight font-semibold text-neutral-900 md:text-4xl xl:text-5xl dark:text-neutral-100 pb-10">
            Warranty
          </h2>

          {/* Welcome section */}
          <div className="mb-6">
            <p className="mb-4 leading-8">
              Once purchased, goods cannot be returned or exchanged under any
              circumstances.
            </p>
          </div>

          {/* Consent section */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">
              Warranty Doesnt cover
            </h3>
            <p className="mb-4 leading-8">
              Liquid or water damage, display, display lines, touch panel,
              charging port burnt, drop damage, power fluctuations, no power,
              improper operations. products for domestic usage only. For DISPLAY
              WARRANTY covers 7 DAYS( to check the device for any manufacturing
              defects)
            </p>
          </div>

          {/* Information we collect section */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">
            Warranty terms
            </h3>
            <p className="mb-4 leading-8 font-bold">
            Repair and no Replacement
            </p>


            <div className="mb-6">
              
              <ul className="list-disc pl-5 mb-4 leading-8 ml-4">
                <li>For claim product should be submitted with box, cable and etc.</li>
                <li>Apple care warranty claim minimum 45 days</li>
              </ul>
            </div>
            <div className="mb-6">
              <p className="mb-4 leading-8">
              Warranty claim time duration is subjected to spares availability and shipping
              </p>
            </div>

            

            
          </div>
        </div>
      </div>
    </div>
  );
}
