import Image from "next/image";
import Link from "next/link";
import aboutContent from "@/content/about.json";
import SectionGoogleReviews, {
  type GoogleReviewsFields,
} from "@/components/home/SectionGoogleReviews";

const sectionHeadingClass =
  "font-albra text-3xl font-semibold text-[#092412] md:text-5xl";

interface AboutPageContentProps {
  googleReviews?: GoogleReviewsFields | null;
}

const AboutPageContent = ({ googleReviews }: AboutPageContentProps) => {
  const { hero, intro, brands, philosophy, why, closing } = aboutContent;

  return (
    <div className="-mb-20 bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-header-green">
        <Image
          src="/homepage/footer-overlay.png"
          alt=""
          fill
          aria-hidden
          sizes="100vw"
          className="object-cover opacity-40"
        />
        <div className="relative mx-auto grid max-w-[1368px] grid-cols-1 items-center gap-10 px-4 py-14 md:grid-cols-2 md:gap-14 md:px-6 md:py-20 lg:py-24">
          <div className="text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/80 md:text-sm">
              {hero.eyebrow}
            </p>
            <h1 className="mt-3 font-albra text-4xl font-semibold leading-tight md:text-6xl">
              {hero.title}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/85 md:text-lg">
              {intro.lead}
            </p>
            <Link
              href="/shop"
              className="mt-8 inline-flex items-center rounded-xl bg-header-action px-6 py-3 text-sm font-bold text-[#092412] transition-opacity hover:opacity-90"
            >
              Shop pet essentials
            </Link>
          </div>
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-white/20 shadow-lg md:aspect-square">
            <Image
              src={hero.image}
              alt={hero.imageAlt}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
              priority
            />
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="bg-header-cream px-4 py-14 md:px-6 md:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-lg font-medium leading-relaxed text-[#092412] md:text-xl">
            {intro.body}
          </p>
        </div>
      </section>

      {/* Three brands */}
      <section className="px-4 py-14 md:px-6 md:py-20">
        <div className="mx-auto max-w-[1368px]">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className={sectionHeadingClass}>{brands.title}</h2>
            <p className="mt-4 text-base font-medium text-black/55 md:text-lg">
              {brands.subtitle}
            </p>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
            {brands.items.map((brand) => (
              <article
                key={brand.name}
                style={{ backgroundColor: brand.accent }}
                className="flex flex-col rounded-2xl p-6 md:p-7"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/70">
                  <Image
                    src="/icons/paw-feat.png"
                    alt=""
                    width={28}
                    height={28}
                    aria-hidden
                    className="h-7 w-7 object-contain"
                  />
                </div>
                <h3 className="mt-5 text-xl font-bold text-[#092412]">
                  {brand.name}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-neutral-700 md:text-base">
                  {brand.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="bg-[#F5F5F5] px-4 py-14 md:px-6 md:py-20">
        <div className="mx-auto grid max-w-[1368px] grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl lg:aspect-square">
            <Image
              src={philosophy.image}
              alt={philosophy.imageAlt}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <div>
            <p className="text-lg leading-relaxed text-neutral-700 md:text-xl">
              {philosophy.body}
            </p>
          </div>
        </div>
      </section>

      {/* Why Catlitter */}
      <section className="px-4 py-14 md:px-6 md:py-20">
        <div className="mx-auto max-w-[1368px]">
          <h2 className={`${sectionHeadingClass} text-center`}>{why.title}</h2>
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {why.items.map((item) => (
              <div
                key={item.text}
                className="flex flex-col items-center rounded-2xl border border-[#E8E8E8] bg-white p-6 text-center shadow-sm"
              >
                <Image
                  src={item.icon}
                  alt={item.iconAlt}
                  width={40}
                  height={40}
                  className="h-10 w-10 object-contain"
                />
                <p className="mt-4 text-sm font-semibold leading-snug text-[#092412] md:text-base">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SectionGoogleReviews data={googleReviews} className="mt-0" />

      {/* Closing */}
      <section className="bg-[#EDF2EE] px-4 pb-14 pt-4 text-center md:px-6 md:pb-20">
        <div className="mx-auto max-w-3xl">
          <p className="text-base leading-relaxed text-neutral-700 md:text-lg">
            {closing.body}
          </p>
          <p className="mt-8 font-albra text-2xl font-semibold text-[#769F5F] md:text-4xl">
            {closing.tagline}
          </p>
        </div>
      </section>
    </div>
  );
};

export default AboutPageContent;
