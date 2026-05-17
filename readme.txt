=== UV Realtime Crypto Dashboard ===
Contributors:      vishwaupesh
Tags:              dashboard, websockets, crypto, blocks, bitcoin
Requires at least: 6.2
Tested up to:      6.9
Requires PHP:      7.4
Stable tag:        1.0.0
License:           GPL-2.0-or-later
License URI:       https://www.gnu.org/licenses/gpl-2.0.html

Display live cryptocurrency market data directly on your WordPress site with this ultra-fast, zero-server-load Gutenberg block.

== Description ==

The **UV Realtime Crypto Dashboard** is the easiest way to embed live, self-updating cryptocurrency charts directly into your WordPress posts and pages. 

Perfect for crypto bloggers, financial news sites, and trading portfolios, this block connects directly to live market data streams. Because it establishes a direct WebSocket connection on the visitor's browser, you get millisecond-accurate data updates without putting *any* additional load on your WordPress server.

= Why use UV Realtime Crypto Dashboard? =

* **Zero Server Load:** Your web server does zero work. The visitor's browser securely handles the live stream, keeping your website lightning fast.
* **Free Live Data (No API Keys!):** By default, the block connects to the public Binance WebSocket API. It is 100% free and requires no authentication.
* **Auto-Healing Hooks:** Built-in logic to detect when a user's computer wakes from sleep or changes Wi-Fi, automatically reconnecting the stream without a page refresh.
* **No-Conflict Architecture:** Works alongside any theme or plugin. It doesn't use the WordPress database for price storage, ensuring zero database bloat.
* **Mobile Optimized & Smart Throttling:** Built-in performance throttling saves battery life and CPU power for users viewing your charts on mobile devices.
* **Accessible (WCAG 2.2):** Fully compatible with screen readers (using ARIA Live Regions) and respects "reduced motion" settings for visually sensitive users.
* **Highly Customizable:** Easily change the chart title, adjust the refresh rate, or input any custom public `wss://` data stream URL directly within the WordPress editor.

== For Developers ==

Engineered for high-traffic environments, this plugin uses React and Recharts with strict memory management. It features automatic network drop detection, "zombie" connection killing, and auto-healing capabilities to ensure a flawless 60fps UI experience, even with high-frequency data.

This plugin is built with extensibility in mind. It exposes both PHP hooks for server-side defaults and JavaScript hooks so theme developers can extend the Gutenberg block's UI controls.

**PHP Filters (Server-Side Defaults)**

`add_filter( 'uv_realtime_crypto_dashboard_default_stream', function() { return 'wss://stream.binance.com:9443/ws/ethusdt@trade'; } );`
Overrides the global fallback WebSocket data stream output on the frontend.

`add_filter( 'uv_realtime_crypto_dashboard_default_refresh', function() { return 3000; } );`
Overrides the global fallback refresh rate in milliseconds.

**JavaScript Filters (Editor UI Extensibility)**

You can easily extend the block's sidebar dropdowns by hooking into the React rendering cycle using `@wordpress/hooks` in your theme's admin JavaScript.

`wp.hooks.addFilter( 'uvRealtimeCryptoDashboard.streamOptions', 'my-theme', function( options ) {
    return [
        ...options,
        { label: 'Solana (SOL/USDT)', value: 'wss://stream.binance.com:9443/ws/solusdt@trade' },
        { label: 'Cardano (ADA/USDT)', value: 'wss://stream.binance.com:9443/ws/adausdt@trade' }
    ];
} );`
Appends new cryptocurrency pairs to the "Select Live Market" dropdown inside the block settings sidebar.

`wp.hooks.addFilter( 'uvRealtimeCryptoDashboard.refreshRateOptions', 'my-theme', function( options ) {
    return [
        ...options,
        { label: 'Ultra Slow (5000ms)', value: 5000 }
    ];
} );`
Appends custom millisecond options to the "Chart Refresh Rate" dropdown.

== Installation ==

1. Log into your WordPress admin dashboard.
2. Navigate to **Plugins > Add New Plugin**.
3. Search for "UV Realtime Crypto Dashboard".
4. Click **Install Now**, then click **Activate**.
5. Open any page or post in the WordPress editor, type `/crypto`, and add the "Realtime Crypto Dashboard" block!

== Frequently Asked Questions ==

= Will this slow down my WordPress website? =
Not at all. The block uses client-side WebSockets. Your server only delivers the initial script, and the user's browser handles the live stream directly. It has zero impact on your Core Web Vitals or server CPU.

= Do I need to create an account or get an API key? =
No! The default stream uses a public, free endpoint. You can install the plugin and show live Bitcoin prices in seconds without signing up for anything.

= Can I use my own custom WebSocket data stream? =
Absolutely. You can paste any public `wss://` endpoint into the block settings. Just ensure your custom endpoint returns JSON with `p` (price) and `T` (timestamp) keys to render correctly on the chart.

= Is it secure? =
Yes. The data connection is 100% read-only. No user data, site credentials, or sensitive headers are ever transmitted. 

== Screenshots ==

1. The live dashboard view rendering Bitcoin (BTC/USDT) real-time data on the frontend.
2. The WordPress editor view showing the custom URL input field and 'Connect Stream' validation.
3. Block settings sidebar showing the refresh rate and performance throttling options.
4. Example of a custom WebSocket stream (BNB/USDT) rendering on the chart.

== External Services ==

This plugin connects to a third-party service to fetch real-time market data.

= Binance WebSocket API (stream.binance.com) =

* **What it is and what it's used for:** A public, high-frequency data stream used for tracking real-time cryptocurrency price.
* **When the connection occurs:** A secure WebSocket is opened only when a visitor views a page where the block is actively displayed.
* **What data is exchanged:** No user data, IP addresses, or site credentials are ever transmitted. The connection is strictly **read-only**.
* **Terms & Privacy:** This service is provided by Binance. No API key or account registration is required to access this public data stream.

== Privacy ==

**UV Realtime Crypto Dashboard** is designed with a "Privacy First" architecture.

* **No Telemetry:** We do not track usage, site URLs, or admin activity.
* **No Cookies:** This plugin does not set any cookies for visitors or admins.
* **Zero Server-Side Logging:** Because the WebSocket connection happens in the user's browser, your WordPress server never sees or logs the data traffic.

== Changelog ==

= 1.0.0 =
* **Initial Release:** High-performance crypto visualization block.
* **Live WebSocket Integration:** Direct, zero-server-load connection to Binance market data.
* **Gutenberg Native:** Built specifically for the Block Editor with full Inspector Controls support.
* **Developer Extensibility:** Includes 4 distinct filters (2 PHP, 2 JS) for overriding default streams, refresh rates, and extending UI dropdown options.
* **Performance Engineering:** Features automatic network drop detection, "zombie" connection killing, and CPU-friendly repaint throttling.
* **Reliability:** Built-in auto-healing hooks to restore connections after system sleep or network changes.
* **Accessibility Ready:** WCAG 2.2 compliant with ARIA Live Regions for real-time price updates and screen-reader support.
* **Modern UI:** Variable-driven SCSS architecture with status indicators and CSS-based pulse animations.
* **Translation Ready:** Fully internationalized with a shipped `.pot` template.