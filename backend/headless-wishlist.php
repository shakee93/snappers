<?php
/**
 * Plugin Name: Headless Wishlist (YITH bridge)
 * Description: Exposes the current user's YITH WooCommerce Wishlist over WPGraphQL
 *              so the headless Next.js storefront can read it and add/remove
 *              products. All operations are scoped to the authenticated user
 *              (resolved from the wp-graphql-jwt-authentication Bearer token);
 *              guests get an auth error. YITH's free build ships no GraphQL, so
 *              this bridges to its v4 CRUD API (YITH_WCWL_Wishlist_Factory +
 *              YITH_WCWL_Wishlist).
 * Version: 1.0.0
 * Author: catlitter-headless
 *
 * Deploy note: this WP runs opcache.validate_timestamps=Off — reset OPcache via
 *              a web request (Apache SAPI) after copying this file, or the old
 *              bytecode keeps running. Add the operation names below to the
 *              tripwire allowlist; they intentionally stay OUT of the Smart Cache
 *              allowlist (graphql-cache-skip-session.php) because they are
 *              user-scoped and must never be cached.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Database ID of the current user's default wishlist, read straight from the
 * YITH lists table.
 *
 * We deliberately bypass YITH_WCWL_Wishlist_Factory::get_default_wishlist(): it
 * caches a `null` into the Redis `wishlists` object-cache group on the first
 * miss, then keeps returning that stale null even after a list exists — which
 * would also make us create a DUPLICATE default list and hide the user's items.
 * Direct SQL is always fresh and avoids both problems.
 *
 * @param bool $create create-and-persist a default wishlist when none exists.
 * @return int 0 when there is no list (and none was created).
 */
function hwl_default_wishlist_id( $create = false ) {
	global $wpdb;

	$uid = get_current_user_id();
	if ( ! $uid ) {
		return 0;
	}

	$id = (int) $wpdb->get_var( $wpdb->prepare(
		"SELECT ID FROM {$wpdb->prefix}yith_wcwl_lists WHERE user_id = %d AND is_default = 1 ORDER BY ID ASC LIMIT 1",
		$uid
	) );

	if ( ! $id && $create && class_exists( 'YITH_WCWL_Wishlist' ) ) {
		// Explicit create — generate_default_wishlist() throws unless is_default
		// and a name are pre-set, so we set them ourselves (proven recipe).
		$wishlist = new YITH_WCWL_Wishlist();
		$wishlist->set_user_id( $uid );
		$wishlist->set_is_default( true );
		$wishlist->set_name( __( 'Wishlist', 'catlitter' ) );
		$wishlist->save();
		$id = (int) $wishlist->get_id();
	}

	return $id;
}

/**
 * Current user's default wishlist object (for writes). Null for guests.
 *
 * @param bool $create create-and-persist a default wishlist when none exists.
 * @return YITH_WCWL_Wishlist|null
 */
function hwl_user_wishlist( $create = false ) {
	if ( ! class_exists( 'YITH_WCWL_Wishlist_Factory' ) ) {
		return null;
	}
	$id = hwl_default_wishlist_id( $create );
	if ( ! $id ) {
		return null;
	}
	$wishlist = YITH_WCWL_Wishlist_Factory::get_wishlist( $id );

	return ( $wishlist && $wishlist->get_id() ) ? $wishlist : null;
}

/**
 * Product IDs in the current user's wishlist, newest first. Read via direct SQL
 * so the list is always fresh (see hwl_default_wishlist_id note on caching).
 *
 * @return int[]
 */
function hwl_wishlist_ids() {
	global $wpdb;

	$id = hwl_default_wishlist_id( false );
	if ( ! $id ) {
		return array();
	}

	$rows = $wpdb->get_col( $wpdb->prepare(
		"SELECT prod_id FROM {$wpdb->prefix}yith_wcwl WHERE wishlist_id = %d ORDER BY dateadded DESC, ID DESC",
		$id
	) );

	$ids = array();
	foreach ( $rows as $pid ) {
		$pid = (int) $pid;
		if ( $pid && ! in_array( $pid, $ids, true ) && wc_get_product( $pid ) ) { // skip dupes + deleted/unpublished
			$ids[] = $pid;
		}
	}

	return $ids;
}

/**
 * Whether a product is already in the current user's wishlist (direct SQL).
 *
 * @param int $wishlist_id list id.
 * @param int $product_id  product id.
 * @return bool
 */
function hwl_list_has_product( $wishlist_id, $product_id ) {
	global $wpdb;

	return (bool) $wpdb->get_var( $wpdb->prepare(
		"SELECT ID FROM {$wpdb->prefix}yith_wcwl WHERE wishlist_id = %d AND prod_id = %d LIMIT 1",
		$wishlist_id,
		$product_id
	) );
}

/**
 * Guard: throw a GraphQL user error for guests.
 *
 * @throws \GraphQL\Error\UserError
 */
function hwl_require_login() {
	if ( ! get_current_user_id() ) {
		throw new \GraphQL\Error\UserError( __( 'You must be logged in to manage your wishlist.', 'catlitter' ) );
	}
}

add_action( 'graphql_register_types', function () {

	/* ---- Query: wishlist -> [Int] of product database IDs --------------- */
	register_graphql_field( 'RootQuery', 'wishlist', array(
		'type'        => array( 'list_of' => 'Int' ),
		'description' => 'Product database IDs in the current user\'s YITH wishlist. Empty for guests.',
		'resolve'     => function () {
			return hwl_wishlist_ids();
		},
	) );

	/* ---- Mutation: addToWishlist ---------------------------------------- */
	register_graphql_mutation( 'addToWishlist', array(
		'inputFields'         => array(
			'productId' => array(
				'type'        => array( 'non_null' => 'Int' ),
				'description' => 'Database ID of the product to add.',
			),
		),
		'outputFields'        => array(
			'wishlist' => array(
				'type'        => array( 'list_of' => 'Int' ),
				'description' => 'The full updated list of wishlist product IDs.',
				'resolve'     => function ( $payload ) {
					return isset( $payload['wishlist'] ) ? $payload['wishlist'] : array();
				},
			),
			'added'    => array(
				'type'        => 'Boolean',
				'description' => 'True if the product was newly added (false if already present).',
				'resolve'     => function ( $payload ) {
					return ! empty( $payload['added'] );
				},
			),
		),
		'mutateAndGetPayload' => function ( $input ) {
			hwl_require_login();
			$product_id = isset( $input['productId'] ) ? (int) $input['productId'] : 0;
			if ( ! $product_id || ! wc_get_product( $product_id ) ) {
				throw new \GraphQL\Error\UserError( __( 'Invalid product.', 'catlitter' ) );
			}

			$wishlist = hwl_user_wishlist( true );
			if ( ! $wishlist ) {
				throw new \GraphQL\Error\UserError( __( 'Could not load your wishlist.', 'catlitter' ) );
			}

			$added = false;
			if ( ! hwl_list_has_product( $wishlist->get_id(), $product_id ) ) {
				$wishlist->add_product( $product_id );
				$wishlist->save();
				$added = true;
			}

			return array(
				'added'    => $added,
				'wishlist' => hwl_wishlist_ids(),
			);
		},
	) );

	/* ---- Mutation: removeFromWishlist ----------------------------------- */
	register_graphql_mutation( 'removeFromWishlist', array(
		'inputFields'         => array(
			'productId' => array(
				'type'        => array( 'non_null' => 'Int' ),
				'description' => 'Database ID of the product to remove.',
			),
		),
		'outputFields'        => array(
			'wishlist' => array(
				'type'        => array( 'list_of' => 'Int' ),
				'description' => 'The full updated list of wishlist product IDs.',
				'resolve'     => function ( $payload ) {
					return isset( $payload['wishlist'] ) ? $payload['wishlist'] : array();
				},
			),
			'removed'  => array(
				'type'        => 'Boolean',
				'description' => 'True if the product was present and removed.',
				'resolve'     => function ( $payload ) {
					return ! empty( $payload['removed'] );
				},
			),
		),
		'mutateAndGetPayload' => function ( $input ) {
			hwl_require_login();
			$product_id = isset( $input['productId'] ) ? (int) $input['productId'] : 0;
			if ( ! $product_id ) {
				throw new \GraphQL\Error\UserError( __( 'Invalid product.', 'catlitter' ) );
			}

			$wishlist = hwl_user_wishlist( false );
			$removed  = false;
			if ( $wishlist && hwl_list_has_product( $wishlist->get_id(), $product_id ) ) {
				$wishlist->remove_product( $product_id );
				$wishlist->save();
				$removed = true;
			}

			return array(
				'removed'  => $removed,
				'wishlist' => hwl_wishlist_ids(),
			);
		},
	) );
} );
