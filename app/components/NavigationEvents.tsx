'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import {useStore} from "@/store/store";
import {Next13ProgressBar} from "next13-progressbar";

export function NavigationEvents() {
    const pathname = usePathname()
    const { pushNavigation } = useStore()

    useEffect(() => {
        pushNavigation(pathname);
    }, [pathname])

    return <div>
        <Next13ProgressBar height="3px" color="#1b41b0" showOnShallow={true} options={{ showSpinner: false}} />
    </div>
}