import { NextApiRequest, NextApiResponse } from 'next';
import { NextResponse } from "next/server";

export async function POST(req: Request) {

    if (req.method === 'POST') {

        console.log('inside');

        try {

            const reqBody = await req.json();
            console.log('Inside API', reqBody);

            const body = new URLSearchParams({
                "xoo_wl_user_email": reqBody.xoo_wl_user_email || "",
                "_xoo_wl_product_id": reqBody._xoo_wl_product_id || "",
                "xoo_wl_required_qty": reqBody.xoo_wl_required_qty || "",
            }).toString();

            console.log('body', body);

            const response = await fetch("https://api.gqmobiles.lk/wp-json/api/gq_mobile/v1/handle_waitlist_form_submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Accept": "application/json",
                },
                body: body,
                credentials: "include",
            });

            // console.log('response', response);

            // Check if the response is okay
            if (!response.ok) {
                const errorMessage = await response.text(); // Get the error message
                console.error('Error from external API:', errorMessage);
                return NextResponse.json(
                    { message: 'Error from external API', details: errorMessage },
                    { status: Number(response.status) }
                );
            }

            // Get the response data from the external API
            const responseData = await response.json();
            console.log('Response from external API:', responseData);

            // Send the response back to the client
            return NextResponse.json(
                { message: 'Fetch Success', details: responseData },
                { status: 200 }
            )
        } catch (error) {
            console.error('Error processing request:', error);
            return NextResponse.json(
                { error: 'Internal Server Error', details: (error as any)?.message },
                { status: 500 }
            );
        }
    } else {
        // Handle non-POST requests
        return NextResponse.json(
            { error: 'Method Not Allowed' },
            { status: 405 }
        );
    }
}
