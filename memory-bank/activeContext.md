# Active Context - March 14, 2025

## Current Status: Open Source Release Complete

### Project Renaming
- The project has been renamed from "runestone-visualizer" to "METHANE" (Method Exploration, Testing, and Analysis eNvironment)
- All references to the old name have been updated in code and documentation
- This change better reflects the project's purpose and scope

### Open Source Preparation (Completed)
- The project has been published to GitHub: https://github.com/JinMaa/METHANE
- Version 1.0.0 has been tagged and released
- All documentation and templates have been standardized

### Core Focus Areas
1. **API Method Testing Interface**
   - All Metashrew API methods documented with test interfaces
   - Endpoint toggle component implemented for switching between local and production
   - Status display for monitoring connection health

2. **Documentation**
   - Comprehensive guides for contributors, users, and developers
   - Troubleshooting and quickstart guides complete
   - Security policy established
   - **Product Requirements Document (PRD)** created for standardizing API method pages

3. **CI/CD Pipeline**
   - GitHub Actions workflow created for automated testing
   - Issue and PR templates implemented for standardized contributions

### Current Priorities
1. **Standardizing API Method Pages (Phase 1 - In Progress)**
   - Creating a unified template for all API method pages
   - Implementing endpoint toggle functionality on all pages
   - Adding status indicators for API connections
   - **Latest Update (March 14)**: Added downloadable test scripts to each API method page with implementation examples
   - Creating shell scripts for testing all API methods directly from the command line
   - Updated PRD to require test scripts with each API method page

2. **Implementation of Experimental Features (Phase 2 - Upcoming)**
   - Designing chain of events visualization page
   - Developing transaction detail views
   - Preparing for implementation of block visualization tools

3. **Documentation Improvements**
   - Updating guides with more comprehensive examples
   - Including the latest API method changes
   - Adding troubleshooting guides for common issues

### Recent Decisions
- Removed reliance on X-Sandshrew-Project-ID header due to connection issues
- Standardized JSON-RPC request format across all method examples
- Added GitHub CI workflow for automated testing
- Renamed project to METHANE for better project identity
- **Created comprehensive PRD** to guide method page standardization

### Recent Changes and Decisions
1. **Test Script Implementation**
   - Created template-based approach for standardized API testing
   - All API method pages will include downloadable .sh scripts
   - Scripts support both local and production endpoints with proper parameter handling
   - Scripts follow consistent error handling and output format

2. **Endpoint Toggle Implementation**
   - Production endpoint: https://mainnet.sandshrew.io/v2/lasereyes
   - Local endpoint: http://localhost:8080
   - Visual indicators for connection status
   - Real-time height information from both endpoints

3. **API Correctness**
   - Following the exact JSON-RPC protocol required by Metashrew
   - Proper field ordering: method, params, id, jsonrpc
   - Using fixed IDs instead of timestamps
   - Only including Content-Type: application/json header

### Blockers and Known Issues
1. **API Connectivity**
   - Some API methods may temporarily return errors from the Metashrew API
   - Test scripts still function correctly, showing the error handling capabilities

2. **Protobuf Encoding**
   - Complex encoding requirements for some methods
   - Current implementation is a simplified version for demonstration
   - Will need more robust encoding for production use

### Next Actions
1. Create test scripts for remaining API methods
2. Update all existing API method pages to use the new standardized template
3. Test the API connectivity with different parameters and endpoints
4. Prepare for Phase 2 implementation of experimental features

### Next Steps
Our focus is now on preparing for the next phase of development:

1. **API Method Testing**
   - Test all API method pages with both local and production endpoints
   - Verify the endpoint toggle works correctly across all pages
   - Ensure all curl examples follow best practices
   - **Implement standardized components** as defined in the PRD

2. **Community Engagement**
   - Create discussion forums or Discord channel
   - Set up issue templates
   - Prepare initial release announcement

3. **Repository Maintenance**
   - Set up GitHub repository with appropriate template files
   - Configure GitHub Actions for CI/CD
   - Set up repository protection rules

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

This document will be continuously updated as we progress toward the next phase of development.
