'use client'
import { ChevronLeft, Loader, Search, XIcon } from "lucide-react";
import HeaderSearchResults from "@/app/components/globalComponents/HeaderSearchResults";
import { Brand, ProductCategory } from "@/graphql/types/graphql";
import { useStore } from "@/store/store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { usePathname } from "next/navigation";


const SearchBar = () => {

    const { search, setSearch, search_status } = useStore()

    const router = useRouter()
    const path = usePathname()


    useEffect(() => {
        setSearch('');
    }, [path])

    return <div className='flex-1 flex items-center gap-1'>
        {path !== '/' &&
            <button onClick={e => router.back()} className='hidden md:hidden w-10 h-10 flex items-center justify-center'>
                <ChevronLeft className='text-white w-8' />
            </button>
        }

        <div
            className="text-primary-700 flex-1"
        >
            <div className="bg-white border-2 lg:border border-primaryColor/20 py-0 md:py-1 flex
            items-center space-x-0 lg:space-x-1.5 px-3 md:px-5 rounded-md md:rounded-[25px] h-full ">
                {
                    (search_status === 'stalled' || search_status === 'loading') ? <Loader className='text-primaryColor animate-spin' /> : search.length > 0 ?
                        <button onClick={e => setSearch("")}>
                            <XIcon className='text-primaryColor' />
                        </button>
                        : <Search className='text-primaryColor' />
                }
                <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    type="text"
                    placeholder="Type to Quick Search"
                    className="border-none focus:border-none focus:outline-none focus:ring-0 bg-transparent w-full text-sm"
                />
            </div>
        </div>
    </div>
}

export default SearchBar