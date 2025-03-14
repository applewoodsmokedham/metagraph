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
1. Test all API methods with the new endpoint toggle
2. Gather initial feedback from community
3. Plan next phase of development, including GraphQL integration
4. **Implement PRD requirements** for standardized API method pages

### Recent Decisions
- Removed reliance on X-Sandshrew-Project-ID header due to connection issues
- Standardized JSON-RPC request format across all method examples
- Added GitHub CI workflow for automated testing
- Renamed project to METHANE for better project identity
- **Created comprehensive PRD** to guide method page standardization

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
