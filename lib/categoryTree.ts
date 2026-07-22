/** Flat WP category shape used to build a parent → children tree. */
export type FlatCategoryNode = {
  databaseId?: number | null;
  parentDatabaseId?: number | null;
  slug?: string | null;
  name?: string | null;
  image?: {
    sourceUrl?: string | null;
    altText?: string | null;
  } | null;
};

export type CategoryTreeNode = FlatCategoryNode & {
  children: CategoryTreeNode[];
};

/**
 * Build a parent → children tree from a flat WPGraphQL category list.
 * WordPress uses `parentDatabaseId: 0` (or null) for roots.
 */
export function buildCategoryTree<T extends FlatCategoryNode>(
  categories: T[],
): CategoryTreeNode[] {
  const categoryMap = new Map<number, CategoryTreeNode>();
  const roots: CategoryTreeNode[] = [];

  for (const category of categories) {
    if (category.databaseId == null) continue;
    categoryMap.set(category.databaseId, {
      ...category,
      children: [],
    });
  }

  for (const category of categories) {
    if (category.databaseId == null) continue;

    const node = categoryMap.get(category.databaseId);
    if (!node) continue;

    const parentId = category.parentDatabaseId;
    const isRoot = parentId == null || parentId === 0;

    if (!isRoot) {
      const parent = categoryMap.get(parentId);
      if (parent) {
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    } else {
      roots.push(node);
    }
  }

  return roots;
}

/** Find a root (or nested) node by slug. */
export function findCategoryBySlug(
  nodes: CategoryTreeNode[],
  slug: string,
): CategoryTreeNode | undefined {
  for (const node of nodes) {
    if (node.slug === slug) return node;
    const nested = findCategoryBySlug(node.children, slug);
    if (nested) return nested;
  }
  return undefined;
}
