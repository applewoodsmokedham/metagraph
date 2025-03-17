# METHANE Product Context

## Project Purpose

METHANE (Method Exploration, Testing, and Analysis eNvironment) is an interactive, developer-friendly playground and documentation hub designed specifically to facilitate exploration, testing, and integration of Alkanes metaprotocol and Sandshrew API methods on the Bitcoin blockchain. It serves as a critical tool for Bitcoin developers who need to work with smart contract functionality on Bitcoin.

## Problems Solved

1. **Complexity of Bitcoin Smart Contracts**: Bitcoin smart contracts through Alkanes are powerful but complex to develop and test. METHANE simplifies this process by providing an intuitive interface.

2. **Lack of Interactive Documentation**: Traditional documentation for blockchain APIs is often static and doesn't allow for real-time testing. METHANE provides interactive examples that connect directly to the Bitcoin mainnet.

3. **Environment Switching Challenges**: Developers need to test in both local and production environments. METHANE allows seamless toggling between these environments.

4. **Integration Complexity**: Integrating Alkanes smart contracts into applications is complex. METHANE demonstrates proper integration patterns through its own implementation.

5. **Learning Curve**: The learning curve for Bitcoin protocol development is steep. METHANE provides a structured environment to explore and understand the capabilities of Alkanes and Sandshrew APIs.

6. **Debugging Difficulty**: Debugging smart contract execution on Bitcoin is challenging. METHANE's trace method visualization helps developers understand exactly how their contracts execute.

## User Experience Goals

1. **Intuitive Interface**: Provide a clean, intuitive interface that makes complex blockchain operations accessible.

2. **Real-time Feedback**: Offer immediate visual feedback for API responses and errors.

3. **Comprehensive Documentation**: Include detailed documentation of all API parameters, responses, and use-cases.

4. **Interactive Examples**: Allow developers to execute real API calls directly from the documentation.

5. **Environment Flexibility**: Enable seamless switching between production and local testing environments.

6. **Error Handling**: Provide clear error messages and guidance for troubleshooting.

7. **Performance**: Ensure responsive performance even when interacting with blockchain APIs.

8. **Consistent Design**: Maintain a consistent design language across all pages and components.

9. **Reusable Components**: Use template components to ensure consistency and reduce development time.

## Target Users

1. **Bitcoin Protocol Developers**: Professionals working on Bitcoin protocol improvements and extensions.

2. **Alkanes Smart Contract Developers**: Developers creating and deploying smart contracts on Bitcoin using Alkanes.

3. **Blockchain Integrators**: Developers integrating Bitcoin functionality into applications.

4. **Technical Documentation Specialists**: Professionals creating and maintaining technical documentation for Bitcoin projects.

## User Stories

1. As a Bitcoin developer, I want to explore available Alkanes API methods so that I can understand what functionality is available.

2. As a smart contract developer, I want to test my contract execution with the trace method so that I can debug issues.

3. As an integrator, I want to simulate transactions before sending them so that I can verify they will work as expected.

4. As a documentation specialist, I want to see real examples of API calls and responses so that I can create accurate documentation.

5. As a developer, I want to toggle between production and local environments so that I can test my code in different contexts.

6. As a new Bitcoin developer, I want to understand how Alkanes smart contracts work so that I can start developing my own.

7. As a smart contract developer, I want to see detailed execution traces of my transactions so that I can debug and optimize my code.

8. As a developer, I want a consistent user interface across all method pages so that I can quickly learn how to use new methods.

## Key Features

1. **Endpoint Toggle**: Switch between Production and Local environments with real-time health status indication.

2. **Interactive API Testing**: Forms for entering parameters and executing API calls with immediate visual feedback.

3. **Comprehensive Documentation**: Detailed documentation of all API methods, parameters, and responses.

4. **Block Explorer Integration**: Links to block explorers for additional context on transactions and blocks.

5. **Method Directory**: Categorized listings of available API methods for easy discovery.

6. **Real-time Block Height**: Display of current block height for the selected network.

7. **Error Handling**: Clear error messages and guidance for troubleshooting.

8. **Trace Method Visualization**: Detailed visualization of transaction execution traces for debugging smart contracts.

9. **Template Components**: Reusable components for consistent API method pages.

10. **Example Sections**: Interactive examples with request, response, and cURL tabs for each method.

11. **Notes Sections**: Method-specific notes and guidance for developers.

## Implementation Approach

1. **Component-Based Architecture**: Using React components for modularity and reusability.

2. **Template Pattern**: Using template components for consistent API method pages.

3. **React Router Integration**: Using React Router for client-side routing and context passing.

4. **SDK Abstraction Layer**: Using a custom SDK abstraction layer for interacting with the Oyl SDK.

5. **Error Handling Strategy**: Implementing a comprehensive error handling strategy at multiple levels.

This product context provides the foundation for understanding why METHANE exists, what problems it solves, and how it should work to meet user needs.