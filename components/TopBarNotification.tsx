import React from "react";

const TopBarNotification: React.FC = () => {
  return (
    <div className="bg-black px-1 py-2 md:px-3 md:py-2.5">
      <div className="flex items-center justify-center">
        <p className="text-xs font-semibold text-white md:text-sm text-center">
          We're closed on April 13th &amp; 14th. Reopening April 15th.
        </p>
      </div>
    </div>
  );
};

export default TopBarNotification;
