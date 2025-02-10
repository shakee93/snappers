import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const data = await request.json();

    const { order_id } = data

    // console.log(order_id);

    const response = await fetch('https://api.gqmobiles.lk/wp-json/api/gq_mobile/v1/paykoko-post-data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    // console.log('response', response.body);
    const responseData = await response.text();
    // console.log('responseData', responseData);

    return NextResponse.json({ 
        message: 'Data received',
        kokoResponse: responseData
    });
}
