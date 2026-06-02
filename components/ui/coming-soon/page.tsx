
import Link from "next/link";
import { twMerge } from "tailwind-merge";
import SiteLogoImage from "@/components/brand/SiteLogoImage";

export default async function Home() {
  const Logo = ({
    className = "",
    imageClass = "",
  }: {
    className?: string;
    imageClass?: string;
  }) => {
    return (
      <Link href={"/"} className={className}>
        <SiteLogoImage
          priority
          className={twMerge(
            "relative h-32 w-auto max-w-[80px] rounded-b-2xl p-2 transition-all hover:scale-110 md:h-48 md:max-w-[320px] md:p-4",
            imageClass
          )}
        />
      </Link>
    );
  };

  return (
    <section
      key="1"
      className="w-full h-screen flex items-center justify-center bg-mobile-pattern"
    >
      <Logo />
    </section>
  );
}
