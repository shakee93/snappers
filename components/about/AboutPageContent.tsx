import Image from "next/image";
import Link from "next/link";
import { BRAND_CTA_BUTTON_CLASS } from "@/shared/Button/ButtonBrand";
import aboutContent from "@/content/about.json";

const sectionHeadingClass =
  "font-albra text-3xl font-semibold text-[#092412] md:text-5xl";

const AboutPageContent = () => {
  const { hero, intro, welcome, stats, why, closing, cta } = aboutContent;

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
              href={cta?.href ?? "/shop"}
              className={`mt-8 inline-flex items-center rounded-full px-8 py-3.5 text-sm font-bold transition-opacity hover:opacity-90 ${BRAND_CTA_BUTTON_CLASS}`}
            >
              {cta?.label ?? "Start shopping"}
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

      {/* Welcome - matches live Snappers about copy */}
      <section className="bg-[#F5F5F5] px-4 py-14 md:px-6 md:py-20">
        <div className="mx-auto grid max-w-[1368px] grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-white shadow-sm lg:aspect-[5/4]">
            <Image
              src={welcome.image}
              alt={welcome.imageAlt}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm md:p-10">
            <p className="text-base leading-relaxed text-neutral-700 md:text-lg md:leading-8">
              <span
                className="float-left mr-2 mt-0.5 font-albra text-5xl font-bold leading-[0.85] text-[#F97316] md:text-6xl"
                aria-hidden
              >
                {welcome.dropCap}
              </span>
              {welcome.body}
            </p>
          </div>
        </div>

        <ul className="mx-auto mt-10 grid max-w-[1368px] grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {stats.map((stat) => (
            <li
              key={stat.label}
              className="flex flex-col items-center justify-center rounded-2xl bg-white px-4 py-8 text-center shadow-sm md:py-10"
            >
              <p className="font-albra text-3xl font-bold text-[#F97316] md:text-4xl lg:text-5xl">
                {stat.value}
              </p>
              <p className="mt-2 text-sm font-semibold uppercase tracking-wide text-header-green md:text-base">
                {stat.label}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* Why Snappers */}
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
