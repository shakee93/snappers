<?php
/**
 * NDB-Pay (CyberSource Secure Acceptance) Payment Gateway
 * WordPress REST API Endpoint
 * 
 * This endpoint generates a signed CyberSource form for NDB-Pay payments
 * 
 * Endpoint: /wp-json/api/gq_mobile/v1/ndb-pay-post-data
 * Method: POST
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Register REST API endpoint for NDB-Pay form generation
 */
add_action('rest_api_init', function () {
    register_rest_route('api/gq_mobile/v1', '/ndb-pay-post-data', array(
        'methods' => 'POST',
        'callback' => 'generate_ndb_pay_form',
        'permission_callback' => '__return_true', // Public endpoint
    ));
});

/**
 * Generate signed CyberSource form for NDB-Pay
 * 
 * @param WP_REST_Request $request REST request object
 * @return WP_REST_Response|WP_Error
 */
function generate_ndb_pay_form($request) {
    try {
        // Get request data
        $data = $request->get_json_params();
        
        // Validate required fields
        if (empty($data['order_id'])) {
            return new WP_Error('missing_order_id', 'Order ID is required', array('status' => 400));
        }
        
        // Get NDB-Pay settings from WordPress options
        // You can store these in wp_options table or use a settings page
        $access_key = get_option('ndb_pay_access_key', 'd609ad7869b432e99f2088794a47b65c');
        $profile_id = get_option('ndb_pay_profile_id', '084B767B-5A00-496B-8A21-3EB771DFF36F');
        $secret_key = get_option('ndb_pay_secret_key', 'b4d982303486434aaceaccbd11f6667e4f47843d22a241b0a9a443be99a2f180c763e55570c146eeb1e14c58a2c5c245109a82df9a7f474d8086bac64c32e9c40fcec09394e549aca4011d658eba0905f4685c5e00564f37a0c750a1d19c5539aa8b25bb108b4c87b298f0329ea4891fb28727267cff46fe9f965b56ee0e5b57');
        
        // Determine if test or production
        $is_test = get_option('ndb_pay_test_mode', true);
        $pay_url = $is_test 
            ? 'https://testsecureacceptance.cybersource.com/pay'
            : 'https://secureacceptance.cybersource.com/pay';
        
        // Get order details
        $order_id = sanitize_text_field($data['order_id']);
        $amount = isset($data['amount']) ? sanitize_text_field($data['amount']) : '0.00';
        $currency = isset($data['currency']) ? sanitize_text_field($data['currency']) : 'LKR';
        
        // Clean amount - remove currency symbols and format
        $amount = preg_replace('/[^0-9.]/', '', $amount);
        $amount = number_format((float)$amount, 2, '.', '');
        
        // Generate transaction UUID
        $transaction_uuid = wp_generate_uuid4();
        
        // Get current date/time in ISO 8601 format
        $signed_date_time = gmdate('Y-m-d\TH:i:s\Z');
        
        // Define signed field names (must be in this order)
        $signed_field_names = array(
            'access_key',
            'profile_id',
            'transaction_uuid',
            'signed_field_names',
            'unsigned_field_names',
            'signed_date_time',
            'locale',
            'transaction_type',
            'reference_number',
            'auth_trans_ref_no',
            'amount',
            'currency',
        );
        
        // Build fields array
        $fields = array(
            'access_key' => $access_key,
            'profile_id' => $profile_id,
            'transaction_uuid' => $transaction_uuid,
            'signed_field_names' => implode(',', $signed_field_names),
            'unsigned_field_names' => '',
            'signed_date_time' => $signed_date_time,
            'locale' => 'en',
            'transaction_type' => 'sale',
            'reference_number' => $order_id,
            'auth_trans_ref_no' => $order_id,
            'amount' => $amount,
            'currency' => $currency,
            'submit' => 'Submit',
        );
        
        // Generate signature
        $signature = generate_ndb_pay_signature($fields, $signed_field_names, $secret_key);
        $fields['signature'] = $signature;
        
        // Generate HTML form
        $form_html = generate_ndb_pay_form_html($fields, $pay_url);
        
        // Return the form HTML
        return new WP_REST_Response($form_html, 200);
        
    } catch (Exception $e) {
        return new WP_Error('ndb_pay_error', $e->getMessage(), array('status' => 500));
    }
}

/**
 * Generate HMAC SHA256 signature for CyberSource
 * 
 * @param array $fields Form fields
 * @param array $signed_field_names Field names to sign (in order)
 * @param string $secret_key Secret key from CyberSource
 * @return string Base64 encoded signature
 */
function generate_ndb_pay_signature($fields, $signed_field_names, $secret_key) {
    // Build signed string: field1=value1,field2=value2,...
    $signed_string_parts = array();
    foreach ($signed_field_names as $field_name) {
        if (isset($fields[$field_name])) {
            $signed_string_parts[] = $field_name . '=' . $fields[$field_name];
        }
    }
    $signed_string = implode(',', $signed_string_parts);
    
    // Create HMAC SHA256 hash
    $hash = hash_hmac('sha256', $signed_string, $secret_key, true);
    
    // Encode to base64 and convert to uppercase
    $signature = strtoupper(base64_encode($hash));
    
    return $signature;
}

/**
 * Generate HTML form with all hidden fields
 * 
 * @param array $fields Form fields including signature
 * @param string $pay_url CyberSource payment URL
 * @return string HTML form
 */
function generate_ndb_pay_form_html($fields, $pay_url) {
    $inputs = '';
    
    foreach ($fields as $key => $value) {
        // Escape HTML attributes
        $escaped_key = esc_attr($key);
        $escaped_value = esc_attr($value);
        $inputs .= sprintf('<input type="hidden" name="%s" value="%s" />', $escaped_key, $escaped_value) . "\n";
    }
    
    $form_html = sprintf(
        '<!doctype html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Redirecting to Payment Gateway...</title>
</head>
<body>
    <form method="POST" action="%s" id="ndb-pay-form">
        %s
    </form>
    <script>
        // Auto-submit form
        document.getElementById("ndb-pay-form").submit();
    </script>
</body>
</html>',
        esc_url($pay_url),
        $inputs
    );
    
    return $form_html;
}

/**
 * Helper function to generate UUID v4
 * 
 * @return string UUID
 */
function wp_generate_uuid4() {
    return sprintf(
        '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );
}

/**
 * Optional: Add settings page for NDB-Pay configuration
 * Uncomment to add admin settings page
 */
/*
add_action('admin_menu', function() {
    add_options_page(
        'NDB-Pay Settings',
        'NDB-Pay',
        'manage_options',
        'ndb-pay-settings',
        'ndb_pay_settings_page'
    );
});

function ndb_pay_settings_page() {
    if (isset($_POST['ndb_pay_save_settings'])) {
        check_admin_referer('ndb_pay_settings');
        
        update_option('ndb_pay_access_key', sanitize_text_field($_POST['ndb_pay_access_key']));
        update_option('ndb_pay_profile_id', sanitize_text_field($_POST['ndb_pay_profile_id']));
        update_option('ndb_pay_secret_key', sanitize_text_field($_POST['ndb_pay_secret_key']));
        update_option('ndb_pay_test_mode', isset($_POST['ndb_pay_test_mode']) ? true : false);
        
        echo '<div class="notice notice-success"><p>Settings saved!</p></div>';
    }
    
    $access_key = get_option('ndb_pay_access_key', '');
    $profile_id = get_option('ndb_pay_profile_id', '');
    $secret_key = get_option('ndb_pay_secret_key', '');
    $test_mode = get_option('ndb_pay_test_mode', true);
    ?>
    <div class="wrap">
        <h1>NDB-Pay Settings</h1>
        <form method="post">
            <?php wp_nonce_field('ndb_pay_settings'); ?>
            <table class="form-table">
                <tr>
                    <th><label for="ndb_pay_access_key">Access Key</label></th>
                    <td><input type="text" id="ndb_pay_access_key" name="ndb_pay_access_key" value="<?php echo esc_attr($access_key); ?>" class="regular-text" /></td>
                </tr>
                <tr>
                    <th><label for="ndb_pay_profile_id">Profile ID</label></th>
                    <td><input type="text" id="ndb_pay_profile_id" name="ndb_pay_profile_id" value="<?php echo esc_attr($profile_id); ?>" class="regular-text" /></td>
                </tr>
                <tr>
                    <th><label for="ndb_pay_secret_key">Secret Key</label></th>
                    <td><textarea id="ndb_pay_secret_key" name="ndb_pay_secret_key" rows="3" class="large-text"><?php echo esc_textarea($secret_key); ?></textarea></td>
                </tr>
                <tr>
                    <th><label for="ndb_pay_test_mode">Test Mode</label></th>
                    <td><input type="checkbox" id="ndb_pay_test_mode" name="ndb_pay_test_mode" <?php checked($test_mode, true); ?> /></td>
                </tr>
            </table>
            <?php submit_button('Save Settings', 'primary', 'ndb_pay_save_settings'); ?>
        </form>
    </div>
    <?php
}
*/
