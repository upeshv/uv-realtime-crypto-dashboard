/**
 * Global type definitions for the Realtime Dashboard block.
 */

/**
 * Gutenberg block attributes schema.
 * Maps directly to the attributes defined in block.json.
 */
export interface DashboardAttributes {
	dataStreamUrl: string;
	chartTitle: string;
	refreshRateMs: number;
}

/**
 * Allowed WebSocket connection states.
 */
export type ConnectionStatus = 'connecting' | 'connected' | 'error' | 'disconnected';

/**
 * Generic state container for the WebSocket data hook.
 */
export interface WebSocketState<T> {
	data: T | null;
	status: ConnectionStatus;
	error: string | null;
}

/**
 * Standardized time-series data point for Recharts ingestion.
 */
export interface MetricData {
	timestamp: number;
	price: number;
	volume?: number;
}