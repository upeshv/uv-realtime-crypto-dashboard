/**
 * Editor view for the Realtime Crypto Dashboard.
 * Handles the WebSocket connection and Recharts rendering within Gutenberg.
 */
import { __, sprintf } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, SelectControl, TextControl, Spinner, Button } from '@wordpress/components';
import { useState, useEffect, useRef } from '@wordpress/element';
import { applyFilters } from '@wordpress/hooks';
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

const STREAM_OPTIONS = applyFilters( 'uvRealtimeCryptoDashboard.streamOptions', [
    { label: __( 'Bitcoin (BTC/USDT)', 'uv-realtime-crypto-dashboard' ), value: 'wss://stream.binance.com:9443/ws/btcusdt@trade' },
    { label: __( 'Ethereum (ETH/USDT)', 'uv-realtime-crypto-dashboard' ), value: 'wss://stream.binance.com:9443/ws/ethusdt@trade' },
    { label: __( 'Solana (SOL/USDT)', 'uv-realtime-crypto-dashboard' ), value: 'wss://stream.binance.com:9443/ws/solusdt@trade' },
] ) as { label: string; value: string }[];

const REFRESH_RATE_OPTIONS = applyFilters( 'uvRealtimeCryptoDashboard.refreshRateOptions', [
    { label: __( 'Hyper-Active (100ms)', 'uv-realtime-crypto-dashboard' ), value: '100' },
    { label: __( 'Fast (500ms)', 'uv-realtime-crypto-dashboard' ), value: '500' },
    { label: __( 'Smooth (1 Second)', 'uv-realtime-crypto-dashboard' ), value: '1000' },
    { label: __( 'Relaxed (3 Seconds)', 'uv-realtime-crypto-dashboard' ), value: '3000' },
] ) as { label: string; value: string }[];

export default function Edit( {
	attributes,
	setAttributes,
}: BlockEditProps< DashboardAttributes > ) {
	const blockProps = useBlockProps( {
		className: 'uv-realtime-crypto-dashboard-wrapper',
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
	const formatTooltipValue = ( value: any ): [ string, string ] => [ `$${ value }`, __( 'Price', 'uv-realtime-crypto-dashboard' ) ];
	const formatYAxis = ( val: any ) => `$${ parseFloat( val ).toLocaleString() }`;

	const currentPrice = chartData.length > 0 ? chartData[ chartData.length - 1 ].price : null;
	const previousPrice = chartData.length > 1 ? chartData[ chartData.length - 2 ].price : null;

	const isUp = currentPrice !== null && previousPrice !== null && currentPrice > previousPrice;
	const isDown = currentPrice !== null && previousPrice !== null && currentPrice < previousPrice;

	return (
		<div { ...blockProps }>
			<InspectorControls>
				<PanelBody title={ __( 'Data Stream Settings', 'uv-realtime-crypto-dashboard' ) } initialOpen={ true }>
					<SelectControl
						label={ __( 'Select Live Market', 'uv-realtime-crypto-dashboard' ) }
						value={ isPresetStream ? currentStream : 'custom' }
						options={ [
							...STREAM_OPTIONS,
							{ label: __( 'Custom wss:// Endpoint...', 'uv-realtime-crypto-dashboard' ), value: 'custom' },
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
						<div className="uv-crypto-custom-url-wrapper">
							<TextControl
								label={ __( 'Custom WebSocket URL', 'uv-realtime-crypto-dashboard' ) }
								value={ customUrlInput }
								onChange={ ( newVal: string ) => setCustomUrlInput( newVal ) }
								help={ __( 'Enter a public wss:// endpoint. The live stream must return a JSON object containing \'p\' (price) and \'T\' (timestamp) to render on the chart.', 'uv-realtime-crypto-dashboard' ) }
								__nextHasNoMarginBottom={ true }
								__next40pxDefaultSize={ true }
							/>
							<Button
								variant="primary"
								className="uv-crypto-connect-button"
								onClick={ () => setAttributes( { dataStreamUrl: customUrlInput } ) }
								disabled={ !customUrlInput.startsWith( 'ws' ) }
							>
								{ __( 'Connect Stream', 'uv-realtime-crypto-dashboard' ) }
							</Button>
						</div>
					) }

					<SelectControl
						label={ __( 'Chart Refresh Rate', 'uv-realtime-crypto-dashboard' ) }
						value={ refreshRate.toString() }
						options={ REFRESH_RATE_OPTIONS }
						onChange={ ( newVal: string ) =>
							setAttributes( { refreshRateMs: parseInt( newVal, 10 ) } )
						}
						help={ __( 'Controls how often the chart repaints to save CPU.', 'uv-realtime-crypto-dashboard' ) }
						__nextHasNoMarginBottom={ true }
						__next40pxDefaultSize={ true }
					/>
				</PanelBody>
			</InspectorControls>

			<div className="dashboard-header">
				<div className="header-titles">
					<h2>{ attributes.chartTitle || __( 'Live Crypto Market', 'uv-realtime-crypto-dashboard' ) }</h2>

					<span className="coin-label">{ getStreamLabel( currentStream ) }</span>

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
						{ status === 'connecting' && (
							<span className="uv-crypto-spinner-wrapper">
								<Spinner /> { __( 'Connecting', 'uv-realtime-crypto-dashboard' ) }
							</span>
						) }
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