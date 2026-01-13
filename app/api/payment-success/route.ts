import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

/**
 * CyberSource Secure Acceptance Return URL Handler
 * 
 * CyberSource sends payment results via POST with form data containing:
 * - decision: ACCEPT, DECLINE, REVIEW, ERROR, CANCEL
 * - transaction_id: CyberSource transaction ID
 * - req_reference_number: Original order reference number
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

export async function POST(request: NextRequest) {
  try {
    // CyberSource sends form data, not JSON
    const formData = await request.formData();
    const params: Record<string, string> = {};

    // Convert FormData to object
    formData.forEach((value, key) => {
      params[key] = value.toString();
    });

    console.log('=== CyberSource Payment Return ===');
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
    const isSuccess = decision === 'ACCEPT';
    const isDeclined = decision === 'DECLINE';
    const isReview = decision === 'REVIEW';
    const isError = decision === 'ERROR';
    const isCancelled = decision === 'CANCEL';

    // Prepare response data
    const responseData = {
      success: true,
      method: 'POST',
      timestamp: new Date().toISOString(),
      cybersource: {
        decision,
        transaction_id: transactionId,
        reference_number: referenceNumber,
        auth_amount: authAmount,
        currency,
        reason_code: reasonCode,
        signature_valid: signatureValid,
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

    // Log payment result
    console.log('Payment Decision:', decision);
    console.log('Transaction ID:', transactionId);
    console.log('Reference Number:', referenceNumber);
    console.log('Amount:', authAmount, currency);

    // TODO: Update order status in WordPress/WooCommerce
    // You can call your WordPress API or GraphQL mutation here
    // Example:
    // if (isSuccess && referenceNumber) {
    //   await updateOrderStatus(referenceNumber, 'completed', transactionId);
    // }

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error('Payment success handler error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 400 }
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
