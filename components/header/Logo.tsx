"use client";

import Link from "next/link";
import { twMerge } from "tailwind-merge";
import { useClearSearch } from "@/hooks/useClearSearch";
import SiteLogoImage from "@/components/global/brand/SiteLogoImage";

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
          "relative h-12 w-auto max-w-none transition-all hover:scale-105 md:h-14 lg:h-16",
          imageClass
        )}
      />
    </Link>
  );
};

export default Logo;
