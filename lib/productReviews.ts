export type ProductReviewItem = {
  databaseId: number;
  content?: string | null;
  date?: string | null;
  author?: { node?: { name?: string | null } | null } | null;
};

export function stripReviewHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export function formatReviewDate(date: string): string {
  try {
    const normalized = date.includes("T") ? date : date.replace(" ", "T");
    return new Date(normalized).toLocaleDateString("en-LK", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return date;
  }
}
