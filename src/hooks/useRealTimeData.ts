/**
 * Manages a persistent WebSocket connection with auto-reconnect capabilities.
 *
 * Handles hardware network bridging, DNS rebound delays, stalled stream detection,
 * automatic reconnections, and data parsing while preventing infinite retry loops.
 *
 * @template T
 * @param {string} url The WebSocket endpoint to connect to.
 * @return {WebSocketState<T>} The current connection state and parsed data payload.
 */
import { useState, useEffect, useRef } from '@wordpress/element';
import { WebSocketState } from '../types';

export function useRealTimeData< T >( url: string ): WebSocketState< T > {
	const [ state, setState ] = useState< WebSocketState< T > >( {
		data: null,
		status: 'disconnected',
		error: null,
	} );

	const socketRef = useRef< WebSocket | null >( null );
	const reconnectTimer = useRef< number | null >( null );
	const retryCountRef = useRef< number >( 0 );

	// Prevents auto-healing for verified logic errors versus transient network drops.
	const isFatalErrorRef = useRef< boolean >( false );

	// Establishes references for connection timers to detect silent network failures.
	const connectionTimeoutRef = useRef< number | null >( null );
	const messageTimeoutRef = useRef< number | null >( null );

	// Defines thresholds for connection resilience.
	const maxRetries = 3;
	const connectionTimeoutMs = 5000;
	const messageTimeoutMs = 10000;

	useEffect( () => {
		// Fails cleanly and resets the state if the provided URL is empty.
		if ( ! url ) {
			setState( { data: null, status: 'disconnected', error: null } );
			return;
		}

		let isMounted = true;

		// Clears all active network timers to prevent browser memory leaks.
		const clearTimeouts = () => {
			if ( connectionTimeoutRef.current ) {
				window.clearTimeout( connectionTimeoutRef.current );
			}
			if ( messageTimeoutRef.current ) {
				window.clearTimeout( messageTimeoutRef.current );
			}
		};

		const connect = () => {
			if ( reconnectTimer.current ) {
				window.clearTimeout( reconnectTimer.current );
			}

			clearTimeouts();
			isFatalErrorRef.current = false;

			// Prevents opening multiple instances if a connection is already active or forming.
			if (
				socketRef.current?.readyState === WebSocket.OPEN ||
				socketRef.current?.readyState === WebSocket.CONNECTING
			) {
				return;
			}

			setState( ( prev ) => ( { ...prev, status: 'connecting', error: null } ) );

			try {
				const socket = new WebSocket( url );
				socketRef.current = socket;

				// Terminates the connection if the server takes too long to respond.
				connectionTimeoutRef.current = window.setTimeout( () => {
					if ( isMounted && socket.readyState !== WebSocket.OPEN ) {
						// Domain/Connection timeouts are only fatal if the hardware is stable.
						if ( navigator.onLine ) {
							isFatalErrorRef.current = true;
						}
						socket.close();
						setState( ( prev ) => ( { 
							...prev, 
							status: 'error', 
							error: 'Connection timed out. Verify domain and port.' 
						} ) );
					}
				}, connectionTimeoutMs );

				socket.onopen = () => {
					if ( ! isMounted ) {
						return;
					}

					clearTimeouts();
					setState( ( prev ) => ( { ...prev, status: 'connected' } ) );
					retryCountRef.current = 0;

					// Starts the data listener to ensure the stream is actually broadcasting.
					messageTimeoutRef.current = window.setTimeout( () => {
						if ( isMounted ) {
							isFatalErrorRef.current = true;
							socket.close();
							setState( ( prev ) => ( { 
								...prev, 
								status: 'error', 
								error: 'Connected, but no data received. Verify stream name.' 
							} ) );
						}
					}, messageTimeoutMs );
				};

				socket.onmessage = ( event ) => {
					if ( ! isMounted ) {
						return;
					}

					retryCountRef.current = 0;
					clearTimeouts();

					messageTimeoutRef.current = window.setTimeout( () => {
						if ( isMounted ) {
							socket.close();
							setState( ( prev ) => ( { 
								...prev, 
								status: 'error', 
								error: 'Stream stalled. Attempting to reconnect...' 
							} ) );
						}
					}, messageTimeoutMs );

					try {
						const parsedData: T = JSON.parse( event.data );
						setState( ( prev ) => ( { ...prev, data: parsedData, error: null } ) );
					} catch ( err ) {
						// Silently ignores malformed JSON packets.
					}
				};

				socket.onerror = () => {
					if ( isMounted ) {
						setState( ( prev ) => {
							if ( prev.error ) {
								return prev;
							}
							return { ...prev, status: 'error', error: 'WebSocket connection failed.' };
						} );
					}
				};

				socket.onclose = () => {
					if ( ! isMounted ) {
						return;
					}

					clearTimeouts();

					// Halts auto-healing only if a fatal logic error was explicitly flagged.
					if ( isFatalErrorRef.current ) {
						return;
					}

					setState( ( prev ) => ( { ...prev, status: 'disconnected' } ) );

					// Attempts to auto-heal if the network is active and under the retry limit.
					if ( navigator.onLine ) {
						if ( retryCountRef.current < maxRetries ) {
							retryCountRef.current += 1;
							reconnectTimer.current = window.setTimeout( connect, 3000 );
						} else {
							setState( ( prev ) => ( {
								...prev,
								status: 'error',
								error: prev.error || 'Connection failed after 3 attempts.',
							} ) );
						}
					}
				};
			} catch ( error: any ) {
				if ( isMounted ) {
					clearTimeouts();
					// Protocol errors (like 'ws://' vs 'wss://') are always fatal.
					if ( ! error.message?.includes( 'DNS' ) ) {
						isFatalErrorRef.current = true;
					}
					setState( ( prev ) => ( { 
						...prev, 
						status: 'error', 
						error: error.message || 'Failed to construct WebSocket.' 
					} ) );
				}
			}
		};

		const onNetworkOnline = () => {
			retryCountRef.current = 0;
			// Waits 3 seconds before reconnecting to allow DNS services to stabilize.
			reconnectTimer.current = window.setTimeout( connect, 3000 );
		};

		const onNetworkOffline = () => {
			if ( socketRef.current ) {
				socketRef.current.onclose = null;
				socketRef.current.close();
			}
			
			clearTimeouts();

			if ( isMounted ) {
				setState( ( prev ) => ( { ...prev, status: 'disconnected' } ) );
			}
		};

		window.addEventListener( 'online', onNetworkOnline );
		window.addEventListener( 'offline', onNetworkOffline );

		connect();

		return () => {
			isMounted = false;
			window.removeEventListener( 'online', onNetworkOnline );
			window.removeEventListener( 'offline', onNetworkOffline );
			
			clearTimeouts();

			if ( reconnectTimer.current ) {
				window.clearTimeout( reconnectTimer.current );
			}

			if ( socketRef.current ) {
				socketRef.current.onclose = null;

				if (
					socketRef.current.readyState === WebSocket.OPEN ||
					socketRef.current.readyState === WebSocket.CONNECTING
				) {
					socketRef.current.close();
				}
			}
		};
	}, [ url ] );

	return state;
}