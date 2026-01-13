import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

/**
 * Handle POST requests from CyberSource at /payment-success
 * Redirects to /order-success with payment details as query parameters
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

export async function POST(request: NextRequest) {
  try {
    // CyberSource sends form data, not JSON
    const formData = await request.formData();
    const params: Record<string, string> = {};

    // Convert FormData to object
    formData.forEach((value, key) => {
      params[key] = value.toString();
    });

    console.log('=== CyberSource Payment Return (POST) ===');
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

    // Log payment result
    console.log('Payment Decision:', decision);
    console.log('Transaction ID:', transactionId);
    console.log('Reference Number:', referenceNumber);
    console.log('Amount:', authAmount, currency);

    // TODO: Update order status in WordPress/WooCommerce
    // You can call your WordPress API or GraphQL mutation here
    // Example:
    // if (decision === 'ACCEPT' && referenceNumber) {
    //   await updateOrderStatus(referenceNumber, 'completed', transactionId);
    // }

    // Build query string from all parameters
    const queryString = new URLSearchParams(params).toString();
    const baseUrl = new URL(request.url);
    const redirectUrl = `${baseUrl.origin}/order-success?${queryString}`;
    
    // Redirect to order-success page with all payment parameters
    return NextResponse.redirect(redirectUrl, 302);
  } catch (error) {
    console.error('Payment success handler error:', error);
    // On error, redirect to order-success with error parameter
    const baseUrl = new URL(request.url);
    return NextResponse.redirect(
      `${baseUrl.origin}/order-success?error=processing`,
      302
    );
  }
}

/**
 * Handle GET requests - redirect to order-success (for testing)
 */
export async function GET(request: NextRequest) {
  const baseUrl = new URL(request.url);
  return NextResponse.redirect(`${baseUrl.origin}/order-success`, 302);
}
