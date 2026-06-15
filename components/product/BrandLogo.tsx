import Link from "next/link";
import Image from "next/image";
import { Brand } from "@/graphql/types/graphql";
import { getBrandPath } from "@/lib/productUrl";
import { twMerge } from "tailwind-merge";

interface BrandLogoProps {
  brand: Brand | null | undefined;
  className?: string;
  imageClassName?: string;
}

const BrandLogo = ({
  brand,
  className = "",
  imageClassName = "h-8 w-auto max-w-[160px] object-contain object-left",
}: BrandLogoProps) => {
  if (!brand?.brandImage?.trim()) {
    return null;
  }

  return (
    <Link
      href={getBrandPath(brand.slug ?? "")}
      className={twMerge("inline-flex items-center", className)}
    >
      <Image
        src={brand.brandImage}
        alt={brand.name || "Brand"}
        width={160}
        height={48}
        className={imageClassName}
      />
    </Link>
  );
};

export default BrandLogo;
