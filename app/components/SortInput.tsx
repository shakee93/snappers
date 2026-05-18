import { useSortBy } from "react-instantsearch";
import { useStore } from "@/store/store";
import { useEffect } from "react";

// Drives Typesense sort_by through the IS index-name convention. The
// Typesense adapter translates virtual indices like "product/sort/<field>:<dir>"
// into the corresponding sort_by parameter; setting sort_by on Configure does
// NOT work because the adapter only reads sort from the index name, not from
// Configure's searchParameters.
const SortInput = () => {
    const { refine } = useSortBy({
        items: [{ label: "Default", value: "product" }],
    });
    const { sidebar } = useStore();

    useEffect(() => {
        refine(sidebar.sort ? `product/sort/${sidebar.sort}` : "product");
    }, [sidebar.sort, refine]);

    return null;
};

export default SortInput;
