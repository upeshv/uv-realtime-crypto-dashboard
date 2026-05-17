/**
 * Frontend view script for the Realtime Performance Dashboard.
 * * Hydrates the server-rendered HTML with the interactive React component
 * and establishes the live WebSocket connection for site visitors.
 */
import { createRoot, useState, useEffect, useRef } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import {
	AreaChart,
	Area,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
} from 'recharts';

import { useRealTimeData } from './hooks/useRealTimeData';
import { MetricData } from './types';

interface BinanceTradePayload {
	p: string;
	T: number;
}

/**
 * Maps the raw WebSocket URL to a human-readable, translatable UI label.
 *
 * @param {string} url The active WebSocket stream URL.
 * @return {string} The localized label for the stream.
 */
const getStreamLabel = ( url: string ): string => {
	if ( url.includes( 'btc' ) ) {
		return __( 'Bitcoin (BTC/USDT)', 'uv-realtime-crypto-dashboard' );
	}
	if ( url.includes( 'eth' ) ) {
		return __( 'Ethereum (ETH/USDT)', 'uv-realtime-crypto-dashboard' );
	}
	if ( url.includes( 'sol' ) ) {
		return __( 'Solana (SOL/USDT)', 'uv-realtime-crypto-dashboard' );
	}
	return __( 'Custom Stream', 'uv-realtime-crypto-dashboard' );
};

interface LiveDashboardProps {
	streamUrl: string;
	title: string;
	refreshRate: number;
}

/**
 * Renders the live dashboard component on the frontend.
 *
 * @param {LiveDashboardProps} props The block attributes passed from the PHP renderer.
 * @return {JSX.Element} The rendered React component.
 */
function LiveDashboard( { streamUrl, title, refreshRate }: LiveDashboardProps ) {
	const { data, status, error } = useRealTimeData< BinanceTradePayload >( streamUrl );
	const [ chartData, setChartData ] = useState< MetricData[] >( [] );
	const lastUpdateRef = useRef< number >( 0 );

	useEffect( () => {
		if ( data && data.p ) {
			const now = Date.now();

			if ( now - lastUpdateRef.current >= refreshRate ) {
				lastUpdateRef.current = now;
				
				setChartData( ( prev ) => {
					const newArray = [
						...prev,
						{ timestamp: data.T, price: parseFloat( data.p ) },
					];
					return newArray.slice( -20 );
				} );
			}
		}
	}, [ data, refreshRate ] );

	// Extracts formatters to prevent memory reallocation on every render.
	const formatTime = ( tickItem: any ) => {
		const date = new Date( tickItem );
		return `${ date.getHours() }:${ date.getMinutes() }:${ date.getSeconds() }`;
	};

	const formatTooltipTime = ( label: any ) => formatTime( label );
	const formatTooltipValue = ( value: any ): [ string, string ] => [ `$${ value }`, __( 'Price', 'uv-realtime-crypto-dashboard' ) ];
	const formatYAxis = ( val: any ) => `$${ parseFloat( val ).toLocaleString() }`;

	const currentPrice = chartData.length > 0 ? chartData[ chartData.length - 1 ].price : null;
	const previousPrice = chartData.length > 1 ? chartData[ chartData.length - 2 ].price : null;

	const isUp = currentPrice !== null && previousPrice !== null && currentPrice > previousPrice;
	const isDown = currentPrice !== null && previousPrice !== null && currentPrice < previousPrice;

	return (
		<div className="uv-realtime-crypto-dashboard-wrapper">
			<div className="dashboard-header">
				<div className="header-titles">
					<h2>{ title }</h2>
					<span className="coin-label">{ getStreamLabel( streamUrl ) }</span>

					{ currentPrice ? (
						<div
							className={ `kpi-price ${ isUp ? 'price-up' : '' } ${ isDown ? 'price-down' : '' }` }
                            aria-live="polite"
                            role="status"
                            aria-atomic="true"
						>
                            <span className="screen-reader-text">{ __( 'Current Price:', 'uv-realtime-crypto-dashboard' ) } </span>
							${ currentPrice.toLocaleString( undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 } ) }
							{ isUp && <span className="delta-icon" aria-hidden="true">▲</span> }
							{ isDown && <span className="delta-icon" aria-hidden="true">▼</span> }
						</div>
					) : (
						<div className="kpi-price loading" aria-live="polite">
							{ __( 'Awaiting Data...', 'uv-realtime-crypto-dashboard' ) }
						</div>
					) }
				</div>

				<div className="header-meta">
					<div className={ `status-badge status-${ status }` }>
						{ status === 'connecting' && <span>{ __( 'Connecting...', 'uv-realtime-crypto-dashboard' ) }</span> }
						{ status === 'connected' && <span>{ __( 'Live', 'uv-realtime-crypto-dashboard' ) }</span> }
						{ status === 'disconnected' && <span>{ __( 'Offline', 'uv-realtime-crypto-dashboard' ) }</span> }
						{ status === 'error' && <span>{ __( 'Error', 'uv-realtime-crypto-dashboard' ) }</span> }
					</div>
					<div className="refresh-note">
						{ sprintf( __( 'Updates every %ss', 'uv-realtime-crypto-dashboard' ), refreshRate / 1000 ) }
					</div>
				</div>
			</div>

			{ status === 'error' && (
				<div className="error-card">
					<p><strong>{ __( 'Connection Failed:', 'uv-realtime-crypto-dashboard' ) }</strong> { error }</p>
				</div>
			) }

			{ status === 'connected' && (
				<div className="chart-container">
					<ResponsiveContainer width="99%" height={ 320 }>
						<AreaChart data={ chartData }>
							<defs>
								<linearGradient id="colorPriceLive" x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%" stopColor="#0ea5e9" stopOpacity={ 0.4 } />
									<stop offset="95%" stopColor="#0ea5e9" stopOpacity={ 0 } />
								</linearGradient>
							</defs>
							<CartesianGrid strokeDasharray="3 3" opacity={ 0.1 } vertical={ false } />
							<XAxis
								dataKey="timestamp"
								tickFormatter={ formatTime }
								style={ { fontSize: '11px', fill: '#64748b' } }
								tickLine={ false }
								axisLine={ false }
								dy={ 10 }
							/>
							<YAxis
								domain={ [ 'auto', 'auto' ] }
								tickFormatter={ formatYAxis }
								style={ { fontSize: '11px', fill: '#64748b' } }
								tickLine={ false }
								axisLine={ false }
								dx={ -10 }
							/>
							<Tooltip
								labelFormatter={ formatTooltipTime }
								formatter={ formatTooltipValue }
								contentStyle={ { borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' } }
							/>
							<Area
								type="monotone"
								dataKey="price"
								stroke="#0ea5e9"
								strokeWidth={ 3 }
								fillOpacity={ 1 }
								fill="url(#colorPriceLive)"
								isAnimationActive={ false }
							/>
						</AreaChart>
					</ResponsiveContainer>
				</div>
			) }
		</div>
	);
}

/**
 * Initializes the React application when the DOM is fully loaded.
 */
document.addEventListener( 'DOMContentLoaded', () => {
	const wrappers = document.querySelectorAll( '.uv-realtime-crypto-dashboard-frontend-root' );

	wrappers.forEach( ( wrapper ) => {
		// Performs a strict check to satisfy TypeScript safely.
		if ( ! ( wrapper instanceof HTMLElement ) ) {
			return;
		}

		const streamUrl = wrapper.getAttribute( 'data-stream-url' ) || 'wss://stream.binance.com:9443/ws/btcusdt@trade';
		const title = wrapper.getAttribute( 'data-title' ) || __( 'Live Crypto Market', 'uv-realtime-crypto-dashboard' );
		const refreshRate = parseInt( wrapper.getAttribute( 'data-refresh-rate' ) || '1000', 10 );

		if ( streamUrl ) {
			const root = createRoot( wrapper );
			root.render(
				<LiveDashboard
					streamUrl={ streamUrl }
					title={ title }
					refreshRate={ refreshRate }
				/>
			);
		}
	} );
} );