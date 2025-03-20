# METHANE Technical Context

## Technologies Used

### Core Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| JavaScript/JSX | ES2020+ | Primary programming language |
| React | 19.0.0 | Frontend framework |
| React Router | 7.3.0 | Client-side routing |
| Vite | 6.2.0 | Build tool and development server |

### Key Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| @oyl/sdk | latest | Bitcoin blockchain interaction |
| @omnisat/lasereyes | latest | Bitcoin wallet integration |
| bitcoinjs-lib | 6.1.7 | Bitcoin JavaScript library |
| react-router-dom | 7.3.0 | React routing library |
| @nanostores/react | latest | State management for LaserEyes |

### Node.js Polyfills for Browser Compatibility

| Polyfill | Purpose |
|----------|---------|
| buffer | Buffer implementation for browser |
| crypto-browserify | Crypto API for browser |
| events | Event emitter implementation |
| os-browserify | OS utilities for browser |
| path-browserify | Path utilities for browser |
| process | Process implementation for browser |
| stream-browserify | Stream implementation for browser |
| util | Utility functions for browser |

### Development Tools

| Tool | Version | Purpose |
|------|---------|---------|
| ESLint | 9.21.0 | Code linting |
| Vite Node Polyfills Plugin | latest | Node.js compatibility |

## Development Setup

### Environment Requirements

- Node.js v16+ (v20+ recommended)
- npm or yarn package manager
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Bitcoin wallet extension (Unisat, Leather, etc.) for wallet functionality

### Environment Variables

The application uses the following environment variables:

| Variable | Purpose | Default |
|----------|---------|---------|
| VITE_SANDSHREW_PROJECT_ID | API key for Sandshrew API | 'lasereyes' |

These are configured in `.env` files:
- `.env` - Production environment variables
- `.env.development` - Development environment variables
- `.env.template` - Template for environment variables

### Local Development

1. Clone the repository
2. Install dependencies: `npm install` or `yarn`
3. Create `.env` file from `.env.template`
4. Start development server: `npm run dev` or `yarn dev`
5. Access the application at `http://localhost:5173`

### Build Process

1. Run build command: `npm run build` or `yarn build`
2. Output is generated in the `dist` directory
3. Static files can be served from any web server

## Technical Constraints

### Browser Compatibility

The application is designed to work in modern browsers that support:
- ES2020+ JavaScript features
- Modern CSS features
- Fetch API
- Web Crypto API
- Browser wallet extensions

### Oyl SDK Browser Compatibility

The Oyl SDK was primarily designed for Node.js environments, which presents several challenges when used in a browser:

1. **Node.js API Dependencies**: The SDK uses Node.js-specific APIs like `fs`, `path`, and `process`.
2. **Buffer Usage**: Extensive use of Node.js Buffer for binary data handling.
3. **Crypto Requirements**: Relies on Node.js crypto module for cryptographic operations.

These constraints are addressed through:
- Custom Node.js shims implementation
- Vite's node polyfills plugin
- Proxies for handling missing functionality

### LaserEyes Browser Compatibility

The LaserEyes package requires:
1. **Client-side rendering**: The package interacts with browser wallet extensions and cannot be server-side rendered.
2. **Browser wallet extensions**: Users must have compatible wallet extensions installed (Unisat, Leather, etc.).
3. **Web3 APIs**: Relies on wallet-provided Web3 APIs for blockchain interaction.

These constraints are addressed through:
- Client-side only rendering with isClient state check
- Detection of available wallet providers
- Graceful fallbacks when wallets are not available

### Network Constraints

The application interacts with different Bitcoin networks:

| Network | URL | Constraints |
|---------|-----|-------------|
| Mainnet | https://mainnet.sandshrew.io | Requires valid project ID |
| Regtest | http://localhost:18888 | Requires local Bitcoin node |
| Oylnet | https://oylnet.oyl.gg | Test network with limited availability |

### Performance Considerations

- API calls to blockchain can be slow (especially for mainnet)
- Large responses from trace and block methods
- Limited by browser's memory constraints for large datasets
- Wallet operations may require user confirmation, introducing delays
- LaserEyesProvider adds additional rendering overhead

## Dependencies

### External Dependencies

#### Oyl SDK

The Oyl SDK is a comprehensive Bitcoin development toolkit that provides:

- Account management (HD wallet generation, key derivation)
- Transaction creation and signing
- UTXO management
- Protocol support (Alkanes, Runes, BRC20)
- Provider abstraction for network interaction

Key modules used:
- Provider module for network communication
- Alkanes module for smart contract functionality
- Sandshrew client for Bitcoin RPC interaction

#### LaserEyes Package

The LaserEyes package is a Bitcoin wallet integration library that provides:

- Multi-wallet support (Unisat, Leather, Magic Eden, OKX, etc.)
- Wallet connection and management
- Transaction creation and signing
- Balance retrieval
- Network switching
- Message signing

Key components:
- LaserEyesProvider for global wallet context
- useLaserEyes hook for accessing wallet functionality
- Network constants (MAINNET, TESTNET)
- Wallet provider constants (UNISAT, LEATHER, etc.)

#### bitcoinjs-lib

Bitcoin JavaScript library that provides:
- Bitcoin address and script handling
- Transaction building and parsing
- Network definitions (mainnet, testnet, regtest)

### Internal Dependencies

#### SDK Layer (`src/sdk/`)

Custom abstraction layer that wraps the Oyl SDK:
- `provider.js` - Provider implementation
- `alkanes.js` - Alkanes API methods including:
  - `traceTransaction` - Trace transaction execution
  - `performAlkanesSimulation` - Simulate Alkanes operations
  - `getAlkanesByAddress` - Get tokens by address with transformed response
  - `getAlkanesTokenImage` - Retrieve token images using simulation
  - `transformAlkanesResponse` - Transform complex API responses to usable format
  - `hexToDataUri` - Convert hex string image data to data URIs
- `node-shims.js` - Browser compatibility shims
- `index.js` - SDK exports

#### Wallet Integration (`src/utils/`, `src/components/shared/`)

Custom components and utilities for wallet integration:
- `WalletConnector.jsx` - Component for connecting to wallets
- `networkMapping.js` - Utility for mapping between METHANE and LaserEyes network types
- Example components demonstrating wallet functionality usage

#### Component Structure

- `src/components/layout/` - Layout components
- `src/components/shared/` - Reusable components
  - `APIForm.jsx` - Enhanced template component for API method pages
  - `BlockHeight.jsx` - Real-time block height display
  - `EndpointToggle.jsx` - Network selection toggle
  - `StatusIndicator.jsx` - Network status indicator
  - `WalletConnector.jsx` - Wallet connection component
- `src/components/methods/` - Method-specific forms
  - `TraceForm.jsx` - Form for tracing transaction execution
  - `SimulateForm.jsx` - Form for simulating transaction execution
  - `TraceBlockForm.jsx` - Form for tracing all transactions in a block
- `src/components/examples/` - Example components
  - `WalletExample.jsx` - Example of using wallet functionality
- `src/pages/` - Page components
  - `Home.jsx` - Landing page with method directory
  - `APIMethodPage.jsx` - Template page for API methods
  - `AlkanesBalanceExplorer.jsx` - Interactive page for exploring Alkanes token balances with images
  - `AlkanesTemplatesExplorer.jsx` - Page for exploring Alkanes templates
  - `AlkanesTokensExplorer.jsx` - Page for exploring Alkanes tokens
  - `NotFound.jsx` - 404 error page
- `src/routes.jsx` - Routing configuration with React Router
- `src/App.jsx` - Root layout component with React Router integration and LaserEyesProvider

## Application Architecture

### Routing Architecture

The application uses React Router for client-side routing:
- `App.jsx` serves as the root layout component
- Routes are defined in `routes.jsx`
- Outlet component for rendering nested routes
- Context API for passing data between routes
- Dynamic route parameters for API method pages

### Component Architecture

The application uses a component-based architecture:
- Reusable components for common UI elements
- Template components for consistent API method pages
- Method-specific components for specialized functionality
- Context passing for sharing data between components
- Wallet components for Bitcoin wallet functionality

### State Management

The application uses React's built-in state management:
- Component state for local UI state
- Context API for global state (network environment)
- Props for passing data between components
- Outlet context for passing data to nested routes
- LaserEyesProvider context for wallet state

## Integration Points

### Bitcoin Network Integration

The application integrates with Bitcoin networks through the Oyl SDK:
- Mainnet for production use
- Regtest for local development
- Oylnet for testing

### Alkanes Smart Contract Integration

Alkanes is a metaprotocol for smart contracts on Bitcoin:
- Trace method for examining contract execution (updated implementation)
- Simulate method for previewing outcomes
- Methods for querying contract state

### Wallet Integration

The application integrates with Bitcoin wallets through the LaserEyes package:
- Multiple wallet providers (Unisat, Leather, Magic Eden, etc.)
- Wallet connection and management
- Balance retrieval
- Transaction creation and signing
- Message signing
- Network switching

### Block Explorer Integration

The application links to block explorers for additional context:
- Transaction details
- Block information
- Address balances

## Deployment Considerations

### Hosting Requirements

- Static file hosting (no server-side processing required)
- HTTPS recommended for security
- CORS configuration for API access

### CI/CD Integration

GitHub Actions workflow for:
- Building and testing the application
- Linting code for quality
- Supporting Node.js 16.x and 18.x environments

### Security Considerations

- API keys stored in environment variables
- No sensitive operations performed client-side without user confirmation
- Read-only access to blockchain data
- Wallet operations require user confirmation through wallet UI
- Client-side only rendering for wallet functionality

This technical context document provides a comprehensive overview of the technologies, dependencies, constraints, and integration points for the METHANE application.