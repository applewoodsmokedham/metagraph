# Implementation Guide: URL-based Network Navigation

## Overview

This guide provides detailed instructions for React developers implementing the URL-based network navigation system. Before making any changes, it's crucial to understand the current application architecture and key components that will be affected by this refactoring.

## Key Files to Review

Before beginning implementation, thoroughly review these files to understand the current architecture:

### 1. Route Configuration (`src/routes.jsx`)

**Why it matters:** This file defines all application routes and will need significant changes to implement the URL-based network structure.

**What to look for:**
- How routes are currently structured (nested under a single App component)
- How parameters are passed to components
- The relationship between paths and components
- Current route definitions for the pages we're migrating:
  - `api-methods/trace`
  - `api-methods/simulate`
  - `explorer/alkanesTokens`
  - `explorer/alkanesBalance`
  - `explorer/alkanesTemplates`

**Changes needed:**
- Add network-specific routes
- Implement dynamic route generation
- Maintain backward compatibility

### 2. Main Application Component (`src/App.jsx`)

**Why it matters:** This component sets up the application layout and provides the network context to all child components.

**What to look for:**
- How the network state is managed (`const [network, setNetwork] = useState('mainnet')`)
- How network change is handled (`handleNetworkChange` function)
- How the network context is passed to child routes (via `<Outlet context={{ endpoint: network }} />`)
- The LaserEyes provider configuration

**Changes needed:**
- Create a new NetworkProvider component based on this pattern
- Ensure consistency in layout and styling
- Maintain identical header and navigation

### 3. Network Switching Component (`src/components/shared/EndpointToggle.jsx`)

**Why it matters:** This component will be replaced with a new NetworkNav component that uses links instead of state changes.

**What to look for:**
- How the toggle works currently (button clicks triggering `onChange` callback)
- The styling and UI elements used
- How the active network is visually indicated

**Changes needed:**
- Create a new NetworkNav component using `<Link>` elements
- Maintain visual consistency
- Preserve path when switching networks

### 4. Explorer Page Example (`src/pages/AlkanesTokensExplorer.jsx`)

**Why it matters:** This is a representative page component that will need updating to support network from URL parameters.

**What to look for:**
- How the component gets the current network (`const { endpoint = 'mainnet' } = useOutletContext() || {}`)
- How data fetching depends on the network (`useEffect(() => { fetchTokens(); }, [currentPage, endpoint])`)
- How the network is displayed in the UI

**Changes needed:**
- Update to get network from both URL params and context
- Add request cancellation logic
- Ensure visual consistency

### 5. SDK Methods (`src/sdk/alkanes.js`)

**Why it matters:** The SDK methods make network-specific API calls and need updates to support request cancellation.

**What to look for:**
- How methods accept the `endpoint` parameter
- How the provider is initialized for each network (`const provider = getProvider(endpoint)`)
- Current error handling patterns

**Changes needed:**
- Add AbortController signal support to all methods
- Properly handle aborted requests
- Maintain consistent error handling

### 6. Provider Configuration (`src/sdk/provider.js`)

**Why it matters:** This file configures connections to different networks and will be central to ensuring correct network access.

**What to look for:**
- How network configurations are defined
- How the provider is initialized for different networks
- Any network-specific behavior

**Changes needed:**
- No direct changes needed, but understand how it works
- May need updates if network configurations change

## Implementation Steps

After reviewing these files, follow these implementation steps:

### 1. Create New Components

1. **NetworkProvider Component**:
   - Create `src/components/providers/NetworkProvider.jsx`
   - Model after App.jsx but get network from URL parameters
   - Include NetworkNav instead of EndpointToggle

2. **NetworkNav Component**:
   - Create `src/components/shared/NetworkNav.jsx`
   - Use Link components for navigation
   - Extract and preserve the current path when switching networks

### 2. Update SDK Methods

1. **Add AbortController Support**:
   - Update each method in `src/sdk/alkanes.js` to accept a signal parameter
   - Modify the provider calls to respect the AbortController signal
   - Handle AbortError separately in catch blocks

### 3. Modify Route Configuration

1. **Create Page Definitions**:
   - Define each page once with legacy and new paths
   - Set up component and props mapping

2. **Implement Dynamic Route Generation**:
   - Generate both legacy routes and new network-based routes
   - Ensure all routes use the same underlying components

### 4. Update Page Components

1. **Add Network Detection**:
   - Update components to get network from both URL params and context
   - Prioritize URL params over context
   - Add useRef for AbortController

2. **Add Request Cancellation**:
   - Implement cleanup function in useEffect
   - Cancel requests when component unmounts or dependencies change
   - Only update state if request wasn't aborted

### 5. Test Thoroughly

1. **Test Both Routing Systems**:
   - Verify functionality on legacy routes
   - Verify functionality on new network routes
   - Ensure switching between routes maintains state correctly

2. **Test Network Switching**:
   - Test rapid network switching to verify race condition is fixed
   - Verify correct data always displays for the selected network
   - Check URL updates correctly when switching networks

## Implementation Examples

Refer to the `docs/implementation-plan-network-pages-updated.md` document for detailed code examples of all components and implementation patterns.

## Common Pitfalls to Avoid

1. **Forgetting to cancel requests** when component unmounts or network changes
2. **Not checking for aborted requests** before updating state
3. **Hardcoding network-specific logic** that should be dynamic
4. **Breaking backward compatibility** with legacy routes
5. **Inconsistent styling** between old and new navigation
6. **Missing error handling** for network-specific errors

## Questions for Implementation

If you encounter issues during implementation, consider these questions:

1. Is the component properly detecting the network from both URL and context?
2. Are requests being properly cancelled when switching networks?
3. Is the route configuration correctly generating all needed routes?
4. Does the navigation preserve the current path when switching networks?
5. Is the user experience consistent between old and new navigation patterns?

## Success Criteria

Your implementation is successful when:

1. All five specified pages work identically in both legacy and new URL patterns
2. Network switching no longer causes race conditions or data inconsistency
3. The same component code is reused across different network paths
4. URL accurately reflects the current application state
5. Navigation between networks is intuitive and preserves current page