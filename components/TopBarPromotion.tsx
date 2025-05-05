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
    topBarBgColor = "hsla(0, 0.00%, 0.00%, 0.80)",
    topBarBeforeText = "The ALL NEW",
    topBarHighlightedText = "Samsung Galaxy S25 Series",
    topBarAfterText = "Available!",
    topBarHighlightedColor = "#fb923c",
    topBarButtonLink = "/series/samsung-s25",
    topBarButtonText = "Shop Now",
  } = options || {};

// console.log('TopBarPromotion', topBarButtonLink, topBarBgColor, topBarBeforeText);

  return (
    <div style={{ backgroundColor: topBarBgColor }} className="px-1 py-3 md:p-3">
      <div className="items-between flex flex-col gap-4 md:flex-row md:items-center md:gap-3">
        <div className="flex w-full flex-col items-center justify-center gap-2 md:flex-row">
          <div className="flex-row md:flex-row flex gap-2 md:gap-5 justify-center text-center items-center">
            <div className="text-xs font-semibold text-white md:text-sm lg:text-md">
              <span className="font-bold">{topBarBeforeText}</span>
              <span style={{ color: topBarHighlightedColor }}> {topBarHighlightedText} </span>{" "}
              <span>{topBarAfterText}</span>{" "}
            </div>
            <div className="text-xs">
              <Link
                href={topBarButtonLink}
                className="bg-blue-700 text-white font-semibold py-1 px-2 md:py-1 md:px-4 rounded transition duration-300 ease-in-out hover:bg-blue-800"
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
