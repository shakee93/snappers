"use client";

import Link from "next/link";
import { ProductCategory } from "@/graphql/types/graphql";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { useMemo } from "react";
import { orderCollectionNavRoots } from "@/lib/collectionNavOrder";
import { getCategoryPath } from "@/lib/productUrl";
import {
  buildCategoryTree,
  type CategoryTreeNode,
} from "@/lib/categoryTree";

type NavCategoriesProps = {
  onClose: () => void;
  categories: ProductCategory[];
};

/** All-categories mega panel (3-column overview). Prefer CategoryMegaPanel for per-nav roots. */
export default function NavCategories({
  onClose,
  categories,
}: NavCategoriesProps) {
  const categoryTree = useMemo(
    () => buildCategoryTree(categories ?? []),
    [categories],
  );

  /** 3 columns, round-robin: 1→col1, 2→col2, 3→col3, 4→col1, … */
  const categoryColumns = useMemo(() => {
    const items = orderCollectionNavRoots(categoryTree);
    const columnCount = 3;
    const columns: CategoryTreeNode[][] = Array.from(
      { length: columnCount },
      () => [],
    );
    items.forEach((item, index) => {
      columns[index % columnCount].push(item);
    });
    return columns;
  }, [categoryTree]);

  return (
    <div
      className="w-full overflow-y-auto bg-white md:w-[800px] lg:w-[800px] xl:w-[1200px]"
      style={{ maxHeight: "calc(100vh - 200px)" }}
    >
      <div className="mb-2 w-full border-b pb-2 p-3 text-sm text-muted-foreground">
        <Link
          href="/c"
          className="flex items-center transition-colors duration-200 hover:text-blue-800 hover:underline"
        >
          <span>Browse all categories</span>
          <ArrowRight className="ml-1 h-4 w-4 group-hover:text-blue-500" />
        </Link>
      </div>

      <div className="flex w-full flex-col gap-6 p-3 pt-1 md:flex-row md:gap-8">
        {categoryColumns.map((columnItems, colIndex) => (
          <div
            key={`nav-col-${colIndex}`}
            className="flex min-w-0 flex-1 flex-col gap-y-2"
          >
            {columnItems.map((category) => (
              <div
                key={`category-${category.slug}`}
                className="category-group mb-2 min-w-0 rounded-md p-2 hover:bg-zinc-100"
              >
                <h3
                  className={`text-sm font-semibold ${
                    category.children.length > 0 ? "mb-2" : ""
                  }`}
                >
                  <Link
                    href={getCategoryPath(category.slug ?? "")}
                    className="flex items-center text-blue-950 hover:underline"
                    onClick={onClose}
                  >
                    {category.image?.sourceUrl ? (
                      <Image
                        src={category.image.sourceUrl}
                        alt={category.name ?? ""}
                        width={24}
                        height={24}
                        className="mr-1.5 h-6 w-6 rounded-full object-contain"
                      />
                    ) : (
                      <span className="mr-1.5 inline-block h-6 w-6 rounded-full bg-zinc-200" />
                    )}
                    <span className="max-w-[200px] truncate">
                      {category.name}
                    </span>
                  </Link>
                </h3>
                {category.children.length > 0 ? (
                  <ul className="space-y-1">
                    {category.children.map((child) => (
                      <li
                        key={`child-${child.slug}`}
                        className="ml-2.5"
                      >
                        <Link
                          href={getCategoryPath(child.slug ?? "")}
                          className="text-sm text-muted-foreground hover:text-primary"
                          onClick={onClose}
                        >
                          {child.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
