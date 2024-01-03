import {useSortBy} from "react-instantsearch";
import {useStore} from "@/store/store";
import {useEffect} from "react";


const SortInput = () => {
    const {
        initialIndex,
        currentRefinement,
        options,
        refine,
        canRefine,
    } = useSortBy({
        items: [
            { label: "Default", value: "product" },
        ]
    });
    const { sidebar } = useStore()


    useEffect(() => {
        refine(`product/sort/${sidebar.sort}`)
    }, [sidebar.sort])

    return <></>
}

export default SortInput