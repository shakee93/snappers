#!/usr/bin/env node

const https = require('https');
const http = require('http');
const { URL } = require('url');

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_WP_GRAPHQL || 'https://api.gqmobiles.lk/graphql';

console.log('🔍 Testing Real Checkout Scenario');
console.log('📍 Endpoint:', GRAPHQL_ENDPOINT);
console.log('Run this when you encounter the PHP output error');
console.log('=' . repeat(50));

// First, let's test getting a cart to establish session
const getCartQuery = {
  query: `
    query GetCart {
      cart {
        contents {
          itemCount
          nodes {
            key
            quantity
            product {
              node {
                name
                databaseId
              }
            }
          }
        }
        total
        subtotal
        needsShippingAddress
      }
    }
  `
};

function makeRequest(url, data, headers = {}) {
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
        'User-Agent': 'GraphQL-Real-Checkout-Test',
        ...headers
      }
    };

    const req = client.request(options, (res) => {
      let responseData = '';
      
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

async function testRealCheckout() {
  console.log('🚀 Step 1: Getting cart session...');
  
  try {
    const cartResponse = await makeRequest(GRAPHQL_ENDPOINT, getCartQuery);
    
    console.log('📊 Cart Response Status:', cartResponse.statusCode);
    
    // Extract session token
    const sessionToken = cartResponse.headers['woocommerce-session'];
    console.log('🔑 Session Token:', sessionToken ? 'Found' : 'Missing');
    
    if (!sessionToken) {
      console.log('❌ No session token found. This might be part of the issue.');
      return;
    }
    
    console.log('✅ Session established. Testing checkout...');
    console.log('');
    
    // Now test checkout with session
    const checkoutMutation = {
      query: `
        mutation checkout($input: CheckoutInput!) {
          checkout(input: $input) {
            clientMutationId
            redirect
            result
            order {
              total
              id
              databaseId
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
            city: "Test City",
            country: "LK",
            email: "test@example.com",
            phone: "0123456789"
          },
          billing: {
            firstName: "Test",
            lastName: "User",
            address1: "123 Test Street",
            city: "Test City",
            country: "LK",
            email: "test@example.com",
            phone: "0123456789"
          }
        }
      }
    };
    
    const checkoutResponse = await makeRequest(GRAPHQL_ENDPOINT, checkoutMutation, {
      'woocommerce-session': sessionToken
    });
    
    console.log('📊 Checkout Response Status:', checkoutResponse.statusCode);
    console.log('📦 Raw checkout response (first 1000 chars):');
    console.log('-'.repeat(50));
    console.log(checkoutResponse.body.substring(0, 1000));
    console.log('-'.repeat(50));
    
    // Check for PHP output
    if (checkoutResponse.body.trim().startsWith('Array') || 
        checkoutResponse.body.includes('Notice:') ||
        checkoutResponse.body.includes('Warning:') ||
        checkoutResponse.body.includes('Fatal error:')) {
      
      console.log('🚨 PHP OUTPUT DETECTED IN CHECKOUT!');
      console.log('This is the source of your error.');
      console.log('Full response:');
      console.log(checkoutResponse.body);
      
      console.log('');
      console.log('ACTION ITEMS:');
      console.log('1. Check your WordPress error logs');
      console.log('2. Disable WooCommerce payment plugins one by one');
      console.log('3. Check for custom checkout code in your theme');
      console.log('4. Set WP_DEBUG_DISPLAY to false in wp-config.php');
      
      return;
    }
    
    try {
      const jsonData = JSON.parse(checkoutResponse.body);
      console.log('✅ Valid JSON response from checkout');
      
      if (jsonData.errors) {
        console.log('⚠️  GraphQL errors:', jsonData.errors);
      } else {
        console.log('✅ Checkout successful!');
      }
      
    } catch (parseError) {
      console.log('❌ JSON Parse Error - This is your issue!');
      console.log('Parse error:', parseError.message);
      console.log('');
      console.log('Response causing the error:');
      console.log(checkoutResponse.body);
    }
    
  } catch (error) {
    console.log('❌ Request failed:', error.message);
  }
}

// Run the test
testRealCheckout(); 