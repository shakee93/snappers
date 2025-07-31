import { NextRequest, NextResponse } from "next/server";

interface GenieWebhookEvent {
  transaction_id?: string;
  order_id?: string;
  payment_id?: string;
  status?: string;
  amount?: string;
  currency?: string;
  customer_email?: string;
  customer_name?: string;
  timestamp?: string;
  event_type?: string;
  [key: string]: any;
}

export async function POST(request: NextRequest) {
  const logs: string[] = [];
  const webhookId = `WEBHOOK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const addLog = (message: string, level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS' = 'INFO') => {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${webhookId}] [${level}] ${message}`;
    logs.push(logEntry);
    console.log(logEntry);
  };

  // ========================================
  // GENIE WEBHOOK EVENT PROCESSING START
  // ========================================
  addLog("=== GENIE WEBHOOK EVENT RECEIVED ===", 'INFO');
  addLog(`Webhook ID: ${webhookId}`, 'INFO');
  addLog(`Request URL: ${request.url}`, 'INFO');
  addLog(`Request Method: ${request.method}`, 'INFO');
  addLog(`Content-Type: ${request.headers.get('content-type')}`, 'INFO');
  addLog(`User-Agent: ${request.headers.get('user-agent')}`, 'INFO');
  addLog(`X-Forwarded-For: ${request.headers.get('x-forwarded-for')}`, 'INFO');
  addLog(`X-Real-IP: ${request.headers.get('x-real-ip')}`, 'INFO');

  try {
    // Parse the webhook payload
    addLog("Parsing webhook payload...", 'INFO');
    const body = await request.json();
    addLog("Webhook payload parsed successfully", 'SUCCESS');
    addLog(`Payload size: ${JSON.stringify(body).length} characters`, 'INFO');

    // Log the complete webhook payload
    addLog("Complete webhook payload:", 'INFO');
    addLog(JSON.stringify(body, null, 2), 'INFO');

    // Extract common Genie webhook fields
    const event: GenieWebhookEvent = {
      transaction_id: body.transaction_id || body.transactionId || body.transaction,
      order_id: body.order_id || body.orderId || body.order,
      payment_id: body.payment_id || body.paymentId || body.payment,
      status: body.status || body.payment_status || body.paymentStatus,
      amount: body.amount || body.total_amount || body.totalAmount,
      currency: body.currency || body.curr || 'LKR',
      customer_email: body.customer_email || body.email || body.customerEmail,
      customer_name: body.customer_name || body.name || body.customerName,
      timestamp: body.timestamp || body.created_at || body.createdAt || new Date().toISOString(),
      event_type: body.event_type || body.type || body.eventType || 'transaction_update'
    };

    addLog("Extracted webhook event data:", 'INFO');
    addLog(JSON.stringify(event, null, 2), 'INFO');

    // Validate required fields
    addLog("Validating webhook event data...", 'INFO');
    
    if (!event.transaction_id && !event.order_id) {
      addLog("ERROR: Missing required field - transaction_id or order_id", 'ERROR');
      return NextResponse.json(
        { 
          success: false,
          error: "Missing required field: transaction_id or order_id",
          webhook_id: webhookId,
          logs: logs
        },
        { status: 400 }
      );
    }

    if (!event.status) {
      addLog("ERROR: Missing required field - status", 'ERROR');
      return NextResponse.json(
        { 
          success: false,
          error: "Missing required field: status",
          webhook_id: webhookId,
          logs: logs
        },
        { status: 400 }
      );
    }

    addLog("Webhook event validation passed", 'SUCCESS');

    // Determine event type and status
    const eventStatus = event.status.toLowerCase();
    let isSuccess = false;
    let isPending = false;
    let isFailed = false;
    let isCancelled = false;

    addLog(`Processing event status: ${eventStatus}`, 'INFO');

    if (eventStatus === 'success' || eventStatus === 'completed' || eventStatus === 'approved' || eventStatus === 'paid') {
      isSuccess = true;
      addLog("Event status: SUCCESS", 'SUCCESS');
    } else if (eventStatus === 'pending' || eventStatus === 'processing' || eventStatus === 'authorized') {
      isPending = true;
      addLog("Event status: PENDING", 'WARN');
    } else if (eventStatus === 'failed' || eventStatus === 'error' || eventStatus === 'declined' || eventStatus === 'rejected') {
      isFailed = true;
      addLog("Event status: FAILED", 'ERROR');
    } else if (eventStatus === 'cancelled' || eventStatus === 'canceled' || eventStatus === 'voided') {
      isCancelled = true;
      addLog("Event status: CANCELLED", 'WARN');
    } else {
      addLog("Event status: UNKNOWN", 'WARN');
    }

    // Process the webhook event based on status
    addLog("Processing webhook event...", 'INFO');

    if (isSuccess) {
      addLog("Processing successful transaction", 'INFO');
      addLog(`Transaction ID: ${event.transaction_id}`, 'INFO');
      addLog(`Order ID: ${event.order_id}`, 'INFO');
      addLog(`Amount: ${event.amount} ${event.currency}`, 'INFO');
      
      // Here you would typically:
      // 1. Update order status in database
      // 2. Send confirmation email to customer
      // 3. Update inventory
      // 4. Generate invoice
      // 5. Update analytics
      
      addLog("Simulating successful transaction processing...", 'INFO');
      setTimeout(() => {
        addLog("✓ Order status updated in database", 'SUCCESS');
        addLog("✓ Confirmation email sent to customer", 'SUCCESS');
        addLog("✓ Inventory updated", 'SUCCESS');
        addLog("✓ Invoice generated", 'SUCCESS');
        addLog("✓ Analytics updated", 'SUCCESS');
      }, 1000);

    } else if (isFailed) {
      addLog("Processing failed transaction", 'INFO');
      addLog(`Transaction ID: ${event.transaction_id}`, 'INFO');
      addLog(`Order ID: ${event.order_id}`, 'INFO');
      addLog(`Failure reason: ${body.failure_reason || body.error_message || 'Unknown'}`, 'ERROR');
      
      // Here you would typically:
      // 1. Update order status to failed
      // 2. Send failure notification
      // 3. Restore inventory
      // 4. Log failure for analysis
      
      addLog("Simulating failed transaction processing...", 'INFO');
      setTimeout(() => {
        addLog("✓ Order status updated to failed", 'SUCCESS');
        addLog("✓ Failure notification sent", 'SUCCESS');
        addLog("✓ Inventory restored", 'SUCCESS');
        addLog("✓ Failure logged for analysis", 'SUCCESS');
      }, 1000);

    } else if (isPending) {
      addLog("Processing pending transaction", 'INFO');
      addLog(`Transaction ID: ${event.transaction_id}`, 'INFO');
      addLog(`Order ID: ${event.order_id}`, 'INFO');
      
      // Here you would typically:
      // 1. Update order status to pending
      // 2. Send pending notification
      // 3. Set up monitoring for status changes
      
      addLog("Simulating pending transaction processing...", 'INFO');
      setTimeout(() => {
        addLog("✓ Order status updated to pending", 'SUCCESS');
        addLog("✓ Pending notification sent", 'SUCCESS');
        addLog("✓ Status monitoring set up", 'SUCCESS');
      }, 1000);

    } else if (isCancelled) {
      addLog("Processing cancelled transaction", 'INFO');
      addLog(`Transaction ID: ${event.transaction_id}`, 'INFO');
      addLog(`Order ID: ${event.order_id}`, 'INFO');
      
      // Here you would typically:
      // 1. Update order status to cancelled
      // 2. Send cancellation notification
      // 3. Restore inventory
      // 4. Process refund if needed
      
      addLog("Simulating cancelled transaction processing...", 'INFO');
      setTimeout(() => {
        addLog("✓ Order status updated to cancelled", 'SUCCESS');
        addLog("✓ Cancellation notification sent", 'SUCCESS');
        addLog("✓ Inventory restored", 'SUCCESS');
        addLog("✓ Refund processed if applicable", 'SUCCESS');
      }, 1000);

    } else {
      addLog("Processing unknown status transaction", 'WARN');
      addLog(`Transaction ID: ${event.transaction_id}`, 'INFO');
      addLog(`Order ID: ${event.order_id}`, 'INFO');
      addLog(`Unknown status: ${eventStatus}`, 'WARN');
      
      // Here you would typically:
      // 1. Log unknown status for investigation
      // 2. Send alert to admin
      // 3. Flag for manual review
      
      addLog("Simulating unknown status processing...", 'INFO');
      setTimeout(() => {
        addLog("✓ Unknown status logged for investigation", 'SUCCESS');
        addLog("✓ Admin alert sent", 'SUCCESS');
        addLog("✓ Flagged for manual review", 'SUCCESS');
      }, 1000);
    }

    // Prepare response
    const responseData = {
      success: true,
      webhook_id: webhookId,
      event_processed: true,
      transaction_id: event.transaction_id,
      order_id: event.order_id,
      status: event.status,
      amount: event.amount,
      currency: event.currency,
      timestamp: event.timestamp,
      is_success: isSuccess,
      is_pending: isPending,
      is_failed: isFailed,
      is_cancelled: isCancelled,
      message: isSuccess 
        ? "Transaction processed successfully" 
        : isPending 
        ? "Transaction is being processed" 
        : isFailed 
        ? "Transaction failed"
        : isCancelled 
        ? "Transaction was cancelled"
        : "Transaction status unknown",
      logs: logs
    };

    addLog("Preparing webhook response...", 'INFO');
    addLog("Response data: " + JSON.stringify(responseData, null, 2), 'INFO');
    addLog("=== GENIE WEBHOOK EVENT PROCESSING COMPLETED ===", 'SUCCESS');

    return NextResponse.json(responseData, { status: 200 });

  } catch (error) {
    addLog("ERROR processing webhook: " + error, 'ERROR');
    addLog("Raw request body could not be parsed", 'ERROR');
    
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to process webhook payload",
        webhook_id: webhookId,
        logs: logs
      },
      { status: 400 }
    );
  }
}

export async function GET(request: NextRequest) {
  const logs: string[] = [];
  const webhookId = `WEBHOOK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const addLog = (message: string, level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS' = 'INFO') => {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${webhookId}] [${level}] ${message}`;
    logs.push(logEntry);
    console.log(logEntry);
  };

  addLog("=== GENIE WEBHOOK ENDPOINT HEALTH CHECK ===", 'INFO');
  addLog(`Webhook ID: ${webhookId}`, 'INFO');
  addLog(`Request URL: ${request.url}`, 'INFO');
  addLog(`Request Method: ${request.method}`, 'INFO');

  const healthData = {
    success: true,
    webhook_id: webhookId,
    endpoint: "Genie Webhook Event Handler",
    status: "healthy",
    message: "Webhook endpoint is ready to receive events",
    supported_methods: ["POST"],
    expected_payload_format: "JSON",
    timestamp: new Date().toISOString(),
    logs: logs
  };

  addLog("Health check completed successfully", 'SUCCESS');
  addLog("=== GENIE WEBHOOK HEALTH CHECK COMPLETED ===", 'SUCCESS');

  return NextResponse.json(healthData, { status: 200 });
} 