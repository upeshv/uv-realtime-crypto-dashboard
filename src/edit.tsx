/**
 * Editor view for the Realtime Performance Dashboard.
 * Handles the WebSocket connection and Recharts rendering within Gutenberg.
 */
import { __, sprintf } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, SelectControl, TextControl, Spinner, Button } from '@wordpress/components';
import { useState, useEffect, useRef } from '@wordpress/element';
import { BlockEditProps } from '@wordpress/blocks';
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
import { DashboardAttributes, MetricData } from './types';

interface BinanceTradePayload {
	p: string;
	T: number;
}

const getStreamLabel = ( url: string ): string => {
	if ( url.includes( 'btc' ) ) {
		return __( 'Bitcoin (BTC/USDT)', 'react-realtime-performance-dashboard' );
	}
	if ( url.includes( 'eth' ) ) {
		return __( 'Ethereum (ETH/USDT)', 'react-realtime-performance-dashboard' );
	}
	if ( url.includes( 'sol' ) ) {
		return __( 'Solana (SOL/USDT)', 'react-realtime-performance-dashboard' );
	}
	return __( 'Custom Stream', 'react-realtime-performance-dashboard' );
};

const STREAM_OPTIONS: { label: string; value: string }[] = [
	{ label: __( 'Bitcoin (BTC/USDT)', 'react-realtime-performance-dashboard' ), value: 'wss://stream.binance.com:9443/ws/btcusdt@trade' },
	{ label: __( 'Ethereum (ETH/USDT)', 'react-realtime-performance-dashboard' ), value: 'wss://stream.binance.com:9443/ws/ethusdt@trade' },
	{ label: __( 'Solana (SOL/USDT)', 'react-realtime-performance-dashboard' ), value: 'wss://stream.binance.com:9443/ws/solusdt@trade' },
];

const REFRESH_RATE_OPTIONS: { label: string; value: string }[] = [
	{ label: __( 'Hyper-Active (100ms)', 'react-realtime-performance-dashboard' ), value: '100' },
	{ label: __( 'Fast (500ms)', 'react-realtime-performance-dashboard' ), value: '500' },
	{ label: __( 'Smooth (1 Second)', 'react-realtime-performance-dashboard' ), value: '1000' },
	{ label: __( 'Relaxed (3 Seconds)', 'react-realtime-performance-dashboard' ), value: '3000' },
];

export default function Edit( {
	attributes,
	setAttributes,
}: BlockEditProps< DashboardAttributes > ) {
	const blockProps = useBlockProps( {
		className: 'realtime-dashboard-architect-wrapper',
	} );

	const currentStream = attributes.dataStreamUrl !== undefined
		? attributes.dataStreamUrl
		: 'wss://stream.binance.com:9443/ws/btcusdt@trade';

	const refreshRate = attributes.refreshRateMs || 1000;

	/* Local State for the Text Input */
	const [ customUrlInput, setCustomUrlInput ] = useState< string >( currentStream );

	/* Keep local text synced if the user uses the dropdown instead */
	useEffect( () => {
		setCustomUrlInput( currentStream );
	}, [ currentStream ] );

	const isValidUrl = currentStream.startsWith( 'ws://' ) || currentStream.startsWith( 'wss://' );
	const hookUrl = isValidUrl ? currentStream : '';

	const { data, status, error } = useRealTimeData< BinanceTradePayload >( hookUrl );
	const [ chartData, setChartData ] = useState< MetricData[] >( [] );
	const lastUpdateRef = useRef< number >( 0 );

	const isPresetStream = STREAM_OPTIONS.some( ( opt ) => opt.value === currentStream );

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

	useEffect( () => {
		setChartData( [] );
		lastUpdateRef.current = 0;
	}, [ currentStream ] );

	const formatTime = ( tickItem: any ) => {
		const date = new Date( tickItem );
		return `${ date.getHours() }:${ date.getMinutes() }:${ date.getSeconds() }`;
	};

	const formatTooltipTime = ( label: any ) => formatTime( label );
	const formatTooltipValue = ( value: any ): [ string, string ] => [ `$${ value }`, __( 'Price', 'react-realtime-performance-dashboard' ) ];
	const formatYAxis = ( val: any ) => `$${ parseFloat( val ).toLocaleString() }`;

	const currentPrice = chartData.length > 0 ? chartData[ chartData.length - 1 ].price : null;
	const previousPrice = chartData.length > 1 ? chartData[ chartData.length - 2 ].price : null;

	const isUp = currentPrice !== null && previousPrice !== null && currentPrice > previousPrice;
	const isDown = currentPrice !== null && previousPrice !== null && currentPrice < previousPrice;

	return (
		<div { ...blockProps }>
			<InspectorControls>
				<PanelBody title={ __( 'Data Stream Settings', 'react-realtime-performance-dashboard' ) } initialOpen={ true }>
					<SelectControl
						label={ __( 'Select Live Market', 'react-realtime-performance-dashboard' ) }
						value={ isPresetStream ? currentStream : 'custom' }
						options={ [
							...STREAM_OPTIONS,
							{ label: __( 'Custom wss:// Endpoint...', 'react-realtime-performance-dashboard' ), value: 'custom' },
						] }
						onChange={ ( newVal: string ) => {
							if ( newVal !== 'custom' ) {
								setAttributes( { dataStreamUrl: newVal } );
							} else {
								setAttributes( { dataStreamUrl: '' } );
							}
						} }
						__nextHasNoMarginBottom={ true }
						__next40pxDefaultSize={ true }
					/>

					{ ! isPresetStream && (
						<div style={ { padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px' } }>
							<TextControl
								label={ __( 'Custom WebSocket URL', 'react-realtime-performance-dashboard' ) }
								value={ customUrlInput }
								onChange={ ( newVal: string ) => setCustomUrlInput( newVal ) }
								help={ __( 'Enter a public wss:// endpoint. The live stream must return a JSON object containing \'p\' (price) and \'T\' (timestamp) to render on the chart.', 'react-realtime-performance-dashboard' ) }
								__nextHasNoMarginBottom={ true }
								__next40pxDefaultSize={ true }
							/>
							<Button
								variant="primary"
								style={ { marginTop: '12px', width: '100%', justifyContent: 'center' } }
								onClick={ () => setAttributes( { dataStreamUrl: customUrlInput } ) }
								disabled={ !customUrlInput.startsWith( 'ws' ) }
							>
								{ __( 'Connect Stream', 'react-realtime-performance-dashboard' ) }
							</Button>
						</div>
					) }

					<SelectControl
						label={ __( 'Chart Refresh Rate', 'react-realtime-performance-dashboard' ) }
						value={ refreshRate.toString() }
						options={ REFRESH_RATE_OPTIONS }
						onChange={ ( newVal: string ) =>
							setAttributes( { refreshRateMs: parseInt( newVal, 10 ) } )
						}
						help={ __( 'Controls how often the chart repaints to save CPU.', 'react-realtime-performance-dashboard' ) }
						__nextHasNoMarginBottom={ true }
						__next40pxDefaultSize={ true }
					/>
				</PanelBody>
			</InspectorControls>

			<div className="dashboard-header">
				<div className="header-titles">
					<h2>{ attributes.chartTitle || __( 'Live Market Performance', 'react-realtime-performance-dashboard' ) }</h2>

					<span className="coin-label">{ getStreamLabel( currentStream ) }</span>

					{ currentPrice ? (
						<div
							className={ `kpi-price ${ isUp ? 'price-up' : '' } ${ isDown ? 'price-down' : '' }` }
                            aria-live="polite"
			                role="status"
                            aria-atomic="true"
						>
                            <span className="screen-reader-text">{ __( 'Current Price:', 'react-realtime-performance-dashboard' ) } </span>
							${ currentPrice.toLocaleString( undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 } ) }
							{ isUp && <span className="delta-icon" aria-hidden="true">▲</span> }
							{ isDown && <span className="delta-icon" aria-hidden="true">▼</span> }
						</div>
					) : (
						<div className="kpi-price loading" aria-live="polite">
							{ __( 'Awaiting Data...', 'react-realtime-performance-dashboard' ) }
						</div>
					) }
				</div>

				<div className="header-meta">
					<div className={ `status-badge status-${ status }` }>
						{ status === 'connecting' && (
							<span style={ { display: 'flex', alignItems: 'center', gap: '4px' } }>
								<Spinner /> { __( 'Connecting', 'react-realtime-performance-dashboard' ) }
							</span>
						) }
						{ status === 'connected' && <span>🟢 { __( 'Live', 'react-realtime-performance-dashboard' ) }</span> }
						{ status === 'disconnected' && <span>⚫ { __( 'Offline', 'react-realtime-performance-dashboard' ) }</span> }
						{ status === 'error' && <span>🔴 { __( 'Error', 'react-realtime-performance-dashboard' ) }</span> }
					</div>
					<div className="refresh-note">
						{ sprintf( __( 'Updates every %ss', 'react-realtime-performance-dashboard' ), refreshRate / 1000 ) }
					</div>
				</div>
			</div>

			{ status === 'error' && (
				<div className="error-card">
					<p><strong>{ __( 'Connection Failed:', 'react-realtime-performance-dashboard' ) }</strong> { error }</p>
				</div>
			) }

			{ status === 'connected' && (
				<div className="chart-container" style={ { height: 320, width: '100%', marginTop: '20px' } }>
					<ResponsiveContainer width="99%" height={ 320 }>
						<AreaChart data={ chartData }>
							<defs>
								<linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
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
								fill="url(#colorPrice)"
								isAnimationActive={ false }
							/>
						</AreaChart>
					</ResponsiveContainer>
				</div>
			) }
		</div>
	);
}