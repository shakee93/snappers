const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = 'http://localhost:3000'; // Change this to your local development URL
const CALLBACK_URL = `${BASE_URL}/payment/genie-thankyou`;
const API_CALLBACK_URL = `${BASE_URL}/api/genie-callback`;

// Test scenarios
const testScenarios = [
  {
    name: "Successful Payment",
    params: {
      order_id: "GENIE_ORDER_001",
      payment_id: "PAY_123456789",
      status: "success",
      amount: "2500.00",
      currency: "LKR",
      signature: "abc123def456",
      timestamp: new Date().toISOString(),
      customer_email: "test@example.com",
      customer_name: "John Doe"
    }
  },
  {
    name: "Failed Payment",
    params: {
      order_id: "GENIE_ORDER_002",
      payment_id: "PAY_987654321",
      status: "failed",
      amount: "1500.00",
      currency: "LKR",
      signature: "xyz789abc456",
      timestamp: new Date().toISOString(),
      error_code: "INSUFFICIENT_FUNDS",
      error_message: "Insufficient funds in account"
    }
  },
  {
    name: "Pending Payment",
    params: {
      order_id: "GENIE_ORDER_003",
      payment_id: "PAY_555666777",
      status: "pending",
      amount: "3000.00",
      currency: "LKR",
      signature: "def456ghi789",
      timestamp: new Date().toISOString(),
      processing_time: "2-3 business days"
    }
  },
  {
    name: "Unknown Status",
    params: {
      order_id: "GENIE_ORDER_004",
      payment_id: "PAY_111222333",
      status: "unknown",
      amount: "5000.00",
      currency: "LKR",
      signature: "jkl012mno345",
      timestamp: new Date().toISOString()
    }
  }
];

// Helper function to build URL with parameters
function buildUrl(baseUrl, params) {
  const url = new URL(baseUrl);
  Object.keys(params).forEach(key => {
    url.searchParams.append(key, params[key]);
  });
  return url.toString();
}

// Helper function to make HTTP request
function makeRequest(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Genie-Payment-Test-Script/1.0'
      }
    };

    const client = urlObj.protocol === 'https:' ? https : http;
    const req = client.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
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
async function testGenieCallback() {
  console.log('🚀 Starting Genie Payment Callback Tests...\n');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Callback URL: ${CALLBACK_URL}`);
  console.log(`API Callback URL: ${API_CALLBACK_URL}\n`);

  for (let i = 0; i < testScenarios.length; i++) {
    const scenario = testScenarios[i];
    console.log(`\n📋 Test ${i + 1}: ${scenario.name}`);
    console.log('='.repeat(50));

    try {
      // Test the frontend callback page
      console.log('\n🔗 Testing Frontend Callback Page...');
      const frontendUrl = buildUrl(CALLBACK_URL, scenario.params);
      console.log(`URL: ${frontendUrl}`);
      
      const frontendResponse = await makeRequest(frontendUrl);
      console.log(`Status: ${frontendResponse.statusCode}`);
      console.log(`Response Length: ${frontendResponse.data.length} characters`);

      // Test the API callback endpoint
      console.log('\n🔗 Testing API Callback Endpoint...');
      const apiUrl = buildUrl(API_CALLBACK_URL, scenario.params);
      console.log(`URL: ${apiUrl}`);
      
      const apiResponse = await makeRequest(apiUrl);
      console.log(`Status: ${apiResponse.statusCode}`);
      
      if (apiResponse.statusCode === 200) {
        try {
          const responseData = JSON.parse(apiResponse.data);
          console.log('API Response:');
          console.log(JSON.stringify(responseData, null, 2));
        } catch (e) {
          console.log('Raw API Response:', apiResponse.data);
        }
      }

      // Test POST to API endpoint
      console.log('\n🔗 Testing API Callback POST...');
      const postResponse = await makeRequest(API_CALLBACK_URL, 'POST', scenario.params);
      console.log(`Status: ${postResponse.statusCode}`);
      
      if (postResponse.statusCode === 200) {
        try {
          const responseData = JSON.parse(postResponse.data);
          console.log('POST Response:');
          console.log(JSON.stringify(responseData, null, 2));
        } catch (e) {
          console.log('Raw POST Response:', postResponse.data);
        }
      }

    } catch (error) {
      console.error(`❌ Error in test ${i + 1}:`, error.message);
    }

    console.log('\n' + '='.repeat(50));
  }

  console.log('\n✅ All tests completed!');
  console.log('\n📝 Next Steps:');
  console.log('1. Open your browser and navigate to the callback URLs manually');
  console.log('2. Check the browser console for detailed logs');
  console.log('3. Verify that the debug panel shows all callback data');
  console.log('4. Test with real Genie payment callbacks when available');
}

// Run the tests
if (require.main === module) {
  testGenieCallback().catch(console.error);
}

module.exports = { testGenieCallback, testScenarios }; 