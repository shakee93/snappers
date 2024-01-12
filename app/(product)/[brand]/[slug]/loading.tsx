const LoadingBrands = () => {
  return (
    <div className="container py-10 lg:pb-24 lg:pt-10 ">
      <div className="w-full flex flex-col gap-5">
        <div className="">
          <div className="h-5 md:h-8 w-3/5 md:w-1/5 bg-gray-300 rounded-md animate-pulse"></div>
        </div>
        <div className="grid grid-row-3 md:grid-cols-3 gap-5">
          <div className="flex flex-col gap-5">
            <div className="h-56 md:h-80 w-full bg-gray-300 rounded-md animate-pulse"></div>
            <div className="grid grid-cols-3 gap-5">
              <div className="h-20 w-full bg-gray-300 rounded-md animate-pulse"></div>
              <div className="h-20 w-full bg-gray-300 rounded-md animate-pulse"></div>
              <div className="h-20 w-full bg-gray-300 rounded-md animate-pulse"></div>
            </div>
          </div>
          <div className=" w-full flex flex-col gap-5">
            <div className="h-8 w-11/12 bg-gray-300 rounded-md animate-pulse"></div>
            <div className="h-8 w-5/12 bg-gray-300 rounded-md animate-pulse"></div>
            <div className="flex gap-5">
                <div className="h-8 w-1/5 bg-gray-300 rounded-md animate-pulse"></div>
                <div className="h-8 w-1/5 bg-gray-300 rounded-md animate-pulse"></div>
            </div>
            <div className="h-8 w-8/12 bg-gray-300 rounded-md animate-pulse"></div>
            
          </div>
          <div className=" w-full grid grid-row-3 gap-5">
            <div className=" bg-gray-300 rounded-md animate-pulse h-20"></div>
            <div className=" bg-gray-300 rounded-md animate-pulse h-20"></div>
            <div className=" bg-gray-300 rounded-md animate-pulse h-20"></div>
            <div className=" bg-gray-300 rounded-md animate-pulse h-20"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingBrands;
