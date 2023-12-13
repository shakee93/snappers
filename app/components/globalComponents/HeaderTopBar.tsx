// components/Header.js

import Link from "next/link";
import Logo from "./Logo";
import { PhoneCall, MapPin, Facebook, Instagram } from "lucide-react";

const HeaderTopBar = () => {
  const iconSize = 13;
  return (
  
      <div className="flex flex-row justify-between bg-primary-700 con p-2 text-xs text-white">
        <div className="flex gap-2 w-1/3">
          Contact Us : 
          <Link
            href={"tel:0777555665"}
            className="flex gap-2 items-center justify-center"
          >
            <PhoneCall size={iconSize} /> 0777555665
          </Link>
          <Link
            href={"tel:0777988665"}
            className="flex gap-2 items-center justify-center"
          >
            <PhoneCall size={iconSize} />
            0777988665
          </Link>
        </div>
        
        <div className="flex gap-2 w-1/3 items-center justify-center">
          Social Media : 
          <Link href={"https://www.facebook.com/gqmobilestore"}><Facebook size={iconSize}/></Link>
          <Link href={"https://www.instagram.com/gqthemobilestoreunlimited"}><Instagram size={iconSize}/></Link>
        </div>
        <div className="flex gap-2 w-1/3 items-center justify-end">
          Address : 
          <MapPin size={iconSize} />
          250/54, Ground Floor, Liberty Plaza, Colombo 03.
        </div>
      </div>
  );
};

export default HeaderTopBar;
