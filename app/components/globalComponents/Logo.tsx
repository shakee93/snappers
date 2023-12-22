import Link from "next/link";
import Image from "next/image";
import SiteLogo from "@/public/global/logo.webp";

const Logo = () => {
  return (
    <Link href={"/"} className='border-r'>
      <Image
        width={320}
        height={266}
        src={SiteLogo}
        alt="logo"
        className="h-20 lg:h-32 w-auto p-2 lg:p-4 relative z-50 bg-white rounded-b-2xl"
      ></Image>
    </Link>
  );
};

export default Logo;
