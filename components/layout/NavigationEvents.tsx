'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { useStore } from "@/store/store";
import NextTopLoader from "nextjs-toploader";
import { PRICE_RANGE } from "@/components/primitives/Filters/PriceFilter";
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
    const {
        pushNavigation,
        setSearch,
        syncCategories,
        syncBrands,
        synPriceRange,
        syncOnSale,
        setInStock,
        setSort,
        clearVariations,
    } = useStore()

    useEffect(() => {
        pushNavigation(pathname);
        setSearch('')

        // Only clear filters the destination URL does NOT carry. routeToState
        // re-applies URL-carried filters via a microtask whose order vs this
        // effect isn't guaranteed by InstantSearchNext — making the reset
        // URL-aware removes the race entirely (per PR #107 review).
        if (!searchParams.get('categories')) syncCategories([])
        if (!searchParams.get('brands')) syncBrands([])
        if (!searchParams.get('priceRange')) synPriceRange(PRICE_RANGE)
        if (searchParams.get('on_sale') !== 'true') syncOnSale(false)
        if (searchParams.get('in_stock') !== 'true') setInStock(false)
        if (!searchParams.get('sort')) setSort('')

        let hasVariations = false
        searchParams.forEach((_, key) => {
            if (key.startsWith('variation_')) hasVariations = true
        })
        if (!hasVariations) clearVariations()
    }, [
        pathname,
        searchParams,
        pushNavigation,
        setSearch,
        syncCategories,
        syncBrands,
        synPriceRange,
        syncOnSale,
        setInStock,
        setSort,
        clearVariations,
    ])

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