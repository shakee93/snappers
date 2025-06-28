"use client";

import React from "react";
import { Accordion, AccordionItem } from "@nextui-org/react";
import SiteLogo from "@/public/global/gq-logo.png";
import Image from "next/image";

const faqs = [
  {
    key: "1",
    title: "Sealed Pack & Brand New?",
    content:
      "Yes! All phones at GQMobiles.lk are 100% brand new, sealed by the manufacturer with full accessories.",
  },
  {
    key: "2",
    title: "Warranty Period?",
    content:
      "Warranty varies by brand—typically 1 year for phones and 6 months for accessories. Details are listed on each product page.",
  },
  {
    key: "3",
    title: "Warranty Claim Process?",
    content:
      "Bring the device and invoice to our service center or reach out via WhatsApp—we'll guide you through the process.",
  },
  {
    key: "4",
    title: "Repair & After Service?",
    content:
      "We provide support for both in-warranty and out-of-warranty repairs through authorized service partners.",
  },
  {
    key: "5",
    title: "Out of Stock - Pre Order?",
    content:
      "Yes, you can pre-order out-of-stock models. Just contact us via WhatsApp to reserve your unit.",
  },
  {
    key: "6",
    title: "Shipping & Delivery process?",
    content:
      "Islandwide delivery within 1–3 working days. Same-day delivery available in selected areas.",
  },
  {
    key: "7",
    title: "Installments with credit cards?",
    content:
      "We support 3–24 month installment plans for selected banks. Check at checkout or contact support.",
  },
  {
    key: "8",
    title: "Cash on Delivery?",
    content:
      "Cash on Delivery is available for selected models and locations. Contact us to confirm availability.",
  },
  {
    key: "9",
    title: "Is KOKO Payment available?",
    content:
      "Yes, KOKO 3-month installment plans are supported for eligible orders during checkout.",
  },
  {
    key: "10",
    title: "For more information? Call us",
    content:
      "Message or call us via WhatsApp for quick responses. We're happy to help!",
  },
  {
    key: "11",
    title: "Why GQMobiles prices are low?",
    content:
      "We import directly with low margins and zero middlemen—so you get the best deal, always.",
  },
  {
    key: "12",
    title: "Buy with Confidence at GQMobiles.lk?",
    content:
      "Trusted by thousands, verified reviews, and real-time support—shop safe, fast, and smart.",
  },
];

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
          <Image 
            src={SiteLogo} 
            alt="GQ Mobiles Logo" 
            width={90} 
            height={30} 
            className="object-contain hover:scale-110 transition-transform duration-200" 
          />
        </div>
        <div className="text-xs sm:text-sm text-gray-700 mb-4 sm:mb-6">
          <div>Mon - Sat (10.00AM - 08.00PM)</div>
          <div>Poya Days: (10.00AM - 05.00PM)</div>
          <div>Sundays: Closed</div>
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