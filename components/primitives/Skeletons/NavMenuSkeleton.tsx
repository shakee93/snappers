const NavMenuSkeleton = () => {
  // This function creates an array with placeholders to simulate multiple brands loading
  const brandsPlaceholderCount = 32; // Assuming there are 32 brands in the UI

  return (
    <div className="w-full bg-white md:w-[800px] lg:w-[800px] xl:w-[1200px] p-3 space-y-4">
      <div className="text-sm text-muted-foreground mb-2 w-full border-b pb-2 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/4"></div>
      </div>

      <div className="flex flex-wrap space-x-6 p-3 pt-1 animate-pulse">
        {Array.from({ length: brandsPlaceholderCount }).map((_, index) => (
          <div key={index} className="w-1/4 flex items-center mb-4">
            {/* Logo Placeholder */}
            <div className="rounded-full bg-slate-200 h-10 w-10 mr-2"></div>

            {/* Brand Name Placeholder */}
            <div className="h-4 bg-slate-200 rounded w-2/4"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NavMenuSkeleton;
