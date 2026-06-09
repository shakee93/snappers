

const ProductCardLoading = () => {

    return <div className="space-y-3">
        <div className="relative h-[185px] md:h-60 w-full bg-gray-200 rounded-xl animate-pulse">
            <div className="absolute h-12 w-12 bg-gray-300 rounded-full animate-pulse bottom-3 right-3 " ></div>
        </div>
        <div className='space-y-2'>
            <div className="h-4 bg-gray-300 rounded-md"></div>
            <div className="h-4 bg-gray-300 rounded-md w-2/3"></div>
        </div>
        <div className="h-7 bg-gray-300 rounded-md w-1/4"></div>
    </div>
}

export default ProductCardLoading