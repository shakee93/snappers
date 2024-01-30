import { revalidatePath } from 'next/cache'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
    const path = request.nextUrl.searchParams.get('path')

    if (path) {

        if (path === 'all') {
            revalidatePath('/', 'layout');
            return Response.json({ revalidated: 'all', now: Date.now() })
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