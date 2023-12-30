

const LoadingBrands = () => {

    const grid = 8;

    return <div className='container py-16 lg:pb-24 lg:pt-12 space-y-16 sm:space-y-20 lg:space-y-28'>
        <div className="w-full space-y-10 lg:space-y-14">
            <div className="space-y-3">
                <div className="h-10 bg-gray-300 rounded-md w-32 animate-pulse"></div>
                <div className='space-y-2'>
                    <div className="h-4 bg-gray-300 rounded-md w-2/4 animate-pulse"></div>
                    <div className="h-4 bg-gray-300 rounded-md w-1/4 animate-pulse"></div>
                </div>
            </div>

            <hr className="border-slate-200 dark:border-slate-700"/>

            <div className='space-y-8'>
                <div className='flex justify-between'>
                    <div className='flex gap-2'>
                        <div className="h-10 bg-gray-300 rounded-full w-32 animate-pulse"></div>
                        <div className="h-10 bg-gray-300 rounded-full w-32 animate-pulse"></div>
                        <div className="h-10 bg-gray-300 rounded-full w-32 animate-pulse"></div>
                        <div className="h-10 bg-gray-300 rounded-full w-32 animate-pulse"></div>
                    </div>
                    <div>
                        <div className="h-10 bg-gray-300 rounded-full w-32 animate-pulse"></div>
                    </div>
                </div>
                <div className="grid grid-cols-4 gap-x-8 gap-y-10 mt-6">

                    {Array(grid).fill(null).map((x, index) =>
                        <div key={index} className="space-y-3">
                            <div className="h-48 bg-gray-200 rounded-md animate-pulse"></div>
                            <div className="h-4 bg-gray-300 rounded-md"></div>
                            <div className="h-4 bg-gray-300 rounded-md w-2/3"></div>
                            <div className="h-8 bg-gray-300 rounded-md w-1/4"></div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    </div>
}

export default LoadingBrands