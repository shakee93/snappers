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
    <Link
      href={"/"}
      className={twMerge("select-none", className)}
      onClick={clearSearch}
    >
      <SiteLogoImage
        priority
        className={twMerge(
          "relative h-[31px] w-auto max-w-[320px] select-none transition-all hover:scale-110",
          imageClass
        )}
        draggable={false}
      />
    </Link>
  );
};

export default Logo;
