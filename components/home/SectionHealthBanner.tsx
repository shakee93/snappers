import Image from "next/image";

export interface SectionHealthBannerProps {
  className?: string;
  /** Banner artwork (stethoscope & rabbit doctor). */
  backgroundImage?: string;
}

/**
 * Health promo banner with a centred title overlaid on the background image.
 */
const SectionHealthBanner = ({
  className = "",
  backgroundImage = "/homepage/health-bg.png",
}: SectionHealthBannerProps) => {
  return (
    <section className={`mx-auto w-full max-w-[1368px] px-3 lg:px-0 ${className}`}>
      <div className="relative w-full overflow-hidden rounded-[28px]">
        <Image
          src={backgroundImage}
          alt=""
          width={1386}
          height={443}
          aria-hidden
          className="h-auto w-full object-cover"
        />

        <div className="absolute inset-0 flex flex-col items-center justify-end px-4 pb-8 sm:pb-28">
          <h2 className="text-center text-[#092412]">
            <span className="block font-albra text-3xl font-semibold text-[#092412] md:text-6xl">
              We Care About Your
            </span>
            <span className="mt-1 block font-albra font-bold text-[#769F5F] text-3xl md:text-6xl">
              Pet&apos;s Health 
            </span>
          </h2>
        </div>
      </div>
    </section>
  );
};

export default SectionHealthBanner;
