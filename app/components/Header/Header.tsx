import React, { FC } from "react";
import MainNav1 from "./MainNav1";

export interface HeaderProps {}

const Header: FC<HeaderProps> = () => {
  return (
    <div className="nc-Header relative w-full z-40 ">
      {/* <MainNav1 /> */}
    </div>
  );
};

export default Header;
