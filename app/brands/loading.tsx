import ArchiveLoading from "@/app/components/archive/ArchiveLoading";


const LoadingBrands = () => {

    const list = 40;

    return <div className='container py-8 lg:py-12 space-y-16 sm:space-y-20 lg:space-y-28'>
        <div className="w-full space-y-4 lg:space-y-14">
            <div className="space-y-3">
                <div className="h-10 bg-gray-300 rounded-md w-32 animate-pulse"></div>
                <div className='space-y-2'>
                    <div className="h-4 bg-gray-300 rounded-md  w-full  md:w-2/4 animate-pulse"></div>
                    <div className="h-4 bg-gray-300 rounded-md w-3/4 md:w-1/4 animate-pulse"></div>
                </div>
            </div>

            <hr className="border-slate-200 dark:border-slate-700"/>

            <div className='space-y-8'>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-3 gap-y-4 mt-6">

                    {Array(list).fill(null).map((x, index) =>
                        <div key={index} className="space-y-1">
                            <div className="h-6 bg-gray-300 rounded-md w-2/3"></div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    </div>
}

export default LoadingBrands