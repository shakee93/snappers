import Image from "next/image";

export interface SectionHealthBannerProps {
  className?: string;
  /** Desktop banner artwork. */
  backgroundImage?: string;
  /** Mobile banner artwork (rabbit doctor on the right). */
  backgroundImageMobile?: string;
}

/**
 * Health promo banner with title overlaid on the background image.
 */
const SectionHealthBanner = ({
  className = "",
  backgroundImage = "/homepage/health-bg.png",
  backgroundImageMobile = "/homepage/health-m-bg.png",
}: SectionHealthBannerProps) => {
  return (
    <section className={`mx-auto w-full max-w-[1368px] px-3 lg:px-0 ${className}`}>
      <div className="relative w-full overflow-visible rounded-[20px] md:overflow-hidden md:rounded-[28px]">
        <Image
          src={backgroundImageMobile}
          alt=""
          width={371}
          height={167}
          aria-hidden
          className="h-auto w-full rounded-[20px] object-cover md:hidden"
        />
        <Image
          src={backgroundImage}
          alt=""
          width={1386}
          height={443}
          aria-hidden
          className="hidden h-auto w-full object-cover md:block"
        />

        {/* Mobile: left-aligned title over rabbit bg */}
        <div className="absolute inset-0 flex flex-col items-start justify-end pb-8 pl-5 pr-[38%] md:hidden">
          <h2 className="text-left text-[#092412]">
            <span className="block font-albra text-[25px] font-semibold leading-tight">
              We Care About
            </span>
            <span className="mt-0.5 block font-albra text-[25px] font-bold leading-tight">
              Your <span className="text-[#769F5F]">Pet&apos;s Health</span>
            </span>
          </h2>
        </div>

        {/* Desktop: centered title overlay */}
        <div className="absolute inset-0 hidden flex-col items-center justify-end px-4 pb-8 sm:pb-28 md:flex">
          <h2 className="text-center text-[#092412]">
            <span className="block font-albra text-6xl font-semibold text-[#092412]">
              We Care About Your
            </span>
            <span className="mt-1 block font-albra text-6xl font-bold text-[#769F5F]">
              Pet&apos;s Health
            </span>
          </h2>
        </div>
      </div>
    </section>
  );
};

export default SectionHealthBanner;
