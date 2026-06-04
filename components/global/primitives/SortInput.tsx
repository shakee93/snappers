import { useSortBy } from "react-instantsearch";
import { useStore } from "@/store/store";
import { useEffect } from "react";

// Drives Typesense sort_by through the IS index-name convention. The
// Typesense adapter translates virtual indices like "product/sort/<field>:<dir>"
// into the corresponding sort_by parameter; setting sort_by on Configure does
// NOT work because the adapter only reads sort from the index name, not from
// Configure's searchParameters.
//
// SORT_BY_ITEMS is module-level so its identity is stable across renders.
// Inline `items: [...]` would make useSortBy hand back a fresh `refine`
// each render, which would re-fire the effect on every render.
const SORT_BY_ITEMS = [{ label: "Default", value: "product" }];

interface SortInputProps {
    // Sort id applied when the user hasn't picked one (store sort is empty).
    // Used by /new-arrivals to default to newest without writing ?sort= to the
    // URL — see InstantSearchWrapper for why store/URL seeding is avoided.
    defaultSort?: string;
}

const SortInput = ({ defaultSort = "" }: SortInputProps) => {
    const { refine } = useSortBy({ items: SORT_BY_ITEMS });
    const { sidebar } = useStore();

    const activeSort = sidebar.sort || defaultSort;

    useEffect(() => {
        refine(activeSort ? `product/sort/${activeSort}` : "product");
    }, [activeSort, refine]);

    return null;
};

export default SortInput;
