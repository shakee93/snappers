const pulseClassName = "animate-pulse bg-neutral-200";

export const ARCHIVE_PRODUCT_GRID_CLASS_NAME =
  "grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-4";

export const INSTANT_SEARCH_PRODUCT_GRID_CLASS_NAME =
  "flex-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-2 gap-y-2 lg:gap-x-3 lg:gap-y-4";

export const ProductCardsSkeleton = ({
  count = 9,
  className = ARCHIVE_PRODUCT_GRID_CLASS_NAME,
}: {
  count?: number;
  className?: string;
}) => (
  <div className={className} aria-hidden>
    {Array.from({ length: count }).map((_, index) => (
      <ProductCardLoading key={index} />
    ))}
  </div>
);

const ProductCardLoading = () => {
  return (
    <div
      className="relative flex h-full flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white"
      aria-hidden
    >
      <div className="relative w-full shrink-0 bg-[#FAFAFA] pt-[100%]">
        <div className={`absolute inset-0 ${pulseClassName}`} />
        <div className="absolute bottom-2.5 right-2.5 z-10 h-9 w-9 rounded-lg border border-neutral-200 bg-neutral-100 sm:bottom-3 sm:right-3" />
      </div>

      <div className="flex flex-1 flex-col border-t border-neutral-200 px-3 pb-3 pt-2.5 sm:px-4 sm:pb-4 sm:pt-3">
        <div className="min-h-[2.5rem] space-y-1.5">
          <div className={`h-3.5 w-full rounded sm:h-4 ${pulseClassName}`} />
          <div className={`h-3.5 w-2/3 rounded sm:h-4 ${pulseClassName}`} />
        </div>
        <div className={`mt-2 h-5 w-28 rounded sm:h-6 sm:w-32 ${pulseClassName}`} />
        <div className={`mt-1.5 h-3 w-40 rounded sm:h-3.5 ${pulseClassName}`} />
        <div
          className={`mt-3 h-10 w-full rounded-lg sm:mt-4 sm:h-[46px] ${pulseClassName}`}
        />
      </div>
    </div>
  );
};

export default ProductCardLoading;
