import {useInstantSearch, useSearchBox} from "react-instantsearch";
import {Search} from "lucide-react";
import {useStore} from "@/store/store";
import {useEffect} from "react";


const SearchInput = ({ show = true } : { show?: boolean}) => {
    const {
        query,
        refine,
        clear,
    } = useSearchBox();

    const { search } = useStore()

    useEffect(() => {
        refine(search)
    }, [search])

    if (!show) {
        return <></>
    }


    return  <form
        className="flex-1 text-primary-700"
    >
        <div className="bg-primaryColor/5 border border-primaryColor/20 py-2 flex items-center space-x-1.5 px-5 rounded-2xl h-full ">
            <Search className='text-primaryColor' />
            <input
                type="text"
                placeholder="Type to Quick Search"
                defaultValue={query}
                onChange={e => refine(e.target.value)}
                className="border-none bg-transparent focus:outline-none focus:ring-0 w-full text-sm"
                autoFocus
            />
        </div>
        <input type="submit" hidden value="" />
    </form>;
}

export default SearchInput