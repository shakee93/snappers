import Link from "next/link";
import { PhoneCall, MapPin, Facebook, Instagram } from "lucide-react";

const HeaderTopBar = () => {
  const iconSize = 13;
  return (
  
      <div className="flex flex-row justify-between bg-primaryColor con p-2 text-xs text-white">
        <div className="flex gap-2 xl:w-48">
        
        </div>
        <div className="flex gap-2 items-center w-4/12">
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
        
        <div className=" gap-2  xl:w-2/12 items-center hidden xl:flex justify-center text-xs">
          Social Media : 
          <Link href={"https://www.facebook.com/gqmobilestore"}><Facebook size={iconSize}/></Link>
          <Link href={"https://www.instagram.com/gqthemobilestoreunlimited"}><Instagram size={iconSize}/></Link>
        </div>
        <div className="flex gap-2 xl:w-4/12 items-center justify-end">
          Address : 
          <MapPin size={iconSize} />
          250/54, Ground Floor, Liberty Plaza, Colombo 03.
        </div>
      </div>
  );
};

export default HeaderTopBar;
