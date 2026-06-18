import Image from "next/image";
import Link from "next/link";
import notFoundContent from "@/content/not-found.json";

const NotFoundPageContent = () => {
  const { hero, suggestions } = notFoundContent;

  return (
    <div className="-mb-20 bg-white">
      <section className="relative overflow-hidden bg-header-green">
        <Image
          src="/homepage/footer-overlay.png"
          alt=""
          fill
          aria-hidden
          sizes="100vw"
          className="object-cover opacity-40"
        />
        <div className="relative mx-auto grid max-w-[1368px] grid-cols-1 items-center gap-10 px-4 py-16 md:grid-cols-2 md:gap-14 md:px-6 md:py-24 lg:py-28">
          <div className="text-center md:text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/80 md:text-sm">
              {hero.eyebrow}
            </p>
            <p
              className="mt-3 font-albra text-7xl font-semibold leading-none text-white md:text-8xl"
              aria-hidden
            >
              {hero.code}
            </p>
            <h1 className="mt-4 font-albra text-3xl font-semibold leading-tight text-white md:text-5xl">
              {hero.title}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/85 md:text-lg">
              {hero.description}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3 md:justify-start">
              <Link
                href={hero.cta.primary.href}
                className="inline-flex items-center rounded-xl bg-header-action px-6 py-3 text-sm font-bold text-[#092412] transition-opacity hover:opacity-90"
              >
                {hero.cta.primary.label}
              </Link>
              <Link
                href={hero.cta.secondary.href}
                className="inline-flex items-center rounded-xl border border-white/35 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10"
              >
                {hero.cta.secondary.label}
              </Link>
            </div>
          </div>
          <div className="relative mx-auto aspect-[4/3] w-full max-w-md overflow-hidden rounded-2xl border border-white/20 shadow-lg md:max-w-none md:aspect-square">
            <Image
              src="/homepage/categories/cat-dog.webp"
              alt="Cat and dog"
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
              priority
            />
          </div>
        </div>
      </section>

      <section className="bg-header-cream px-4 py-14 md:px-6 md:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-albra text-2xl font-semibold text-[#092412] md:text-3xl">
            {suggestions.title}
          </h2>
          <nav
            className="mt-8 flex flex-wrap justify-center gap-3"
            aria-label="Helpful links"
          >
            {suggestions.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-xl border border-[#E8E8E8] bg-white px-5 py-2.5 text-sm font-semibold text-header-green transition-colors hover:border-header-green/30 hover:bg-[#EBF3EF]"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </section>
    </div>
  );
};

export default NotFoundPageContent;
