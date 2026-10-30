<?php
/**
 * Plugin Name: Snappers Packaging & Service Charge
 * Description: Adds a flat packaging & service charge to every non-empty cart.
 *              It is a WooCommerce cart fee, so it is priced into the cart and
 *              checkout totals the headless storefront reads over GraphQL
 *              (`cart.fees`, `cart.total`) and written to each order as a fee
 *              line - nothing on the frontend adds it on its own.
 * Version: 1.0.0
 * Author: snappers-headless
 *
 * Install: upload the zip in Plugins > Add New > Upload Plugin and activate,
 *          or copy this file to wp-content/mu-plugins/ (always on). Use one,
 *          not both - each would add the fee under the same constant names.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// The storefront labels a fee row off the order total by this same name
// (siteConfig.fees.serviceChargeLabel) - keep the two in step.
const SNAPPERS_SERVICE_CHARGE_LABEL = 'Packaging & Service Charge';

// Flat amount in the store currency (LKR), per order.
const SNAPPERS_SERVICE_CHARGE_AMOUNT = 100;

add_action( 'woocommerce_cart_calculate_fees', function ( $cart ) {
	if ( ! $cart instanceof WC_Cart || $cart->is_empty() ) {
		return;
	}

	// add_fee() keys the fee by its sanitized name, so recalculating the cart
	// replaces the fee rather than stacking a second one.
	$cart->add_fee( SNAPPERS_SERVICE_CHARGE_LABEL, SNAPPERS_SERVICE_CHARGE_AMOUNT, false );
} );
