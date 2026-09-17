import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ourStoresContent from "@/content/our-stores.json";

interface StoreLocation {
  id: string;
  name: string;
  location: string;
  address: string;
  hours: string[];
  href: string;
  image?: string;
  imageAlt?: string;
}

export interface SectionOurStoresProps {
  className?: string;
}

const isExternalHref = (href: string) => /^https?:\/\//.test(href);

/**
 * "Our store" location cards — static copy in `content/our-stores.json` until
 * a WP ACF options page is exposed over GraphQL.
 */
const SectionOurStores = ({ className = "" }: SectionOurStoresProps) => {
  const { title, subtitle, coverImage, stores } = ourStoresContent as {
    title: string;
    subtitle: string;
    coverImage: string;
    stores: StoreLocation[];
  };

  if (stores.length === 0) return null;

  return (
    <section
      className={`w-full bg-white px-3 py-14 md:py-10 lg:px-0 ${className}`}
    >
      <div className="mx-auto w-full max-w-[1368px]">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-albra text-4xl font-semibold text-[#092412] md:text-6xl">
            {title}
          </h2>
          <p className="mt-4 text-base font-medium text-black/55 md:text-lg">
            {subtitle}
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3 xl:mt-14 xl:gap-6">
          {stores.map((store) => {
            const external = isExternalHref(store.href);
            const imageSrc = store.image || coverImage;
            const imageAlt = store.imageAlt || `${store.name} — ${store.location}`;

            return (
              <article
                key={store.id}
                className="flex flex-col rounded-2xl bg-[#F6E9DF] p-4"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl">
                  <Image
                    src={imageSrc}
                    alt={imageAlt}
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover"
                  />
                </div>

                <h3 className="mt-4 text-lg font-bold text-[#092412]">
                  {store.name}
                </h3>
                <p className="mt-1 text-sm font-medium text-neutral-700">
                  {store.location}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-neutral-600">
                  {store.address}
                </p>
                {store.hours.length > 0 ? (
                  <div className="mt-3 flex-1">
                    <p className="text-sm font-semibold text-[#092412]">
                      Open hours
                    </p>
                    <ul className="mt-1.5 space-y-0.5 text-sm leading-relaxed text-neutral-600">
                      {store.hours.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <Link
                  href={store.href}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noopener noreferrer" : undefined}
                  className="mt-5 inline-flex w-fit items-center gap-2 self-end rounded-lg bg-[#E8916F] px-5 py-2.5 text-sm font-semibold text-[#092412] transition-opacity hover:opacity-90"
                >
                  Read More
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default SectionOurStores;
