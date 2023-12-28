import React from "react";
import { useLocation } from "react-router-dom";
import Header from "@/app/components/Header/Header";

const SiteHeader = () => {
  let location = useLocation();

  return  <Header /> ;
};

export default SiteHeader;
