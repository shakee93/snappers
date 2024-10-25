import React from "react";

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
    topBarBgColor = "rgba(0, 0, 0, 0.8)", // Default value in rgba format for opacity
    topBarBeforeText = "The ALL NEW",
    topBarHighlightedText = "iPhone 16 Series",
    topBarAfterText = "Available!",
    topBarHighlightedColor = "#fb923c", // Example hex color
    topBarButtonLink = "https://gqmobiles.lk//apple/apple-iphone-16",
    topBarButtonText = "Shop Now",
  } = options || {};

  return (
    <div style={{ backgroundColor: topBarBgColor }} className="px-2 py-5 md:p-3">
      <div className="items-between flex flex-col gap-4 md:flex-row md:items-center md:gap-3">
        <div className="flex w-full flex-col items-center justify-center gap-2 md:flex-row">
          <div className="flex-col md:flex-row flex gap-5 justify-center text-center items-center">
            <div className="text-sm font-semibold text-white md:text-xs lg:text-sm">
              <span className="font-bold">{topBarBeforeText}</span>{" "}
              <span>Exclusive</span>
              <span style={{ color: topBarHighlightedColor }}> {topBarHighlightedText}</span>{" "}
              <span>{topBarAfterText}</span>{" "}
            </div>
            <div className="text-xs">
              <a
                href={topBarButtonLink}
                className="bg-blue-700 text-white font-semibold py-1 px-4 rounded transition duration-300 ease-in-out hover:bg-blue-800"
              >
                 {topBarButtonText}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBarPromotion;
