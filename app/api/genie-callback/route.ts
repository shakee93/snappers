import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const logs: string[] = [];

  const addLog = (message: string) => {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}`;
    logs.push(logEntry);
    console.log(logEntry);
  };

  addLog("=== GENIE PAYMENT CALLBACK API ROUTE TRIGGERED ===");
  addLog(`Request URL: ${request.url}`);
  addLog(`Request Method: ${request.method}`);
  addLog(`User Agent: ${request.headers.get('user-agent')}`);
  addLog(`Referer: ${request.headers.get('referer')}`);
  addLog(`Origin: ${request.headers.get('origin')}`);

  // Extract all query parameters
  const allParams: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    allParams[key] = value;
    addLog(`Query Parameter - ${key}: ${value}`);
  });

  addLog("All callback parameters: " + JSON.stringify(allParams, null, 2));

  // Extract common Genie payment parameters
  const orderId = allParams.order_id || allParams.orderId || allParams.order;
  const paymentId = allParams.payment_id || allParams.paymentId || allParams.payment;
  const status = allParams.status || allParams.payment_status || allParams.paymentStatus;
  const amount = allParams.amount || allParams.total_amount || allParams.totalAmount;
  const currency = allParams.currency || allParams.curr || 'LKR';
  const signature = allParams.signature || allParams.hash || allParams.checksum;
  const timestamp = allParams.timestamp || allParams.time || allParams.created_at;

  addLog(`Extracted Order ID: ${orderId}`);
  addLog(`Extracted Payment ID: ${paymentId}`);
  addLog(`Extracted Status: ${status}`);
  addLog(`Extracted Amount: ${amount}`);
  addLog(`Extracted Currency: ${currency}`);
  addLog(`Extracted Signature: ${signature}`);
  addLog(`Extracted Timestamp: ${timestamp}`);

  // Validate required parameters
  if (!orderId) {
    addLog("ERROR: Missing order_id parameter");
    return NextResponse.json(
      { 
        error: "Missing order_id parameter",
        logs: logs 
      },
      { status: 400 }
    );
  }

  if (!status) {
    addLog("ERROR: Missing status parameter");
    return NextResponse.json(
      { 
        error: "Missing status parameter",
        logs: logs 
      },
      { status: 400 }
    );
  }

  // Determine payment status
  const paymentStatus = status.toLowerCase();
  let isSuccess = false;
  let isPending = false;
  let isFailed = false;

  if (paymentStatus === 'success' || paymentStatus === 'completed' || paymentStatus === 'approved') {
    isSuccess = true;
    addLog("Payment status: SUCCESS");
  } else if (paymentStatus === 'pending' || paymentStatus === 'processing') {
    isPending = true;
    addLog("Payment status: PENDING");
  } else if (paymentStatus === 'failed' || paymentStatus === 'error' || paymentStatus === 'declined') {
    isFailed = true;
    addLog("Payment status: FAILED");
  } else {
    addLog("Payment status: UNKNOWN");
  }

  // Simulate payment verification logic
  addLog("Simulating payment verification...");
  
  // Here you would typically:
  // 1. Verify the signature/hash
  // 2. Check if the payment amount matches
  // 3. Update order status in database
  // 4. Send confirmation emails
  // 5. Update inventory

  // For testing purposes, we'll simulate these steps
  setTimeout(() => {
    addLog("Step 1: Signature verification completed");
    addLog("Step 2: Amount verification completed");
    addLog("Step 3: Order status updated in database");
    addLog("Step 4: Confirmation email sent");
    addLog("Step 5: Inventory updated");
  }, 1000);

  // Prepare response data
  const responseData = {
    success: true,
    orderId: orderId,
    paymentId: paymentId,
    status: status,
    amount: amount,
    currency: currency,
    timestamp: timestamp,
    isSuccess: isSuccess,
    isPending: isPending,
    isFailed: isFailed,
    message: isSuccess 
      ? "Payment processed successfully" 
      : isPending 
      ? "Payment is being processed" 
      : "Payment failed",
    logs: logs
  };

  addLog("Preparing response: " + JSON.stringify(responseData, null, 2));

  // Return success response
  return NextResponse.json(responseData, { status: 200 });
}

export async function POST(request: NextRequest) {
  const logs: string[] = [];

  const addLog = (message: string) => {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}`;
    logs.push(logEntry);
    console.log(logEntry);
  };

  addLog("=== GENIE PAYMENT CALLBACK POST ROUTE TRIGGERED ===");
  addLog(`Request URL: ${request.url}`);
  addLog(`Request Method: ${request.method}`);

  try {
    const body = await request.json();
    addLog("Request body: " + JSON.stringify(body, null, 2));

    // Process POST data similar to GET
    const orderId = body.order_id || body.orderId || body.order;
    const paymentId = body.payment_id || body.paymentId || body.payment;
    const status = body.status || body.payment_status || body.paymentStatus;
    const amount = body.amount || body.total_amount || body.totalAmount;
    const currency = body.currency || body.curr || 'LKR';

    addLog(`Extracted Order ID: ${orderId}`);
    addLog(`Extracted Payment ID: ${paymentId}`);
    addLog(`Extracted Status: ${status}`);
    addLog(`Extracted Amount: ${amount}`);
    addLog(`Extracted Currency: ${currency}`);

    const responseData = {
      success: true,
      orderId: orderId,
      paymentId: paymentId,
      status: status,
      amount: amount,
      currency: currency,
      message: "POST callback processed successfully",
      logs: logs
    };

    return NextResponse.json(responseData, { status: 200 });

  } catch (error) {
    addLog("ERROR processing POST request: " + error);
    return NextResponse.json(
      { 
        error: "Failed to process POST request",
        logs: logs 
      },
      { status: 400 }
    );
  }
} 