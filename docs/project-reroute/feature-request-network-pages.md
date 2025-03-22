# Feature Request: URL-based Network Navigation for Alkanes Explorer

## Overview

Implement a URL-based navigation structure for METAGRAPH that organizes pages by network (provider), resource type, and specific resources, ensuring data integrity across network switches and eliminating race conditions.

## Problem Statement

Our current application architecture experiences a critical race condition when users rapidly switch between networks:

1. When a user switches from one network (e.g., mainnet) to another (e.g., oylnet) and then quickly back, multiple asynchronous data fetching operations are triggered
2. These operations run concurrently without proper cancellation
3. Later responses can override earlier ones, causing the UI to display data from the wrong network (e.g., mainnet data shows while the UI indicates oylnet is selected)

This race condition undermines the reliability of the explorer for developers and users alike, creating confusion and potentially leading to incorrect analysis of on-chain data.

## Proposed Solution

Implement a hierarchical URL structure following this pattern:

```
/[provider]/[metaprotocol]/[resource-type]/[specific-resource]
```

Examples for Alkanes resources:
- `/mainnet/alkanes/tokens` - List of Alkanes tokens on mainnet
- `/oylnet/alkanes/tokens` - List of Alkanes tokens on oylnet
- `/mainnet/alkanes/balance/bc1q...` - Balance for a specific address on mainnet
- `/oylnet/alkanes/templates` - Templates on oylnet

This approach has several advantages:
1. **Eliminates race conditions** by making network switching a page navigation event rather than a state change
2. **Makes URLs shareable and bookmarkable** for documentation purposes
3. **Simplifies caching** as each URL uniquely identifies a specific resource/network combination
4. **Enhances developer experience** by allowing direct links to specific resources on specific networks

## Technical Requirements

### 1. Route Structure

Create a route structure using React Router that supports the proposed URL hierarchy:

```jsx
<Routes>
  {/* Legacy routes for backward compatibility */}
  <Route path="/" element={<App />}>
    <Route index element={<Home />} />
    <Route path="explorer/alkanesTokens" element={<AlkanesTokensExplorer />} />
    <Route path="explorer/alkanesBalance" element={<AlkanesBalanceExplorer />} />
    <Route path="explorer/alkanesTemplates" element={<AlkanesTemplatesExplorer />} />
    {/* Other existing routes */}
  </Route>
  
  {/* New provider-based routes */}
  <Route path="/:network" element={<NetworkProvider />}>
    <Route index element={<NetworkHome />} />
    <Route path="alkanes/tokens" element={<AlkanesTokensExplorer />} />
    <Route path="alkanes/balance/:address?" element={<AlkanesBalanceExplorer />} />
    <Route path="alkanes/templates" element={<AlkanesTemplatesExplorer />} />
  </Route>
</Routes>
```

### 2. Network Provider Component

Create a network provider component that:
- Uses the network parameter from the URL to determine the current network
- Provides this network context to all child components
- Replaces the current toggle-based approach with a consistent network state

### 3. Network Navigation

Replace the current EndpointToggle with a navigation component that:
- Shows all available networks
- Links to the current page on different networks
- Visually indicates the current active network
- Preserves the current path when switching networks

### 4. Request Cancellation

Implement proper request cancellation when:
- Components unmount
- Network changes (as a result of navigation)
- User navigates away from a page

### 5. SDK Enhancements

Update the Alkanes SDK functions to:
- Accept an AbortController signal parameter
- Properly handle request cancellation
- Return appropriate errors for aborted requests

## Implementation Approach

### Phase 1: Core Structure (2-3 days)
- Create the NetworkProvider component
- Implement new route structure (while maintaining backward compatibility)
- Create the NetworkNav component to replace EndpointToggle

### Phase 2: Page Adaptation (2-3 days)
- Update Alkanes explorer pages to use the network from URL parameters
- Add request cancellation logic to all components
- Update SDK methods to support cancellation signals

### Phase 3: Testing and Refinement (2-3 days)
- Test all network switching scenarios
- Verify race conditions are eliminated
- Ensure UX remains smooth during network transitions

### Phase 4: Migration (1-2 days)
- Add redirects from old URLs to new structure
- Update documentation and examples
- Add seamless transition between old and new URL patterns

## User Experience Benefits

1. **Reliability**: Elimination of race conditions means users always see data that matches the selected network
2. **Shareability**: URLs can be shared in documentation or for troubleshooting
3. **Navigation**: Better browser history support and the ability to use back/forward buttons
4. **Clarity**: The URL clearly shows which network is being used

## Technical Benefits

1. **Simpler state management**: Network is derived from URL, not component state
2. **Better resource caching**: Each URL uniquely identifies a resource/network combination
3. **Improved code organization**: Pages don't need to handle network switching
4. **Easier maintenance**: New features can be added without worrying about network switch race conditions
5. **Testability**: Easier to test specific network configurations

## Alkanes-Specific Considerations

Since Alkanes tokens, balances, and templates can vary significantly between networks, this structure ensures that:

1. Developers can easily compare the same Alkanes token across different networks
2. Token explorer pages maintain data integrity during rapid network switching
3. The explorer can be used as a reliable reference tool for Alkanes development
4. URLs can be referenced in Alkanes documentation, linking directly to relevant resources