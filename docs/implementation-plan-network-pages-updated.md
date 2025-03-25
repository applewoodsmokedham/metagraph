# Updated Implementation Plan: URL-based Network Navigation for Alkanes Explorer

## Architecture Overview

This implementation plan focuses on migrating the existing METAGRAPH functionality to a URL-based network structure while ensuring efficient code reuse across network variations.

## Pages to Migrate (1:1 Functionality)

The following pages need to be migrated with identical functionality:
- `api-methods/trace`
- `api-methods/simulate`
- `explorer/alkanesTokens`
- `explorer/alkanesBalance`
- `explorer/alkanesTemplates`

## Component Reuse Strategy

To avoid duplicating components across different network paths (e.g., `/oylnet/alkanes/api-methods/trace` vs `/mainnet/alkanes/api-methods/trace`), we'll implement a strategy based on three key principles:

1. **Single Component Definition**: Each page will have a single component definition used across all networks
2. **URL-Based Network Detection**: Components will automatically detect the network from URL parameters
3. **Dynamic Route Generation**: Routes will be generated programmatically to avoid repetition

### Single Component Pattern

All components should follow this pattern to be network-aware without duplication:

```jsx
// Example for AlkanesTokensExplorer
import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import { getAllAlkanes } from '../sdk/alkanes';

const AlkanesTokensExplorer = () => {
  // Get network from URL params first, then fallback to context for backward compatibility
  const { endpoint = 'mainnet' } = useOutletContext() || {};
  const { network } = useParams();
  
  // Use URL network param first, fall back to context
  const activeNetwork = network || endpoint || 'mainnet';
  
  // Rest of the component using activeNetwork instead of endpoint
  // ...
  
  return (
    <div className="container">
      <h2>Alkanes Tokens Explorer</h2>
      <p>Explore all initialized Alkanes tokens on the {activeNetwork.toUpperCase()} network.</p>
      {/* Rest of component remains unchanged except using activeNetwork instead of endpoint */}
    </div>
  );
};

export default AlkanesTokensExplorer;
```

This approach ensures the same component can be used in both legacy routes and new network-specific routes.

## Route Configuration with DRY Pattern

To avoid repetition in route definitions, we'll use a dynamic approach to generate routes:

```jsx
// src/routes.jsx
import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import NetworkProvider from './components/providers/NetworkProvider';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
// Import all page components

// Define available networks
const networks = ['mainnet', 'regtest', 'oylnet'];

// Define page mappings for both old and new paths
const pageDefinitions = [
  {
    legacyPath: 'api-methods/trace',
    newPathTemplate: 'alkanes/api-methods/trace',
    component: TraceMethodPage,
    props: { methodComponent: TraceForm, methodName: "Trace" }
  },
  {
    legacyPath: 'api-methods/simulate',
    newPathTemplate: 'alkanes/api-methods/simulate',
    component: APIMethodPage,
    props: { methodComponent: SimulateForm, methodName: "Simulate Transaction" }
  },
  {
    legacyPath: 'explorer/alkanesTokens',
    newPathTemplate: 'alkanes/tokens',
    component: AlkanesTokensExplorer
  },
  {
    legacyPath: 'explorer/alkanesBalance',
    newPathTemplate: 'alkanes/balance',
    component: AlkanesBalanceExplorer
  },
  {
    legacyPath: 'explorer/alkanesTemplates',
    newPathTemplate: 'alkanes/templates',
    component: AlkanesTemplatesExplorer
  }
];

// Build routes dynamically
const routes = [
  // Legacy routes (for backward compatibility)
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      // Generate legacy routes
      ...pageDefinitions.map(pageDef => ({
        path: pageDef.legacyPath,
        element: <pageDef.component {...pageDef.props} />
      })),
      { path: '*', element: <NotFound /> }
    ]
  },
];

// Add network-specific routes for each network
networks.forEach(network => {
  routes.push({
    path: `/${network}`,
    element: <NetworkProvider />,
    children: [
      { index: true, element: <NetworkHome /> },
      // Generate new path routes for this network
      ...pageDefinitions.map(pageDef => ({
        path: pageDef.newPathTemplate,
        element: <pageDef.component {...pageDef.props} />
      })),
      { path: '*', element: <NotFound /> }
    ]
  });
});

const router = createBrowserRouter(routes);

export default router;
```

This approach:
1. Defines each page once in the `pageDefinitions` array
2. Automatically generates both legacy routes and network-specific routes
3. Reuses the same component across all networks
4. Eliminates copy-pasting of route configurations

## NetworkProvider Component

The NetworkProvider component will serve as a wrapper for all network-specific routes:

```jsx
// src/components/providers/NetworkProvider.jsx
import React from 'react';
import { useParams, Outlet } from 'react-router-dom';
import { LaserEyesProvider } from '@omnisat/lasereyes';
import NetworkNav from '../shared/NetworkNav';
import WalletConnector from '../shared/WalletConnector';
import BlockHeight from '../shared/BlockHeight';
import { mapNetworkToLaserEyes } from '../../utils/networkMapping';

const NetworkProvider = () => {
  // Get network from URL parameters
  const { network } = useParams();
  
  // Validate network parameter
  const validNetworks = ['mainnet', 'regtest', 'oylnet'];
  const validNetwork = validNetworks.includes(network) ? network : 'mainnet';

  return (
    <LaserEyesProvider config={{ network: mapNetworkToLaserEyes(validNetwork) }}>
      <div className="app">
        <header className="header">
          {/* Header content similar to App.jsx */}
          <div className="header-controls">
            <NetworkNav currentNetwork={validNetwork} />
            <WalletConnector />
            <BlockHeight network={validNetwork} refreshInterval={10000} />
          </div>
        </header>
        <main className="main-content">
          {/* Pass the network down through context */}
          <Outlet context={{ endpoint: validNetwork }} />
        </main>
      </div>
    </LaserEyesProvider>
  );
};

export default NetworkProvider;
```

## Navigation Component for Network Switching

The NetworkNav component will replace EndpointToggle and maintain the current page when switching networks:

```jsx
// src/components/shared/NetworkNav.jsx
import React from 'react';
import { useLocation, Link } from 'react-router-dom';

const NetworkNav = ({ currentNetwork }) => {
  const location = useLocation();
  
  // Extract the path without the network part to preserve current page
  // This regex removes the leading network segment from the path
  const pathWithoutNetwork = location.pathname.replace(/^\/[^\/]+/, '') || '';
  
  const networks = [
    { id: 'regtest', label: 'REGTEST' },
    { id: 'mainnet', label: 'MAINNET' },
    { id: 'oylnet', label: 'OYLNET' }
  ];
  
  return (
    <div className="network-nav">
      <h4>Network:</h4>
      <div className="network-links">
        {networks.map(network => (
          <Link
            key={network.id}
            to={`/${network.id}${pathWithoutNetwork}`}
            className={`network-link ${currentNetwork === network.id ? 'active' : ''}`}
          >
            {network.label}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default NetworkNav;
```

## Implementation Phases

### Phase 1: Core Infrastructure (Days 1-2)

1. Create the NetworkProvider component
2. Create the NetworkNav component 
3. Update SDK methods with AbortController support

### Phase 2: Dynamic Route Configuration (Days 3-4)

1. Create the page definitions mapping
2. Implement dynamic route generation
3. Test both legacy routes and network routes with a simple example

### Phase 3: Component Updates (Days 5-6)

1. Update page components to detect network from both URL and context
2. Add request cancellation to all components
3. Test components on both legacy routes and network routes

### Phase 4: Data Consistency Testing (Day 7)

1. Test network switching using new navigation
2. Verify race conditions are eliminated
3. Confirm data consistency across all pages

### Phase 5: Deployment and Verification (Days 8-9)

1. Add analytics to track user adoption of new URLs
2. Add logs to help debug any issues
3. Deploy with both routing systems active

## Migration Strategy

### Gradual Transition Approach

To ensure a smooth transition:

1. Support both URL patterns simultaneously
2. Use a consistent network detection approach in components
3. Gradually direct users to the new URL structure through:
   - "New URL available" notifications on legacy pages
   - Documentation updates
   - Redirects (optional, based on adoption metrics)

### User Education

1. Add a small information banner on legacy pages:
   ```jsx
   {!network && (
     <div className="info-banner">
       Try our new URL structure with network in the path: 
       <Link to={`/${endpoint}${newPath}`}>
         /{endpoint}{newPath}
       </Link>
     </div>
   )}
   ```

2. Update documentation with the new URL structure

## Testing Strategy

### Network Switching Tests

Create specific tests to verify the race condition is fixed:

1. **Network Switch Test**: Navigate to a page, switch networks rapidly, verify correct data loads
2. **Cancellation Test**: Verify in-flight requests are cancelled when switching networks
3. **URL State Test**: Verify URL correctly reflects the current network
4. **State Consistency Test**: Verify page state is consistent with the URL

### Component Tests

1. Test each component in both legacy and network-specific routes
2. Verify components properly use the network parameter from either source
3. Test request cancellation when unmounting or changing networks

## Conclusion

This updated implementation plan addresses the concerns about maintaining 1:1 functionality and avoiding code duplication. By using a dynamic route generation approach and a consistent network detection pattern in components, we can ensure:

1. All existing pages work exactly as before
2. The same components are reused across different network paths
3. Route configuration is centralized and DRY (Don't Repeat Yourself)
4. The network switching race condition is eliminated

This approach strikes a balance between maintaining backward compatibility and implementing a cleaner, more reliable architecture for the future.