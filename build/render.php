<?php
/**
 * Frontend render template for the realtime dashboard block.
 *
 * @package UvRealtimeCryptoDashboard
 */

// Exit if accessed directly to prevent unauthorized script execution.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Merges the React mount point and data attributes with standard Gutenberg wrapper attributes.
 *
 * We access the attributes array directly to avoid creating temporary variables, 
 * ensuring a clean scan and strictly maintaining global variable scope integrity.
 */

$uv_realtime_crypto_dashboard_default_stream = apply_filters( 'uv_realtime_crypto_dashboard_default_stream', 'wss://stream.binance.com:9443/ws/btcusdt@trade' );
$uv_realtime_crypto_dashboard_default_refresh = apply_filters( 'uv_realtime_crypto_dashboard_default_refresh', 1000 );

$uv_realtime_crypto_dashboard_wrapper_attributes = get_block_wrapper_attributes(
	[
		'class'             => 'uv-realtime-crypto-dashboard-frontend-root',
		'data-stream-url'   => esc_url( $attributes['dataStreamUrl'] ?? $uv_realtime_crypto_dashboard_default_stream, [ 'ws', 'wss' ] ),
		'data-title'        => esc_attr( $attributes['chartTitle'] ?? 'Live Crypto Market' ),
		'data-refresh-rate' => absint( $attributes['refreshRateMs'] ?? $uv_realtime_crypto_dashboard_default_refresh ),
	]
);

?>
<div <?php echo $uv_realtime_crypto_dashboard_wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>></div>