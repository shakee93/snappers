const LoadingProduct = () => {
  return (
    <div className="mt-5 md:mt-10">
      <main className="flex flex-col px-3 sm:container sm:max-w-screen-2xl">
        {/* Breadcrumbs Skeleton */}
        <div className="md:mt-0 text-sm md:px-5 md:text-[0.95rem] md:ml-4">
          <div className="h-4 w-48 bg-gray-300 rounded animate-pulse"></div>
        </div>

        {/* Main Product Section */}
        <div className="flex flex-col md:flex-row p-3 rounded-3xl mt-5 md:mt-3 md:p-6 md:py-6 bg-white">
          {/* Left Side - Product Images */}
          <div className="w-full md:w-6/12 flex-col gap-6 md:pr-10">
            {/* Main Image Skeleton */}
            <div className="min-h-[272px] md:min-h-[576px] w-full bg-gray-300 rounded-2xl animate-pulse"></div>

            {/* Thumbnails Skeleton */}
            <div className="flex gap-3 mt-4 overflow-x-auto">
              <div className="h-20 w-20 flex-shrink-0 bg-gray-300 rounded-lg animate-pulse"></div>
              <div className="h-20 w-20 flex-shrink-0 bg-gray-300 rounded-lg animate-pulse"></div>
              <div className="h-20 w-20 flex-shrink-0 bg-gray-300 rounded-lg animate-pulse"></div>
              <div className="h-20 w-20 flex-shrink-0 bg-gray-300 rounded-lg animate-pulse"></div>
              <div className="h-20 w-20 flex-shrink-0 bg-gray-300 rounded-lg animate-pulse"></div>
            </div>

            {/* Features Skeleton (Desktop only) */}
            <div className="hidden lg:block w-full mt-6">
              <div className="grid grid-cols-2 gap-3">
                <div className="h-24 bg-gray-200 rounded-2xl animate-pulse"></div>
                <div className="h-24 bg-gray-200 rounded-2xl animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Right Side - Product Details */}
          <div className="md:w-6/12 flex flex-col p-2 gap-y-1 md:gap-y-1.5 mt-5 md:mt-0">
            {/* Cash Price Label */}
            <div className="h-4 w-24 bg-gray-300 rounded animate-pulse mt-2"></div>

            {/* Price Skeleton */}
            <div className="h-8 w-40 bg-gray-300 rounded animate-pulse mt-2"></div>

            {/* KOKO Payment Option Skeleton */}
            <div className="h-5 w-56 bg-gray-200 rounded animate-pulse mt-2"></div>

            {/* Product Name Skeleton */}
            <div className="h-9 w-3/4 bg-gray-300 rounded animate-pulse mt-3"></div>

            {/* Brand Skeleton */}
            <div className="h-5 w-32 bg-gray-300 rounded animate-pulse mt-2"></div>

            {/* Attributes Skeleton (Variable Product) */}
            <div className="mt-4 space-y-3">
              <div className="h-5 w-20 bg-gray-300 rounded animate-pulse"></div>
              <div className="flex gap-2 flex-wrap">
                <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>

            {/* Add to Cart Section Skeleton */}
            <div className="flex items-center gap-4 mt-6 md:mt-8">
              {/* Quantity Selector Skeleton */}
              <div className="h-12 w-32 bg-gray-200 rounded-full animate-pulse"></div>
              {/* Add to Cart Button Skeleton */}
              <div className="h-12 flex-1 bg-gray-300 rounded-full animate-pulse"></div>
            </div>

            {/* Product Description Accordion Skeleton */}
            <div className="mt-6 space-y-2">
              <div className="h-12 w-full bg-gray-200 rounded animate-pulse"></div>
              <div className="h-12 w-full bg-gray-200 rounded animate-pulse"></div>
            </div>

            {/* Categories Skeleton */}
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-2">
              <div className="h-5 w-20 bg-gray-300 rounded animate-pulse"></div>
              <div className="h-8 w-24 bg-gray-200 rounded-md animate-pulse"></div>
              <div className="h-8 w-24 bg-gray-200 rounded-md animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Product Overview Skeleton */}
        <div className="bg-white p-5 rounded-3xl md:p-10 my-5">
          <div className="pb-3 border-b-2 border-gray-200">
            <div className="h-6 w-24 bg-gray-300 rounded animate-pulse"></div>
          </div>
          <div className="flex flex-col md:flex-row py-2 md:py-5 mt-4">
            <div className="md:w-3/5 p-2 md:p-4 space-y-3">
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="md:w-2/5 p-2 md:p-4">
              <div className="space-y-2">
                <div className="h-5 w-full bg-gray-200 rounded animate-pulse"></div>
                <div className="h-5 w-full bg-gray-200 rounded animate-pulse"></div>
                <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Skeleton (Mobile only) */}
        <div className="lg:hidden w-full p-3 bg-white rounded-3xl my-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="h-24 bg-gray-200 rounded-2xl animate-pulse"></div>
            <div className="h-24 bg-gray-200 rounded-2xl animate-pulse"></div>
          </div>
        </div>

        {/* Upsell Products Skeleton */}
        <div className="mt-5 md:mt-10">
          <div className="h-8 w-64 bg-gray-300 rounded animate-pulse mb-4"></div>
          <div className="flex gap-4 overflow-hidden">
            <div className="flex-shrink-0 w-48 h-64 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="flex-shrink-0 w-48 h-64 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="flex-shrink-0 w-48 h-64 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="flex-shrink-0 w-48 h-64 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoadingProduct;
