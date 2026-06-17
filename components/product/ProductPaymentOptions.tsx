import Image from "next/image";
import type { StaticImageData } from "next/image";
import koko from "@/public/koko.png";
import amex from "@/public/product/amex.png";
import bankTransfer from "@/public/product/bank-transfer.png";
import cashPrice from "@/public/product/cash-price.png";
import visaMastercard from "@/public/product/visa-mastercard.png";
import { formatPrice } from "@/lib/formatPrice";

interface ProductPaymentOptionsProps {
  numericPrice: number;
}

const optionCardClass =
  "flex min-h-[72px] items-center justify-between gap-2 rounded-2xl border border-[#E8E8E8] bg-white p-3";

const splitPayCardClass =
  "flex min-h-[72px] items-center gap-3 rounded-2xl border border-[#E8E8E8] bg-white p-3";

const paymentOptions: Array<{
  image: StaticImageData;
  alt: string;
  imageClassName?: string;
}> = [
  { image: cashPrice, alt: "Cash Price", imageClassName: "h-8 w-auto max-w-[55%] object-contain" },
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
    image: amex,
    alt: "American Express",
    imageClassName: "h-8 w-auto rounded-md object-contain",
  },
];

const ProductPaymentOptions = ({
  numericPrice,
}: ProductPaymentOptionsProps) => {
  const kokoInstallment =
    numericPrice > 0 ? ((numericPrice / 88) * 100) / 3 : 0;
  const mintpayInstallment = numericPrice > 0 ? numericPrice / 3 : 0;
  const formattedPrice = numericPrice > 0 ? formatPrice(numericPrice) : "—";

  return (
    <div className="mb-4 space-y-4">
      <div className="space-y-3">
        <p className="text-sm font-bold text-[#1A1A1A]">Payment Options</p>

        <div className="grid grid-cols-2 gap-3">
          {paymentOptions.map((option) => (
            <div key={option.alt} className={optionCardClass}>
              <Image
                src={option.image}
                alt={option.alt}
                className={option.imageClassName ?? "h-8 w-auto object-contain"}
              />
              <div className="shrink-0 text-right">
                <p className="text-xs text-[#9CA3AF]">Price</p>
                <p className="text-sm font-bold text-[#1A1A1A]">{formattedPrice}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {numericPrice > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-bold text-[#1A1A1A]">Split And Pay</p>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className={splitPayCardClass}>
              <Image
                src={koko}
                alt="Koko"
                width={64}
                height={28}
                className="h-7 w-auto shrink-0 object-contain"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-[#9CA3AF]">Buy Now Pay Later</p>
                <p className="text-sm font-bold text-[#38461F]">
                  3 x {formatPrice(kokoInstallment)}
                </p>
              </div>
            </div>

            <div className={splitPayCardClass}>
              <span className="shrink-0 text-lg font-bold leading-none tracking-tight">
                <span className="text-[#1E3A5F]">mint</span>
                <span className="text-[#00C4B3]">pay</span>
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-[#9CA3AF]">Buy Now Pay Later</p>
                <p className="text-sm font-bold text-[#38461F]">
                  3 x {formatPrice(mintpayInstallment)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductPaymentOptions;
