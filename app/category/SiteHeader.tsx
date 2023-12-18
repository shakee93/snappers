import React from "react";
import { useLocation } from "react-router-dom";
import { usePathname } from "next/navigation";
import HeaderLogged from "@/app/components/Header/HeaderLogged";
import Header from "@/app/components/Header/Header";

const SiteHeader = () => {
  let location = usePathname();
  // console.log({location2})

  return location === "/" ? <Header /> : <HeaderLogged />;
};

export default SiteHeader;
