import Image from "next/image";
import type { StaticImageData } from "next/image";
import koko from "@/public/koko.png";
import bankTransfer from "@/public/product/bank-transfer.png";
import cod from "@/public/product/cod.svg";
import visaMastercard from "@/public/product/visa-mastercard.png";
import { formatPrice } from "@/lib/formatPrice";
import { pdpRadius } from "@/components/product/pdpStyles";

interface ProductPaymentOptionsProps {
  numericPrice: number;
}

const optionCardClass =
  `flex min-h-[72px] items-center justify-between gap-3 border border-[#E8E8E8] bg-white p-3 sm:gap-2 ${pdpRadius}`;

const priceOptions: Array<{
  image: StaticImageData;
  alt: string;
  imageClassName?: string;
}> = [
  {
    image: bankTransfer,
    alt: "Bank Transfer",
    imageClassName: "h-8 w-auto max-w-[55%] object-contain",
  },
  {
    image: visaMastercard,
    alt: "Visa and Mastercard",
    imageClassName: "h-7 w-auto max-w-[55%] object-contain",
  },
  {
    image: cod,
    alt: "Cash On Delivery",
    imageClassName: "h-10 w-auto max-w-[60%] object-contain",
  },
];

const ProductPaymentOptions = ({
  numericPrice,
}: ProductPaymentOptionsProps) => {
  const kokoInstallment =
    numericPrice > 0 ? numericPrice / 3 : 0;
  const formattedPrice = numericPrice > 0 ? formatPrice(numericPrice) : "—";

  return (
    <div className="mb-4 space-y-3">
      <p className="text-sm font-bold text-[#1A1A1A]">Payment Options</p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {priceOptions.map((option) => (
          <div key={option.alt} className={optionCardClass}>
            <Image
              src={option.image}
              alt={option.alt}
              className={option.imageClassName ?? "h-8 w-auto object-contain"}
            />
            <div className="shrink-0 whitespace-nowrap text-right">
              <p className="text-xs text-[#9CA3AF]">Price</p>
              <p className="text-sm font-bold text-[#1A1A1A]">{formattedPrice}</p>
            </div>
          </div>
        ))}

        {numericPrice > 0 && (
          <div className={optionCardClass}>
            <Image
              src={koko}
              alt="Koko"
              width={64}
              height={28}
              className="h-7 w-auto shrink-0 object-contain"
            />
            <div className="shrink-0 whitespace-nowrap text-right">
              <p className="text-xs text-[#9CA3AF]">Buy Now Pay Later</p>
              <p className="text-sm font-bold text-[#38461F]">
                3 x {formatPrice(kokoInstallment)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductPaymentOptions;
