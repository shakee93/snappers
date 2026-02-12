import Image from "next/image";
import Link from "next/link";
import { Brand } from "@/graphql/types/graphql";

interface BrandLogoProps {
  brand: Brand | null | undefined;
  className?: string;
}

const BrandLogo = ({ brand, className = "" }: BrandLogoProps) => {
  if (!brand) {
    return null;
  }

  // Only show logo if brandImage exists and is not empty
  if (!brand.brandImage || brand.brandImage.trim() === "") {
    return null;
  }

  return (
    <Link
      href={`/${brand.slug}`}
      target="_blank"
      className={`inline-block ${className}`}
    >
      <Image
        src={brand.brandImage}
        alt={brand.name || "Brand"}
        width={100}
        height={50}
        className="object-contain"
      />
    </Link>
  );
};

export default BrandLogo;
