# NDB-Pay (CyberSource) Integration Setup

## WordPress Backend Setup

### Option 1: Add to functions.php

Add the code from `wordpress-ndb-pay-endpoint.php` to your theme's `functions.php` file.

### Option 2: Create as a Plugin

1. Create a new folder: `wp-content/plugins/ndb-pay-gateway/`
2. Create `ndb-pay-gateway.php` with the code
3. Activate the plugin in WordPress admin

## Configuration

### Method 1: WordPress Options (Recommended)

Add these to your `wp-config.php` or use WordPress options:

```php
// In wp-config.php or via WordPress options
define('NDB_PAY_ACCESS_KEY', 'd609ad7869b432e99f2088794a47b65c');
define('NDB_PAY_PROFILE_ID', '084B767B-5A00-496B-8A21-3EB771DFF36F');
define('NDB_PAY_SECRET_KEY', 'b4d982303486434aaceaccbd11f6667e4f47843d22a241b0a9a443be99a2f180c763e55570c146eeb1e14c58a2c5c245109a82df9a7f474d8086bac64c32e9c40fcec09394e549aca4011d658eba0905f4685c5e00564f37a0c750a1d19c5539aa8b25bb108b4c87b298f0329ea4891fb28727267cff46fe9f965b56ee0e5b57');
define('NDB_PAY_TEST_MODE', true); // Set to false for production
```

### Method 2: WordPress Options API

The code uses `get_option()` to retrieve settings. You can set them via:

```php
update_option('ndb_pay_access_key', 'your-access-key');
update_option('ndb_pay_profile_id', 'your-profile-id');
update_option('ndb_pay_secret_key', 'your-secret-key');
update_option('ndb_pay_test_mode', true); // or false for production
```

### Method 3: Admin Settings Page

Uncomment the settings page code at the bottom of `wordpress-ndb-pay-endpoint.php` to add an admin interface.

## API Endpoint

**URL:** `https://your-site.com/wp-json/api/gq_mobile/v1/ndb-pay-post-data`

**Method:** POST

**Request Body:**
```json
{
  "order_id": "12345",
  "amount": "125.00",
  "currency": "LKR",
  "email": "customer@example.com",
  "phone": "0771234567"
}
```

**Response:**
Returns HTML form with all signed fields ready to submit to CyberSource.

## Testing

1. Set `NDB_PAY_TEST_MODE` to `true`
2. Use test credentials from CyberSource
3. Test card: `4916217501611292` (Visa test card)
4. Use any future expiry date and any CVV

## Production

1. Set `NDB_PAY_TEST_MODE` to `false`
2. Update credentials with production values from CyberSource
3. The payment URL will automatically switch to production

## Security Notes

- Store secret keys securely (use WordPress options or constants)
- Never commit secret keys to version control
- Use HTTPS for all API calls
- Validate and sanitize all input data (already done in the code)
