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
// FOR REAL DATA
    // console.log("Payhere Notification Endpoint is running");
    
    // let data;
    // const contentType = req.headers.get('content-type');
    
    // if (contentType?.includes('application/json')) {
    //   data = await req.json();
    // } else {
    //   // Handle form data
    //   const formData = await req.formData();
    //   data = Object.fromEntries(formData);
    // }
    
    // console.log("Parsed data: ", data);
    // const { isValid, missingFields } = validateRequiredFields(data);
    // if (!isValid) {
    //   return NextResponse.json(
    //     { 
    //       error: 'Missing required fields',
    //       missingFields 
    //     },
    //     { status: 400 }
    //   );
    // }
    let parsed_data =   {
      merchant_id: '215650',
      order_id: '1cc150d2-17fc-4580-8490-d638aff940b8',
      payment_id: '320043744024',
      captured_amount: '20.60',
      payhere_amount: '20.60',
      payhere_currency: 'LKR',
      status_code: '2',
      md5sig: 'EF37EB9E60452C255D5011298D621128',
      custom_1: '',
      custom_2: '',
      status_message: 'Successfully received the VISA payment',
      method: 'VISA',
      card_holder_name: 'Mohammed Sadikin Mohammed Shadir',
      card_no: '************6268',
      card_expiry: '0826',
      recurring: '0'
    }


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
      parsed_data.merchant_id +
      parsed_data.order_id +
      parsed_data.payhere_amount +
      parsed_data.payhere_currency +
      parsed_data.status_code +
      md5(merchant_secret).toUpperCase()
    ).toUpperCase();

    // Verify signature and payment status
    if (local_md5sig === parsed_data.md5sig ) {
      switch(parsed_data.status_code) {
        case '3':
          // Payment authorization successful
          // TODO: Update your database here
          break;

        case '2':
          // Payment successful
          // TODO: Update your database here
          break;
        case '0':
          // Payment pending
          // TODO: Update your database here
          break;
        case '-1':
          // Payment canceled
          // TODO: Update your database here
          break;
        case '-2':
          // Payment failed
          // TODO: Update your database here
          break;
        default:
          console.log('Unknown payment status code:', parsed_data.status_code);
          break;
      }
      
      return NextResponse.json(
        { message: 'Payment verification successful' },
        { status: 200 }
      );
    } else {
      // Payment verification failed
      console.error('Payment verification failed', {
        status_code: parsed_data.status_code,
        signature_match: local_md5sig === parsed_data.md5sig
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
