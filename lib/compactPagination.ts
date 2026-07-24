export type CompactPageItem = number | "ellipsis";

/**
 * Build a short page list: `1 … 7 8 9 … 17`.
 * Shows every page when total is small enough to fit.
 */
export function getCompactPageItems(
  currentPage: number,
  totalPages: number,
  siblingCount = 1,
): CompactPageItem[] {
  if (totalPages <= 0) return [];
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const current = Math.min(Math.max(currentPage, 1), totalPages);
  const left = Math.max(2, current - siblingCount);
  const right = Math.min(totalPages - 1, current + siblingCount);

  const items: CompactPageItem[] = [1];

  if (left > 2) items.push("ellipsis");

  for (let page = left; page <= right; page++) {
    items.push(page);
  }

  if (right < totalPages - 1) items.push("ellipsis");

  items.push(totalPages);

  return items;
}
