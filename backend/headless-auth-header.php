<?php
/**
 * Plugin Name: Headless Auth Header Bridge
 * Description: This host runs mod_php and does NOT expose the HTTP `Authorization`
 *              request header in $_SERVER['HTTP_AUTHORIZATION'] (Apache strips it
 *              for security unless CGIPassAuth / a rewrite rule is set, and neither
 *              is). wp-graphql-jwt-authentication reads ONLY $_SERVER, so it never
 *              sees the Bearer token and treats every authenticated request as a
 *              guest — breaking customer/orders/wishlist auth. The header IS still
 *              available via apache_request_headers(); copy it across at mu-plugin
 *              load time, before WPGraphQL resolves the current user on `init`.
 * Version: 1.0.0
 * Author: catlitter-headless
 *
 * Security note: this does not weaken auth — a valid, signed JWT is still required.
 *                It only makes the already-sent Bearer token reach the validator.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( empty( $_SERVER['HTTP_AUTHORIZATION'] ) && empty( $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ) && function_exists( 'apache_request_headers' ) ) {
	foreach ( (array) apache_request_headers() as $key => $value ) {
		if ( 0 === strcasecmp( $key, 'Authorization' ) && '' !== $value ) {
			$_SERVER['HTTP_AUTHORIZATION'] = $value;
			break;
		}
	}
}
