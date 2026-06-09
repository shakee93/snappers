const LoadingSkeleton = () => {
    return (
        <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="animate-pulse flex items-center justify-between p-4 border-b border-gray-200">
                    <div className="flex">
                        <div className="bg-gray-300 h-24 w-32 rounded-md"></div>
                        <div className="ml-4 space-y-2">
                            <div className="bg-gray-300 h-4 w-36 rounded"></div>
                            <div className="bg-gray-300 h-4 w-24 rounded"></div>
                        </div>
                    </div>
                    <div className="bg-gray-300 h-6 w-20 rounded"></div>
                </div>
            ))}
        </div>
    );
};

export default LoadingSkeleton;
