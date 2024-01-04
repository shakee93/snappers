'use client'
import {Loader, Search, XIcon} from "lucide-react";
import HeaderSearchResults from "@/app/components/globalComponents/HeaderSearchResults";
import {Brand, ProductCategory} from "@/graphql/types/graphql";
import {useStore} from "@/store/store";
import {useRouter} from "next/router";
import {useEffect} from "react";
import {usePathname} from "next/navigation";


const SearchBar = () => {

    const router = usePathname()

    const { search, setSearch, search_status } = useStore()


    useEffect(() => {
        setSearch('')
    }, [router])

    return <div className='flex-1'>
        <form
            className=" text-primary-700"
        >
            <div className="bg-primaryColor/5 border border-primaryColor/20 py-2 flex items-center space-x-1.5 px-5 rounded-2xl h-full ">
                {
                    (search_status === 'stalled' || search_status === 'loading') ? <Loader className='text-primaryColor animate-spin'/> : search.length > 0 ?
                        <button onClick={e => setSearch("")}>
                            <XIcon className='text-primaryColor'/>
                        </button>
                        : <Search className='text-primaryColor' />
                }
                <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    type="text"
                    placeholder="Type to Quick Search"
                    className="border-none bg-transparent focus:outline-none focus:ring-0 w-full text-sm"
                    autoFocus
                />
            </div>
            <input type="submit" hidden value="" />
        </form>
    </div>
}

export default SearchBar