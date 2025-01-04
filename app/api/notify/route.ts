import { NextResponse } from 'next/server';
import { md5 } from 'js-md5';

function validateRequiredFields(data: any) {
    const requiredFields = {
      merchant_id: data.merchant_id,
      order_id: data.order_id,
      payhere_amount: data.payhere_amount,
      payhere_currency: data.payhere_currency,
      status_code: data.status_code,
      md5sig: data.md5sig
    };

    console.log("requiredFields: ", requiredFields);
  
    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([field]) => field);
  
    return {
      isValid: missingFields.length === 0,
      missingFields
    };
  }
  

export async function POST(req: Request) {
  try {
    console.log("Payhere Notification Endpoint is running");
    
    let data;
    const contentType = req.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      data = await req.json();
    } else {
      // Handle form data
      const formData = await req.formData();
      data = Object.fromEntries(formData);
    }
    
    console.log("Parsed data: ", data);
    const { isValid, missingFields } = validateRequiredFields(data);
    if (!isValid) {
      return NextResponse.json(
        { 
          error: 'Missing required fields',
          missingFields 
        },
        { status: 400 }
      );
    }
    let parsed_data = JSON.parse(data);
    console.log("parsed_data: ", parsed_data);

    // Get merchant secret from environment variables
    const merchant_secret = process.env.GQ_PAYHERE_MERCHANT_SECRET_KEY;

    if (!merchant_secret) {
      console.error('Merchant secret not configured');
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }

    // Calculate local MD5 signature
    const local_md5sig = md5(
      data.merchant_id +
      data.order_id +
      data.payhere_amount +
      data.payhere_currency +
      data.status_code +
      md5(merchant_secret).toUpperCase()
    ).toUpperCase();

    // Verify signature and payment status
    if (local_md5sig === data.md5sig && data.status_code === '2') {
      // Payment successful
      // TODO: Update your database here
      
      return NextResponse.json(
        { message: 'Payment verification successful' },
        { status: 200 }
      );
    } else {
      // Payment verification failed
      console.error('Payment verification failed', {
        status_code: data.status_code,
        signature_match: local_md5sig === data.md5sig
      });
      
      return NextResponse.json(
        { error: 'Payment verification failed' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error processing payment notification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 


export async function GET() {
  return NextResponse.json(
    { status: "healthy", message: "Payhere notification endpoint is running" },
    { status: 200 }
  );
}
