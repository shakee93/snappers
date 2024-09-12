'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import {useStore} from "@/store/store";
import {Next13ProgressBar} from "next13-progressbar";
import {PRICE_RANGE} from "@/app/components/Filters/PriceFilter";

export function NavigationEvents() {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const { pushNavigation, setSearch, syncCategories, syncBrands, synPriceRange } = useStore()

    useEffect(() => {
        pushNavigation(pathname);
        setSearch('')
        syncCategories([])
        syncBrands([])
        synPriceRange(PRICE_RANGE)
    }, [pathname, pushNavigation, setSearch, syncCategories, syncBrands, synPriceRange])

    useEffect(() => {
        const revalidate = searchParams.get('revalidate')
        if (revalidate === 'true') {
            const currentPath = pathname
            fetch(`/api/revalidate?path=${encodeURIComponent(currentPath)}`)
                .then(response => response.json())
                .then(data => {
                    console.log('Revalidation result:', data)
                })
                .catch(error => {
                    console.error('Revalidation error:', error)
                })
        }
    }, [pathname, searchParams])

    return <div>
        <Next13ProgressBar height="3px" color="#1b41b0" showOnShallow={true} options={{ showSpinner: false}} />
    </div>
}