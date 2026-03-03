import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const data = await request.json();

        // Log the extracted amount received from frontend
        console.log('=== NDB-PAY API ROUTE ===');
        console.log('Received data from frontend:', data);
        console.log('Amount received (extracted):', data.amount);

        // Send order details to WordPress backend
        // WordPress will generate the signed CyberSource form with access_key, profile_id, secret_key
        const response = await fetch('https://api.gqmobiles.lk/wp-json/api/gq_mobile/v1/ndb-pay-post-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`WordPress API error: ${response.status}`);
        }

        // WordPress returns only the HTML form (plain HTML, not JSON)
        const formHtml = await response.text();

        // Return plain HTML (not JSON wrapped)
        return new Response(formHtml, {
            status: 200,
            headers: {
                'Content-Type': 'text/html; charset=UTF-8',
            },
        });
    } catch (error) {
        console.error('NDB-Pay API error:', error);
        return NextResponse.json(
            { error: 'Failed to process NDB-Pay request' },
            { status: 500 }
        );
    }
}
