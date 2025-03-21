# METAGRAPH Product Requirements Document (PRD)

## 1. Project Overview

**METAGRAPH** (Method Exploration, Tool And Graph Renderer for Alkanes Protocol Handling) is an interactive, developer-friendly playground and documentation hub designed specifically to facilitate exploration, testing, and integration of Alkanes metaprotocol and Sandshrew API methods on the Bitcoin blockchain. It leverages the Oyl SDK for business logic and interaction with Bitcoin.

## 2. Project Goals

- Provide an intuitive and robust interface to explore and test Sandshrew and Alkanes RPC API methods.
- Enable rapid development and integration of Alkanes smart contracts on Bitcoin using the Oyl SDK.
- Offer interactive, real-world API call capabilities directly to the Bitcoin mainnet.
- Allow seamless toggling between Production and Local testing environments.
- Ensure detailed, accurate, and actionable documentation for developers.

## 3. Target Users

- Bitcoin protocol developers
- Alkanes smart contract developers
- Blockchain integrators
- Technical documentation specialists

## 4. Site Structure and Navigation

- **Homepage**
  - Endpoint toggle (Production/Local)
  - API directory access
  - Quick links to core functionality

- **API Directory**
  - Categorized API method listings
  - Core Alkanes, Protorunes, Runes, JSON-RPC, Indexer, API Utilities

- **Method Pages**
  - Method descriptions, parameters, interactive forms
  - Interactive examples connecting to Bitcoin mainnet

## 5. Key Features

### 5.1 Endpoint Toggle
- Persistent toggle between Production and Local.
- Real-time endpoint health indicator.

### 5.2 Interactive API Testing
- Forms for entering parameters and executing API calls.
- Immediate visual feedback for API responses and errors.
- Fully interactive Bitcoin mainnet API examples.

### 5.3 Documentation and Examples
- Comprehensive documentation of all API parameters, responses, and use-cases.
- Interactive examples provided through Oyl SDK integration.
- Block explorer integration for additional context.

## 6. Technology Stack

### 6.1 Frontend
- React.js (primary frontend technology)
- Minimal external dependencies
- Semantic React components for clarity and maintainability

### 6.2 Backend/Business Logic
- **Oyl SDK** (TypeScript-based)
  - Account management
  - Transaction signing
  - Provider abstraction with built-in support for Sandshrew RPC endpoints (Production and Local)
  - Protocol support (Alkanes, Runes, BRC20)
  - Includes full schema of Sandshrew RPC API endpoints

## 7. Implementation Workflow

### Phase 1: Environment Setup
- Initialize React project structure.
- Integrate Oyl SDK.
- Configure Oyl SDK Provider parameters (Production and Local environments).

### Phase 2: Endpoint Toggle & Status Check
- Implement and validate endpoint toggling using Oyl SDK.
- Implement endpoint status health-check.

### Phase 3: Core Page Templates
- Create reusable React components (Header, Endpoint Toggle, API Method Documentation, Interactive Forms).
- Develop method-specific template pages.

### Phase 4: Interactive API Testing Forms
- Implement React forms using Oyl SDK for API integration.
- Ensure robust error handling and validation.

### Phase 5: Interactive Mainnet Integration
- Enable interactive calls to Bitcoin mainnet via forms using Oyl SDK.
- Validate real-world data in interactive examples.

### Phase 6: Documentation and Contextual Integration
- Populate method pages with comprehensive API documentation.
- Integrate block explorer links and contextual data.

### Phase 7: Comprehensive Testing and Review
- Test all functionality across Production and Local environments.
- Finalize documentation and ensure usability.

## 8. Method Implementation Matrix

| Method | Template | Interactive Form | Interactive Mainnet Examples | Status |
| ------ | -------- | ---------------- | ---------------------------- | ------ |
| trace  | ✅       | ✅                | ✅                            | To Implement |
| simulate | ✅     | ✅                | ✅                            | To Implement |
| traceblock | ✅   | ✅                | ✅                            | To Implement |
| protorunesbyaddress | ✅ | ✅          | ✅                            | To implement |
| protorunesbyoutpoint | ✅ | ✅         | ✅                            | To Implement |
| protorunesbyheight | ✅ | ✅           | ✅                            | To Implement |
| spendablesbyaddress | ✅ | ✅          | ✅                            | To Implement |
| btc-getblockcount | ✅ | ✅            | ✅                            | To implement |

## 9. Design Principles

- Clean, intuitive UI/UX.
- Mobile responsive and accessible.
- Clear code formatting and syntax highlighting.


### React Component Templates
- Reusable React component templates/snippets:
  - Endpoint toggle
  - Interactive forms
  - Status indicators
  - Method documentation structures

This PRD serves as a comprehensive foundation for the implementation and deployment of the METAGRAPH playground, ensuring consistency, quality, and maintainability throughout the development lifecycle.