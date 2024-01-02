import Link from "next/link";
import Image from "next/image";
import SiteLogo from "@/public/global/logo.webp";

const Logo = ({ className = 'border-r'}:{ className?: string}) => {
  return (
    <Link href={"/"} className={className}>
      <Image
        width={320}
        height={266}
        priority={true}
        src={SiteLogo}
        alt="logo"
        className="h-20 lg:h-32 max-w-[80px] md:max-w-[320px] w-auto p-2 lg:p-4 relative z-50 rounded-b-2xl"
      ></Image>
    </Link>
  );
};

export default Logo;
