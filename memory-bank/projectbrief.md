# METHANE Project Brief

## Project Overview

**METHANE** (Method Exploration, Testing, and Analysis eNvironment) is an interactive, developer-friendly playground and documentation hub designed specifically to facilitate exploration, testing, and integration of Alkanes metaprotocol and Sandshrew API methods on the Bitcoin blockchain. It leverages the Oyl SDK for business logic and interaction with Bitcoin.

### Key Goals
- Provide an intuitive interface to explore and test Sandshrew and Alkanes RPC API methods
- Enable rapid development and integration of Alkanes smart contracts on Bitcoin using the Oyl SDK
- Offer interactive, real-world API call capabilities directly to the Bitcoin mainnet
- Allow seamless toggling between Production and Local testing environments
- Provide detailed documentation for developers

## Technical Context

### Technology Stack

#### Programming Languages & Frameworks
- **JavaScript/JSX** - Primary programming language
- **React.js (v19.0.0)** - Frontend framework
- **React Router (v7.3.0)** - Client-side routing
- **Vite (v6.2.0)** - Build tool and development server

#### Key Dependencies
- **@oyl/sdk** - Core SDK for Bitcoin blockchain interaction (from GitHub: Oyl-Wallet/oyl-sdk)
- **bitcoinjs-lib (v6.1.7)** - Bitcoin JavaScript library
- **react-router-dom (v7.3.0)** - React routing library
- **Node.js polyfills** - Browser compatibility for Node.js APIs:
  - buffer, crypto-browserify, events, os-browserify, path-browserify, process, stream-browserify, util

#### Development Dependencies
- **ESLint (v9.21.0)** - Code linting
- **Vite plugins** - React plugin, Node.js polyfills

### System Architecture

#### Frontend Architecture
- Single-page application (SPA) built with React
- Component-based architecture with reusable UI components
- Client-side routing with React Router
- Error boundary implementation for robust error handling
- Strict mode enabled for development best practices

#### Backend Integration
- No traditional backend; direct API calls to Bitcoin nodes
- Uses Oyl SDK for business logic and Bitcoin interaction
- Provider abstraction for different network environments (mainnet, regtest, oylnet)

#### Network Configuration
- Support for multiple Bitcoin networks:
  - Mainnet (production) - https://mainnet.sandshrew.io
  - Regtest (local) - http://localhost:18888
  - Oylnet (testing) - https://oylnet.oyl.gg
- Environment variables for API configuration (VITE_SANDSHREW_PROJECT_ID)

### Source Code Modules

#### Core Application Structure
- **src/App.jsx** - Main application component with layout and network state
- **src/routes.jsx** - Application routing configuration
- **src/main.jsx** - Application entry point with error handling

#### Components
1. **Layout Components** (`src/components/layout/`)
   - `Layout.jsx` - Main layout structure with header and content area
   - `Header.jsx` - Application header with title and controls
   - `NavBar.jsx` - Navigation menu with API method categories
   - `Footer.jsx` - Page footer

2. **Shared Components** (`src/components/shared/`)
   - `EndpointToggle.jsx` - Network selection toggle (Production/Local)
   - `BlockHeight.jsx` - Real-time block height display with error handling and retry mechanism
   - `StatusIndicator.jsx` - Network status indicator
   - `APIForm.jsx` - Reusable form for API method calls

3. **Method Components** (`src/components/methods/`)
   - `TraceForm.jsx` - Form for tracing transaction execution
   - `SimulateForm.jsx` - Form for simulating transaction execution
   - `TraceBlockForm.jsx` - Form for tracing all transactions in a block
   - `TraceBlockStatusForm.jsx` - Enhanced form with status tracking
   - `SimulationForm.jsx` - Alternative simulation form implementation

#### Pages
- `Home.jsx` - Application homepage with method directory and environment info
- `APIMethodPage.jsx` - Dynamic page for API method documentation and testing
- `AlkanesBalanceExplorer.jsx` - Interactive page for exploring Alkanes token balances by address
- `AlkanesTemplatesExplorer.jsx` - Page for exploring Alkanes templates
- `AlkanesTokensExplorer.jsx` - Page for exploring Alkanes tokens
- `NotFound.jsx` - 404 error page

#### SDK Integration (`src/sdk/`)
- `provider.js` - Provider implementation for Bitcoin network interaction with proxy for handling browser compatibility
- `alkanes.js` - Alkanes metaprotocol API methods implementation with proper error handling
- `node-shims.js` - Browser compatibility shims for Node.js APIs (process, fs, path, Buffer)
- `index.js` - SDK exports with Node.js shims import

### Key API Methods
1. **Alkanes Metaprotocol Methods**
   - `traceTransaction` - Traces a transaction's smart contract execution
   - `performAlkanesSimulation` - Simulates Alkanes operations, including retrieving token images
   - `traceBlock` - Traces all transactions in a block
   - `getAlkanesByAddress` - Gets Alkanes owned by a specific address with token details
   - `getAlkanesByHeight` - Gets Alkanes at a specific block height
   - `getAlkanesTokenImage` - Retrieves images for Alkanes tokens using simulation

2. **Bitcoin RPC Methods**
   - Access to standard Bitcoin JSON-RPC methods via Sandshrew API
   - Block information retrieval
   - Transaction data access

## Additional Context

### Development Environment
- Vite-based development server with hot module replacement
- ESLint for code quality and consistency
- Environment variable configuration (.env files)
- Node.js polyfills for browser compatibility

### Styling Approach
- CSS-based styling with separate files:
  - `index.css` - Base styles and CSS variables
  - `App.css` - Application-specific styles
- Responsive design with media queries
- Dark/light mode support via `prefers-color-scheme`

### CI/CD and Deployment
- GitHub Actions workflow for continuous integration
- Build and lint checks on push to main and pull requests
- Supports Node.js 16.x and 18.x environments
- No automated deployment configuration found

### Project Status
- Implementation in progress based on the PRD
- Method implementation matrix tracks progress of API methods
- Core functionality implemented with real data (no mock data)
- Oyl SDK integration completed with browser compatibility layer
- Error handling improved throughout the application

### Error Handling
- Comprehensive error handling throughout the application
- Error boundaries for component failures
- Detailed error logging to console
- User-friendly error messages
- Retry mechanisms for transient failures

### Documentation
- PRD document with detailed project requirements
- Oyl SDK integration documentation
- Alkanes provider integration guide
- Node.js compatibility layer documentation

### Recent Achievements
- Successfully integrated Oyl SDK with browser compatibility layer
- Removed all mock data and implemented real data fetching
- Improved error handling throughout the application
- Added validation to ensure required methods exist before calling them
- Implemented proxy pattern for handling missing functionality
- Implemented AlkanesBalanceExplorer for viewing token balances by address
- Added token image retrieval functionality using the simulate method
- Enhanced the transformAlkanesResponse function to include tokenId for image fetching

This comprehensive project brief provides the technical context needed for effective debugging, modifications, and extensions to the METHANE project.
