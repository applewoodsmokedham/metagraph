# Active Context

## Current Work Focus
As of March 14, 2025, we've completed significant improvements to prepare the Alkanes Explorer project for open-sourcing. We've standardized the API method documentation, implemented comprehensive project documentation, and addressed security considerations throughout the codebase.

## Recent Changes
- Fixed the block height display issue in the Alkanes Explorer
- Enhanced error handling in the API client to manage timeouts and retries more effectively
- Improved the endpoint toggle component to properly update when switching between LOCAL and PRODUCTION
- Cleaned up test files to remove `X-Sandshrew-Project-ID` headers for better API compatibility
- Enhanced documentation format for API methods to follow the standardized format
- Created a comprehensive memory bank for the runestone-visualizer project
- Created project brief document outlining the Alkanes Explorer requirements
- Established memory bank structure for maintaining project documentation
- Created a standardized template for API method pages with endpoint toggle and status display
- Added documentation for best practices when working with the Metashrew API
- Implemented open-source project essentials:
  - MIT LICENSE file
  - Comprehensive CONTRIBUTING.md guide
  - SECURITY.md policy document
  - Troubleshooting guide
  - Developer quickstart guide
  - Updated package.json with proper metadata
  - Improved .EXAMPLE.env with detailed comments

## Next Steps
Our focus is now on preparing for the official open-source release:

1. **Final Testing**
   - Test all API method pages with both local and production endpoints
   - Verify the endpoint toggle works correctly across all pages
   - Ensure all curl examples follow best practices

2. **Documentation Review**
   - Perform a final review of all documentation for accuracy
   - Verify links between documentation files work correctly
   - Ensure all memory bank files are up-to-date with latest information

3. **Repository Preparation**
   - Set up GitHub repository with appropriate template files
   - Configure GitHub Actions for CI/CD
   - Set up repository protection rules

4. **Community Preparation**
   - Create discussion forums or Discord channel
   - Set up issue templates
   - Prepare initial release announcement

## Open Source Preparation Status

| Component | Status | Notes |
|-----------|--------|-------|
| Core API Functionality | Complete | Fixed issues with Metashrew API connection |
| Endpoint Toggle | Complete | Fully functional in trace-method.html |
| API Method Template | Complete | Created standardized template for all methods |
| LICENSE | Complete | MIT license added |
| CONTRIBUTING.md | Complete | Comprehensive contribution guidelines |
| SECURITY.md | Complete | Security policy and disclosure process |
| Documentation | Complete | API docs, troubleshooting, quickstart guides |
| Package.json | Complete | Updated metadata, scripts, dependencies |
| Environment Config | Complete | Updated .EXAMPLE.env with best practices |

## Active Decisions and Considerations

### API Integration Strategy
We've standardized on the following API integration pattern:

1. **Request Format**
   - Follow exact field order: `method`, `params`, `id`, `jsonrpc`
   - Use simple numerical IDs (0, 1) instead of timestamps
   - Only include `Content-Type: application/json` header
   - DO NOT include `X-Sandshrew-Project-ID` header

2. **Endpoint Management**
   - Use the toggle component to easily switch between local and production
   - Default to `https://mainnet.sandshrew.io/v2/lasereyes` for production
   - Display status indicator to show endpoint connectivity

3. **Error Handling**
   - Implement proper error catching for all API calls
   - Add fallbacks when primary API methods fail
   - Parse string responses with `parseInt()` when needed

### Documentation Standards
All API method pages now follow a standardized format:

1. **Comprehensive Method Details**
   - Clear method description and purpose
   - Parameter requirements and types
   - Return value documentation
   - Example requests and responses

2. **Interactive Components**
   - Endpoint toggle for switching between environments
   - Status display showing current endpoint connectivity
   - Form for testing the API method with real parameters
   - Results display showing formatted API responses

3. **Code Examples**
   - JSON-RPC request format
   - Example response
   - Curl command following best practices

### Security Focus
We've implemented several security best practices:

1. **No Sensitive Data in Code**
   - Environment variables for all configuration
   - No hardcoded API keys or credentials
   - Security policy document for vulnerability reporting

2. **API Request Security**
   - Server-side proxy for API requests
   - Proper error handling and validation
   - CORS configuration for secure client-server communication

3. **Documentation**
   - Clear security guidelines in SECURITY.md
   - Best practices documented in memory bank
   - Troubleshooting guide for common issues

## Tools and Resources

- **Documentation**: memory-bank/ directory and docs/ folder
- **API Templates**: src/public/api-methods/template.html
- **Core Scripts**: src/public/js/api-client.js, endpoint-toggle.js
- **Example Config**: .EXAMPLE.env

This document will be continuously updated as we progress toward the official open-source release.
