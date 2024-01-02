import { getPlaiceholder } from "plaiceholder";
import { cache } from 'react'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get("image");

    if (!imageUrl) {
        return new Response("Missing imageUrl", {
            status: 400,
        });
    }

    const buffer = cache( async (image: string) => {
        let x = await fetch(image).then(async (res) =>
            Buffer.from(await res.arrayBuffer())
        );

        return x
    })

    const bufferData = await buffer(imageUrl)

    const { base64 } = await getPlaiceholder(bufferData);

    return new Response(JSON.stringify({ data: base64 }), {
        headers: {
            "content-type": "application/json",
        },
    });
}