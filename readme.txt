=== React Realtime Performance Dashboard ===
Contributors:      upeshv
Tags:              dashboard, realtime, websockets, crypto, blocks, chart
Requires at least: 6.2
Tested up to:      6.9
Requires PHP:      7.4
Stable tag:        1.0.0
License:           GPL-2.0-or-later
License URI:       https://www.gnu.org/licenses/gpl-2.0.html

A high-performance, real-time data visualization block bridging WordPress and WebSockets.

== Description ==

The React Realtime Performance Dashboard is an enterprise-grade Gutenberg block that allows you to embed live, self-updating data streams directly into your WordPress posts and pages. 

Built with React and Recharts, this block establishes a direct WebSocket connection on the client side, meaning you get millisecond-accurate data updates without putting any additional load on your WordPress server.

**Key Features:**
* **Zero Server Load:** Connects directly to external WebSocket endpoints from the user's browser.
* **Hardware Network Bridging:** Automatically detects network drops, kills "zombie" connections to save memory, and auto-heals when restored.
* **Performance Throttling:** Controls to throttle React repaints (100ms to 3s) to save battery and CPU on mobile devices.
* **Customizable:** Input any public wss:// data stream URL directly within the editor.

== Performance & Optimization ==

This plugin is engineered for high-traffic environments where frontend efficiency is critical.
* **Client-Side Hydration:** The PHP renderer only serves the container and initial configuration, the heavy lifting of data processing is handled by the browser's JavaScript engine.
* **Memory Management:** The custom `useRealTimeData` hook utilizes aggressive garbage collection, clearing all internal timeouts and closing socket listeners immediately when the block is unmounted.
* **Repaint Throttling:** By using a `useRef` based timer, the dashboard prevents the "React Refresh Storm" common in real-time apps, ensuring 60fps UI smoothness even with high-frequency data.

== Security & Data Integrity ==

Data safety is maintained through a strictly decentralized architecture.
* **Read-Only Pipeline:** The connection to WebSocket endpoints is 100% read-only. No user data, site credentials, or sensitive headers are ever transmitted to external servers.
* **Protocol Enforcement:** Utilizing strict WordPress escaping (`esc_url`), the block only permits secure `wss://` and `ws://` protocols, preventing XSS injections through malformed URLs.
* **Zero Server-Side Execution:** Since no data is processed on your PHP server, the plugin eliminates common backend vulnerabilities associated with API proxies.

== Accessibility (WCAG 2.1) ==

Inclusive design is baked into the dashboard to ensure market data is perceptible to all visitors.
* **ARIA Live Regions:** High-priority price updates utilize `aria-live="polite"` regions, allowing screen readers to announce value changes without interrupting the user's flow.
* **Keyboard Navigation:** Every control, including custom URL inputs and refresh rate selectors, is fully navigable via Tab keys with high-visibility focus states.
* **Motion Reduction:** The charting engine respects the `prefers-reduced-motion` system preference, disabling transitions for users with vestibular sensitivities.

== API & Legal Compliance ==

By default, this block connects to the public Binance WebSocket API. This stream is **100% free, requires no authentication or API keys**, and has no CORS restrictions. 

Because it operates as a public data pipeline, it is perfectly safe, legally compliant, and respects the open-source ethos of the WordPress community. No user data is ever sent to the endpoint, the connection is strictly read-only for public market data.

== Installation ==

**From a compiled ZIP file:**
1. Upload the plugin files to the `/wp-content/plugins/react-realtime-performance-dashboard` directory.
2. Activate the plugin through the 'Plugins' screen in WordPress.
3. Open any page or post and add the "React Realtime Dashboard" block.

**From Source (GitHub):**
1. Clone the repository into your plugins directory.
2. Run `npm install` and `npm run build`.
3. Activate the plugin.

== Testing & Quality Assurance ==

This plugin is engineered with strict Test-Driven Development (TDD) principles. The test suite uses Jest and React Testing Library to simulate real-world browser events.

**How to run the tests:**
1. Navigate to the plugin directory.
2. Run `npm run test`

== Frequently Asked Questions ==

= Will this slow down my WordPress server? =
No. The block uses client-side WebSockets. Your server only delivers the initial JS, the user's browser handles the live stream.

= Can I use my own custom WebSocket data? =
Yes. You can paste any public wss:// endpoint. Ensure your endpoint returns JSON with 'p' (price) and 'T' (timestamp) keys.

== Screenshots ==

1. Settings sidebar showing the refresh rate and performance throttling options.
2. The live dashboard view rendering Bitcoin (BTC/USDT) real-time data.
3. Example of a custom WebSocket stream (BNB/USDT) rendering on the chart.
4. The custom URL input field with the 'Connect Stream' validation button.
5. Terminal output showing the passing Jest test suite, validating the auto-healing network hook and WebSocket reliability.

== Changelog ==

= 1.0.0 =
* Initial enterprise-grade release.
* Refactored architecture to strict TypeScript standards.
* Added CPU performance throttling and network auto-healing.