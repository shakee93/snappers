import React, { FC } from "react";
import Link from "next/link";

export default function Warranty() {
  return (
    <div className={`overflow-hidden relative`} data-nc-id="PageAbout">
      <title>Warranty Terms </title>

      <div className="container py-10 lg:py-10 space-y-16 lg:space-y-28">
        <div className="py-8">
          <h2 className="text-3xl !leading-tight font-semibold text-neutral-900 md:text-4xl xl:text-5xl dark:text-neutral-100 pb-10">
            Warranty
          </h2>

          {/* Return Policy */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-3">Return & Exchange Policy</h3>
            <p className="mb-4 leading-8">
              Goods once sold cannot be returned or exchanged under any circumstances.
            </p>
          </div>

          {/* Warranty Terms */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-3">Warranty Terms</h3>
            <ul className="list-disc pl-5 mb-4 leading-8 ml-4 space-y-2">
              <li>
                <span className="font-semibold">Repairs only</span> — No replacements will be provided.
              </li>
              <li>
                The product must be presented with the <span className="font-semibold">original box, cables, and all accessories</span> to claim warranty.
              </li>
              <li>
                AppleCare or manufacturer warranty claims may take a <span className="font-semibold">minimum of 45 days</span> to process.
              </li>
              <li>
                Warranty processing time depends on the <span className="font-semibold">availability of spare parts and shipping schedules</span>.
              </li>
            </ul>
          </div>

          {/* Warranty Exclusions */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-3">Warranty Does Not Cover</h3>
            <p className="mb-4 leading-8">
              The following conditions and damages are <span className="font-semibold">not covered</span> under warranty:
            </p>
            <ul className="list-disc pl-5 mb-4 leading-8 ml-4 space-y-2">
              <li>Liquid or water damage</li>
              <li>Display or display line issues</li>
              <li>Touch panel faults</li>
              <li>Charging port damage</li>
              <li>Burn marks</li>
              <li>Drops or physical damage</li>
              <li>Power fluctuations</li>
              <li>No-power issues</li>
              <li>Improper usage or misuse</li>
              <li>Products used outside normal domestic conditions</li>
            </ul>
          </div>

          {/* Display Warranty Note */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-3">Display Warranty</h3>
            <p className="mb-4 leading-8">
              Display warranty covers <span className="font-semibold">7 days</span> to check the device for any manufacturing defects.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
