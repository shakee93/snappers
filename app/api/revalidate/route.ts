import { revalidatePath } from 'next/cache'
import { NextRequest } from 'next/server'

// NOTE: IF you want to revalidate all routes, use `/api/revalidate?path=all`;
// just use `/api/revalidate`.
export async function GET(request: NextRequest) {
    const path = request.nextUrl.searchParams.get('path')

    if (path) {

        if (path === 'all') {
            revalidatePath('/', 'layout');
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
        return Response.json({ revalidated: true, now: Date.now() })
    }

    return Response.json({
        revalidated: false,
        now: Date.now(),
        message: 'Missing path to revalidate',
    })
}