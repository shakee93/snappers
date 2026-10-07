import { getClient } from "@/graphql/apollo-ssr";
import { GET_ALL_CATEGORIES_WITH_HIERARCHY } from "@/graphql/defs/products";
import {
  buildCategoryTree,
  type CategoryTreeNode,
  type FlatCategoryNode,
} from "@/lib/categoryTree";
import { orderCollectionNavRoots } from "@/lib/collectionNavOrder";
import { getCategoryPath } from "@/lib/productUrl";
import ShopCategoriesPromoBanner from "@/components/global/ShopCategoriesPromoBanner";
import Link from "next/link";
import { Metadata } from "next";
import { siteConfig } from "@/site.config";

export const revalidate = 1800;

export const metadata: Metadata = {
  title: "All Categories",
  description: `Browse every category at ${siteConfig.brand.name} — cat, dog, bird, and aquarium food, health products, and accessories.`,
};

type CategoryNode = FlatCategoryNode & { count?: number | null };

type CategoriesQueryResult = {
  productCategories: {
    nodes: CategoryNode[];
  };
};

async function getData() {
  const { data } = await getClient().query<CategoriesQueryResult>({
    query: GET_ALL_CATEGORIES_WITH_HIERARCHY,
  });

  return {
    productCategories: data.productCategories.nodes,
  };
}

type CategoryTreeNodeWithCount = CategoryTreeNode & { count?: number | null };

function totalCount(node: CategoryTreeNodeWithCount): number {
  const own = node.count ?? 0;
  return node.children.reduce(
    (sum, child) => sum + totalCount(child as CategoryTreeNodeWithCount),
    own,
  );
}

const Page = async () => {
  const { productCategories } = await getData();

  const tree = buildCategoryTree(productCategories) as CategoryTreeNodeWithCount[];

  const roots = orderCollectionNavRoots(tree)
    .filter((root) => totalCount(root) > 0)
    .map((root) => ({
      ...root,
      children: [...root.children]
        .filter((child) => ((child as CategoryTreeNodeWithCount).count ?? 0) > 0)
        .sort((a, b) => (a.name ?? "").localeCompare(b.name ?? "")),
    }));

  return (
    <div>
      <ShopCategoriesPromoBanner />
      <div className="container space-y-16 pt-4 pb-8 sm:space-y-20 lg:space-y-28 lg:pt-4 lg:pb-12">
        <div className="space-y-4 lg:space-y-14">
          <h1 className="sr-only">Browse Categories</h1>
          <main>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
              {roots.map((root) => (
                <section key={root.slug ?? root.databaseId} className="min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">
                    <Link
                      href={getCategoryPath(root.slug ?? "")}
                      className="hover:underline"
                    >
                      {root.name}
                      {root.count ? (
                        <span className="ml-1.5 text-sm font-normal text-neutral-500">
                          ({root.count})
                        </span>
                      ) : null}
                    </Link>
                  </h3>
                  {root.children.length > 0 && (
                    <ul className="space-y-1.5 pl-1 border-l border-slate-200 dark:border-slate-700">
                      {root.children.map((child) => (
                        <li key={child.slug ?? child.databaseId} className="pl-3">
                          <Link
                            href={getCategoryPath(child.slug ?? "")}
                            className="text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                          >
                            {child.name}
                            {(child as CategoryTreeNodeWithCount).count ? (
                              <span className="ml-1 text-xs text-neutral-400">
                                ({(child as CategoryTreeNodeWithCount).count})
                              </span>
                            ) : null}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Page;
