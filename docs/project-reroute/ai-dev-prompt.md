# AI Developer Prompt: URL-based Network Navigation System

I need your help implementing a URL-based network navigation system for our METAGRAPH application to resolve a critical race condition issue. We currently have a global network state with a toggle component, but this causes data inconsistency when users rapidly switch between networks.

## The Problem

When users quickly switch networks (e.g., from mainnet to oylnet and back), multiple API requests run concurrently without cancellation. Later responses can override earlier ones, causing the UI to display data from one network while showing a different network is selected in the UI.

## The Solution

We want to change our navigation from a toggle-based approach to a URL-based approach, shifting from:
- Current: `/explorer/alkanesTokens` (with network in global state)
- New: `/{network}/alkanes/tokens` (with network in URL)

This makes network switching a navigation event rather than a state change, eliminating race conditions.

## Requirements

1. **1:1 Functionality Preservation**: The following pages need to be migrated with identical functionality:
   - `api-methods/trace` → `/{network}/alkanes/api-methods/trace`
   - `api-methods/simulate` → `/{network}/alkanes/api-methods/simulate`
   - `explorer/alkanesTokens` → `/{network}/alkanes/tokens`
   - `explorer/alkanesBalance` → `/{network}/alkanes/balance`
   - `explorer/alkanesTemplates` → `/{network}/alkanes/templates`

2. **Code Reuse Across Networks**: We need a solution that avoids duplicating components for different networks. For example, the code for `/oylnet/alkanes/tokens` should be the same as `/mainnet/alkanes/tokens`.

3. **Backward Compatibility**: We need to maintain existing routes during transition.

4. **Request Cancellation**: All API requests should be cancellable when switching networks.

## Reference Documents

I've prepared several documents to guide the implementation:
- `docs/feature-request-network-pages.md`: Detailed requirements 
- `docs/implementation-plan-network-pages-updated.md`: Technical implementation plan with code examples
- `docs/implementation-guide-for-developers.md`: Step-by-step guide for implementation

## Key Components to Create

1. `NetworkProvider`: A component that wraps network-specific routes and provides network context from URL
2. `NetworkNav`: A navigation component that replaces EndpointToggle with links
3. Dynamic route generation system: To avoid repetitive route definitions
4. SDK enhancements: Update API methods to support AbortController

## Expected Outcome

A working implementation where:
1. All specified pages function identically in both URL patterns
2. Network switching no longer causes race conditions
3. Components are reused across networks without duplication
4. URLs accurately reflect application state

Focus on understanding the current architecture first, then implement the new structure incrementally while maintaining functionality.