import Link from "next/link";
import Image from "next/image";
import SiteLogo from "@/public/global/logo_cropped.webp";
import { twMerge } from "tailwind-merge";

const Logo = ({ className = '', imageClass = '' }: { className?: string, imageClass?: string }) => {
  return (
    <Link href={"/"} className={className}>
      <Image
        width={320}
        height={266}
        priority={true}
        src={SiteLogo}
        alt="logo"
        className={twMerge(
          "h-32 md:h-20 hover:scale-110 transition-all max-w-[80px] md:max-w-[320px] w-auto relative rounded-b-2xl",
          imageClass
        )}
      ></Image>
    </Link>
  );
};

export default Logo;
