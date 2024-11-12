const CategoriesMenuSkeleton = () => {
    // This function creates placeholders to simulate the loading state for categories and subcategories
    const categoryPlaceholderCount = 6; // Assuming there are 6 categories in the UI
    const subcategoryPlaceholderCount = 5; // Assuming each category has 5 subcategories
  
    return (
      <div className="w-full bg-white md:w-[800px] lg:w-[800px] xl:w-[1200px] p-3 space-y-4">
        <div className="text-sm text-muted-foreground mb-2 w-full border-b pb-2 animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-1/4"></div>
        </div>
  
        <div className="flex flex-wrap space-x-6 p-3 pt-1 animate-pulse">
          {Array.from({ length: categoryPlaceholderCount }).map((_, categoryIndex) => (
            <div key={categoryIndex} className="w-1/4 mb-6">
              {/* Category Header Placeholder */}
              <div className="flex items-center mb-3">
                <div className="h-6 w-6 bg-slate-200 rounded-full mr-2"></div>
                <div className="h-5 bg-slate-200 rounded w-3/4"></div>
              </div>
  
              {/* Subcategory Placeholders */}
              {Array.from({ length: subcategoryPlaceholderCount }).map((_, subcategoryIndex) => (
                <div key={subcategoryIndex} className="mb-2">
                  <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  export default CategoriesMenuSkeleton;
  