# WordPress GraphQL PHP Output Debug Guide

## The Problem

Your WordPress GraphQL endpoint is intermittently returning PHP debug output instead of JSON, causing the error:

```
ServerParseError: Unexpected token 'A', "Array(" ... is not valid JSON
```

## Debug Scripts

### 1. Basic GraphQL Test
```bash
npm run debug-graphql
```
Tests if the GraphQL endpoint is responding with valid JSON.

### 2. Checkout Mutation Test
```bash  
npm run debug-checkout
```
Tests the specific checkout mutation that's causing issues.

### 3. Real Checkout Scenario Test
```bash
npm run debug-real-checkout
```
Tests checkout with proper session handling - run this when you encounter the error.

## Common Causes & Solutions

### 1. WordPress Debug Configuration
**Problem**: `WP_DEBUG_DISPLAY` is set to `true`
**Solution**: Set it to `false` in `wp-config.php`

```php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
define('WP_DEBUG_DISPLAY', false);  // Critical!
```

### 2. PHP Notices/Warnings
**Problem**: PHP notices are being output before GraphQL response
**Solution**: Check WordPress error logs and fix the underlying PHP issues

### 3. Plugin Conflicts
**Problem**: WooCommerce payment plugins outputting debug info
**Solution**: Disable plugins one by one to identify the culprit

### 4. Custom Code Issues
**Problem**: Theme or plugin code using `echo`, `print_r`, or `var_dump`
**Solution**: Search for these functions in your WordPress code

## WordPress Error Logs

Check these locations for error logs:
- `/wp-content/debug.log`
- Your server's error log
- Hosting provider's error logs

## Quick Fix Commands

```bash
# Set environment variable
export NEXT_PUBLIC_WP_GRAPHQL=https://api.gqmobiles.lk/graphql

# Test all scenarios
npm run debug-graphql && npm run debug-checkout && npm run debug-real-checkout
```

## When to Run These Scripts

1. **When you encounter the PHP output error** - run `debug-real-checkout`
2. **After making WordPress changes** - run `debug-graphql`
3. **When testing checkout fixes** - run `debug-checkout`

## Expected Results

✅ **Good**: All scripts return valid JSON
❌ **Bad**: Any script shows PHP output or parse errors

## Next Steps

If scripts detect PHP output:
1. Check WordPress error logs
2. Disable WooCommerce payment plugins
3. Check custom checkout code
4. Set `WP_DEBUG_DISPLAY` to `false`
5. Contact your WordPress developer 