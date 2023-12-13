import React, { FC } from "react";
import MainNav1 from "@/app/components/Header/MainNav1";
import MainNav from "@/app/components/Header/MainNavwithSearch";
import MainNav2Logged from "@/app/components/Header/MainNav2Logged";

export interface HeaderProps { }

const Header: FC<HeaderProps> = () => {
  return (
    <div className="nc-Header relative w-full z-40">
      <div className="md:hidden">
        <MainNav2Logged />
      </div>
      <div className="hidden md:block">
        <MainNav1 isTop />
      </div>
    </div>
  );
};

export default Header;
