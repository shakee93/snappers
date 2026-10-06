import { stripReviewHtml } from "@/lib/productReviews";
import { stripEmojis } from "@/lib/stripEmojis";

/** Turn Woo short description HTML into bullet lines for grocery-style PDPs. */
export function getShortDescriptionBullets(raw?: string | null): string[] {
  if (!raw?.trim()) return [];

  const html = raw.trim();
  const liRe = /<li[^>]*>([\s\S]*?)<\/li>/gi;
  const liBullets: string[] = [];
  let liMatch: RegExpExecArray | null;
  while ((liMatch = liRe.exec(html)) !== null) {
    const text = stripEmojis(stripReviewHtml(liMatch[1] ?? "")).trim();
    if (text) liBullets.push(text);
  }
  if (liBullets.length) return liBullets;

  const plain = stripEmojis(stripReviewHtml(html)).trim();
  if (!plain) return [];

  return plain
    .split(/\n+|•|·/)
    .map((line) => line.replace(/^[-–—]\s*/, "").trim())
    .filter(Boolean);
}
