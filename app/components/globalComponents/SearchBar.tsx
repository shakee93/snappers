'use client'
import {ChevronLeft, Loader, Search, XIcon} from "lucide-react";
import HeaderSearchResults from "@/app/components/globalComponents/HeaderSearchResults";
import {Brand, ProductCategory} from "@/graphql/types/graphql";
import {useStore} from "@/store/store";
import {useRouter} from "next/navigation";
import {useEffect} from "react";
import {usePathname} from "next/navigation";


const SearchBar = () => {

    const { search, setSearch, search_status } = useStore()

    const router = useRouter()
    const path = usePathname()

    return <div className='flex-1 flex items-center gap-1'>

        {path !== '/' &&
            <button onClick={e => router.back()} className='w-12 h-12 flex items-center justify-center'>
                <ChevronLeft className='text-white w-8'/>
            </button>
        }

        <form
            className="text-primary-700 flex-1"
        >
            <div className="bg-white lg:bg-primaryColor/5 border border-primaryColor/20 py-1 md:py-2 flex items-center space-x-1.5 px-5 rounded-lg lg:rounded-2xl h-full ">
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
                    className="border-none bg-transparent focus:outline-none focus:ring-0 w-full text-[16px]"
                    autoFocus
                />
            </div>
            <input type="submit" hidden value="" />
        </form>
    </div>
}

export default SearchBar