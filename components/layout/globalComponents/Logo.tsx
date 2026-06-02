"use client";

import Link from "next/link";
import { twMerge } from "tailwind-merge";
import { useClearSearch } from "@/hooks/useClearSearch";
import SiteLogoImage from "@/components/brand/SiteLogoImage";

const Logo = ({
  className = "",
  imageClass = "",
}: {
  className?: string;
  imageClass?: string;
}) => {
  const clearSearch = useClearSearch();
  return (
    <Link href={"/"} className={className} onClick={clearSearch}>
      <SiteLogoImage
        priority
        className={twMerge(
          "relative h-28 w-auto max-w-[80px] rounded-b-2xl transition-all hover:scale-110 md:h-16 md:max-w-[320px]",
          imageClass
        )}
      />
    </Link>
  );
};

export default Logo;
