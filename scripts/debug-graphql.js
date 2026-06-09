#!/usr/bin/env node

const https = require('https');
const http = require('http');
const { URL } = require('url');

// Get the GraphQL endpoint from environment or use default
const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_WP_GRAPHQL || 'https://your-wordpress-site.com/graphql';

console.log('🔍 Debugging WordPress GraphQL Endpoint');
console.log('📍 Endpoint:', GRAPHQL_ENDPOINT);
console.log('=' . repeat(50));

// Simple GraphQL query to test
const testQuery = {
  query: `
    query TestQuery {
      generalSettings {
        title
        url
      }
    }
  `
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
        'User-Agent': 'GraphQL-Debug-Script'
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

async function debugGraphQL() {
  try {
    console.log('🚀 Sending test GraphQL query...');
    
    const response = await makeRequest(GRAPHQL_ENDPOINT, testQuery);
    
    console.log('✅ Response received');
    console.log('📦 Raw response body (first 500 chars):');
    console.log('-'.repeat(50));
    console.log(response.body.substring(0, 500));
    console.log('-'.repeat(50));
    console.log('');
    
    // Check if response starts with PHP output
    if (response.body.trim().startsWith('Array') || 
        response.body.trim().startsWith('object(') ||
        response.body.includes('Notice:') ||
        response.body.includes('Warning:') ||
        response.body.includes('Fatal error:')) {
      
      console.log('🚨 PROBLEM DETECTED: PHP output found in response!');
      console.log('');
      console.log('The response contains PHP debug output or errors.');
      console.log('This is likely caused by:');
      console.log('1. WP_DEBUG_DISPLAY is set to true in wp-config.php');
      console.log('2. PHP errors/warnings in plugins or themes');
      console.log('3. Plugins echoing content before GraphQL response');
      console.log('');
      console.log('SOLUTIONS:');
      console.log('1. Set WP_DEBUG_DISPLAY to false in wp-config.php');
      console.log('2. Check your error logs for PHP errors');
      console.log('3. Disable plugins one by one to identify the culprit');
      console.log('4. Check your active theme functions.php');
      
      return;
    }
    
    // Try to parse as JSON
    try {
      const jsonData = JSON.parse(response.body);
      console.log('✅ Valid JSON response received');
      console.log('📄 Parsed response:', JSON.stringify(jsonData, null, 2));
      
      if (jsonData.data) {
        console.log('✅ GraphQL query executed successfully');
      } else if (jsonData.errors) {
        console.log('⚠️  GraphQL errors found:', jsonData.errors);
      }
      
    } catch (parseError) {
      console.log('❌ Failed to parse JSON response');
      console.log('Parse error:', parseError.message);
      console.log('');
      console.log('This suggests the response is not valid JSON.');
      console.log('Check the raw response above for PHP output or HTML.');
    }
    
  } catch (error) {
    console.log('❌ Request failed:', error.message);
  }
}

// Run the debug
debugGraphQL(); 