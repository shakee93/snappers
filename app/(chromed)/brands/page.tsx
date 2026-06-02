import { getClient } from "@/graphql/apollo-ssr";
import { GET_ALL_BRANDS } from "@/graphql/defs/products";
import { Brand } from "@/graphql/types/graphql";
import Link from "next/link";
import Image from "next/image";
import brandsPageContent from "@/content/brands-page.json";
import { getLogoSources } from "@/lib/siteAssets";

// Safety-net ISR — primary invalidation is the WP webhook; this keeps the
// page self-healing if a build-time fetch is rate-limited.
export const revalidate = 1800;

async function getData(): Promise<{ brands: Brand[] }> {
  // The SSR client retries transient 429s with backoff; if it still fails,
  // degrade to an empty list so the build doesn't hard-fail — ISR/webhook
  // revalidation backfills the brands shortly after.
  try {
    const { data } = await getClient().query({ query: GET_ALL_BRANDS });
    return { brands: data?.brands?.nodes ?? [] };
  } catch (error: unknown) {
    console.error("Failed to fetch brands for /brands page", error);
    return { brands: [] };
  }
}

const Page = async () => {
  const { brands } = await getData();
  const { light: brandLogoFallback } = getLogoSources();

  return (
    <div>
      <div className="container py-8 lg:py-12 space-y-16 sm:space-y-20 lg:space-y-28">
        <div className="space-y-4 lg:space-y-14">
          <div className="max-w-screen-sm">
            <h2 className="block text-2xl sm:text-3xl lg:text-4xl font-semibold">
              Browse
            </h2>
            <span className="block mt-2 lg:mt-4 text-neutral-500 dark:text-neutral-400 text-sm sm:text-base">
              {brandsPageContent.heroDescription}
            </span>
          </div>
          <hr className="border-slate-200 dark:border-slate-700 !mt-4" />
          <main className="!mt-4">
            <div className="w-full">
              <ul className="py-2 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2  lg:gap-4 text-left text-sm text-gray-700 dark:text-gray-200">
                {brands
                  ?.filter((brand: Brand) => brand.count && brand.count > 0)
                  .map((brand: Brand, index: number) => (
                    <li key={index} className="flex flex-col items-center">
                      <Link
                        href={`/${brand.slug}`}
                        className="group flex flex-col items-center w-full h-full px-4 py-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white transition-colors"
                      >
                        <div className="w-40 h-28 flex items-center justify-center mb-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm ">
                          <Image
                            src={
                              brand.brandImage && brand.brandImage.trim() !== ""
                                ? brand.brandImage
                                : brandLogoFallback
                            }
                            alt={brand.name || "Brand"}
                            width={80}
                            height={80}
                            className="object-contain p-2 w-full h-full transition-transform duration-300 ease-in-out group-hover:scale-110"
                          />
                        </div>
                        <span className="block text-center font-medium text-base mt-1">{brand.name} <span className="text-gray-400">({brand.count})</span></span>
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Page;
