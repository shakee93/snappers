import { NextResponse } from 'next/server';
import { md5 } from 'js-md5';

function validateRequiredFields(data: any) {
    console.log("Starting validateRequiredFields with data:", data);
    const requiredFields = {
      merchant_id: data.merchant_id,
      order_id: data.order_id,
      payhere_amount: data.payhere_amount,
      payhere_currency: data.payhere_currency,
      status_code: data.status_code,
      md5sig: data.md5sig
    };

    console.log("Required fields extracted:", requiredFields);
  
    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([field]) => field);
  
    console.log("Missing fields:", missingFields);
    
    const result = {
      isValid: missingFields.length === 0,
      missingFields
    };
    console.log("Validation result:", result);
    return result;
  }


  const sentPayhereConfirmation = async (orderId: number | string, status: string): Promise<any> => {
    console.log("Starting sentPayhereConfirmation with:", { orderId, status });
    
    console.log("Making request to WordPress API...");
    const confirmationResponse = await fetch(
      "https://api.gqmobiles.lk/wp-json/api/gq_mobile/v1/payhere-order-confirmation",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          order_id: orderId,
          order_status: status,
        }),
      }
    );

    console.log("WordPress API response status:", confirmationResponse.status);
    console.log("WordPress API response ok:", confirmationResponse.ok);
  
    if (confirmationResponse.ok) {
      console.log("Confirmation sent successfully");
      return true;
    }
    console.log("Confirmation failed");
    return false;
  };
  

export async function POST(req: Request) {
  console.log("POST request received at /api/notify");
  try {
    console.log("Processing Payhere notification...");
    
    let data;
    const contentType = req.headers.get('content-type');
    console.log("Content-Type:", contentType);
    
    if (contentType?.includes('application/json')) {
      console.log("Processing JSON data");
      data = await req.json();
    } else {
      console.log("Processing form data");
      const formData = await req.formData();
      data = Object.fromEntries(formData);
    }
    
    console.log("Parsed request data:", data);
    
    const { isValid, missingFields } = validateRequiredFields(data);
    console.log("Validation results:", { isValid, missingFields });
    
    if (!isValid) {
      console.log("Validation failed - missing required fields");
      return NextResponse.json(
        { 
          error: 'Missing required fields',
          missingFields 
        },
        { status: 400 }
      );
    }

    const merchant_secret = process.env.GQ_PAYHERE_MERCHANT_SECRET_KEY;
    console.log("Merchant secret configured:", !!merchant_secret);

    if (!merchant_secret) {
      console.error('Merchant secret missing in environment variables');
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
    // console.log("requiredFields: ", requiredFields);
    // return {
    //   console.log("orderId: ", orderId);
    //   console.log("test id == orderId: ", orderId == "d87f5913-6106-44b5-bd26-4308f0331c05");
    //   console.log("status: ", status);
    //   // FOR REAL DATA
    //   console.log("Payhere Notification Endpoint is running");
    //   // Handle form data
    //   console.log("Parsed data: ", data);
    // // let parsed_data =   {
    // //   merchant_id: '215650',
    // //   order_id: 'd87f5913-6106-44b5-bd26-4308f0331c05',
    // //   payment_id: '320043744024',
    // //   captured_amount: '20.60',
    // //   payhere_amount: '20.60',
    // //   payhere_currency: 'LKR',
    // //   status_code: '2',
    // //   md5sig: 'EF37EB9E60452C255D5011298D621128',
    // //   custom_1: '',
    // //   custom_2: '',
    // //   status_message: 'Successfully received the VISA payment',
    // //   method: 'VISA',
    // //   card_holder_name: 'Mohammed Sadikin Mohammed Shadir',
    // //   card_no: '************6268',
    // //   card_expiry: '0826',
    // //   recurring: '0'
    // // }


    console.log("Calculating MD5 signature...");
    const local_md5sig = md5(
      data.merchant_id +
      data.order_id +
      data.payhere_amount +
      data.payhere_currency +
      data.status_code +
      md5(merchant_secret).toUpperCase()
    ).toUpperCase();
    console.log("Local MD5:", local_md5sig);
    console.log("Received MD5:", data.md5sig);

    if (local_md5sig === data.md5sig) {
      console.log("MD5 signature verified successfully");
      let orderStatus = "pending";
      console.log("Processing status code:", data.status_code);
      
      switch(data.status_code) {
        case '2':
          orderStatus = "completed";
          console.log("Payment successful");
          break;
        case '3':
          orderStatus = "pauthorized";
          console.log("Payment authorized");
          break;
        case '1':
          orderStatus = "processing";
          console.log("Payment processing");
          break;
        case '0':
          orderStatus = "on-hold";
          console.log("Payment pending");
          break;
        case '-1':
          orderStatus = "cancelled";
          console.log("Payment cancelled");
          break;
        case '-2':
          orderStatus = "failed";
          console.log("Payment failed");
          break;
        case '-3':
          orderStatus = "refunded";
          console.log("Payment refunded");
          break;
        default:
          orderStatus = "pending";
          console.log("Unknown status code, defaulting to pending");
      }

      console.log("Sending confirmation to WordPress...");
      const confirmResult = await sentPayhereConfirmation(data.order_id, orderStatus);
      console.log("WordPress confirmation result:", confirmResult);
      
      if (!confirmResult) {
        console.error('WordPress confirmation failed');
        return NextResponse.json(
          { error: 'Failed to update order status' },
          { status: 500 }
        );
      }
      
      console.log("Payment process completed successfully");
      return NextResponse.json(
        { message: 'Payment verification successful' },
        { status: 200 }
      );
    } else {
      console.error('Payment verification failed - signature mismatch');
      console.error('Verification details:', {
        status_code: data.status_code,
        signature_match: local_md5sig === data.md5sig,
        received_sig: data.md5sig,
        calculated_sig: local_md5sig
      });
      
      return NextResponse.json(
        { error: 'Payment verification failed' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error processing payment notification:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      });
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 


export async function GET() {
  console.log("GET request received at /api/notify");
  return NextResponse.json(
    { status: "healthy", message: "Payhere notification endpoint is running" },
    { status: 200 }
  );
}
