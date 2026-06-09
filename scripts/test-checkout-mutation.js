#!/usr/bin/env node

const https = require('https');
const http = require('http');
const { URL } = require('url');

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_WP_GRAPHQL || 'https://api.gqmobiles.lk/graphql';

console.log('🔍 Testing WordPress GraphQL Checkout Mutation');
console.log('📍 Endpoint:', GRAPHQL_ENDPOINT);
console.log('=' . repeat(50));

// Test the checkout mutation that's causing issues
const checkoutMutation = {
  query: `
    mutation checkout($input: CheckoutInput!) {
      checkout(input: $input) {
        clientMutationId
        redirect
        result
        customer {
          displayName
          email
        }
        order {
          total
          id
          databaseId
          lineItems {
            nodes {
              databaseId
              subtotal
              quantity
              product {
                node {
                  name
                  databaseId
                }
              }
            }
          }
        }
      }
    }
  `,
  variables: {
    input: {
      paymentMethod: "cod",
      shippingMethod: {
        methodId: "wbs:0dd3bc79_weight_based_shipping",
        methodTitle: "Weight Based Shipping",
        total: "500"
      },
      shipping: {
        firstName: "Test",
        lastName: "User",
        address1: "123 Test Street",
        address2: "",
        city: "Test City",
        state: "",
        postcode: "12345",
        country: "LK",
        email: "test@example.com",
        phone: "0123456789"
      },
      billing: {
        firstName: "Test",
        lastName: "User", 
        address1: "123 Test Street",
        address2: "",
        city: "Test City",
        state: "",
        postcode: "12345",
        country: "LK",
        email: "test@example.com",
        phone: "0123456789"
      },
      customerNote: "<p><strong>Customer Email:</strong> test@example.com</p><p><strong>Phone Number:</strong> 0123456789</p>",
      metaData: [
        {
          key: "payhere_order_id",
          value: ""
        }
      ]
    }
  }
};

function makeRequest(url, data) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const isHttps = parsedUrl.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (isHttps ? 443 : 80),
      path: parsedUrl.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': 'GraphQL-Checkout-Test',
        'woocommerce-session': 'Session test-session-token'
      }
    };

    const req = client.request(options, (res) => {
      let responseData = '';
      
      console.log('📊 Response Status:', res.statusCode);
      console.log('📋 Response Headers:', res.headers);
      console.log('');

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: responseData
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function testCheckout() {
  try {
    console.log('🚀 Testing checkout mutation...');
    
    const response = await makeRequest(GRAPHQL_ENDPOINT, checkoutMutation);
    
    console.log('✅ Response received');
    console.log('📦 Raw response body (first 1000 chars):');
    console.log('-'.repeat(50));
    console.log(response.body.substring(0, 1000));
    console.log('-'.repeat(50));
    console.log('');
    
    // Check if response starts with PHP output
    if (response.body.trim().startsWith('Array') || 
        response.body.trim().startsWith('object(') ||
        response.body.includes('Notice:') ||
        response.body.includes('Warning:') ||
        response.body.includes('Fatal error:') ||
        response.body.includes('Call to undefined') ||
        response.body.includes('PHP')) {
      
      console.log('🚨 PROBLEM DETECTED: PHP output found in checkout response!');
      console.log('');
      console.log('Full response body:');
      console.log(response.body);
      
      return;
    }
    
    // Try to parse as JSON
    try {
      const jsonData = JSON.parse(response.body);
      console.log('✅ Valid JSON response received from checkout mutation');
      console.log('📄 Parsed response:', JSON.stringify(jsonData, null, 2));
      
      if (jsonData.data && jsonData.data.checkout) {
        console.log('✅ Checkout mutation executed successfully');
        console.log('Order ID:', jsonData.data.checkout.order?.databaseId);
      } else if (jsonData.errors) {
        console.log('⚠️  GraphQL errors found:', jsonData.errors);
      }
      
    } catch (parseError) {
      console.log('❌ Failed to parse JSON response from checkout mutation');
      console.log('Parse error:', parseError.message);
      console.log('');
      console.log('This is exactly the error you\'re seeing in your app!');
      console.log('Raw response that caused the error:');
      console.log(response.body);
    }
    
  } catch (error) {
    console.log('❌ Request failed:', error.message);
  }
}

// Run the test
testCheckout(); 