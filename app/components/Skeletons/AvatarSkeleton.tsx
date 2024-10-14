
const AvatarSkeleton = () => {
    return (
      <div className="animate-pulse flex space-x-4 items-center justify-center">
        <div className="rounded-full bg-slate-200 h-10 w-10 sm:h-8 sm:w-8"></div>
        <div className="flex-1 space-y-4 py-1">
          <div className="h-4 bg-slate-200 rounded w-3/4"></div>
          <div className="h-4 bg-slate-200 rounded w-1/4"></div>
        </div>
      </div>
    );
  };
  

export default AvatarSkeleton;