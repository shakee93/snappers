import {
  Bone,
  Cat,
  Cross,
  Cuboid,
  HeartPulse,
  LayoutGrid,
  type LucideIcon,
  PawPrint,
  Pill,
  ShoppingBag,
  ToyBrick,
} from "lucide-react";
import type { CategoryTreeNode } from "@/lib/categoryTree";

function normalizeKey(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Lucide fallback when a WP category image isn't available. */
export function getMegaMenuCategoryIcon(
  category: CategoryTreeNode,
): LucideIcon {
  const key = normalizeKey(`${category.slug ?? ""} ${category.name ?? ""}`);

  if (key.includes("food")) return Bone;
  if (key.includes("vitamin")) return Pill;
  if (key.includes("litter")) return Cuboid;
  if (key.includes("accessories") || key.includes("accessory")) {
    return ShoppingBag;
  }
  if (key.includes("medicine") || key.includes("supplement")) return Pill;
  if (key.includes("health") || key.includes("wellness")) return HeartPulse;
  if (key.includes("toy")) return ToyBrick;
  if (key.includes("bird")) return PawPrint;
  if (key.includes("aquarium") || key.includes("fish")) return LayoutGrid;
  if (key.includes("rabbit") || key.includes("hamster")) return Cat;
  if (key.includes("care") || key.includes("groom")) return Cross;

  return LayoutGrid;
}
