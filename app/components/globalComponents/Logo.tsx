import Link from "next/link";
import Image from "next/image";
import SiteLogo from "@/public/global/logo.webp";
import {twMerge} from "tailwind-merge";

const Logo = ({ className = 'border-r', imageClass = ''}:{ className?: string, imageClass?: string}) => {
  return (
    <Link href={"/"} className={className}>
      <Image
        width={320}
        height={266}
        priority={true}
        src={SiteLogo}
        alt="logo"
        className={twMerge(
            "h-20 md:h-32 max-w-[80px] md:max-w-[320px] w-auto p-2 lg:p-4 relative z-50 rounded-b-2xl",
            imageClass
        )}
      ></Image>
    </Link>
  );
};

export default Logo;
