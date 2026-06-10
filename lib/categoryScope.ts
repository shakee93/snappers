/** Minimal category node shape for flattening nested WPGraphQL children. */
export type CategoryTreeNode = {
  databaseId?: number | null;
  children?: { nodes?: (CategoryTreeNode | null)[] | null } | null;
};

/** Collect every descendant databaseId from a nested category tree. */
export const flattenCategoryDescendantIds = (
  nodes: (CategoryTreeNode | null)[] | null | undefined,
): number[] => {
  const ids: number[] = [];

  for (const node of nodes ?? []) {
    if (!node?.databaseId) continue;
    ids.push(node.databaseId);
    ids.push(...flattenCategoryDescendantIds(node.children?.nodes));
  }

  return ids;
};

/** Parent category plus all nested subcategory IDs for product archive filters. */
export const buildCategoryScopeIds = (
  parentId: number,
  nestedNodes: (CategoryTreeNode | null)[] | null | undefined,
): number[] => [parentId, ...flattenCategoryDescendantIds(nestedNodes)];
