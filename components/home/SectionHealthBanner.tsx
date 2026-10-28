import Image from "next/image";
import {
  sectionTitleAccentClass,
  sectionTitleClass,
} from "@/lib/sectionTypography";
import { cn } from "@/lib/utils";

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
          <h2 className={cn(sectionTitleClass, "text-left text-[1.35rem] sm:text-4xl")}>
            We care about your{" "}
            <span className={sectionTitleAccentClass}>pet&apos;s health</span>
          </h2>
        </div>

        {/* Desktop: centered title overlay */}
        <div className="absolute inset-0 hidden flex-col items-center justify-end px-4 pb-8 sm:pb-28 md:flex">
          <h2 className={cn(sectionTitleClass, "text-left")}>
            We care about your{" "}
            <span className={sectionTitleAccentClass}>pet&apos;s health</span>
          </h2>
        </div>
      </div>
    </section>
  );
};

export default SectionHealthBanner;
