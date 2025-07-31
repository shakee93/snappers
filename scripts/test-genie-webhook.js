const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = 'http://localhost:3000'; // Change this to your local development URL
const WEBHOOK_URL = `${BASE_URL}/api/genie-webhook`;

// Test scenarios for webhook events
const webhookTestScenarios = [
  {
    name: "Successful Transaction Event",
    payload: {
      transaction_id: "TXN_123456789",
      order_id: "ORDER_001",
      payment_id: "PAY_123456789",
      status: "success",
      amount: "2500.00",
      currency: "LKR",
      customer_email: "customer@example.com",
      customer_name: "John Doe",
      timestamp: new Date().toISOString(),
      event_type: "transaction_completed"
    }
  },
  {
    name: "Failed Transaction Event",
    payload: {
      transaction_id: "TXN_987654321",
      order_id: "ORDER_002",
      payment_id: "PAY_987654321",
      status: "failed",
      amount: "1500.00",
      currency: "LKR",
      customer_email: "customer2@example.com",
      customer_name: "Jane Smith",
      timestamp: new Date().toISOString(),
      event_type: "transaction_failed",
      failure_reason: "Insufficient funds",
      error_message: "Payment declined by bank"
    }
  },
  {
    name: "Pending Transaction Event",
    payload: {
      transaction_id: "TXN_555666777",
      order_id: "ORDER_003",
      payment_id: "PAY_555666777",
      status: "pending",
      amount: "3000.00",
      currency: "LKR",
      customer_email: "customer3@example.com",
      customer_name: "Bob Johnson",
      timestamp: new Date().toISOString(),
      event_type: "transaction_pending",
      processing_time: "2-3 business days"
    }
  },
  {
    name: "Cancelled Transaction Event",
    payload: {
      transaction_id: "TXN_111222333",
      order_id: "ORDER_004",
      payment_id: "PAY_111222333",
      status: "cancelled",
      amount: "5000.00",
      currency: "LKR",
      customer_email: "customer4@example.com",
      customer_name: "Alice Brown",
      timestamp: new Date().toISOString(),
      event_type: "transaction_cancelled",
      cancellation_reason: "Customer requested cancellation"
    }
  },
  {
    name: "Unknown Status Event",
    payload: {
      transaction_id: "TXN_444555666",
      order_id: "ORDER_005",
      payment_id: "PAY_444555666",
      status: "unknown",
      amount: "7500.00",
      currency: "LKR",
      customer_email: "customer5@example.com",
      customer_name: "Charlie Wilson",
      timestamp: new Date().toISOString(),
      event_type: "transaction_unknown"
    }
  },
  {
    name: "Minimal Event Payload",
    payload: {
      transaction_id: "TXN_MINIMAL",
      status: "success",
      amount: "1000.00"
    }
  },
  {
    name: "Alternative Field Names",
    payload: {
      transactionId: "TXN_ALT_001",
      orderId: "ORDER_ALT_001",
      paymentId: "PAY_ALT_001",
      paymentStatus: "success",
      totalAmount: "2000.00",
      curr: "LKR",
      email: "alt@example.com",
      name: "Alternative User",
      createdAt: new Date().toISOString(),
      type: "transaction_update"
    }
  }
];

// Helper function to make HTTP request
function makeRequest(url, method = 'POST', data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Genie-Webhook-Test-Script/1.0',
        'X-Webhook-Source': 'Genie-Business'
      }
    };

    const client = urlObj.protocol === 'https:' ? https : http;
    const req = client.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: responseData
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Test function
async function testGenieWebhook() {
  console.log('🚀 Starting Genie Webhook Event Tests...\n');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Webhook URL: ${WEBHOOK_URL}\n`);

  // First, test the health check endpoint
  console.log('📋 Health Check Test');
  console.log('='.repeat(50));

  try {
    console.log('\n🔗 Testing Webhook Health Check...');
    const healthResponse = await makeRequest(WEBHOOK_URL, 'GET');
    console.log(`Status: ${healthResponse.statusCode}`);
    
    if (healthResponse.statusCode === 200) {
      try {
        const healthData = JSON.parse(healthResponse.data);
        console.log('Health Check Response:');
        console.log(JSON.stringify(healthData, null, 2));
      } catch (e) {
        console.log('Raw Health Response:', healthResponse.data);
      }
    }
  } catch (error) {
    console.error(`❌ Error in health check:`, error.message);
  }

  console.log('\n' + '='.repeat(50));

  // Test each webhook scenario
  for (let i = 0; i < webhookTestScenarios.length; i++) {
    const scenario = webhookTestScenarios[i];
    console.log(`\n📋 Test ${i + 1}: ${scenario.name}`);
    console.log('='.repeat(50));

    try {
      console.log('\n🔗 Testing Webhook Event...');
      console.log(`Payload: ${JSON.stringify(scenario.payload, null, 2)}`);
      
      const webhookResponse = await makeRequest(WEBHOOK_URL, 'POST', scenario.payload);
      console.log(`Status: ${webhookResponse.statusCode}`);
      
      if (webhookResponse.statusCode === 200) {
        try {
          const responseData = JSON.parse(webhookResponse.data);
          console.log('Webhook Response:');
          console.log(JSON.stringify(responseData, null, 2));
          
          // Check if the response contains logs
          if (responseData.logs && responseData.logs.length > 0) {
            console.log('\n📝 Webhook Logs:');
            responseData.logs.forEach(log => {
              console.log(log);
            });
          }
        } catch (e) {
          console.log('Raw Webhook Response:', webhookResponse.data);
        }
      } else {
        console.log('Error Response:', webhookResponse.data);
      }

    } catch (error) {
      console.error(`❌ Error in test ${i + 1}:`, error.message);
    }

    console.log('\n' + '='.repeat(50));
  }

  console.log('\n✅ All webhook tests completed!');
  console.log('\n📝 Next Steps:');
  console.log('1. Check your server logs for detailed webhook processing');
  console.log('2. Verify that each event type is processed correctly');
  console.log('3. Test with real Genie webhook events when available');
  console.log('4. Configure the webhook URL in Genie dashboard');
  console.log('\n🔗 Webhook URL to configure in Genie Dashboard:');
  console.log(`${BASE_URL}/api/genie-webhook`);
}

// Run the tests
if (require.main === module) {
  testGenieWebhook().catch(console.error);
}

module.exports = { testGenieWebhook, webhookTestScenarios }; 