import Image from "next/image";
import Link from "next/link";
import SiteLogo from "@/public/global/gq-logo.png";
import { Brand } from "@/graphql/types/graphql";

interface BrandLogoProps {
  brand: Brand | null | undefined;
  className?: string;
}

const BrandLogo = ({ brand, className = "" }: BrandLogoProps) => {
  if (!brand) {
    return null;
  }

  const logoUrl = brand.brandImage && brand.brandImage.trim() !== "" 
    ? brand.brandImage 
    : SiteLogo;

  return (
    <Link
      href={`/${brand.slug}`}
      target="_blank"
      className={`inline-block ${className}`}
    >
      <Image
        src={logoUrl}
        alt={brand.name || "Brand"}
        width={50}
        height={50}
        className="object-contain"
      />
    </Link>
  );
};

export default BrandLogo;
