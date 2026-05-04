import { revalidatePath, revalidateTag } from 'next/cache'
import { NextRequest } from 'next/server'
import { DEALS_CACHE_TAG } from '@/lib/cache-tags'

// NOTE: IF you want to revalidate all routes, use `/api/revalidate?path=all`;
// just use `/api/revalidate`.
export async function GET(request: NextRequest) {
    const path = request.nextUrl.searchParams.get('path')

    if (path) {

        if (path === 'all') {
            revalidatePath('/', 'layout');
            revalidateTag(DEALS_CACHE_TAG, 'max');
            return Response.json({ revalidated: 'all', now: Date.now() })
        }

        if (path === 'homepage') {
            revalidatePath('/', 'page');
            revalidatePath('/new-arrivals');
            revalidatePath('/back-in-stock');
            revalidatePath('/smartwatches');
            revalidatePath('/explore-speakers');
            return Response.json({ revalidated: 'homepage', now: Date.now() })
        }

        revalidatePath(path);
        // Bust deals sliders when a product or tag page changes
        if (path.startsWith('/product') || path.startsWith('/tag')) {
            revalidateTag(DEALS_CACHE_TAG, 'max');
        }
        return Response.json({ revalidated: true, now: Date.now() })
    }

    return Response.json({
        revalidated: false,
        now: Date.now(),
        message: 'Missing path to revalidate',
    })
}
