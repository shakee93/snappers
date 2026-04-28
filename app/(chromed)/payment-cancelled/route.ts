import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

/**
 * Handle POST requests from CyberSource/NDB at /payment-cancelled
 * Updates order status to CANCELLED and redirects to cancel page
 */

// Get secret key from environment
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
 * Update order status to cancelled via WordPress REST API
 * Uses the same endpoint as PayHere order confirmation
 */
async function updateOrderStatusToCancelled(orderId: string, transactionId: string) {
  try {
    console.log('Updating order status to cancelled:', { orderId, transactionId });
    
    const confirmationResponse = await fetch(
      "https://api.gqmobiles.lk/wp-json/api/gq_mobile/v1/payhere-order-confirmation",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          order_id: orderId,
          order_status: "cancelled",
          transaction_id: transactionId,
        }),
      }
    );

    const responseText = await confirmationResponse.text();
    console.log('Order cancellation response status:', confirmationResponse.status);
    console.log('Order cancellation response body:', responseText);

    if (confirmationResponse.ok) {
      let result;
      try {
        result = JSON.parse(responseText);
      } catch {
        result = responseText;
      }
      console.log('Order status updated to cancelled successfully:', result);
      return true;
    } else {
      console.error('Order cancellation update failed:', confirmationResponse.status, responseText);
      return false;
    }
  } catch (error) {
    console.error('Error updating order status to cancelled:', error);
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

    console.log('=== NDB Payment Cancelled (POST) ===');
    console.log('Received parameters:', params);

    // Extract key CyberSource parameters
    // Note: Cancel URL may receive fewer parameters than success URL
    const decision = params.decision || '';
    const transactionId = params.transaction_id || '';
    const referenceNumber = params.req_reference_number || '';
    const authAmount = params.auth_amount || '';
    const currency = params.currency || params.req_currency || '';
    const reasonCode = params.reason_code || '';
    const signature = params.signature || '';
    const signedFieldNames = params.signed_field_names || '';
    const message = params.message || '';

    // Verify signature if available (cancel URL may not always have signature)
    const secretKey = getSecretKey();
    let signatureValid = false;
    if (secretKey && signature && signedFieldNames) {
      signatureValid = verifySignature(params, secretKey);
      console.log('Signature verification:', signatureValid ? 'VALID' : 'INVALID');
      
      // If signature is invalid, log warning but still process cancellation
      // (user-initiated cancellations should be processed)
      if (!signatureValid) {
        console.warn('Invalid signature on cancel URL - proceeding with caution');
      }
    } else {
      console.log('Signature verification skipped (missing secret key or signature fields)');
      // This is acceptable for cancel URLs - user may cancel before full transaction
    }

    // Determine payment status based on CyberSource decision values
    // CANCEL = User cancelled, DECLINE = Payment declined, ERROR = System error
    const isCancelled = decision === 'CANCEL';
    const isDeclined = decision === 'DECLINE';
    const isError = decision === 'ERROR';
    const isReview = decision === 'REVIEW';
    
    // Log payment result
    console.log('Payment Decision:', decision);
    console.log('Reason Code:', reasonCode);
    console.log('Message:', message);
    console.log('Transaction ID:', transactionId);
    console.log('Reference Number (Order ID):', referenceNumber);
    console.log('Amount:', authAmount, currency);

    // Update order status to cancelled if we have an order ID
    // Process cancellation even if signature is missing (user-initiated cancel)
    if (referenceNumber) {
      // Only update if we have a clear cancellation/decline/error status
      // REVIEW status should not be cancelled automatically
      if (isCancelled || isDeclined || isError) {
        console.log('Payment cancelled/declined/failed, updating order status to CANCELLED...');
        const updateSuccess = await updateOrderStatusToCancelled(referenceNumber, transactionId || '');
        if (updateSuccess) {
          console.log('Order status updated to cancelled successfully');
        } else {
          console.error('Failed to update order status to cancelled');
        }
      } else if (isReview) {
        console.log('Payment in REVIEW status - not cancelling order');
      } else if (!decision && referenceNumber) {
        // No decision but we have order ID - likely user cancelled before transaction
        console.log('User cancelled before transaction - updating order status to CANCELLED...');
        const updateSuccess = await updateOrderStatusToCancelled(referenceNumber, '');
        if (updateSuccess) {
          console.log('Order status updated to cancelled successfully');
        }
      }
    } else {
      console.warn('No reference number (order ID) found in cancel callback');
    }

    // Redirect to cancel page
    const baseUrl = new URL(request.url);
    const redirectUrl = `${baseUrl.origin}/cancel`;
    
    // Return HTML that auto-redirects (for POST requests from CyberSource)
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta http-equiv="refresh" content="0;url=${redirectUrl}">
          <script>window.location.href = ${JSON.stringify(redirectUrl)};</script>
        </head>
        <body>
          <p>Payment cancelled. Redirecting...</p>
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
    console.error('Payment cancellation handler error:', error);
    // On error, redirect to cancel page
    const baseUrl = new URL(request.url);
    return NextResponse.redirect(
      `${baseUrl.origin}/cancel?error=processing`,
      302
    );
  }
}

/**
 * Handle GET requests - redirect to cancel page (for testing or direct access)
 */
export async function GET(request: NextRequest) {
  const baseUrl = new URL(request.url);
  return NextResponse.redirect(`${baseUrl.origin}/cancel`, 302);
}
