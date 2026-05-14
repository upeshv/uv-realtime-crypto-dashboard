<?php
/**
 * Frontend render template for the realtime dashboard block.
 *
 * @package RealtimeDashboard
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
$react_realtime_performance_dashboard_wrapper_attributes = get_block_wrapper_attributes(
	[
		'class'             => 'realtime-dashboard-frontend-root',
		'data-stream-url'   => esc_url( $attributes['dataStreamUrl'] ?? 'wss://stream.binance.com:9443/ws/btcusdt@trade', [ 'ws', 'wss' ] ),
		'data-title'        => esc_attr( $attributes['chartTitle'] ?? 'Live Market Performance' ),
		'data-refresh-rate' => absint( $attributes['refreshRateMs'] ?? 1000 ),
	]
);

?>
<div <?php echo $react_realtime_performance_dashboard_wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>></div>