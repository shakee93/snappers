<?php
/**
 * Pickup Type Handler for WooCommerce
 * 
 * This file handles pickup type (Store, Uber, Pick Me) functionality
 * Add this code to your theme's functions.php or create a custom plugin
 */

/**
 * Whitelist pickup_type meta data for GraphQL (if using WPGraphQL WooCommerce)
 * This allows the meta data to be saved and queried via GraphQL
 */
add_filter('woocommerce_graphql_order_meta_data_keys', function($keys) {
    $keys[] = '_pickup_type';
    return $keys;
});

/**
 * Display pickup type in WooCommerce admin order details
 * Shows after shipping address section
 */
add_action('woocommerce_admin_order_data_after_shipping_address', function($order) {
    $pickupType = $order->get_meta('_pickup_type');
    
    if ($pickupType) {
        $pickupLabels = [
            'store' => 'Store',
            'uber' => 'Uber',
            'pickme' => 'Pick Me'
        ];
        
        $label = isset($pickupLabels[$pickupType]) ? $pickupLabels[$pickupType] : ucfirst($pickupType);
        
        echo '<div class="address">';
        echo '<p><strong>' . esc_html__('Pickup Type:', 'woocommerce') . '</strong> ' . esc_html($label) . '</p>';
        echo '</div>';
    }
});

/**
 * Add pickup type to order emails
 * Appears in all order-related emails (new order, processing, completed, etc.)
 */
add_action('woocommerce_email_order_details', function($order, $sent_to_admin, $plain_text, $email) {
    $pickupType = $order->get_meta('_pickup_type');
    
    if ($pickupType) {
        $pickupLabels = [
            'store' => 'Store',
            'uber' => 'Uber',
            'pickme' => 'Pick Me'
        ];
        
        $label = isset($pickupLabels[$pickupType]) ? $pickupLabels[$pickupType] : ucfirst($pickupType);
        
        if ($plain_text) {
            echo "\n" . __('Pickup Type:', 'woocommerce') . ' ' . $label . "\n";
        } else {
            echo '<p><strong>' . esc_html__('Pickup Type:', 'woocommerce') . '</strong> ' . esc_html($label) . '</p>';
        }
    }
}, 10, 4);

/**
 * Ensure customer note HTML is properly rendered everywhere
 * This fixes the issue where HTML tags are displayed as text
 */
add_filter('woocommerce_order_customer_note', function($note, $order) {
    if (empty($note)) {
        return $note;
    }
    
    // If note contains HTML tags, return it as-is (WooCommerce will render it)
    // But ensure it's properly formatted
    if (strip_tags($note) !== $note) {
        return wpautop($note);
    }
    
    return $note;
}, 10, 2);

/**
 * Override customer note display in admin to render HTML properly
 * This replaces the default customer note display with HTML rendering
 */
/*add_action('woocommerce_admin_order_data_after_order_details', function($order) {
    $customerNote = $order->get_customer_note();
    
    if ($customerNote) {
        echo '<div class="order_data_column" style="clear:both; margin-top: 20px;">';
        echo '<h3 style="margin-top: 20px;">' . esc_html__('Customer Provided Note', 'woocommerce') . '</h3>';
        echo '<div class="address" style="background: #f9f9f9; padding: 12px; border: 1px solid #ddd; border-radius: 4px;">';
        // Render HTML properly - wp_kses_post allows safe HTML tags
        echo wp_kses_post(wpautop($customerNote));
        echo '</div>';
        echo '</div>';
    }
}, 5); // Priority 5 to run before default display
*/
/**
 * Use JavaScript to render HTML in customer note if PHP filters don't work
 * This is a fallback solution that decodes HTML entities and renders them
 */
add_action('admin_footer', function() {
    if (isset($_GET['post']) && get_post_type($_GET['post']) === 'shop_order') {
        ?>
        <script type="text/javascript">
        jQuery(document).ready(function($) {
            // Find all customer note elements and render HTML
            $('.customer-note, .order_data_column p').each(function() {
                var $el = $(this);
                var text = $el.html() || $el.text();
                
                // Check if text contains HTML entities or tags
                if (text.indexOf('&lt;') !== -1 || text.indexOf('<p>') !== -1 || text.indexOf('<strong>') !== -1) {
                    // Decode HTML entities and render
                    var decoded = $('<div>').html(text).text();
                    // If it's still HTML, render it directly
                    if (decoded.indexOf('<') !== -1) {
                        $el.html(decoded);
                    } else {
                        // Decode entities
                        var tempDiv = document.createElement('div');
                        tempDiv.innerHTML = text;
                        $el.html(tempDiv.innerHTML);
                    }
                }
            });
            
            // Also check order notes section
            $('.order_data_column').each(function() {
                var $column = $(this);
                var html = $column.html();
                // If we see escaped HTML, decode it
                if (html && html.indexOf('&lt;p&gt;') !== -1) {
                    var tempDiv = document.createElement('div');
                    tempDiv.innerHTML = html;
                    $column.html(tempDiv.innerHTML);
                }
            });
        });
        </script>
        <?php
    }
});

/**
 * Filter customer note in emails to ensure HTML is rendered
 */
add_filter('woocommerce_email_customer_note', function($note, $order) {
    if (empty($note)) {
        return $note;
    }
    
    // If it's HTML email, render the HTML
    if (strip_tags($note) !== $note) {
        return wp_kses_post(wpautop($note));
    }
    
    return $note;
}, 10, 2);

/**
 * Override the default customer note meta box display in admin
 * This ensures HTML is rendered instead of escaped
 */
add_filter('woocommerce_admin_order_preview_get_order_details', function($order_details, $order) {
    if (isset($order_details['customer_note']) && !empty($order_details['customer_note'])) {
        $note = $order_details['customer_note'];
        // If it contains HTML, render it
        if (strip_tags($note) !== $note) {
            //$order_details['customer_note'] = wp_kses_post(wpautop($note));
        }
    }
    return $order_details;
}, 10, 2);

/**
 * Fallback: Parse pickup type from shipping method title if meta data doesn't exist
 * This is useful if meta data wasn't added initially
 * NOTE: This only runs if meta data doesn't exist (checked in main hook)
 */
add_action('woocommerce_admin_order_data_after_shipping_address', function($order) {
    // Only show if meta data doesn't exist
    $pickupType = $order->get_meta('_pickup_type');
    if ($pickupType) {
        return; // Meta data exists, don't show fallback
    }
    
    $shippingMethod = $order->get_shipping_method();
    if (!$shippingMethod) {
        return; // No shipping method, skip
    }
    
    $pickupLabels = [
        'store' => 'Store',
        'uber' => 'Uber',
        'pickme' => 'Pick Me'
    ];
    $label = '';
    
    if (strpos($shippingMethod, 'Store') !== false) {
        $label = 'Store';
    } elseif (strpos($shippingMethod, 'Uber') !== false) {
        $label = 'Uber';
    } elseif (strpos($shippingMethod, 'Pick Me') !== false) {
        $label = 'Pick Me';
    }
    
    // If not found in shipping method, check address fields
    if (!$label) {
        $address1 = $order->get_shipping_address_1();
        $city = $order->get_shipping_city();
        $pickupTypes = ['Store', 'Uber', 'Pick Me'];
        
        if (in_array($address1, $pickupTypes) && $address1 === $city) {
            $label = $address1;
        }
    }
    
    // Only display if we found a pickup type
    if ($label) {
        echo '<div class="address">';
        //echo '<p><strong>' . esc_html__('Pickup Type:', 'woocommerce') . '</strong> ' . esc_html($label) . '</p>';
        echo '</div>';
    }
}, 20); // Lower priority so it runs after meta data check

/**
 * Add pickup type column to orders list (optional)
 * Uncomment if you want to see pickup type in the orders list table
 */
/*
add_filter('manage_edit-shop_order_columns', function($columns) {
    $columns['pickup_type'] = __('Pickup Type', 'woocommerce');
    return $columns;
});

add_action('manage_shop_order_posts_custom_column', function($column, $post_id) {
    if ($column === 'pickup_type') {
        $order = wc_get_order($post_id);
        $pickupType = $order->get_meta('_pickup_type');
        
        if ($pickupType) {
            $pickupLabels = [
                'store' => 'Store',
                'uber' => 'Uber',
                'pickme' => 'Pick Me'
            ];
            
            $label = isset($pickupLabels[$pickupType]) ? $pickupLabels[$pickupType] : ucfirst($pickupType);
            echo esc_html($label);
        } else {
            echo '—';
        }
    }
}, 10, 2);
*/

/**
 * Add pickup type to order REST API response (optional)
 * Allows pickup type to be accessed via WooCommerce REST API
 */
add_filter('woocommerce_rest_prepare_shop_order_object', function($response, $order, $request) {
    $pickupType = $order->get_meta('_pickup_type');
    
    if ($pickupType) {
        $pickupLabels = [
            'store' => 'Store',
            'uber' => 'Uber',
            'pickme' => 'Pick Me'
        ];
        
        $response->data['pickup_type'] = [
            'value' => $pickupType,
            'label' => isset($pickupLabels[$pickupType]) ? $pickupLabels[$pickupType] : ucfirst($pickupType)
        ];
    }
    
    return $response;
}, 10, 3);

/**
 * Display pickup type in order received page (optional)
 * Shows pickup type to customers after order placement
 */
add_action('woocommerce_order_details_after_order_table', function($order) {
    $pickupType = $order->get_meta('_pickup_type');
    
    if ($pickupType) {
        $pickupLabels = [
            'store' => 'Store',
            'uber' => 'Uber',
            'pickme' => 'Pick Me'
        ];
        
        $label = isset($pickupLabels[$pickupType]) ? $pickupLabels[$pickupType] : ucfirst($pickupType);
        
        echo '<section class="woocommerce-order-pickup-type">';
        echo '<h2 class="woocommerce-order-pickup-type__title">' . esc_html__('Pickup Information', 'woocommerce') . '</h2>';
        echo '<p><strong>' . esc_html__('Pickup Type:', 'woocommerce') . '</strong> ' . esc_html($label) . '</p>';
        echo '</section>';
    }
});
