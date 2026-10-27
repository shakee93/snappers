<?php
/**
 * Plugin Name: Headless Auth Header Bridge
 * Description: Two fixes that make wp-graphql-jwt-authentication usable on this
 *              headless setup:
 *
 *              1) AUTH HEADER. This host runs mod_php and Apache strips the HTTP
 *                 `Authorization` request header from $_SERVER (no CGIPassAuth /
 *                 no rewrite rule). The JWT plugin reads ONLY $_SERVER, so it
 *                 never saw the Bearer token and treated every authenticated
 *                 request as a guest. We copy it across from
 *                 apache_request_headers() at mu-plugin load - the earliest point,
 *                 before anything resolves & caches the (guest) current user; a
 *                 later hook is too late, WPGraphQL has already cached user 0.
 *                 We expose the header ONLY for a currently-valid token (verified
 *                 here with a dependency-free HMAC check, since Firebase\JWT isn't
 *                 autoloaded this early). The JWT plugin does NOT silently ignore
 *                 a bad/expired token: it sets HTTP 401 and surfaces an error that
 *                 WPGraphQL masks as "Internal server error" (GRAPHQL_DEBUG off),
 *                 which would break login/register and any request made while
 *                 holding a stale token. Gating on validity means expired/invalid
 *                 tokens are ignored and the request degrades to guest - the safe
 *                 pre-existing behaviour.
 *
 *              2) TOKEN LIFETIME. `headless-theme-support` pins the auth-token
 *                 expiry to 10 seconds (`graphql_jwt_auth_expire` => 10), which
 *                 made authenticated state (account, orders, wishlist) impossible
 *                 to keep - fine while auth was broken, useless once it works. We
 *                 override it to HWL_AUTH_TOKEN_TTL below.
 * Version: 3.0.0
 * Author: catlitter-headless
 *
 * Security note: this does not weaken auth - a valid, signed, unexpired JWT is
 *                still required. It only lets the already-sent token reach the
 *                validator and gives it a sane lifetime.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Auth-token lifetime in seconds. 1 hour balances usability against the fact
// that JWTs can't be revoked before they expire. Adjust here if needed.
const HWL_AUTH_TOKEN_TTL = 3600;

add_filter( 'graphql_jwt_auth_expire', function () {
	return HWL_AUTH_TOKEN_TTL;
}, 999 );

/**
 * Base64url-decode a JWT segment.
 *
 * @param string $data
 * @return string|false
 */
function hwl_b64url_decode( $data ) {
	$remainder = strlen( $data ) % 4;
	if ( $remainder ) {
		$data .= str_repeat( '=', 4 - $remainder );
	}
	return base64_decode( strtr( $data, '-_', '+/' ) );
}

/**
 * Dependency-free validation of an HS256 JWT: correct signature against the
 * configured secret, not expired, not used-before-valid, and carrying a user id.
 * We deliberately do NOT enforce `iss` here - a mismatched iss already degrades
 * to guest cleanly in the plugin; signature + expiry are the only gates that
 * matter for avoiding the "Internal server error" path.
 *
 * @param string $jwt
 * @param string $secret
 * @return bool
 */
function hwl_jwt_is_valid( $jwt, $secret ) {
	$parts = explode( '.', $jwt );
	if ( 3 !== count( $parts ) ) {
		return false;
	}
	list( $header_b64, $payload_b64, $sig_b64 ) = $parts;

	$signature = hwl_b64url_decode( $sig_b64 );
	if ( false === $signature || '' === $signature ) {
		return false;
	}

	$expected = hash_hmac( 'sha256', $header_b64 . '.' . $payload_b64, $secret, true );
	if ( ! hash_equals( $expected, $signature ) ) {
		return false;
	}

	$payload = json_decode( (string) hwl_b64url_decode( $payload_b64 ) );
	if ( ! is_object( $payload ) ) {
		return false;
	}

	$leeway = 60;
	$now    = time();
	if ( isset( $payload->exp ) && $now >= ( (int) $payload->exp + $leeway ) ) {
		return false;
	}
	if ( isset( $payload->nbf ) && $now < ( (int) $payload->nbf - $leeway ) ) {
		return false;
	}

	return ! empty( $payload->data->user->id );
}

/**
 * Expose the Bearer header to the JWT plugin (via $_SERVER) when, and only when,
 * the token is valid. Runs at include time - i.e. as early as possible.
 */
( function () {
	if ( ! empty( $_SERVER['HTTP_AUTHORIZATION'] ) || ! empty( $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ) ) {
		return;
	}
	if ( ! function_exists( 'apache_request_headers' ) ) {
		return;
	}

	$header = '';
	foreach ( (array) apache_request_headers() as $key => $value ) {
		if ( 0 === strcasecmp( $key, 'Authorization' ) ) {
			$header = (string) $value;
			break;
		}
	}

	if ( '' === $header || 0 !== stripos( $header, 'Bearer ' ) ) {
		return;
	}

	$secret = defined( 'GRAPHQL_JWT_AUTH_SECRET_KEY' ) ? GRAPHQL_JWT_AUTH_SECRET_KEY : '';
	if ( '' === $secret ) {
		return; // can't validate - fail closed (guest)
	}

	$token = trim( substr( $header, 7 ) );
	if ( '' !== $token && hwl_jwt_is_valid( $token, $secret ) ) {
		$_SERVER['HTTP_AUTHORIZATION'] = $header;
	}
} )();
