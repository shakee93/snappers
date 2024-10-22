import {useSortBy} from "react-instantsearch";
import {useStore} from "@/store/store";
import {useEffect} from "react";

const SortInput = () => {
    const { initialIndex, currentRefinement, options, refine, canRefine } = useSortBy({
        items: [
            { label: "Default", value: "product" },
            { label: "Price", value: "product/sort/price" },
            { label: "Rating", value: "product/sort/rating" },
        ]
    });
    
    const { sidebar } = useStore();

    useEffect(() => {
        const sortValue = `product/sort/${sidebar.sort}`;
        if (options.some(option => option.value === sortValue)) {
            refine(sortValue);
        } else {
            console.warn(`Invalid sort value: ${sortValue}`);
        }
    }, [sidebar.sort, options, refine]);

    return <></>;
}

export default SortInput;
