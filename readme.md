# React Realtime Performance Dashboard

![WordPress](https://img.shields.io/badge/WordPress-6.2+-blue.svg)
![PHP](https://img.shields.io/badge/PHP-7.4+-777bb4.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178c6.svg)
![React](https://img.shields.io/badge/React-18-61dafb.svg)
![Jest](https://img.shields.io/badge/Testing-Jest-99424f.svg)
![License](https://img.shields.io/badge/license-GPLv2-green.svg)

An enterprise-grade, high-performance Gutenberg block that bridges WordPress and WebSockets to render real-time data visualizations.

By default, this block connects to the Binance WebSocket API to stream live cryptocurrency trades, but it can be configured in the editor to accept any public `wss://` endpoint.

## 🚀 Features

* **Zero Server Load:** Establishes direct client-to-server WebSockets. Your WordPress server simply delivers the initial JS payload, the user's browser handles the live data stream.
* **Hardware Network Bridging:** Aggressive memory management. The block listens to native browser network events and instantly clears "zombie" sockets if the user loses Wi-Fi, auto-healing the connection with a DNS-stable delay when the network returns.
* **Performance Throttling:** Built-in React state throttling. Users can configure the chart to repaint anywhere from every 100ms (Hyper-Active) to 3000ms (Relaxed) to optimize CPU and battery life.
* **Strict Architecture:** 100% strongly typed with TypeScript, utilizing modular SCSS with CSS Custom Properties for seamless theming and dark mode support.

## 🛠️ Tech Stack

* **Core:** WordPress Block API (Gutenberg)
* **Frontend:** React (`@wordpress/element`)
* **Visualization:** Recharts (D3.js)
* **Language:** TypeScript (Strict Mode)
* **Testing:** Jest & React Testing Library
* **Build Tool:** Webpack (`@wordpress/scripts`)

## 📸 Screenshots

#### 1. Live Dashboard Rendering (Default Bitcoin Stream)
![Default view showing AreaChart visualization of Bitcoin trades](https://raw.githubusercontent.com/upeshv/react-realtime-performance-dashboard/assets/screenshot-1.png)

#### 2. Custom WebSocket Configuration
![Block sidebar demonstrating the custom data stream input and settings](https://raw.githubusercontent.com/upeshv/react-realtime-performance-dashboard/assets/screenshot-2.png)

#### 3. Active Custom Stream (Binance Coin)
![Live block rendering data from a custom WebSocket endpoint](https://raw.githubusercontent.com/upeshv/react-realtime-performance-dashboard/assets/screenshot-3.png)

#### 4. CPU Performance Throttling Controls
![Settings sidebar demonstrating controls to throttle chart refresh rate](https://raw.githubusercontent.com/upeshv/react-realtime-performance-dashboard/assets/screenshot-4.png)

#### 5. Graceful Error Handling & Silent Failure Detection
![UI demonstrating a connection error due to an incorrect stream name](https://raw.githubusercontent.com/upeshv/react-realtime-performance-dashboard/assets/screenshot-5.png)

#### 6. CI/CD: Passing Jest Test Suite
![Terminal output showing passing unit and integration tests](https://raw.githubusercontent.com/upeshv/react-realtime-performance-dashboard/assets/screenshot-6.png)

## 🔒 Security & Data Integrity

* **Read-Only Pipeline:** The connection to WebSocket endpoints is strictly read-only. No user data, site credentials, or sensitive headers are ever transmitted to external servers.
* **Protocol Enforcement:** Utilizing strict WordPress escaping, the block only permits secure `wss://` and `ws://` protocols, preventing XSS injections.
* **Zero Server-Side Execution:** Since no data is processed on the PHP server, the plugin eliminates backend vulnerabilities associated with API proxies.

## ♿ Accessibility (WCAG 2.1)

Inclusive design is a core requirement of this project:
* **ARIA Live Regions:** Real-time price updates utilize `aria-live="polite"` regions to ensure screen readers announce value changes without interrupting the user's flow.
* **Keyboard Operability:** All interactive elements, including custom URL inputs and refresh rate selectors, are fully navigable via keyboard with high-visibility focus states.
* **Reduced Motion:** The charting engine respects the `prefers-reduced-motion` system preference, disabling transitions for users with vestibular sensitivities.

## 📦 Installation

### For Site Owners (Production)

1. Download the latest compiled release `.zip` from the [Releases](https://github.com/upeshv/react-realtime-performance-dashboard/releases) tab.
2. Upload to your WordPress installation via **Plugins > Add New**.
3. Activate the plugin.
4. Add the **React Realtime Dashboard** block to any post or page.

### For Developers (Local Setup)

1. Clone the repository into your local WordPress `wp-content/plugins/` directory:
   
   ```bash
   git clone [https://github.com/your-username/react-realtime-performance-dashboard.git](https://github.com/your-username/react-realtime-performance-dashboard.git)
   ```

2. Navigate into the directory and install dependencies:
   
   ```bash
   cd react-realtime-performance-dashboard
   npm install
   ```

3. Start the Webpack watch process for local development:
   
   ```bash
   npm run start
   ```

## 💻 Available Commands

* `npm run start` - Compiles development assets and watches for changes.
* `npm run build` - Compiles, minifies, and tree-shakes production assets.
* `npm run test` - Runs the Jest test suite.
* `npm run format` - Formats TypeScript and SCSS files using Prettier.
* `npm run lint:js` - Lints JavaScript/TypeScript files via ESLint.

## 🧪 Testing & QA

This project is built using Test-Driven Development (TDD) to ensure architectural stability. The test suite isolates the React hooks and mocks the browser's native WebSocket API and JSDOM network events.

To run the test suite:

```bash
npm run test
```

**Test Coverage Includes:**
- WebSocket connection and JSON payload parsing.
- Hardware disconnect event listeners (Socket assassination).
- Auto-healing intervals (3-second reconnect loops).

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change. 

Please ensure you run `npm run format` and `npm run test` before submitting a PR to maintain the strict wordpress coding standards of this repository.

## 📄 License

This project is licensed under the [GPL-2.0-or-later](https://www.gnu.org/licenses/gpl-2.0.html) License.