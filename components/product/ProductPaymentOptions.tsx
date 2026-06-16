import Image from "next/image";
import koko from "@/public/koko.png";
import { currencySymbol } from "@/lib/formatPrice";

interface ProductPaymentOptionsProps {
  priceHtml: string;
  numericPrice: number;
}

const ProductPaymentOptions = ({
  priceHtml,
  numericPrice,
}: ProductPaymentOptionsProps) => {
  const kokoInstallment =
    numericPrice > 0 ? ((numericPrice / 88) * 100) / 3 : 0;

  return (
    <div className="space-y-4 rounded-2xl border border-[#E8E8E8] bg-[#FAFAFA] p-4">
      <p className="text-sm font-semibold text-[#1A1A1A]">Payment Options</p>

      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-medium text-[#374151]">
          Cash
        </span>
        <span className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-medium text-[#374151]">
          Bank Transfer
        </span>
        <Image src="/logos/visa.png" alt="Visa" width={40} height={24} className="h-6 w-auto" />
        <Image
          src="/logos/mastercard.png"
          alt="Mastercard"
          width={40}
          height={24}
          className="h-6 w-auto"
        />
      </div>

      {numericPrice > 0 && (
        <div className="flex flex-wrap items-center gap-4 border-t border-[#E8E8E8] pt-4">
          <div className="flex items-center gap-2 text-xs text-[#6B7280]">
            <Image src={koko} alt="Koko" width={48} height={20} className="h-5 w-auto" />
            <span>
              3 x {currencySymbol} {kokoInstallment.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#6B7280]">
            <span className="rounded bg-[#00C4B3] px-2 py-0.5 text-[10px] font-bold text-white">
              mintpay
            </span>
            <span dangerouslySetInnerHTML={{ __html: priceHtml }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductPaymentOptions;
