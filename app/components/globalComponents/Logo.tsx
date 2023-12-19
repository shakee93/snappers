import Link from "next/link";
import Image from "next/image";
import SiteLogo from "@/public/global/logo.webp"

const Logo = () => {
  return (
    <Link href={"/"}>
     <Image   width={200} src={SiteLogo} alt="logo" className="h-32 p-4 relative top-[-50px] mb-[-80px] shadow-xl z-50 bg-white w-auto rounded-b-2xl"></Image>
    </Link>
  );
};

export default Logo;
