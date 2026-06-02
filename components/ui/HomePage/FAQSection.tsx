"use client";

import React from "react";
import { Accordion, AccordionItem } from "@nextui-org/react";
import SiteLogoImage from "@/components/brand/SiteLogoImage";
import BusinessHoursList from "@/components/brand/BusinessHoursList";
import faqs from "@/content/faq.json";

const FAQ = () => {
  return (
    <div className="w-full bg-gradient-to-br p-4 sm:p-8 md:p-12 from-blue-500/40 via-blue-500/10 to-white rounded-2xl md:rounded-3xl border flex flex-col md:flex-row overflow-hidden">
      {/* Left Column */}
      <div className="md:w-1/2 md:p-8 p-2 flex flex-col ">
        <span className="font-semibold text-xs sm:text-sm mb-1 sm:mb-2">FAQ</span>
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-4">Customer Support Guide</h1>
        <span className="text-xs sm:text-sm font-medium mb-2 sm:mb-4">Frequently Asked Questions</span>
        <div className="mb-2 sm:mb-4 hover:scale-105 transition-transform duration-200">
          {/* Brand logo placeholder */}
          <SiteLogoImage
            width={90}
            height={30}
            className="object-contain transition-transform duration-200 hover:scale-110"
          />
        </div>
        <div className="text-xs sm:text-sm text-gray-700 mb-4 sm:mb-6 flex flex-col gap-2">
          <BusinessHoursList iconSize={16} />
          <div className="mt-2">Average answer time: Call for instant help</div>
        </div>
      </div>
      {/* Right Column */}
      <div className="md:w-1/2 py-4 px-2 sm:py-8 sm:px-8 bg-white/40 rounded-2xl md:rounded-3xl">
        <Accordion variant="splitted" className="w-full">
          {faqs.map((faq) => (
            <AccordionItem className="shadow-none border" key={faq.key} aria-label={faq.title} title={<span className="md:text-base text-xs">{faq.title}</span>}>
              <div className="text-xs sm:text-sm text-gray-600 pb-2 sm:pb-4">{faq.content}</div>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
};

export default FAQ; 