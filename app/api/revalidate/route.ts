import {revalidateTag} from 'next/cache'

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        // const file = formData.get("file") as File;
        const tagID = formData.get("id") as string;
        revalidateTag(tagID);
        return new Response(JSON.stringify({ message: `revalidated ${tagID} done succussfully` }));
    } catch (error) {
        return new Response(JSON.stringify({ error: `Error: ${error}` }));
    }
}