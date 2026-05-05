"use client";

import Checkbox from "@/shared/Checkbox/Checkbox";
import { ChevronDown } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

type DealFilterType = "clearance" | "offers" | "free-shipping";

type DealsTypeFilterProps = {
  // SSR default — mirrors what the deals page passes when there's no
  // `?filter=` in the URL. After hydration we read the URL directly so
  // tab clicks toggle the active state without needing the page itself
  // to re-render (the page is intentionally static for edge caching).
  activeTypes: DealFilterType[];
};

const VALID_FILTER_TYPES: DealFilterType[] = ["clearance", "offers", "free-shipping"];

const DealsTypeFilter = ({ activeTypes: defaultActiveTypes }: DealsTypeFilterProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTypes = useMemo<DealFilterType[]>(() => {
    const raw = searchParams.get("filter");
    if (!raw) return defaultActiveTypes;
    const parsed = raw
      .split(",")
      .map((v) => v.trim())
      .filter((v): v is DealFilterType => VALID_FILTER_TYPES.includes(v as DealFilterType));
    return parsed.length > 0 ? Array.from(new Set(parsed)) : defaultActiveTypes;
  }, [searchParams, defaultActiveTypes]);

  const handleToggle = (type: DealFilterType, checked: boolean) => {
    const current = new Set(activeTypes);
    if (checked) {
      current.add(type);
    } else {
      current.delete(type);
    }

    const next = Array.from(current);
    const query = next.length > 0 ? `?filter=${next.join(",")}` : "";
    router.push(`/deals${query}`);
  };

  return (
    <div className="w-full bg-white rounded-xl border border-neutral-200 dark:border-neutral-700">
      <div className="relative flex flex-col w-full px-4 py-3 space-y-3">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="font-medium flex gap-2 items-center justify-between w-full text-left hover:opacity-80 transition-opacity text-sm"
          type="button"
        >
          <span>Deals type</span>
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${
              isCollapsed ? "rotate-180" : ""
            }`}
          />
        </button>

        {!isCollapsed ? (
          <div className="space-y-3">
            <Checkbox
              name="deals-clearance"
              label="Clearance"
              defaultChecked={activeTypes.includes("clearance")}
              onChange={(checked) => handleToggle("clearance", checked)}
            />

            <Checkbox
              name="deals-offers"
              label="Buy one Get one"
              defaultChecked={activeTypes.includes("offers")}
              onChange={(checked) => handleToggle("offers", checked)}
            />

            <Checkbox
              name="deals-free-shipping"
              label="Free Shipping"
              defaultChecked={activeTypes.includes("free-shipping")}
              onChange={(checked) => handleToggle("free-shipping", checked)}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default DealsTypeFilter;
