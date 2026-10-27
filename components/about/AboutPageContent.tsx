import Image from "next/image";
import {
  BadgePercent,
  ShoppingCart,
  ShieldCheck,
  Truck,
  type LucideIcon,
} from "lucide-react";
import aboutContent from "@/content/about.json";

const whyIconMap: Record<string, LucideIcon> = {
  delivery: Truck,
  quality: ShieldCheck,
  deals: BadgePercent,
  shop: ShoppingCart,
};

const sectionHeadingClass =
  "font-albra text-3xl font-semibold text-[#092412] md:text-5xl";

const AboutPageContent = () => {
  const { hero, intro, welcome, stats, why, closing } = aboutContent;

  return (
    <div className="-mb-20 bg-white">
      {/* Welcome - matches live Snappers about copy */}
      <section className="bg-[#F5F5F5] px-4 py-14 md:px-6 md:py-20">
        <header className="mx-auto mb-10 max-w-[1368px] text-center md:mb-12">
          <h1 className="font-albra text-3xl font-semibold text-header-green md:text-5xl">
            {hero.eyebrow}
          </h1>
          {intro.lead ? (
            <p className="mx-auto mt-3 max-w-2xl text-base text-neutral-600 md:text-lg">
              {intro.lead}
            </p>
          ) : null}
        </header>

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
            {why.items.map((item) => {
              const Icon =
                "iconKey" in item && typeof item.iconKey === "string"
                  ? whyIconMap[item.iconKey] ?? Truck
                  : Truck;
              const title =
                "title" in item && typeof item.title === "string"
                  ? item.title
                  : null;
              return (
                <div
                  key={item.text}
                  className="flex flex-col items-center rounded-2xl border border-[#E8E8E8] bg-white p-6 text-center shadow-sm"
                >
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FFF8F0]"
                    aria-hidden
                  >
                    <Icon
                      className="h-6 w-6 text-[#F97316]"
                      strokeWidth={2}
                    />
                  </div>
                  {title ? (
                    <h3 className="mt-4 text-base font-bold text-header-green md:text-lg">
                      {title}
                    </h3>
                  ) : null}
                  <p className="mt-2 text-sm leading-snug text-neutral-600 md:text-base">
                    {item.text}
                  </p>
                </div>
              );
            })}
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
