"use client";
import { useQuery } from "@apollo/client";
import { GET_NAV_CATEGORIES } from "@/graphql/defs/nav";
import Link from "next/link";
import { ProductCategory } from "@/graphql/types/graphql";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import CategoriesMenuSkeleton from "../../Skeletons/CategorySkeleton";
import { useMemo } from "react";

type NavCategoriesProps = {
  onClose: () => void;
};

type CategoryWithChildren = Omit<ProductCategory, 'children'> & {
  children?: ProductCategory[];
};

export default function NavCategories({ onClose }: NavCategoriesProps) {
  const { data, loading, error } = useQuery(GET_NAV_CATEGORIES);

  const flatCategories: ProductCategory[] = data?.productCategories?.nodes || [];

  // Build parent-child tree structure from flat categories
  const buildCategoryTree = (
    categories: ProductCategory[]
  ): CategoryWithChildren[] => {
    // Create a map for quick lookup
    const categoryMap = new Map<number, CategoryWithChildren>();
    const rootCategories: CategoryWithChildren[] = [];

    // First pass: create all category objects
    categories.forEach((category) => {
      if (category.databaseId != null) {
        categoryMap.set(category.databaseId, {
          ...category,
          children: [] as ProductCategory[],
        });
      }
    });

    // Second pass: build parent-child relationships
    categories.forEach((category) => {
      if (category.databaseId == null) return;

      const categoryWithChildren = categoryMap.get(category.databaseId);
      if (!categoryWithChildren) return;

      // If category has a parent, add it to parent's children
      if (category.parentDatabaseId != null) {
        const parent = categoryMap.get(category.parentDatabaseId);
        if (parent && parent.children) {
          // Push the category without the children override to avoid type issues
          const { children: _, ...categoryWithoutChildren } = categoryWithChildren;
          parent.children.push(categoryWithoutChildren as ProductCategory);
        }
      } else {
        // Root category (no parent)
        rootCategories.push(categoryWithChildren);
      }
    });

    return rootCategories;
  };

  const categoryTree = useMemo(
    () => buildCategoryTree(flatCategories),
    [flatCategories]
  );

  const prioritizeCategory = (
    items: CategoryWithChildren[],
    slugToPrioritize: string
  ): CategoryWithChildren[] => {
    const prioritizedCategory = items.find(
      (item) => item.slug === slugToPrioritize
    );
    const otherCategories = items.filter(
      (item) => item.slug !== slugToPrioritize
    );
    return prioritizedCategory
      ? [prioritizedCategory, ...otherCategories]
      : items;
  };

  const prioritizedCategories = prioritizeCategory(
    categoryTree,
    "mobiles-and-tablets"
  );

  // Function to split categories into columns
  const splitIntoColumns = (
    items: CategoryWithChildren[],
    columnCount: number
  ): CategoryWithChildren[][] => {
    const columns: CategoryWithChildren[][] = Array.from(
      { length: columnCount },
      () => []
    );
    items.forEach((item, index) => {
      columns[index % columnCount].push(item);
    });
    return columns;
  };

  const columnCount = 3;

  return (
    <div
      className="w-full bg-white md:w-[800px] lg:w-[800px] xl:w-[1200px] overflow-y-auto"
      style={{ maxHeight: "calc(100vh - 200px)" }}
    >
      <div className="text-sm p-3 text-muted-foreground mb-2 w-full border-b pb-2">
        <Link
          href="/collections"
          className="flex items-center hover:underline hover:text-blue-800 transition-colors duration-200"
        >
          <span>Browse all collections</span>
          <ArrowRight className="ml-1 h-4 w-4 group-hover:text-blue-500" />
        </Link>
      </div>

      <div className="flex space-x-6 p-3 pt-1">
        {loading ? (
          <div className="flex-1">
            {/* <p>Loading categories...</p> */}
            <CategoriesMenuSkeleton />
          </div>
        ) : error ? (
          <div className="flex-1">
            <p>Error loading categories</p>
          </div>
        ) : (
          splitIntoColumns(prioritizedCategories, columnCount).map(
            (column, colIndex) => (
              <div key={`column-${colIndex}`} className="flex-1">
                {column.map((category) => (
                  <div
                    key={`category-${category.slug}`}
                    className="category-group mb-2 p-2 hover:bg-zinc-100 rounded-md"
                  >
                    <h3
                      className={`text-sm font-semibold ${category.children && category.children.length > 0
                        ? "mb-2"
                        : ""
                        }`}
                    >
                      <Link
                        href={`/collections/${category.slug}`}
                        className="text-blue-950 hover:underline flex items-center"
                        onClick={onClose}
                      >
                        {category.image?.sourceUrl ? (
                          <Image
                            src={category.image.sourceUrl}
                            alt={category.name ?? ""}
                            width={24}
                            height={24}
                            className="rounded-full w-6 h-6 mr-1.5 object-contain"
                          />
                        ) : (
                          <span className="inline-block bg-zinc-200 rounded-full w-6 h-6 mr-1.5"></span>
                        )}
                        <span className="truncate max-w-[200px]">
                          {category.name}
                        </span>
                      </Link>
                    </h3>
                    {category.children && category.children.length > 0 && (
                      <ul className="space-y-1">
                        {category.children.map((child: ProductCategory) => (
                          <li key={`child-${child.slug}`} className="ml-2.5">
                            <Link
                              href={`/collections/${child.slug}`}
                              className="text-sm text-muted-foreground hover:text-primary"
                              onClick={onClose}
                            >
                              {child.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )
          )
        )}
      </div>
    </div>
  );
}
