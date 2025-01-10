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


  const sentPayhereConfirmation = async (orderId: number | string, status: string): Promise<any> => {
    console.log("orderId: ", orderId);
    console.log("test id == orderId: ", orderId == "d87f5913-6106-44b5-bd26-4308f0331c05");
    console.log("status: ", status);
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

  
    if (confirmationResponse.ok) {
      return true;
    }
    return false;
  };
  

export async function POST(req: Request) {
  try {
// FOR REAL DATA
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
    // let parsed_data =   {
    //   merchant_id: '215650',
    //   order_id: 'd87f5913-6106-44b5-bd26-4308f0331c05',
    //   payment_id: '320043744024',
    //   captured_amount: '20.60',
    //   payhere_amount: '20.60',
    //   payhere_currency: 'LKR',
    //   status_code: '2',
    //   md5sig: 'EF37EB9E60452C255D5011298D621128',
    //   custom_1: '',
    //   custom_2: '',
    //   status_message: 'Successfully received the VISA payment',
    //   method: 'VISA',
    //   card_holder_name: 'Mohammed Sadikin Mohammed Shadir',
    //   card_no: '************6268',
    //   card_expiry: '0826',
    //   recurring: '0'
    // }


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
    if (local_md5sig === data.md5sig) {
      let orderStatus = "pending";
      switch(data.status_code) {
        case '2':
          orderStatus = "completed"; // Payment successful
          break;
        case '3':
          orderStatus = "pauthorized"; // Payment authorized
          break;
        case '1':
          orderStatus = "processing"; // Payment is processing
          break;
        case '0':
          orderStatus = "on-hold"; // Payment pending, stock reduced
          break;
        case '-1':
          orderStatus = "cancelled"; // Payment cancelled
          break;
        case '-2':
          orderStatus = "failed"; // Payment failed
          break;
        case '-3':
          orderStatus = "refunded"; // Payment refunded
          break;
        default:
          orderStatus = "pending"; // Default to pending for unknown status
      }

      const confirmResult = await sentPayhereConfirmation(data.order_id, orderStatus);
      console.log("confirmResult: ", confirmResult);
      if (!confirmResult) {
        console.error('Failed to send confirmation to WordPress');
        return NextResponse.json(
          { error: 'Failed to update order status' },
          { status: 500 }
        );
      }
      
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
