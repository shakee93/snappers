import megaMenuConfig from "@/content/mega-menu.json";
import {
  buildCategoryTree,
  findCategoryBySlug,
  type CategoryTreeNode,
  type FlatCategoryNode,
} from "@/lib/categoryTree";
import {
  getBrowseFeatureImageForNavSlug,
  getBrowseNavSlugForCategory,
} from "@/lib/browseCategories";

export type MegaMenuConfig = {
  columns: number;
  showFeatureImage: boolean;
  shopAllLabel: string;
  slugAliases: Record<string, string[]>;
  includeSharedFrom: Record<string, string[]>;
  /** Map shared mid-level slugs → target mid-level slug families on Cat/Dog. */
  sharedCategoryMerge: Record<string, string[]>;
  /**
   * Preferred mid-level order per nav slug. Each entry is a list of slug
   * aliases (first match wins). Unlisted children keep API order at the end.
   */
  childOrder: Record<string, string[][]>;
  /**
   * Pin a mid-level group into the same column as another group
   * (e.g. Toys under Health & Wellness).
   */
  stackUnder: Record<
    string,
    { child: string[]; under: string[] }[]
  >;
  /** Swap two column indexes after layout (e.g. Cat middle ↔ right). */
  columnSwap?: Record<string, number[]>;
  /** Leaf categories to hide from mega-menu lists (slug/name aliases). */
  excludeLeaves?: string[][];
  featuredLinks: Record<string, { href: string; label: string }[]>;
  /** Header split mega menu — static promo images under `public/`. */
  featureImages?: Record<string, string>;
  /** Flat subcategory lists: max items per column before starting the next. */
  maxRowsPerColumn?: Record<string, number>;
};

export type MegaMenuPanelData = {
  navSlug: string;
  root: CategoryTreeNode;
  columns: CategoryTreeNode[][];
  featureImage?: string;
  featuredLinks: { href: string; label: string }[];
  shopAllHref: string;
  shopAllLabel: string;
};

/** Header category bar: simple stacked list when there are few subcategories. */
export const HEADER_COMPACT_MEGA_MENU_MAX_CHILDREN = 5;

/** Header: menu + feature image column when subcategory count is in this range. */
export const HEADER_SPLIT_MEGA_MENU_MAX_CHILDREN = 10;

export function isHeaderCompactMegaMenu(data: MegaMenuPanelData): boolean {
  return data.root.children.length < HEADER_COMPACT_MEGA_MENU_MAX_CHILDREN;
}

export function isHeaderSplitMegaMenu(data: MegaMenuPanelData): boolean {
  const count = data.root.children.length;
  return (
    count >= HEADER_COMPACT_MEGA_MENU_MAX_CHILDREN &&
    count < HEADER_SPLIT_MEGA_MENU_MAX_CHILDREN
  );
}

/** Wide multi-column panels only — compact/split/≤2 cols anchor under nav item. */
export const HEADER_VIEWPORT_CENTERED_MEGA_MENU_MIN_COLUMNS = 3;

export function isHeaderViewportCenteredMegaMenu(
  data: MegaMenuPanelData,
): boolean {
  if (isHeaderCompactMegaMenu(data) || isHeaderSplitMegaMenu(data)) {
    return false;
  }
  return data.columns.length >= HEADER_VIEWPORT_CENTERED_MEGA_MENU_MIN_COLUMNS;
}

function resolveMegaMenuFeatureImage(
  navSlug: string,
  root: CategoryTreeNode,
): string | undefined {
  if (!config.showFeatureImage) return undefined;

  const configured = config.featureImages?.[navSlug];
  if (configured) return configured;

  const browse = getBrowseFeatureImageForNavSlug(navSlug);
  if (browse) return browse;

  return root.image?.sourceUrl ?? undefined;
}

const config = megaMenuConfig as MegaMenuConfig;

/** Nav href (`/cat`) → canonical slug (`cat`). */
export function navHrefToSlug(href: string): string {
  return href.replace(/^\//, "").replace(/\/$/, "");
}

function slugMatches(navSlug: string, categorySlug: string): boolean {
  const aliases = config.slugAliases[navSlug] ?? [navSlug];
  return aliases.includes(categorySlug);
}

/** Resolve the WP root category for a main-nav slug. */
export function findMegaMenuRoot(
  categories: FlatCategoryNode[],
  navSlug: string,
  tree: CategoryTreeNode[] = buildCategoryTree(categories),
): CategoryTreeNode | undefined {
  const aliases = config.slugAliases[navSlug] ?? [navSlug];

  for (const alias of aliases) {
    const match = findCategoryBySlug(tree, alias);
    if (match) return match;
  }

  return tree.find((node) => {
    if (!node.slug) return false;
    return (
      slugMatches(navSlug, node.slug) ||
      getBrowseNavSlugForCategory(node.slug) === navSlug
    );
  });
}

/**
 * Distribute mid-level categories into columns (round-robin) so order is
 * preserved left→right, then down: 1 2 3 / 4 5 6.
 * Optional `stackUnder` rules move a group into another group's column.
 */
export function distributeMegaMenuColumns(
  children: CategoryTreeNode[],
  columnCount = config.columns,
  navSlug?: string,
): CategoryTreeNode[][] {
  if (children.length === 0) return [];

  // Shallow menus (Bird, Aquarium, …) — single vertical list, not a wide row.
  const isFlatList = children.every((child) => child.children.length === 0);

  if (isFlatList && navSlug) {
    const maxRows = config.maxRowsPerColumn?.[navSlug];
    if (maxRows != null && maxRows > 0 && children.length > maxRows) {
      const columnTotal = Math.ceil(children.length / maxRows);
      const columns: CategoryTreeNode[][] = Array.from(
        { length: columnTotal },
        () => [],
      );
      children.forEach((child, index) => {
        columns[Math.floor(index / maxRows)].push(child);
      });
      return columns.filter((column) => column.length > 0);
    }
  }

  const count = isFlatList
    ? 1
    : Math.max(1, Math.min(columnCount, children.length));
  const columns: CategoryTreeNode[][] = Array.from({ length: count }, () => []);

  children.forEach((child, index) => {
    columns[index % count].push(child);
  });

  const stackRules = navSlug ? config.stackUnder?.[navSlug] ?? [] : [];
  for (const rule of stackRules) {
    let fromCol = -1;
    let fromIndex = -1;
    let toCol = -1;

    for (let c = 0; c < columns.length; c++) {
      for (let i = 0; i < columns[c].length; i++) {
        const node = columns[c][i];
        if (
          fromCol === -1 &&
          rule.child.some((alias) => childMatchesAlias(node, alias))
        ) {
          fromCol = c;
          fromIndex = i;
        }
        if (
          toCol === -1 &&
          rule.under.some((alias) => childMatchesAlias(node, alias))
        ) {
          toCol = c;
        }
      }
    }

    if (fromCol === -1 || toCol === -1 || fromCol === toCol) continue;

    const [moved] = columns[fromCol].splice(fromIndex, 1);
    // Place directly under the anchor group.
    const underIndex = columns[toCol].findIndex((node) =>
      rule.under.some((alias) => childMatchesAlias(node, alias)),
    );
    columns[toCol].splice(underIndex + 1, 0, moved);
  }

  const swap = navSlug ? config.columnSwap?.[navSlug] : undefined;
  if (swap && swap.length >= 2) {
    const [a, b] = swap;
    if (columns[a] && columns[b]) {
      const tmp = columns[a];
      columns[a] = columns[b];
      columns[b] = tmp;
    }
  }

  return columns.filter((column) => column.length > 0);
}

function normalizeCategoryKey(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Match a mid-level node against a configured slug/name alias. */
function childMatchesAlias(
  child: CategoryTreeNode,
  alias: string,
): boolean {
  const aliasKey = normalizeCategoryKey(alias);
  if (!aliasKey) return false;

  if (child.slug && normalizeCategoryKey(child.slug) === aliasKey) {
    return true;
  }

  const nameKey = normalizeCategoryKey(child.name ?? "");
  if (!nameKey) return false;

  return (
    nameKey === aliasKey ||
    nameKey.endsWith(` ${aliasKey}`) ||
    nameKey.startsWith(`${aliasKey} `)
  );
}

/**
 * Sort mid-level children into the configured mega-menu order for a nav slug.
 * Unlisted children keep their relative API order at the end.
 */
export function orderMegaMenuChildren(
  children: CategoryTreeNode[],
  navSlug: string,
): CategoryTreeNode[] {
  const groups = config.childOrder[navSlug];
  if (!groups?.length) return children;

  const remaining = [...children];
  const ordered: CategoryTreeNode[] = [];

  for (const aliases of groups) {
    const index = remaining.findIndex((child) =>
      aliases.some((alias) => childMatchesAlias(child, alias)),
    );
    if (index === -1) continue;
    ordered.push(remaining[index]);
    remaining.splice(index, 1);
  }

  return [...ordered, ...remaining];
}

/** Whether a leaf should be hidden from mega-menu lists. */
function isExcludedLeaf(node: CategoryTreeNode): boolean {
  const groups = config.excludeLeaves ?? [];
  return groups.some((aliases) =>
    aliases.some((alias) => childMatchesAlias(node, alias)),
  );
}

/** Drop configured duplicate/unwanted leaf categories under each mid-level group. */
export function filterExcludedLeaves(
  children: CategoryTreeNode[],
): CategoryTreeNode[] {
  return children.map((child) => ({
    ...child,
    children: child.children.filter((leaf) => !isExcludedLeaf(leaf)),
  }));
}

/**
 * Find the Cat/Dog mid-level category that should receive a shared group
 * (e.g. shared `accessories` → `accessories-cat` / `accessories-dog`).
 */
function findMergeTarget(
  rootChildren: CategoryTreeNode[],
  sharedChild: CategoryTreeNode,
): CategoryTreeNode | undefined {
  const sharedSlug = sharedChild.slug ?? "";
  const configuredTargets = config.sharedCategoryMerge[sharedSlug] ?? [];

  for (const targetSlug of configuredTargets) {
    const match = rootChildren.find((child) => child.slug === targetSlug);
    if (match) return match;
  }

  const sharedKey = normalizeCategoryKey(sharedChild.name ?? sharedSlug);
  if (!sharedKey) return undefined;

  return rootChildren.find((child) => {
    const childKey = normalizeCategoryKey(child.name ?? child.slug ?? "");
    return (
      childKey === sharedKey ||
      childKey.endsWith(` ${sharedKey}`) ||
      childKey.includes(sharedKey)
    );
  });
}

function cloneCategoryNode(node: CategoryTreeNode): CategoryTreeNode {
  return {
    ...node,
    children: node.children.map(cloneCategoryNode),
  };
}

/**
 * Fold shared Cat & Dog mid-level groups into the matching Cat/Dog sections:
 * - Accessories children (Brushes, Food Bowl, Leash) → under Accessories
 * - Health & Wellness / Medicine → under those sections
 */
export function mergeSharedCategoriesIntoRoot(
  root: CategoryTreeNode,
  sharedRoots: CategoryTreeNode[],
): CategoryTreeNode {
  const mergedRoot = cloneCategoryNode(root);
  const seenChildSlugs = new Set(
    mergedRoot.children.flatMap((child) =>
      child.children
        .map((grand) => grand.slug)
        .filter((slug): slug is string => !!slug),
    ),
  );

  for (const sharedRoot of sharedRoots) {
    for (const sharedChild of sharedRoot.children) {
      const target = findMergeTarget(mergedRoot.children, sharedChild);
      if (!target) {
        // No matching section — keep as its own mid-level column.
        if (
          sharedChild.slug &&
          mergedRoot.children.some((child) => child.slug === sharedChild.slug)
        ) {
          continue;
        }
        mergedRoot.children.push(cloneCategoryNode(sharedChild));
        continue;
      }

      const incoming =
        sharedChild.children.length > 0
          ? sharedChild.children
          : [sharedChild];

      for (const node of incoming) {
        if (node.slug && seenChildSlugs.has(node.slug)) continue;
        // Don't nest the target category under itself.
        if (node.slug && node.slug === target.slug) continue;
        target.children.push(cloneCategoryNode(node));
        if (node.slug) seenChildSlugs.add(node.slug);
      }
    }
  }

  return mergedRoot;
}

function collectSharedRoots(
  tree: CategoryTreeNode[],
  navSlug: string,
): CategoryTreeNode[] {
  const sharedSlugs = config.includeSharedFrom[navSlug] ?? [];
  return sharedSlugs
    .map((slug) => findCategoryBySlug(tree, slug))
    .filter((node): node is CategoryTreeNode => !!node);
}

/** Build panel data for a nav item, or `null` when there is nothing to show. */
export function getMegaMenuPanelData(
  categories: FlatCategoryNode[],
  href: string,
): MegaMenuPanelData | null {
  const navSlug = navHrefToSlug(href);
  const tree = buildCategoryTree(categories);
  const root = findMegaMenuRoot(categories, navSlug, tree);
  if (!root?.slug) return null;

  const sharedRoots = collectSharedRoots(tree, navSlug);
  const displayRoot =
    sharedRoots.length > 0
      ? mergeSharedCategoriesIntoRoot(root, sharedRoots)
      : root;

  if (displayRoot.children.length === 0) return null;

  const orderedChildren = filterExcludedLeaves(
    orderMegaMenuChildren(displayRoot.children, navSlug),
  );
  const orderedRoot: CategoryTreeNode = {
    ...displayRoot,
    children: orderedChildren,
  };

  const shopAllLabel = config.shopAllLabel.replace(
    "{name}",
    root.name ?? navSlug,
  );

  return {
    navSlug,
    root: orderedRoot,
    columns: distributeMegaMenuColumns(orderedChildren, config.columns, navSlug),
    featureImage: resolveMegaMenuFeatureImage(navSlug, root),
    featuredLinks: config.featuredLinks[navSlug] ?? [],
    shopAllHref: `/${root.slug}`,
    shopAllLabel,
  };
}

/** Whether a main-nav item should render as a mega-menu trigger. */
export function navItemHasMegaMenu(
  categories: FlatCategoryNode[],
  href: string,
): boolean {
  return getMegaMenuPanelData(categories, href) != null;
}
