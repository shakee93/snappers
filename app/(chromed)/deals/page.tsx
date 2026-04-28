import ArchiveLayout from "@/app/components/archive/ArchiveLayout";
import { Metadata } from "next";

const DEAL_FILTERS = {
  clearance: "clearance",
  offers: "bogo-offer",
} as const;

type DealsFilterKey = keyof typeof DEAL_FILTERS;

export const metadata: Metadata = {
  title: "Deals",
  description: "Browse clearance deals and BOGO free offers at GQ Mobiles.",
};

export default async function DealsPage(props: {
  searchParams: Promise<{ filter?: string | string[] }>;
}) {
  const searchParams = await props.searchParams;
  const rawFilter = searchParams.filter;
  const rawValues = Array.isArray(rawFilter)
    ? rawFilter
    : typeof rawFilter === "string"
    ? rawFilter.split(",")
    : [];

  const selectedTypes = (rawValues
    .map((v) => v.trim())
    .filter((v): v is DealsFilterKey => v === "clearance" || v === "offers")) as DealsFilterKey[];

  const uniqueSelectedTypes = Array.from(new Set(selectedTypes));
  const effectiveTypes = uniqueSelectedTypes.length > 0 ? uniqueSelectedTypes : (["clearance"] as DealsFilterKey[]);
  const dealTags = effectiveTypes.map((key) => DEAL_FILTERS[key]);

  return (
    <ArchiveLayout
      title="Deals"
      headingOverride="Deals"
      descriptionOverride="Explore clearance products and free offers in one place."
      filters
      dealsType={effectiveTypes}
      dealTags={dealTags}
    />
  );
}
