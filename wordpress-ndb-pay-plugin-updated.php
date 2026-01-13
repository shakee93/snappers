<?php
/**
 * Plugin Name: NDB Online Payment Gateway for WooCommerce
 * Description: Registers a WooCommerce payment gateway "NDB Online Payment Gateway" (ID: ndb-pay) with settings for Secret Key, Access Key, and Profile ID. Processes payments by redirecting to the NDB endpoint and handles callbacks.
 * Version: 1.0.0
 * Author: plugin0.com
 * Text Domain: plugin0-ndb-pay
 *
 * # Changelog:
 * 1.0.0 - Initial release with gateway registration, settings, payment redirect, and callback verification.
 */

if ( ! defined( 'ABSPATH' ) ) { exit; }

// --- Admin notice if WooCommerce missing ---
function ndb_gateway_admin_notice_Ndpg() {
    if ( is_admin() && current_user_can( 'manage_options' ) ) {
        if ( ! class_exists( 'WooCommerce' ) || ! class_exists( 'WC_Payment_Gateway' ) ) {
            echo '<div class="notice notice-error"><p>' . esc_html__( 'NDB Online Payment Gateway requires WooCommerce to be installed and active.', 'plugin0-ndb-pay' ) . '</p></div>';
            p0_log('WooCommerce not active. NDB gateway cannot load.');
        }
    }
}
add_action( 'admin_notices', 'ndb_gateway_admin_notice_Ndpg' );

// --- Register gateway class on init (after WC is available) ---
function ndb_register_gateway_class_Ndpg() {
    if ( ! class_exists( 'WooCommerce' ) || ! class_exists( 'WC_Payment_Gateway' ) ) {
        return;
    }

    if ( ! class_exists( 'WC_Gateway_NDB_Pay' ) ) {
        class WC_Gateway_NDB_Pay extends WC_Payment_Gateway {
            public function __construct() {
                $this->id                 = 'ndb-pay';
                $this->method_title       = esc_html__( 'NDB Online Payment Gateway', 'plugin0-ndb-pay' );
                $this->method_description = esc_html__( 'Accept payments through NDB Online Payment Gateway. Configure your Access Key, Profile ID, and Secret Key.', 'plugin0-ndb-pay' );
                $this->has_fields         = false;
                $this->icon               = '';
                $this->supports           = array( 'products' );

                $this->init_form_fields();
                $this->init_settings();

                $this->title        = $this->get_option( 'title', esc_html__( 'NDB Online Payment', 'plugin0-ndb-pay' ) );
                $this->description  = $this->get_option( 'description', esc_html__( 'Pay securely via NDB Online Payment Gateway.', 'plugin0-ndb-pay' ) );
                $this->enabled      = $this->get_option( 'enabled', 'no' );
                $this->access_key   = $this->get_option( 'access_key', '' );
                $this->profile_id   = $this->get_option( 'profile_id', '' );
                $this->secret_key   = $this->get_option( 'secret_key', '' );
                $this->test_mode    = $this->get_option( 'test_mode', 'yes' );

                add_action( 'woocommerce_update_options_payment_gateways_' . $this->id, array( $this, 'process_admin_options' ) );
            }

            public function init_form_fields() {
                $this->form_fields = array(
                    'enabled' => array(
                        'title'   => esc_html__( 'Enable/Disable', 'plugin0-ndb-pay' ),
                        'type'    => 'checkbox',
                        'label'   => esc_html__( 'Enable NDB Online Payment Gateway', 'plugin0-ndb-pay' ),
                        'default' => 'no',
                    ),
                    'title' => array(
                        'title'       => esc_html__( 'Title', 'plugin0-ndb-pay' ),
                        'type'        => 'text',
                        'description' => esc_html__( 'This controls the title seen by customers during checkout.', 'plugin0-ndb-pay' ),
                        'default'     => esc_html__( 'NDB Online Payment', 'plugin0-ndb-pay' ),
                        'desc_tip'    => true,
                    ),
                    'description' => array(
                        'title'       => esc_html__( 'Description', 'plugin0-ndb-pay' ),
                        'type'        => 'textarea',
                        'description' => esc_html__( 'Payment method description that the customer will see on your checkout.', 'plugin0-ndb-pay' ),
                        'default'     => esc_html__( 'Pay securely via NDB Online Payment Gateway.', 'plugin0-ndb-pay' ),
                        'desc_tip'    => true,
                    ),
                    'access_key' => array(
                        'title'       => esc_html__( 'Access Key', 'plugin0-ndb-pay' ),
                        'type'        => 'text',
                        'description' => esc_html__( 'Your NDB Access Key.', 'plugin0-ndb-pay' ),
                        'default'     => '',
                        'desc_tip'    => true,
                    ),
                    'profile_id' => array(
                        'title'       => esc_html__( 'Profile ID', 'plugin0-ndb-pay' ),
                        'type'        => 'text',
                        'description' => esc_html__( 'Your NDB Profile ID.', 'plugin0-ndb-pay' ),
                        'default'     => '',
                        'desc_tip'    => true,
                    ),
                    'secret_key' => array(
                        'title'       => esc_html__( 'Secret Key', 'plugin0-ndb-pay' ),
                        'type'        => 'password',
                        'description' => esc_html__( 'Used to sign requests to NDB. Keep this secret.', 'plugin0-ndb-pay' ),
                        'default'     => '',
                        'desc_tip'    => true,
                    ),
                    'test_mode' => array(
                        'title'       => esc_html__( 'Test Mode', 'plugin0-ndb-pay' ),
                        'type'        => 'checkbox',
                        'label'       => esc_html__( 'Enable test mode (use sandbox endpoint)', 'plugin0-ndb-pay' ),
                        'default'     => 'yes',
                    ),
                );
            }

            public function is_valid_for_use() {
                return in_array( get_woocommerce_currency(), array( 'LKR', 'USD', 'EUR', 'GBP', 'AUD', 'CAD' ), true );
            }

            public function admin_options() {
                echo '<h2>' . esc_html( $this->get_method_title() ) . '</h2>';
                echo '<p>' . esc_html( $this->get_method_description() ) . '</p>';

                if ( ! $this->is_valid_for_use() ) {
                    echo '<div class="notice notice-error"><p>' . esc_html__( 'NDB payment gateway is not available for your store currency.', 'plugin0-ndb-pay' ) . '</p></div>';
                }

                echo '<table class="form-table">';
                $this->generate_settings_html();
                echo '</table>';
            }

            public function process_payment( $order_id ) {
                $order = wc_get_order( $order_id );
                if ( ! $order instanceof WC_Order ) {
                    wc_add_notice( esc_html__( 'Invalid order.', 'plugin0-ndb-pay' ), 'error' );
                    p0_log('NDB process_payment: Invalid order');
                    return array( 'result' => 'failure' );
                }

                // Collect payload
                $amount      = (float) $order->get_total();
                $currency    = $order->get_currency();
                $order_key   = $order->get_order_key();
                $order_ref   = $order->get_id() . '-' . substr( $order_key, 0, 8 );
                $return_url  = $this->get_return_url( $order );
                $cancel_url  = esc_url_raw( $order->get_cancel_order_url_raw() );
                $callback_url = add_query_arg( array( 'wc-api' => 'ndb_pay' ), home_url( '/' ) );

                $endpoint = ( 'yes' === $this->test_mode )
                    ? 'https://sandbox.ndbpay.example/checkout' // Placeholder sandbox endpoint
                    : 'https://payments.ndb.lk/checkout';       // Placeholder live endpoint

                $payload = array(
                    'access_key'  => (string) $this->access_key,
                    'profile_id'  => (string) $this->profile_id,
                    'order_id'    => (string) $order_ref,
                    'amount'      => number_format( $amount, 2, '.', '' ),
                    'currency'    => (string) $currency,
                    'return_url'  => (string) $return_url,
                    'cancel_url'  => (string) $cancel_url,
                    'callback_url'=> (string) $callback_url,
                );

                // Sign payload in sorted order for deterministic HMAC
                $signature = $this->generate_signature( $payload, (string) $this->secret_key );
                $payload['signature'] = $signature;

                $redirect_url = esc_url_raw( add_query_arg( array_map( 'rawurlencode', $payload ), $endpoint ) );

                p0_debug('NDB redirecting to gateway', array( 'order_id' => $order->get_id(), 'endpoint' => $endpoint ) );

                return array(
                    'result'   => 'success',
                    'redirect' => $redirect_url,
                );
            }

            protected function generate_signature( $data, $secret ) {
                if ( empty( $secret ) ) {
                    return '';
                }
                $keys = array_keys( $data );
                sort( $keys, SORT_STRING );
                $signing_string_parts = array();
                foreach ( $keys as $k ) {
                    if ( 'signature' === $k ) {
                        continue;
                    }
                    $v = (string) $data[ $k ];
                    $signing_string_parts[] = $k . '=' . $v;
                }
                $signing_string = implode( '&', $signing_string_parts );
                return hash_hmac( 'sha256', $signing_string, $secret );
            }

            /**
             * Get gateway settings for use in REST API
             */
            public static function get_gateway_settings() {
                $gateway = new WC_Gateway_NDB_Pay();
                return array(
                    'access_key' => $gateway->access_key,
                    'profile_id' => $gateway->profile_id,
                    'secret_key' => $gateway->secret_key,
                    'test_mode'  => $gateway->test_mode,
                );
            }
        }
    }
}
add_action( 'init', 'ndb_register_gateway_class_Ndpg', 20 );

// --- Add gateway to WooCommerce list ---
function ndb_add_gateway_to_list_Ndpg( $gateways ) {
    if ( class_exists( 'WC_Gateway_NDB_Pay' ) ) {
        $gateways[] = 'WC_Gateway_NDB_Pay';
        p0_debug('NDB gateway registered in gateways list');
    }
    return $gateways;
}
add_filter( 'woocommerce_payment_gateways', 'ndb_add_gateway_to_list_Ndpg' );

// --- Handle NDB callback: https://yoursite/?wc-api=ndb_pay ---
function ndb_handle_callback_Ndpg() {
    // Expect: access_key, profile_id, order_id, amount, currency, status, signature
    $params = array();
    foreach ( array( 'access_key','profile_id','order_id','amount','currency','status','signature' ) as $key ) {
        $params[ $key ] = isset( $_REQUEST[ $key ] ) ? sanitize_text_field( wp_unslash( $_REQUEST[ $key ] ) ) : '';
    }

    p0_debug('NDB callback hit', array( 'params' => $params ) );

    if ( empty( $params['order_id'] ) ) {
        wp_die( esc_html__( 'Missing order reference.', 'plugin0-ndb-pay' ) );
    }

    // Extract Woo order ID from composite order_ref: {id}-{key8}
    $order_id_part = (int) preg_replace( '/[^0-9]/', '', (string) $params['order_id'] );
    $order = wc_get_order( $order_id_part );

    if ( ! $order ) {
        p0_log('NDB callback: Order not found: ' . $order_id_part );
        wp_die( esc_html__( 'Order not found.', 'plugin0-ndb-pay' ) );
    }

    // Load gateway settings for signature validation
    $settings = get_option( 'woocommerce_ndb-pay_settings', array() );
    $secret   = isset( $settings['secret_key'] ) ? (string) $settings['secret_key'] : '';

    // Rebuild signature
    $data_to_sign = $params;
    unset( $data_to_sign['signature'] );
    $keys = array_keys( $data_to_sign );
    sort( $keys, SORT_STRING );
    $parts = array();
    foreach ( $keys as $k ) {
        $parts[] = $k . '=' . (string) $data_to_sign[ $k ];
    }
    $signing_string = implode( '&', $parts );
    $expected_sig = empty( $secret ) ? '' : hash_hmac( 'sha256', $signing_string, $secret );

    if ( empty( $expected_sig ) || ! hash_equals( (string) $expected_sig, (string) $params['signature'] ) ) {
        $order->add_order_note( esc_html__( 'NDB callback signature verification failed.', 'plugin0-ndb-pay' ) );
        p0_log('NDB callback: signature mismatch for order ' . $order->get_id());
        wp_die( esc_html__( 'Invalid signature.', 'plugin0-ndb-pay' ) );
    }

    // Basic amount/currency check
    $amount_matches   = abs( (float) $order->get_total() - (float) $params['amount'] ) < 0.01;
    $currency_matches = strtoupper( $order->get_currency() ) === strtoupper( $params['currency'] );

    if ( ! $amount_matches || ! $currency_matches ) {
        $order->add_order_note( esc_html__( 'NDB callback amount or currency mismatch.', 'plugin0-ndb-pay' ) );
        p0_log('NDB callback: amount/currency mismatch for order ' . $order->get_id());
        wp_die( esc_html__( 'Amount or currency mismatch.', 'plugin0-ndb-pay' ) );
    }

    $status = strtolower( $params['status'] );

    if ( in_array( $status, array( 'paid', 'success', 'authorized' ), true ) ) {
        if ( $order->has_status( array( 'pending', 'failed', 'on-hold' ) ) ) {
            $order->payment_complete( sanitize_text_field( $params['order_id'] ) );
            $order->add_order_note( esc_html__( 'Payment confirmed by NDB.', 'plugin0-ndb-pay' ) );
            p0_debug('NDB callback: order marked paid', array( 'order_id' => $order->get_id() ) );
        }
        // Redirect customer to thank you if this was browser-based callback
        if ( ! headers_sent() ) {
            wp_safe_redirect( $order->get_checkout_order_received_url() );
            exit;
        }
        exit;
    }

    if ( in_array( $status, array( 'canceled', 'cancelled', 'failed' ), true ) ) {
        $order->update_status( 'cancelled', esc_html__( 'Payment cancelled/failed at NDB.', 'plugin0-ndb-pay' ) );
        p0_debug('NDB callback: order cancelled', array( 'order_id' => $order->get_id() ) );
        if ( ! headers_sent() ) {
            wp_safe_redirect( wc_get_cart_url() );
            exit;
        }
        exit;
    }

    // Unknown status
    $order->add_order_note( sprintf( /* translators: %s payment status string */ esc_html__( 'NDB returned unhandled status: %s', 'plugin0-ndb-pay' ), esc_html( $status ) ) );
    wp_die( esc_html__( 'Unhandled status.', 'plugin0-ndb-pay' ) );
}
add_action( 'woocommerce_api_ndb_pay', 'ndb_handle_callback_Ndpg' );

// --- Settings link helper in plugins list ---
function ndb_gateway_action_links_Ndpg( $links ) {
    $settings_url = admin_url( 'admin.php?page=wc-settings&tab=checkout&section=ndb-pay' );
    $settings_link = '<a href="' . esc_url( $settings_url ) . '">' . esc_html__( 'Settings', 'plugin0-ndb-pay' ) . '</a>';
    array_unshift( $links, $settings_link );
    return $links;
}
add_filter( 'plugin_action_links_' . plugin_basename( __FILE__ ), 'ndb_gateway_action_links_Ndpg' );

// --- REST API Endpoint for CyberSource Form Generation ---
add_action('rest_api_init', function () {
    register_rest_route('api/gq_mobile/v1', '/ndb-pay-post-data', array(
        'methods' => 'POST',
        'callback' => 'generate_ndb_pay_form',
        'permission_callback' => '__return_true', // Public endpoint
    ));
});

// Filter to serve HTML directly instead of JSON for NDB-Pay endpoint
add_filter('rest_pre_serve_request', function($served, $result, $request, $server) {
    $route = $request->get_route();
    if ($route === '/api/gq_mobile/v1/ndb-pay-post-data') {
        // Extract HTML from result (could be string or WP_REST_Response)
        $html = '';
        if (is_string($result)) {
            $html = $result;
        } elseif (is_object($result) && method_exists($result, 'get_data')) {
            $data = $result->get_data();
            $html = is_string($data) ? $data : '';
        } elseif (is_wp_error($result)) {
            // Handle WP_Error - return error as HTML for debugging
            $html = '<form><p style="color:red;">Error: ' . esc_html($result->get_error_message()) . '</p></form>';
        }
        
        if (!empty($html)) {
            // Clear any previous output
            if (ob_get_level()) {
                ob_clean();
            }
            // Serve HTML directly
            status_header(200);
            header('Content-Type: text/html; charset=UTF-8');
            // Prevent WordPress from adding anything else
            remove_all_actions('shutdown');
            echo $html;
            exit;
        }
    }
    return $served;
}, 10, 4);

/**
 * Generate signed CyberSource form for NDB-Pay
 * This endpoint is called by the Next.js frontend to get the payment form
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
        
        // Get gateway settings from WooCommerce
        $settings = get_option('woocommerce_ndb-pay_settings', array());
        
        if (empty($settings)) {
            return new WP_Error('gateway_not_configured', 'NDB-Pay gateway is not configured', array('status' => 500));
        }
        
        $access_key = isset($settings['access_key']) ? $settings['access_key'] : '';
        $profile_id = isset($settings['profile_id']) ? $settings['profile_id'] : '';
        $secret_key = isset($settings['secret_key']) ? $settings['secret_key'] : '';
        $test_mode  = isset($settings['test_mode']) ? $settings['test_mode'] : 'yes';
        
        if (empty($access_key) || empty($profile_id) || empty($secret_key)) {
            return new WP_Error('missing_credentials', 'NDB-Pay credentials are not configured', array('status' => 500));
        }
        
        // Determine if test or production (CyberSource Secure Acceptance)
        $is_test = ('yes' === $test_mode);
        $pay_url = $is_test 
            ? 'https://testsecureacceptance.cybersource.com/pay'
            : 'https://secureacceptance.cybersource.com/pay';
        
        // Get order details
        $order_id = sanitize_text_field($data['order_id']);
        $amount_raw = isset($data['amount']) ? sanitize_text_field($data['amount']) : '0.00';
        $currency = isset($data['currency']) ? sanitize_text_field($data['currency']) : 'LKR';
        
        // Debug logging
        error_log('NDB-Pay: Received amount (raw): ' . $amount_raw);
        error_log('NDB-Pay: Received order_id: ' . $order_id);
        
        // Clean amount - remove currency symbols and format
        $amount = preg_replace('/[^0-9.]/', '', $amount_raw);
        $amount = number_format((float)$amount, 2, '.', '');
        
        // Debug logging after processing
        error_log('NDB-Pay: Processed amount: ' . $amount);
        
        // Generate transaction UUID
        $transaction_uuid = ndb_generate_uuid4();
        
        // Get current date/time in ISO 8601 format (UTC with Z suffix)
        // Format: 2026-01-13T03:45:00Z
        $signed_date_time = gmdate('Y-m-d\TH:i:s\Z');
        
        // Generate timestamp in milliseconds (equivalent to JavaScript Date.now())
        $timestamp_ms = (string) round(microtime(true) * 1000);
        
        // Collect billing and shipping fields (these will be unsigned)
        $unsigned_fields = array();
        
        // Billing fields
        if (!empty($data['bill_to_forename'])) {
            $unsigned_fields['bill_to_forename'] = sanitize_text_field($data['bill_to_forename']);
        }
        if (!empty($data['bill_to_surname'])) {
            $unsigned_fields['bill_to_surname'] = sanitize_text_field($data['bill_to_surname']);
        }
        if (!empty($data['bill_to_address_line1'])) {
            $unsigned_fields['bill_to_address_line1'] = sanitize_text_field($data['bill_to_address_line1']);
        }
        if (!empty($data['bill_to_address_line2'])) {
            $unsigned_fields['bill_to_address_line2'] = sanitize_text_field($data['bill_to_address_line2']);
        }
        if (!empty($data['bill_to_address_city'])) {
            $unsigned_fields['bill_to_address_city'] = sanitize_text_field($data['bill_to_address_city']);
        }
        if (!empty($data['bill_to_address_state'])) {
            $unsigned_fields['bill_to_address_state'] = sanitize_text_field($data['bill_to_address_state']);
        }
        if (!empty($data['bill_to_address_postal_code'])) {
            $unsigned_fields['bill_to_address_postal_code'] = sanitize_text_field($data['bill_to_address_postal_code']);
        }
        if (!empty($data['bill_to_address_country'])) {
            $unsigned_fields['bill_to_address_country'] = sanitize_text_field($data['bill_to_address_country']);
        }
        if (!empty($data['bill_to_email'])) {
            $unsigned_fields['bill_to_email'] = sanitize_email($data['bill_to_email']);
        }
        if (!empty($data['bill_to_phone'])) {
            $unsigned_fields['bill_to_phone'] = sanitize_text_field($data['bill_to_phone']);
        }
        
        // Shipping fields
        if (!empty($data['ship_to_forename'])) {
            $unsigned_fields['ship_to_forename'] = sanitize_text_field($data['ship_to_forename']);
        }
        if (!empty($data['ship_to_surname'])) {
            $unsigned_fields['ship_to_surname'] = sanitize_text_field($data['ship_to_surname']);
        }
        if (!empty($data['ship_to_address_line1'])) {
            $unsigned_fields['ship_to_address_line1'] = sanitize_text_field($data['ship_to_address_line1']);
        }
        if (!empty($data['ship_to_address_line2'])) {
            $unsigned_fields['ship_to_address_line2'] = sanitize_text_field($data['ship_to_address_line2']);
        }
        if (!empty($data['ship_to_address_city'])) {
            $unsigned_fields['ship_to_address_city'] = sanitize_text_field($data['ship_to_address_city']);
        }
        if (!empty($data['ship_to_address_state'])) {
            $unsigned_fields['ship_to_address_state'] = sanitize_text_field($data['ship_to_address_state']);
        }
        if (!empty($data['ship_to_address_postal_code'])) {
            $unsigned_fields['ship_to_address_postal_code'] = sanitize_text_field($data['ship_to_address_postal_code']);
        }
        if (!empty($data['ship_to_address_country'])) {
            $unsigned_fields['ship_to_address_country'] = sanitize_text_field($data['ship_to_address_country']);
        }
        
        // Build unsigned_field_names list
        $unsigned_field_names_list = array_keys($unsigned_fields);
        $unsigned_field_names = implode(',', $unsigned_field_names_list);
        
        // Define signed field names (must be in this order for CyberSource)
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
        
        // Build fields array (matching example structure exactly)
        // Note: signed_field_names must be set BEFORE signature generation
        $fields = array(
            'access_key' => $access_key,
            'profile_id' => $profile_id,
            'transaction_uuid' => $transaction_uuid,
            'signed_field_names' => implode(',', $signed_field_names),
            'unsigned_field_names' => $unsigned_field_names,
            'signed_date_time' => $signed_date_time,
            'locale' => 'en',
            'transaction_type' => 'sale',
            'reference_number' => $timestamp_ms,
            'auth_trans_ref_no' => $timestamp_ms,
            'amount' => $amount,
            'currency' => $currency,
            'submit' => 'Submit',
        );
        
        // Add unsigned fields to the fields array
        $fields = array_merge($fields, $unsigned_fields);
        
        // Generate signature using CyberSource method (matching example)
        // Signature is generated BEFORE adding it to fields
        $signature = ndb_generate_cybersource_signature($fields, $signed_field_names, $secret_key);
        
        // Add signature to fields AFTER generation
        $fields['signature'] = $signature;
        
        // Generate HTML form (only the form element, not full HTML page)
        // Pass signed_field_names to ensure correct input order
        $form_html = ndb_generate_cybersource_form_html($fields, $signed_field_names, $pay_url);
        
        // Validate form HTML was generated
        if (empty($form_html)) {
            return new WP_Error('form_generation_failed', 'Failed to generate payment form', array('status' => 500));
        }
        
        // Return the form HTML (will be served as plain HTML via filter)
        return $form_html;
        
    } catch (Exception $e) {
        // Log error for debugging
        error_log('NDB-Pay form generation error: ' . $e->getMessage());
        return new WP_Error('ndb_pay_error', $e->getMessage(), array('status' => 500));
    } catch (Error $e) {
        // Catch PHP 7+ errors
        error_log('NDB-Pay form generation fatal error: ' . $e->getMessage());
        return new WP_Error('ndb_pay_error', 'Internal server error', array('status' => 500));
    }
}

/**
 * Generate HMAC SHA256 signature for CyberSource Secure Acceptance
 * 
 * @param array $fields Form fields
 * @param array $signed_field_names Field names to sign (in order)
 * @param string $secret_key Secret key from CyberSource
 * @return string Base64 encoded signature (uppercase)
 */
function ndb_generate_cybersource_signature($fields, $signed_field_names, $secret_key) {
    // Build signed string matching example exactly
    // Example: signedFieldNames.map((f) => `${f}=${fields[f]}`).join(",")
    $signed_string_parts = array();
    foreach ($signed_field_names as $field_name) {
        if (isset($fields[$field_name])) {
            $signed_string_parts[] = $field_name . '=' . $fields[$field_name];
        }
    }
    $signed_string = implode(',', $signed_string_parts);
    
    // Create HMAC SHA256 hash (matching example: crypto.createHmac("sha256", SECRET_KEY).update(signedString, "utf8").digest("base64"))
    // Example returns lowercase base64, so we match that exactly
    $hash = hash_hmac('sha256', $signed_string, $secret_key, true);
    
    // Encode to base64 (matching example - lowercase, not uppercase)
    $signature = base64_encode($hash);
    
    return $signature;
}

/**
 * Generate HTML form with all hidden fields
 * Returns only the form element (not full HTML page) for DOM insertion
 * Inputs are generated in the exact order specified by signed_field_names
 * 
 * @param array $fields Form fields including signature
 * @param array $signed_field_names Array of field names in the order they should appear
 * @param string $pay_url CyberSource payment URL
 * @return string HTML form element
 */
function ndb_generate_cybersource_form_html($fields, $signed_field_names, $pay_url) {
    $inputs = '';
    
    // Generate inputs in the exact order specified by signed_field_names
    // This ensures the form HTML matches the signature order
    foreach ($signed_field_names as $field_name) {
        if (isset($fields[$field_name])) {
            $escaped_key = esc_attr($field_name);
            $escaped_value = str_replace('"', '&quot;', esc_attr($fields[$field_name]));
            $inputs .= sprintf('<input type="hidden" name="%s" value="%s" />', $escaped_key, $escaped_value) . "\n";
        }
    }
    
    // Add signature field (not in signed_field_names, but required)
    if (isset($fields['signature'])) {
        $escaped_key = esc_attr('signature');
        $escaped_value = str_replace('"', '&quot;', esc_attr($fields['signature']));
        $inputs .= sprintf('<input type="hidden" name="%s" value="%s" />', $escaped_key, $escaped_value) . "\n";
    }
    
    // Add unsigned fields (billing and shipping information)
    // These fields are not signed, so they can be added in any order
    $unsigned_field_names_list = array();
    if (isset($fields['unsigned_field_names']) && !empty($fields['unsigned_field_names'])) {
        $unsigned_field_names_list = explode(',', $fields['unsigned_field_names']);
    }
    
    foreach ($unsigned_field_names_list as $field_name) {
        $field_name = trim($field_name);
        if (!empty($field_name) && isset($fields[$field_name])) {
            $escaped_key = esc_attr($field_name);
            $escaped_value = str_replace('"', '&quot;', esc_attr($fields[$field_name]));
            $inputs .= sprintf('<input type="hidden" name="%s" value="%s" />', $escaped_key, $escaped_value) . "\n";
        }
    }
    
    // Add submit field (optional, for compatibility)
    if (isset($fields['submit'])) {
        $escaped_key = esc_attr('submit');
        $escaped_value = str_replace('"', '&quot;', esc_attr($fields['submit']));
        $inputs .= sprintf('<input type="hidden" name="%s" value="%s" />', $escaped_key, $escaped_value) . "\n";
    }
    
    // Return form wrapped in div (div has id, form does not)
    // Frontend will append this to DOM and submit programmatically
    $form_html = sprintf(
        '<div id="ndb-pay-form-container"><form method="POST" action="%s">%s</form></div>',
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
function ndb_generate_uuid4() {
    return sprintf(
        '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );
}
