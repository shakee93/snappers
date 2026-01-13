import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

/**
 * CyberSource Secure Acceptance Return URL Handler
 * 
 * CyberSource sends payment results via POST with form data containing:
 * - decision: ACCEPT, DECLINE, REVIEW, ERROR, CANCEL
 * - transaction_id: CyberSource transaction ID
 * - req_reference_number: Original order reference number (order ID)
 * - signature: Response signature for verification
 * - signed_field_names: Fields used in signature
 * - auth_amount: Authorized amount
 * - currency: Transaction currency
 * - reason_code: Numeric reason code
 */

// Get secret key from environment (should match the one used in form generation)
const getSecretKey = () => {
  return process.env.NDB_PAY_SECRET_KEY || '';
};

/**
 * Verify CyberSource response signature
 */
function verifySignature(params: Record<string, string>, secretKey: string): boolean {
  try {
    if (!params.signature || !params.signed_field_names) {
      return false;
    }

    const signedFieldNames = params.signed_field_names.split(',');
    const signedString = signedFieldNames
      .map((field) => `${field}=${params[field] || ''}`)
      .join(',');

    const hash = crypto.createHmac('sha256', secretKey)
      .update(signedString, 'utf8')
      .digest('base64');

    return hash === params.signature;
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

/**
 * Update order status to processing via GraphQL
 */
async function updateOrderStatus(orderId: string, transactionId: string) {
  try {
    const graphqlEndpoint = process.env.NEXT_PUBLIC_WP_GRAPHQL;
    if (!graphqlEndpoint) {
      console.error('GraphQL endpoint not configured');
      return false;
    }

    const mutation = `
      mutation updateOrderStatus($input: UpdateOrderInput!) {
        updateOrder(input: $input) {
          clientMutationId
          order {
            id
            status
            databaseId
          }
        }
      }
    `;

    const variables = {
      input: {
        orderId: parseInt(orderId, 10),
        status: 'PROCESSING',
        transactionId: transactionId,
      },
    };

    const response = await fetch(graphqlEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: mutation,
        variables,
      }),
    });

    if (!response.ok) {
      console.error('GraphQL request failed:', response.statusText);
      return false;
    }

    const result = await response.json();
    
    if (result.errors) {
      console.error('GraphQL errors:', result.errors);
      return false;
    }

    console.log('Order status updated successfully:', result.data);
    return true;
  } catch (error) {
    console.error('Error updating order status:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    // CyberSource sends form data, not JSON
    const formData = await request.formData();
    const params: Record<string, string> = {};

    // Convert FormData to object
    formData.forEach((value, key) => {
      params[key] = value.toString();
    });

    console.log('=== NDB Payment Return (POST) ===');
    console.log('Received parameters:', params);

    // Extract key CyberSource parameters
    const decision = params.decision || '';
    const transactionId = params.transaction_id || '';
    const referenceNumber = params.req_reference_number || '';
    const authAmount = params.auth_amount || '';
    const currency = params.currency || '';
    const reasonCode = params.reason_code || '';
    const signature = params.signature || '';
    const signedFieldNames = params.signed_field_names || '';

    // Verify signature (optional but recommended)
    const secretKey = getSecretKey();
    let signatureValid = false;
    if (secretKey && signature && signedFieldNames) {
      signatureValid = verifySignature(params, secretKey);
      console.log('Signature verification:', signatureValid ? 'VALID' : 'INVALID');
    } else {
      console.log('Signature verification skipped (missing secret key or signature fields)');
    }

    // Determine payment status
    const isSuccess = decision === 'ACCEPT' && reasonCode === '100';
    const isDeclined = decision === 'DECLINE';
    const isReview = decision === 'REVIEW';
    const isError = decision === 'ERROR';
    const isCancelled = decision === 'CANCEL';

    // Log payment result
    console.log('Payment Decision:', decision);
    console.log('Reason Code:', reasonCode);
    console.log('Transaction ID:', transactionId);
    console.log('Reference Number (Order ID):', referenceNumber);
    console.log('Amount:', authAmount, currency);

    // Update order status to processing if payment is successful
    if (isSuccess && referenceNumber) {
      console.log('Payment successful, updating order status to PROCESSING...');
      const updateSuccess = await updateOrderStatus(referenceNumber, transactionId);
      if (updateSuccess) {
        console.log('Order status updated successfully');
      } else {
        console.error('Failed to update order status');
      }
    }

    // Redirect to checkout page with order ID
    if (isSuccess && referenceNumber) {
      const redirectUrl = `http://localhost:3000/checkout/${referenceNumber}`;
      
      // Return HTML that auto-redirects (for POST requests from CyberSource)
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta http-equiv="refresh" content="0;url=${redirectUrl}">
            <script>window.location.href = ${JSON.stringify(redirectUrl)};</script>
          </head>
          <body>
            <p>Payment successful! Redirecting...</p>
            <p>If you are not redirected, <a href="${redirectUrl}">click here</a>.</p>
          </body>
        </html>
      `;
      
      return new NextResponse(html, {
        status: 200,
        headers: {
          'Content-Type': 'text/html',
        },
      });
    }

    // Handle failed/declined payments
    if (isDeclined || isError || isCancelled) {
      const baseUrl = new URL(request.url);
      const redirectUrl = `${baseUrl.origin}/checkout?payment=failed`;
      
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta http-equiv="refresh" content="0;url=${redirectUrl}">
            <script>window.location.href = ${JSON.stringify(redirectUrl)};</script>
          </head>
          <body>
            <p>Payment failed. Redirecting...</p>
            <p>If you are not redirected, <a href="${redirectUrl}">click here</a>.</p>
          </body>
        </html>
      `;
      
      return new NextResponse(html, {
        status: 200,
        headers: {
          'Content-Type': 'text/html',
        },
      });
    }

    // For review status or unknown status, redirect to checkout
    const baseUrl = new URL(request.url);
    const redirectUrl = referenceNumber 
      ? `http://localhost:3000/checkout/${referenceNumber}`
      : `${baseUrl.origin}/checkout`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta http-equiv="refresh" content="0;url=${redirectUrl}">
          <script>window.location.href = ${JSON.stringify(redirectUrl)};</script>
        </head>
        <body>
          <p>Processing payment... Redirecting...</p>
          <p>If you are not redirected, <a href="${redirectUrl}">click here</a>.</p>
        </body>
      </html>
    `;
    
    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error('Payment success handler error:', error);
    // On error, redirect to checkout page
    const baseUrl = new URL(request.url);
    return NextResponse.redirect(
      `${baseUrl.origin}/checkout?error=processing`,
      302
    );
  }
}

export async function GET(request: NextRequest) {
  // CyberSource can also redirect with query parameters
  const { searchParams } = new URL(request.url);
  const params: Record<string, string> = {};
  
  searchParams.forEach((value, key) => {
    params[key] = value;
  });

  // Extract key CyberSource parameters
  const decision = params.decision || '';
  const transactionId = params.transaction_id || '';
  const referenceNumber = params.req_reference_number || '';
  const authAmount = params.auth_amount || '';
  const currency = params.currency || '';
  const reasonCode = params.reason_code || '';

  // Determine payment status
  const isSuccess = decision === 'ACCEPT';
  const isDeclined = decision === 'DECLINE';
  const isReview = decision === 'REVIEW';
  const isError = decision === 'ERROR';
  const isCancelled = decision === 'CANCEL';

  // Prepare response data
  const responseData = {
    success: true,
    method: 'GET',
    timestamp: new Date().toISOString(),
    cybersource: {
      decision,
      transaction_id: transactionId,
      reference_number: referenceNumber,
      auth_amount: authAmount,
      currency,
      reason_code: reasonCode,
    },
    payment_status: {
      isSuccess,
      isDeclined,
      isReview,
      isError,
      isCancelled,
    },
    all_params: params,
    url: request.url,
  };

  return NextResponse.json(responseData, { status: 200 });
}
