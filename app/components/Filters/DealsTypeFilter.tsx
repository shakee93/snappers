"use client";

import Checkbox from "@/shared/Checkbox/Checkbox";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type DealsTypeFilterProps = {
  activeTypes: ("clearance" | "offers")[];
};

const DealsTypeFilter = ({ activeTypes }: DealsTypeFilterProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const router = useRouter();

  const handleToggle = (type: "clearance" | "offers", checked: boolean) => {
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
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default DealsTypeFilter;
