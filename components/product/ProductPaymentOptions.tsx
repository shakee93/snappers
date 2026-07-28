import Image from "next/image";
import type { StaticImageData } from "next/image";
import koko from "@/public/koko.png";
import bankTransfer from "@/public/product/bank-transfer.png";
import cod from "@/public/product/cod.svg";
import visaMastercard from "@/public/product/visa-mastercard.png";
import { formatPrice } from "@/lib/formatPrice";
import { pdpRadius } from "@/components/product/pdpStyles";
import {
  isKokoTier,
  type ProductPriceTier,
} from "@/lib/priceTiers";

interface ProductPaymentOptionsProps {
  /** Selected variation / simple product price — used when a tier's price is null (e.g. variable parents). */
  numericPrice: number;
  priceTiers?: ProductPriceTier[] | null;
}

const optionCardClass =
  `flex h-full min-h-[80px] items-center justify-between gap-3 border border-[#E8E8E8] bg-white p-3 sm:gap-3 ${pdpRadius}`;

const optionsGridClass =
  "grid grid-cols-1 gap-3 sm:grid-cols-2 sm:auto-rows-fr";

const legacyOptions: Array<{
  image: StaticImageData;
  alt: string;
}> = [
  { image: bankTransfer, alt: "Bank Transfer" },
  { image: visaMastercard, alt: "Visa and Mastercard" },
  { image: cod, alt: "Cash On Delivery" },
];

const fallbackByName: Array<{
  match: RegExp;
  image: StaticImageData;
}> = [
  { match: /bank\s*transfer/i, image: bankTransfer },
  { match: /visa|mastercard|card/i, image: visaMastercard },
  { match: /cash\s*on\s*delivery|^cod$/i, image: cod },
  { match: /koko/i, image: koko },
];

function isCodTier(name: string | null | undefined): boolean {
  return /cash\s*on\s*delivery|^cod$/i.test(name ?? "");
}

function resolveTierImage(
  tier: ProductPriceTier,
): string | StaticImageData {
  const fallback = fallbackByName.find((entry) =>
    entry.match.test(tier.name ?? ""),
  );

  // Prefer local assets for known payment methods — backend thumbs are often
  // cropped squares that clip wordmarks (COD) or look tiny (KOKO).
  if (fallback && (isKokoTier(tier.name) || isCodTier(tier.name))) {
    return fallback.image;
  }

  if (tier.imageUrl) {
    return tier.imageUrl;
  }

  return fallback?.image ?? bankTransfer;
}

function resolveTierPrice(
  tier: ProductPriceTier,
  fallbackPrice: number,
): number {
  if (
    typeof tier.price === "number" &&
    Number.isFinite(tier.price) &&
    tier.price > 0
  ) {
    return tier.price;
  }
  return fallbackPrice;
}

function TierLogo({
  src,
  alt,
  koko,
}: {
  src: string | StaticImageData;
  alt: string;
  koko?: boolean;
}) {
  // Fixed-height fill box + object-contain: scales the full wordmark into the
  // available width instead of clipping when the price column squeezes the row.
  return (
    <div
      className={`relative min-w-0 flex-1 ${koko ? "h-11" : "h-10"}`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 640px) 45vw, 180px"
        className="object-contain object-left"
        unoptimized={typeof src === "string"}
      />
    </div>
  );
}

const ProductPaymentOptions = ({
  numericPrice,
  priceTiers,
}: ProductPaymentOptionsProps) => {
  const tiers = (priceTiers ?? []).filter((tier) => !!tier.name);

  if (tiers.length === 0 && numericPrice <= 0) {
    return null;
  }

  if (tiers.length === 0) {
    const kokoInstallment = ((numericPrice / 88) * 100) / 3;
    const formattedPrice = formatPrice(numericPrice);

    return (
      <div className="mb-4 space-y-3">
        <p className="text-sm font-bold text-[#1A1A1A]">Payment Options</p>
        <div className={optionsGridClass}>
          {legacyOptions.map((option) => (
            <div key={option.alt} className={optionCardClass}>
              <TierLogo src={option.image} alt={option.alt} />
              <div className="shrink-0 whitespace-nowrap text-right">
                <p className="text-xs text-[#9CA3AF]">Price</p>
                <p className="text-sm font-bold text-[#1A1A1A]">{formattedPrice}</p>
              </div>
            </div>
          ))}
          <div className={optionCardClass}>
            <TierLogo src={koko} alt="Koko" koko />
            <div className="shrink-0 whitespace-nowrap text-right">
              <p className="text-xs text-[#9CA3AF]">Buy Now Pay Later</p>
              <p className="text-sm font-bold text-[#38461F]">
                3 x {formatPrice(kokoInstallment)}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4 space-y-3">
      <p className="text-sm font-bold text-[#1A1A1A]">Payment Options</p>

      <div className={optionsGridClass}>
        {tiers.map((tier) => {
          const name = tier.name!.trim();
          const amount = resolveTierPrice(tier, numericPrice);
          const src = resolveTierImage(tier);
          const koko = isKokoTier(name);
          const kokoInstallment =
            koko && amount > 0 ? ((amount / 88) * 100) / 3 : 0;

          return (
            <div key={name} className={optionCardClass}>
              <TierLogo src={src} alt={name} koko={koko} />
              <div className="shrink-0 whitespace-nowrap text-right">
                {koko && amount > 0 ? (
                  <>
                    <p className="text-xs text-[#9CA3AF]">Buy Now Pay Later</p>
                    <p className="text-sm font-bold text-[#38461F]">
                      3 x {formatPrice(kokoInstallment)}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-[#9CA3AF]">Price</p>
                    <p className="text-sm font-bold text-[#1A1A1A]">
                      {amount > 0 ? formatPrice(amount) : "—"}
                    </p>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductPaymentOptions;
