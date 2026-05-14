/**
 * Unit tests for the useRealTimeData WebSocket hook.
 */
import { renderHook, act, waitFor, cleanup } from '@testing-library/react';
import { useRealTimeData } from '../../hooks/useRealTimeData';

// Strongly typed mock to handle static WebSocket constants and instance tracking.
class MockWebSocket {
	static readonly CONNECTING = 0;
	static readonly OPEN = 1;
	static readonly CLOSING = 2;
	static readonly CLOSED = 3;

	url: string;
	readyState: number = MockWebSocket.CONNECTING;
	send: jest.Mock = jest.fn();
	close: jest.Mock = jest.fn( function ( this: MockWebSocket ) {
		this.readyState = MockWebSocket.CLOSED;
	} );

	onopen: ( () => void ) | null = null;
	onclose: ( () => void ) | null = null;
	onmessage: ( ( event: { data: string } ) => void ) | null = null;
	onerror: ( () => void ) | null = null;

	constructor( url: string ) {
		this.url = url;
		// Assign to our tracked variable so tests can trigger events.
		// eslint-disable-next-line @typescript-eslint/no-use-before-define
		activeSocket = this;
	}
}

// Strictly typed global tracker
let activeSocket: MockWebSocket | null = null;

describe( 'useRealTimeData', () => {
	beforeEach( () => {
		jest.useRealTimers();
		jest.clearAllMocks();
		activeSocket = null;

		// @ts-ignore - Deliberately overriding global WebSocket for test isolation
		global.WebSocket = MockWebSocket;
		// @ts-ignore
		window.WebSocket = MockWebSocket;

		Object.defineProperty( navigator, 'onLine', {
			value: true,
			configurable: true,
			writable: true,
		} );

		jest.spyOn( console, 'log' ).mockImplementation( () => {} );
		jest.spyOn( console, 'warn' ).mockImplementation( () => {} );
		jest.spyOn( console, 'error' ).mockImplementation( () => {} );
	} );

	afterEach( () => {
		cleanup();
		jest.restoreAllMocks();
		
		// @ts-ignore
		delete global.WebSocket;
		// @ts-ignore
		delete window.WebSocket;
	} );

	it( 'establishes a connection and parses incoming data', async () => {
		const { result } = renderHook( () => useRealTimeData( 'wss://test.com' ) );

		await waitFor(
			() => {
				expect( result.current.status ).toBe( 'connecting' );
			},
			{ timeout: 1000 }
		);

		expect( activeSocket ).not.toBeNull();

		act( () => {
			if ( activeSocket ) {
				activeSocket.readyState = MockWebSocket.OPEN;
				if ( activeSocket.onopen ) {
					activeSocket.onopen();
				}
			}
		} );

		await waitFor( () => {
			expect( result.current.status ).toBe( 'connected' );
		} );

		act( () => {
			if ( activeSocket && activeSocket.onmessage ) {
				activeSocket.onmessage( {
					data: JSON.stringify( { p: '65000.50', T: 123456789 } ),
				} );
			}
		} );

		expect( result.current.data ).toEqual( { p: '65000.50', T: 123456789 } );
	} );

	it( 'closes the socket and sets status to disconnected on network offline event', async () => {
		const { result } = renderHook( () => useRealTimeData( 'wss://test.com' ) );

		await waitFor( () => expect( activeSocket ).not.toBeNull() );
		const socketRef = activeSocket;

		act( () => {
			Object.defineProperty( navigator, 'onLine', { value: false } );
			window.dispatchEvent( new Event( 'offline' ) );
		} );

		expect( socketRef?.close ).toHaveBeenCalled();
		expect( result.current.status ).toBe( 'disconnected' );
	} );

	it( 'attempts reconnection after 3 seconds when connection closes', async () => {
		jest.useFakeTimers();
		const { result } = renderHook( () => useRealTimeData( 'wss://test.com' ) );

		act( () => {
			jest.advanceTimersByTime( 100 );
		} );

		const socket = activeSocket;
		expect( socket ).not.toBeNull();

		act( () => {
			if ( socket ) {
				socket.readyState = MockWebSocket.CLOSED;
				if ( socket.onclose ) {
					socket.onclose();
				}
			}
		} );

		expect( result.current.status ).toBe( 'disconnected' );

		act( () => {
			jest.advanceTimersByTime( 3100 );
		} );

		expect( result.current.status ).toBe( 'connecting' );

		jest.useRealTimers();
	} );
} );