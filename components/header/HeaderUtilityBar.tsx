"use client";

import SearchBar from "./SearchBar";

/** Mobile: search on green bar. Desktop category strip lives in `HeaderContent`. */
const HeaderUtilityBar = () => {
  return (
    <div className="bg-header-green px-4 pb-3 lg:hidden">
      <SearchBar placeholder="Search for brand, products or categories..." />
    </div>
  );
};

export default HeaderUtilityBar;
