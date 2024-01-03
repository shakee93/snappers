'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import {useStore} from "@/store/store";

export function NavigationEvents() {
    const pathname = usePathname()
    const { pushNavigation } = useStore()

    useEffect(() => {
        pushNavigation(pathname);
    }, [pathname])

    return null
}