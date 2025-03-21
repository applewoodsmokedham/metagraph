# METAGRAPH System Patterns

## System Architecture

METAGRAPH is built as a single-page application (SPA) using React, with a focus on direct interaction with Bitcoin blockchain APIs through the Oyl SDK and wallet functionality through the LaserEyes package. The architecture is designed to be modular, maintainable, and extensible.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      React Frontend                         │
├─────────────┬─────────────────────────────┬─────────────────┤
│  Components │         Pages               │    Routing      │
└─────────────┴─────────────────────────────┴─────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  LaserEyesProvider                          │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                        SDK Layer                            │
├─────────────┬─────────────────────────────┬─────────────────┤
│   Provider  │        Alkanes              │   Node Shims    │
└─────────────┴─────────────────────────────┴─────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      Oyl SDK (@oyl/sdk)                     │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Bitcoin Network APIs                      │
├─────────────┬─────────────────────────────┬─────────────────┤
│  Mainnet    │        Regtest              │     Oylnet      │
└─────────────┴─────────────────────────────┴─────────────────┘
```

## Key Technical Decisions

### 1. Direct API Integration

METAGRAPH uses direct API calls to Bitcoin nodes rather than implementing a traditional backend. This approach:
- Reduces complexity by eliminating an additional server layer
- Provides a more authentic experience for developers
- Allows for real-time interaction with the blockchain

### 2. SDK Abstraction Layer

The application implements a custom SDK abstraction layer (`src/sdk/`) that wraps the Oyl SDK. This pattern:
- Isolates the application from changes in the underlying SDK
- Provides application-specific error handling and response formatting
- Enables consistent interface across different network environments

### 3. Node.js Compatibility in Browser

The Oyl SDK was designed for Node.js environments but needs to run in the browser. To address this, METAGRAPH:
- Implements custom Node.js shims (`src/sdk/node-shims.js`)
- Uses Vite's node polyfills plugin
- Creates proxies for Node-specific functionality

### 4. Provider Pattern

The application uses a provider pattern for network interaction:
- Different network configurations (mainnet, regtest, oylnet)
- Consistent interface across environments
- Runtime environment switching

### 5. Error Handling Strategy

METAGRAPH implements a comprehensive error handling strategy:
- All API calls are wrapped in try/catch blocks
- Errors are logged to console for debugging
- User-friendly error messages are displayed in the UI
- No mock data is returned in error cases

### 6. React Router Integration

The application uses React Router for client-side routing:
- App.jsx serves as the root layout component
- Outlet component for rendering nested routes
- Context API for passing data between routes
- Dynamic route parameters for API method pages

### 7. Wallet Integration Strategy

The application integrates Bitcoin wallet functionality using the LaserEyes package:
- LaserEyesProvider wraps the entire application for global wallet access
- Client-side only rendering to prevent server-side rendering issues
- Network mapping to align LaserEyes network types with METAGRAPH network environments
- Multi-wallet support with a wallet selection UI

## Design Patterns in Use

### 1. Component Composition

React components are composed to create complex UIs from simple, reusable parts:
- Layout components for page structure
- Shared components for common UI elements
- Method-specific components for specialized functionality
- Template components for consistent API method pages
- Wallet components for Bitcoin wallet functionality

### 2. Container/Presentational Pattern

Components are separated into:
- Container components that manage state and data fetching
- Presentational components that render UI based on props

### 3. Provider Pattern

The application uses multiple provider patterns:
- SDK Provider for network interaction:
  - Provider instances are created with specific configurations
  - Provider methods abstract the complexity of API calls
  - Error handling is centralized in the provider implementation
- LaserEyesProvider for wallet functionality:
  - Provides wallet context to all components
  - Manages wallet connection state
  - Abstracts wallet-specific implementation details

### 4. Proxy Pattern

Proxies are used to handle browser compatibility issues:
- The sandshrew client is wrapped in a proxy to handle missing methods
- Method calls are intercepted and handled appropriately

### 5. Factory Pattern

Factory functions are used to create configured instances:
- `getProvider` creates provider instances for different networks
- Each provider is configured with network-specific parameters
- Network mapping utility creates LaserEyes network configurations

### 6. Template Pattern

The application uses a template pattern for API method pages:
- APIForm component serves as a template for all API method pages
- Method-specific components customize the template with their own parameters and behavior
- Consistent UI and behavior across all method pages

### 7. Hook Pattern

The application uses React hooks for state management and side effects:
- useState for local component state
- useEffect for side effects and lifecycle management
- Custom hooks like useLaserEyes for wallet functionality

## Component Relationships

### Core Component Hierarchy

```
App (Root Layout)
├── LaserEyesProvider
│   ├── Header
│   │   ├── EndpointToggle
│   │   ├── WalletConnector
│   │   └── BlockHeight
│   ├── Outlet (Router Outlet)
│   │   ├── Home
│   │   ├── APIMethodPage
│   │   │   ├── Method-specific forms
│   │   │   │   ├── TraceForm
│   │   │   │   │   └── APIForm
│   │   │   │   ├── SimulateForm
│   │   │   │   │   └── APIForm
│   │   │   │   └── TraceBlockForm
│   │   │   │       └── APIForm
│   │   │   └── StatusIndicator
│   │   ├── AlkanesBalanceExplorer
│   │   │   └── Token display with images
│   │   ├── AlkanesTemplatesExplorer
│   │   ├── AlkanesTokensExplorer
│   │   └── NotFound
```

### SDK Module Relationships

```
index.js
├── node-shims.js
├── provider.js
│   └── Provider configuration
└── alkanes.js
    ├── traceTransaction
    ├── performAlkanesSimulation
    ├── traceBlock
    ├── getAlkanesByAddress
    ├── getAlkanesByHeight
    ├── getAlkanesTokenImage
    ├── transformAlkanesResponse
    └── hexToDataUri
```

### Wallet Integration Relationships

```
App.jsx
├── LaserEyesProvider
│   ├── WalletConnector
│   │   └── useLaserEyes hook
│   └── Other components
│       └── useLaserEyes hook (as needed)
```

## Data Flow

### API Data Flow

1. User selects network environment (mainnet, regtest, oylnet)
2. App component stores network state and passes it via context
3. User navigates to a method page
4. Method page receives network context from App
5. User fills out form parameters
6. Form submission triggers API call through SDK layer
7. SDK layer calls Oyl SDK methods
8. Oyl SDK interacts with Bitcoin network
9. Response flows back through the layers
10. UI updates with results or error messages

### Token Balance and Image Flow

1. User navigates to AlkanesBalanceExplorer page
2. User enters a Bitcoin address or connects wallet
3. Form submission triggers getAlkanesByAddress call
4. SDK transforms response to include tokenId information
5. Component displays token list with basic information
6. For each token with a tokenId, component calls getAlkanesTokenImage
7. getAlkanesTokenImage uses performAlkanesSimulation with input value 1000
8. Hex string response is converted to data URI using hexToDataUri
9. Images are stored in component state and displayed in the UI
10. User can view token details including name, symbol, ID, and image

### Wallet Data Flow

1. User clicks "Connect Wallet" button in WalletConnector component
2. WalletConnector displays list of available wallet options
3. User selects a wallet provider
4. LaserEyes package connects to the selected wallet
5. Connection state is updated in LaserEyesProvider
6. WalletConnector UI updates to show connected state
7. Other components can access wallet information through useLaserEyes hook
8. Wallet operations (transactions, signing) flow through LaserEyes to the wallet provider

## State Management

METAGRAPH uses React's built-in state management:
- Component state for local UI state
- Context API for global state (network environment, wallet state)
- Props for passing data between components
- Outlet context for passing data to nested routes
- LaserEyesProvider context for wallet state

## Routing Architecture

The application uses a nested routing architecture:
- App.jsx serves as the root layout component
- Routes are defined in routes.jsx
- Each route is associated with a specific component
- Dynamic route parameters for API method pages
- Outlet component for rendering nested routes

## Error Handling Flow

1. API calls are wrapped in try/catch blocks
2. Errors are logged to console
3. Structured error responses are returned
4. UI components display error messages
5. User is guided on how to resolve issues

## Network Configuration Flow

1. User selects network in EndpointToggle component
2. Network state is updated in App component
3. Network state is passed to LaserEyesProvider via mapNetworkToLaserEyes utility
4. Network state is passed to SDK layer via context
5. SDK layer configures provider for selected network
6. API calls are made to the selected network

This system patterns document provides a comprehensive overview of the architecture, design patterns, and component relationships in the METAGRAPH application.