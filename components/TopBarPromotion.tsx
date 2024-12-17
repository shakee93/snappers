import React from "react";
import Link from "next/link";

interface Options {
  topBarBgColor?: string;
  topBarBeforeText?: string;
  topBarHighlightedText?: string;
  topBarAfterText?: string;
  topBarHighlightedColor?: string;
  topBarButtonLink?: string;
  topBarButtonText?: string;
}

const TopBarPromotion: React.FC<{ options?: Options }> = ({ options }) => {
  const {
    topBarBgColor = "rgba(0, 0, 0, 0.8)",
    topBarBeforeText = "The ALL NEW",
    topBarHighlightedText = "iPhone 16 Series",
    topBarAfterText = "Available!",
    topBarHighlightedColor = "#fb923c",
    topBarButtonLink = "/series/iphone-16",
    topBarButtonText = "Shop Now",
  } = options || {};

  return (
    <div style={{ backgroundColor: topBarBgColor }} className="px-2 py-5 md:p-3">
      <div className="items-between flex flex-col gap-4 md:flex-row md:items-center md:gap-3">
        <div className="flex w-full flex-col items-center justify-center gap-2 md:flex-row">
          <div className="flex-col md:flex-row flex gap-5 justify-center text-center items-center">
            <div className="text-sm font-semibold text-white md:text-xs lg:text-sm">
              <span className="font-bold">{topBarBeforeText}</span>
              <span style={{ color: topBarHighlightedColor }}> {topBarHighlightedText}</span>{" "}
              <span>{topBarAfterText}</span>{" "}
            </div>
            <div className="text-xs">
              <Link
                href='/tag/iphone-16'
                className="bg-blue-700 text-white font-semibold py-1 px-4 rounded transition duration-300 ease-in-out hover:bg-blue-800"
              >
                {topBarButtonText}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBarPromotion;
