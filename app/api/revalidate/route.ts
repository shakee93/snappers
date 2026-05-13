import { revalidatePath, revalidateTag } from 'next/cache'
import { NextRequest } from 'next/server'
import { DEALS_CACHE_TAG } from '@/lib/cache-tags'

// Structured log so WP-side [REVALIDATE] lines can be correlated with the
// Vercel-side processing of the same call. Vercel returns 200 even when
// revalidatePath silently no-ops on a dynamic route — without this log we
// can't tell whether the cache was actually invalidated.
function logRevalidate(fields: Record<string, unknown>) {
    console.log('[REVALIDATE] ' + Object.entries(fields)
        .map(([k, v]) => `${k}=${typeof v === 'string' ? v : JSON.stringify(v)}`)
        .join(' '))
}

// NOTE: IF you want to revalidate all routes, use `/api/revalidate?path=all`;
// just use `/api/revalidate`.
export async function GET(request: NextRequest) {
    const startedAt = Date.now()
    const tag = request.nextUrl.searchParams.get('tag')
    if (tag) {
        try {
            revalidateTag(tag, 'max')
            logRevalidate({ kind: 'tag', tag, ms: Date.now() - startedAt })
        } catch (e) {
            logRevalidate({ kind: 'tag', tag, threw: String(e), ms: Date.now() - startedAt })
            throw e
        }
        return Response.json({ revalidated: tag, now: Date.now() })
    }

    const path = request.nextUrl.searchParams.get('path')

    if (path) {

        if (path === 'all') {
            revalidatePath('/', 'layout');
            revalidateTag(DEALS_CACHE_TAG, 'max');
            logRevalidate({ kind: 'all', ms: Date.now() - startedAt })
            return Response.json({ revalidated: 'all', now: Date.now() })
        }

        if (path === 'homepage') {
            revalidatePath('/', 'page');
            revalidatePath('/new-arrivals');
            revalidatePath('/back-in-stock');
            revalidatePath('/smartwatches');
            revalidatePath('/explore-speakers');
            logRevalidate({ kind: 'homepage', ms: Date.now() - startedAt })
            return Response.json({ revalidated: 'homepage', now: Date.now() })
        }

        try {
            revalidatePath(path);
            // Bust deals sliders when a product or tag page changes
            if (path.startsWith('/product') || path.startsWith('/tag')) {
                revalidateTag(DEALS_CACHE_TAG, 'max');
            }
            logRevalidate({ kind: 'path', path, ms: Date.now() - startedAt })
        } catch (e) {
            logRevalidate({ kind: 'path', path, threw: String(e), ms: Date.now() - startedAt })
            throw e
        }
        return Response.json({ revalidated: true, now: Date.now() })
    }

    logRevalidate({ kind: 'missing-arg', ms: Date.now() - startedAt })
    return Response.json({
        revalidated: false,
        now: Date.now(),
        message: 'Missing path to revalidate',
    })
}
