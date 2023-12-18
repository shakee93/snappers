import Link from "next/link";
import Image from "next/image";
import SiteLogo from "@/public/global/logo.webp"

const Logo = () => {
  return (
    <Link href={"/"}>
      <Image src={SiteLogo} alt="logo" className="h-16 w-auto"></Image>
    </Link>
  );
};

export default Logo;
