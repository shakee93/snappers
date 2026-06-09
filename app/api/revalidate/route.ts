import { revalidatePath, revalidateTag } from 'next/cache'
import { NextRequest } from 'next/server'
import { DEALS_CACHE_TAG, productTag } from '@/lib/cache-tags'

// Accepted values for the optional ?type= query param. Forwarded as the
// second arg to revalidatePath. For App Router dynamic routes like
// /[category]/[slug], passing 'page' is what makes revalidatePath actually
// invalidate the cached entry instead of silently no-op'ing.
type RevalidatePathType = 'page' | 'layout'
function parseType(raw: string | null): RevalidatePathType | undefined {
    return raw === 'page' || raw === 'layout' ? raw : undefined
}

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

        const type = parseType(request.nextUrl.searchParams.get('type'))
        try {
            if (type) {
                revalidatePath(path, type);
            } else {
                revalidatePath(path);
            }
            if (path.startsWith('/product') || path.startsWith('/tag')) {
                // Tag/collection pages — bust deals sliders.
                revalidateTag(DEALS_CACHE_TAG, 'max');
            } else {
                // PDP paths follow /<category>/<slug>. Bust the per-product tag
                // attached to GET_PRODUCT's SSR fetch so a regen actually
                // re-pulls WPGraphQL instead of re-serving the stale fetch-
                // cache entry on a path that was already invalidated.
                const productSlug = path.match(/^\/[^/]+\/([^/]+)$/)?.[1]
                if (productSlug) {
                    revalidateTag(productTag(productSlug), 'max');
                }
            }
            logRevalidate({ kind: 'path', path, type: type ?? '', ms: Date.now() - startedAt })
        } catch (e) {
            logRevalidate({ kind: 'path', path, type: type ?? '', threw: String(e), ms: Date.now() - startedAt })
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
