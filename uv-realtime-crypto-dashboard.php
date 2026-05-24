<?php
/**
 * Plugin Name:       UV Realtime Crypto Dashboard
 * Plugin URI:        https://github.com/upeshv/uv-realtime-crypto-dashboard/
 * Description:       A high-performance, real-time cryptocurrency data visualization block bridging WordPress and WebSockets.
 * Version:           1.0.0
 * Requires at least: 6.2
 * Tested up to:      7.0
 * Requires PHP:      7.4
 * Author:            Upesh Vishwakarma
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       uv-realtime-crypto-dashboard
 * Domain Path:       /languages
 *
 * @package UvRealtimeCryptoDashboard
 */

namespace UvRealtimeCryptoDashboard;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registers the realtime dashboard block.
 *
 * Relies exclusively on block.json as the single source of truth for
 * block attributes and registration metadata to adhere to DRY principles.
 *
 * @since 1.0.0
 *
 * @return void
 */
function register_dashboard_block() {
	register_block_type( __DIR__ . '/build' );
}
add_action( 'init', __NAMESPACE__ . '\register_dashboard_block' );