# METHANE System Patterns

## System Architecture

METHANE is built as a single-page application (SPA) using React, with a focus on direct interaction with Bitcoin blockchain APIs through the Oyl SDK. The architecture is designed to be modular, maintainable, and extensible.

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

METHANE uses direct API calls to Bitcoin nodes rather than implementing a traditional backend. This approach:
- Reduces complexity by eliminating an additional server layer
- Provides a more authentic experience for developers
- Allows for real-time interaction with the blockchain

### 2. SDK Abstraction Layer

The application implements a custom SDK abstraction layer (`src/sdk/`) that wraps the Oyl SDK. This pattern:
- Isolates the application from changes in the underlying SDK
- Provides application-specific error handling and response formatting
- Enables consistent interface across different network environments

### 3. Node.js Compatibility in Browser

The Oyl SDK was designed for Node.js environments but needs to run in the browser. To address this, METHANE:
- Implements custom Node.js shims (`src/sdk/node-shims.js`)
- Uses Vite's node polyfills plugin
- Creates proxies for Node-specific functionality

### 4. Provider Pattern

The application uses a provider pattern for network interaction:
- Different network configurations (mainnet, regtest, oylnet)
- Consistent interface across environments
- Runtime environment switching

### 5. Error Handling Strategy

METHANE implements a comprehensive error handling strategy:
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

## Design Patterns in Use

### 1. Component Composition

React components are composed to create complex UIs from simple, reusable parts:
- Layout components for page structure
- Shared components for common UI elements
- Method-specific components for specialized functionality
- Template components for consistent API method pages

### 2. Container/Presentational Pattern

Components are separated into:
- Container components that manage state and data fetching
- Presentational components that render UI based on props

### 3. Provider Pattern

The SDK implements a provider pattern for network interaction:
- Provider instances are created with specific configurations
- Provider methods abstract the complexity of API calls
- Error handling is centralized in the provider implementation

### 4. Proxy Pattern

Proxies are used to handle browser compatibility issues:
- The sandshrew client is wrapped in a proxy to handle missing methods
- Method calls are intercepted and handled appropriately

### 5. Factory Pattern

Factory functions are used to create configured instances:
- `getProvider` creates provider instances for different networks
- Each provider is configured with network-specific parameters

### 6. Template Pattern

The application uses a template pattern for API method pages:
- APIForm component serves as a template for all API method pages
- Method-specific components customize the template with their own parameters and behavior
- Consistent UI and behavior across all method pages

## Component Relationships

### Core Component Hierarchy

```
App (Root Layout)
├── Header
│   ├── EndpointToggle
│   └── BlockHeight
├── Outlet (Router Outlet)
│   ├── Home
│   ├── APIMethodPage
│   │   ├── Method-specific forms
│   │   │   ├── TraceForm
│   │   │   │   └── APIForm
│   │   │   ├── SimulateForm
│   │   │   │   └── APIForm
│   │   │   └── TraceBlockForm
│   │   │       └── APIForm
│   │   └── StatusIndicator
│   └── NotFound
```

### SDK Module Relationships

```
index.js
├── node-shims.js
├── provider.js
│   └── Provider configuration
└── alkanes.js
    ├── traceTransaction
    ├── simulateTransaction
    ├── traceBlock
    ├── getAlkanesByAddress
    └── getAlkanesByHeight
```

## Data Flow

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

## State Management

METHANE uses React's built-in state management:
- Component state for local UI state
- Context API for global state (network environment)
- Props for passing data between components
- Outlet context for passing data to nested routes

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

This system patterns document provides a comprehensive overview of the architecture, design patterns, and component relationships in the METHANE application.