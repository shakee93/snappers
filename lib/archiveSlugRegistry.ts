import navCategoryPriority from "@/content/nav-category-priority.json";
import { siteConfig } from "@/site.config";

type ArchiveSlugListener = () => void;

const listeners = new Set<ArchiveSlugListener>();

function hrefToSlug(href: string): string {
  return href.replace(/^\//, "").split("/")[0] ?? "";
}

const seededSlugs = [
  ...siteConfig.navigation.main.map((item) => hrefToSlug(item.href)),
  ...navCategoryPriority.flat(),
];

const archiveSlugs = new Set(seededSlugs.filter(Boolean));
let snapshot = archiveSlugs.size;

function emit() {
  snapshot += 1;
  listeners.forEach((listener) => listener());
}

function addArchiveSlugs(slugs: Array<string | null | undefined>): boolean {
  let changed = false;

  for (const slug of slugs) {
    if (!slug) continue;
    const normalized = hrefToSlug(slug);
    if (!normalized || archiveSlugs.has(normalized)) continue;
    archiveSlugs.add(normalized);
    changed = true;
  }

  return changed;
}

export function registerArchiveSlugs(
  slugs: Array<string | null | undefined>,
): void {
  if (addArchiveSlugs(slugs)) emit();
}

export function isRegisteredArchiveSlug(slug: string): boolean {
  return archiveSlugs.has(hrefToSlug(slug));
}

export function subscribeArchiveSlugs(listener: ArchiveSlugListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getArchiveSlugSnapshot(): number {
  return snapshot;
}
