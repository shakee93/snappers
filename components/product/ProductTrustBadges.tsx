import Image, { type StaticImageData } from "next/image";

import boxIcon from "@/public/product/box-product.png";
import contactIcon from "@/public/product/contact-oriduct.png";
import pawIcon from "@/public/product/pow-product.png";
import timerIcon from "@/public/product/timer-product.png";

const TRUST_ITEMS: ReadonlyArray<{
  src: StaticImageData;
  alt: string;
  title: string;
  subtitle: string;
}> = [
  {
    src: pawIcon,
    alt: "Well trusted",
    title: "WELL TRUSTED",
    subtitle: "Over 900+ customers",
  },
  {
    src: contactIcon,
    alt: "Expert help",
    title: "EXPERT HELP",
    subtitle: "24/7 customer support",
  },
  {
    src: boxIcon,
    alt: "Super fast delivery",
    title: "SUPER FAST",
    subtitle: "With Express delivery",
  },
  {
    src: timerIcon,
    alt: "Same-day delivery",
    title: "Same-Day Delivery",
    subtitle: "Order Before 2PM!",
  },
];

const ProductTrustBadges = () => (
  <div className="grid grid-cols-2 gap-3 pb-4">
    {TRUST_ITEMS.map(({ src, alt, title, subtitle }) => (
      <div
        key={title}
        className="flex items-center gap-3 rounded-lg border border-[#E8E8E8] bg-white p-5"
      >
        <Image
          src={src}
          alt={alt}
          width={32}
          height={32}
          className="h-8 w-8 shrink-0 object-contain"
        />
        <div className="min-w-0">
          <p className="text-xs font-bold leading-tight text-[#1A1A1A]">
            {title}
          </p>
          <p className="mt-0.5 text-xs leading-tight text-[#6B7280]">
            {subtitle}
          </p>
        </div>
      </div>
    ))}
  </div>
);

export default ProductTrustBadges;
