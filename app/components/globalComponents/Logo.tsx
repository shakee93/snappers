import Link from "next/link";
import Image from "next/image";
import SiteLogo from "@/public/global/logo.webp";
import SiteLogoNew from "@/public/global/LogoNew.webp";
import {twMerge} from "tailwind-merge";

const Logo = ({ className = 'border-r', imageClass = ''}:{ className?: string, imageClass?: string}) => {
  return (
    <Link href={"/"} className={className}>
      <Image
        width={320}
        height={266}
        priority={true}
        src={SiteLogoNew}
        alt="logo"
        className={twMerge(
            "h-32 md:h-32 hover:scale-110 transition-all max-w-[80px] md:max-w-[320px] w-auto p-2 md:p-4 relative rounded-b-2xl",
            imageClass
        )}
      ></Image>
    </Link>
  );
};

export default Logo;
