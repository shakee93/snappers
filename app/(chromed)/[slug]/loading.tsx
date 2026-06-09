const LoadingProduct = () => {
  return (
    <div className="mt-5 md:mt-10">
      <main className="flex flex-col px-3 sm:container sm:max-w-screen-2xl">
        <div className="md:mt-0 text-sm md:px-5 md:text-[0.95rem] md:ml-4">
          <div className="h-4 w-48 bg-gray-300 rounded animate-pulse"></div>
        </div>

        <div className="flex flex-col md:flex-row p-3 rounded-3xl mt-5 md:mt-3 md:p-6 md:py-6 bg-white">
          <div className="w-full md:w-6/12 flex-col gap-6 md:pr-10">
            <div className="min-h-[272px] md:min-h-[576px] w-full bg-gray-300 rounded-2xl animate-pulse"></div>
          </div>

          <div className="md:w-6/12 flex flex-col p-2 gap-y-1 md:gap-y-1.5 mt-5 md:mt-0">
            <div className="h-8 w-40 bg-gray-300 rounded animate-pulse mt-2"></div>
            <div className="h-9 w-3/4 bg-gray-300 rounded animate-pulse mt-3"></div>
            <div className="h-12 flex-1 bg-gray-300 rounded-full animate-pulse mt-6"></div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoadingProduct;
