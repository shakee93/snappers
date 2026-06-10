import navCategoryPriority from "@/content/nav-category-priority.json";

/**
 * Priority order for collection nav (mega menu + BrandBar "All Categories").
 * Matches WooCommerce category slugs; each group is one slug (first match wins
 * that slot). The data lives in `content/nav-category-priority.json` so a fork
 * re-orders its nav without touching this logic.
 */
export const COLLECTION_NAV_PRIORITY_SLUG_GROUPS: readonly (readonly string[])[] =
  navCategoryPriority;

function slugInGroup(
  slug: string | null | undefined,
  group: readonly string[]
): boolean {
  if (!slug) return false;
  return (group as readonly string[]).includes(slug);
}

/** Prefer earlier slugs in the group (canonical before alias). */
function findIndexForSlugGroup<T extends { slug?: string | null }>(
  items: T[],
  group: readonly string[],
): number {
  for (const slug of group) {
    const index = items.findIndex((item) => item.slug === slug);
    if (index !== -1) return index;
  }
  return items.findIndex((item) => slugInGroup(item.slug, group));
}

function partitionBySlugGroups<T extends { slug?: string | null }>(
  items: T[],
  slugGroups: readonly (readonly string[])[]
): { front: T[]; rest: T[] } {
  const remaining = [...items];
  const front: T[] = [];

  for (const group of slugGroups) {
    const index = findIndexForSlugGroup(remaining, group);
    if (index !== -1) {
      front.push(remaining[index]);
      remaining.splice(index, 1);
    }
  }

  return { front, rest: remaining };
}

/** Mega menu: pinned order first, then remaining in original API order. */
export function orderCollectionNavRoots<T extends { slug?: string | null }>(
  items: T[],
  slugGroups: readonly (readonly string[])[] = COLLECTION_NAV_PRIORITY_SLUG_GROUPS
): T[] {
  const { front, rest } = partitionBySlugGroups(items, slugGroups);
  return [...front, ...rest];
}

/** All Categories dropdown: pinned order first, then everything else A–Z. */
export function orderCollectionNavForDropdown<
  T extends { slug?: string | null; name?: string | null },
>(
  items: T[],
  slugGroups: readonly (readonly string[])[] = COLLECTION_NAV_PRIORITY_SLUG_GROUPS
): T[] {
  const { front, rest } = partitionBySlugGroups(items, slugGroups);
  const sortedRest = [...rest].sort((a, b) =>
    (a.name ?? "").localeCompare(b.name ?? "")
  );
  return [...front, ...sortedRest];
}
