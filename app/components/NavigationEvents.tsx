'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { useStore } from "@/store/store";
import NextTopLoader from "nextjs-toploader";
import { PRICE_RANGE } from "@/app/components/Filters/PriceFilter";
import { toast } from 'sonner';

// Custom toast function for revalidation messages 
const revalidationToast = (message: string, type: 'success' | 'error') => {
    toast[type](message, {
        position: 'top-center',
        className: '',
    });

};

export function NavigationEvents() {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const { pushNavigation, setSearch, syncCategories, syncBrands, synPriceRange, clearVariations } = useStore()

    useEffect(() => {
        pushNavigation(pathname);
        // Only reset filters when navigating to a completely different page, not when URL params change
        setSearch('')
        syncCategories([])
        syncBrands([])
        synPriceRange(PRICE_RANGE)
        clearVariations()

    }, [pathname, pushNavigation, setSearch, syncCategories, syncBrands, synPriceRange, clearVariations])

    useEffect(() => {
        // If 'q' is present as a search param, update the URL to use 'query' instead.
        if (searchParams.get('q') && !searchParams.get('query')) {
            const url = new URL(window.location.href);
            const qValue = searchParams.get('q');
            url.searchParams.delete('q');
            url.searchParams.set('query', qValue || '');
            window.history.replaceState({}, '', url.toString());
            setSearch(qValue || '');
        } else if (searchParams.get('query')) {
            setSearch(searchParams.get('query') || '');
        }
    }, [searchParams]);

    useEffect(() => {
        const revalidate = searchParams.has('revalidate')
        if (revalidate) {
            const currentPath = pathname
            fetch(`/api/revalidate?path=${encodeURIComponent(currentPath)}`)
                .then(response => response.json())
                .then(data => {
                    revalidationToast('Page cache revalidated successfully', 'success')
                })
                .catch(error => {
                    console.error('Revalidation error:', error)
                    revalidationToast('Failed to revalidate page', 'error')
                })
        }
    }, [pathname, searchParams])

    return <div>
        <NextTopLoader height={3} color="#1b41b0" showSpinner={false} />
    </div>
}