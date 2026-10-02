import { revalidatePath, revalidateTag } from 'next/cache'
import { NextRequest } from 'next/server'
import { BROWSE_PRODUCTS_CACHE_TAG, DEALS_CACHE_TAG, productTag } from '@/lib/cache-tags'

// Accepted values for the optional ?type= query param. Forwarded as the
// second arg to revalidatePath. For App Router dynamic routes like
// /[slug], passing 'page' is what makes revalidatePath actually
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

// Homepage is a concrete path, so bust it WITHOUT a type: revalidatePath('/')
// emits the `_N_T_/` implicit tag the page is stored under. revalidatePath('/',
// 'page') emits `_N_T_/page`, which only matches an app/page.tsx outside a
// route group — ours lives at app/(chromed)/page.tsx, so it silently no-op'd.
function bustDealSurfaces() {
    revalidateTag(DEALS_CACHE_TAG, 'max')
    revalidateTag(BROWSE_PRODUCTS_CACHE_TAG, 'max')
    revalidatePath('/')
    revalidatePath('/deals')
}

// NOTE: IF you want to revalidate all routes, use `/api/revalidate?path=all`;
// just use `/api/revalidate`.
export async function GET(request: NextRequest) {
    const startedAt = Date.now()
    const tag = request.nextUrl.searchParams.get('tag')
    if (tag) {
        try {
            revalidateTag(tag, 'max')
            if (tag === DEALS_CACHE_TAG) {
                revalidatePath('/')
                revalidatePath('/deals')
            }
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
            bustDealSurfaces();
            logRevalidate({ kind: 'all', ms: Date.now() - startedAt })
            return Response.json({ revalidated: 'all', now: Date.now() })
        }

        if (path === 'homepage') {
            revalidatePath('/');
            revalidatePath('/new-arrivals');
            revalidatePath('/back-in-stock');
            revalidatePath('/smartwatches');
            revalidatePath('/explore-speakers');
            bustDealSurfaces();
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
            // WP pings PDPs as /<brand>/<slug>, or /product/<slug> for products
            // with no brand (get_custom_product_permalink_path falls back to
            // 'product'). The storefront PDP lives at /<slug>, so bust that
            // concrete path plus the per-product tag attached to GET_PRODUCT's
            // SSR fetch — otherwise a regen re-serves the stale force-cached
            // GraphQL response and bakes the old price/stock straight back in.
            const isCollectionPath = path.startsWith('/tag') || path.startsWith('/shop')
            const productSlug = isCollectionPath
                ? undefined
                : path.match(/^\/[^/]+\/([^/]+)$/)?.[1]
            if (productSlug) {
                revalidatePath(`/${productSlug}`);
                revalidateTag(productTag(productSlug), 'max');
            }
            if (productSlug || isCollectionPath || path.startsWith('/product')) {
                // Product/tag saves must also refresh homepage deals.
                bustDealSurfaces();
            }
            logRevalidate({ kind: 'path', path, type: type ?? '', productSlug: productSlug ?? '', ms: Date.now() - startedAt })
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
