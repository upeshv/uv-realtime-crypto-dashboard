/**
 * Jest global setup file.
 * Configures DOM extensions and mocks browser APIs (like WebSockets) 
 * that do not exist natively in the JSDOM testing environment.
 */
import '@testing-library/jest-dom';

// Explicitly declare our mock instance on the global object so TypeScript doesn't panic in our test files.
declare global {
	var mockSocketInstance: MockWebSocket;
}

class MockWebSocket {
	url: string;
	readyState: number;
	onopen: jest.Mock;
	onclose: jest.Mock;
	onmessage: jest.Mock;
	onerror: jest.Mock;
	close: jest.Mock;

	constructor( url: string ) {
		this.url = url;
		this.readyState = 0; // CONNECTING
		this.onopen = jest.fn();
		this.onclose = jest.fn();
		this.onmessage = jest.fn();
		this.onerror = jest.fn();
		this.close = jest.fn();

		globalThis.mockSocketInstance = this;
	}
}

// Override the native browser WebSocket with our mock.
// @ts-ignore - Deliberately overriding the read-only global object for testing purposes.
globalThis.WebSocket = MockWebSocket;

// Force the JSDOM environment to simulate an active internet connection.
Object.defineProperty( navigator, 'onLine', {
	writable: true,
	value: true,
} );