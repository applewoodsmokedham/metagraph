# METHANE Product Context

## Project Purpose

METHANE (Method Exploration, Testing, and Analysis eNvironment) is an interactive, developer-friendly playground and documentation hub designed specifically to facilitate exploration, testing, and integration of Alkanes metaprotocol and Sandshrew API methods on the Bitcoin blockchain. It serves as a critical tool for Bitcoin developers who need to work with smart contract functionality on Bitcoin. With the addition of wallet integration, it now also provides a complete environment for testing real transactions and interacting with the Bitcoin blockchain using actual wallets.

## Problems Solved

1. **Complexity of Bitcoin Smart Contracts**: Bitcoin smart contracts through Alkanes are powerful but complex to develop and test. METHANE simplifies this process by providing an intuitive interface.

2. **Lack of Interactive Documentation**: Traditional documentation for blockchain APIs is often static and doesn't allow for real-time testing. METHANE provides interactive examples that connect directly to the Bitcoin mainnet.

3. **Environment Switching Challenges**: Developers need to test in both local and production environments. METHANE allows seamless toggling between these environments.

4. **Integration Complexity**: Integrating Alkanes smart contracts into applications is complex. METHANE demonstrates proper integration patterns through its own implementation.

5. **Learning Curve**: The learning curve for Bitcoin protocol development is steep. METHANE provides a structured environment to explore and understand the capabilities of Alkanes and Sandshrew APIs.

6. **Debugging Difficulty**: Debugging smart contract execution on Bitcoin is challenging. METHANE's trace method visualization helps developers understand exactly how their contracts execute.

7. **Wallet Integration Complexity**: Integrating Bitcoin wallets into applications is complex and requires understanding of multiple wallet providers. METHANE demonstrates proper wallet integration patterns through its implementation of the LaserEyes package.

8. **Testing with Real Funds**: Developers need to test their applications with real Bitcoin transactions. METHANE's wallet integration allows developers to connect their wallets and test with real funds.

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

10. **Wallet Connectivity**: Provide seamless wallet connection with support for multiple wallet providers.

11. **Real Transaction Testing**: Enable testing with real Bitcoin transactions through connected wallets.

## Target Users

1. **Bitcoin Protocol Developers**: Professionals working on Bitcoin protocol improvements and extensions.

2. **Alkanes Smart Contract Developers**: Developers creating and deploying smart contracts on Bitcoin using Alkanes.

3. **Blockchain Integrators**: Developers integrating Bitcoin functionality into applications.

4. **Technical Documentation Specialists**: Professionals creating and maintaining technical documentation for Bitcoin projects.

5. **Wallet Integration Developers**: Developers working on integrating Bitcoin wallets into their applications.

6. **DApp Developers**: Developers building decentralized applications on Bitcoin.

## User Stories

1. As a Bitcoin developer, I want to explore available Alkanes API methods so that I can understand what functionality is available.

2. As a smart contract developer, I want to test my contract execution with the trace method so that I can debug issues.

3. As an integrator, I want to simulate transactions before sending them so that I can verify they will work as expected.

4. As a documentation specialist, I want to see real examples of API calls and responses so that I can create accurate documentation.

5. As a developer, I want to toggle between production and local environments so that I can test my code in different contexts.

6. As a new Bitcoin developer, I want to understand how Alkanes smart contracts work so that I can start developing my own.

7. As a smart contract developer, I want to see detailed execution traces of my transactions so that I can debug and optimize my code.

8. As a developer, I want a consistent user interface across all method pages so that I can quickly learn how to use new methods.

9. As a DApp developer, I want to connect my Bitcoin wallet so that I can test my application with real transactions.

10. As a wallet integration developer, I want to see examples of proper wallet integration so that I can implement it in my own application.

11. As a Bitcoin developer, I want to interact with multiple wallet providers so that I can ensure my application works with different wallets.

12. As a token holder, I want to view my Alkanes token balances so that I can track my assets.

13. As a developer, I want to see visual representations of Alkanes tokens so that I can better understand their properties.

14. As a token explorer, I want to see token IDs in a readable format so that I can reference them in other applications.

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

12. **Wallet Connection**: Connect to Bitcoin wallets with support for multiple wallet providers.

13. **Multi-Wallet Support**: Integration with various wallet providers (Unisat, Leather, Magic Eden, etc.).

14. **Wallet Selection UI**: User interface for selecting and connecting to different wallet providers.

15. **Network Synchronization**: Synchronization between METHANE network environment and wallet network.

16. **Alkanes Balance Explorer**: Interactive interface for exploring Alkanes token balances by address.

17. **Token Image Display**: Visual representation of Alkanes tokens with images retrieved via simulation.

18. **Token ID Display**: Formatted display of Alkanes token IDs with copy functionality.

## Implementation Approach

1. **Component-Based Architecture**: Using React components for modularity and reusability.

2. **Template Pattern**: Using template components for consistent API method pages.

3. **React Router Integration**: Using React Router for client-side routing and context passing.

4. **SDK Abstraction Layer**: Using a custom SDK abstraction layer for interacting with the Oyl SDK.

5. **Error Handling Strategy**: Implementing a comprehensive error handling strategy at multiple levels.

6. **Wallet Integration**: Using the LaserEyes package for Bitcoin wallet integration.

7. **Client-Side Rendering**: Ensuring wallet functionality is only rendered on the client-side to prevent server-side rendering issues.

8. **Network Mapping**: Using a network mapping utility to align METHANE network environments with LaserEyes network types.

## Value Proposition

METHANE provides a complete environment for Bitcoin developers to:

1. **Explore and Learn**: Discover and understand Alkanes metaprotocol and Sandshrew API methods.

2. **Test and Debug**: Test smart contracts and debug issues with detailed execution traces.

3. **Integrate and Deploy**: Learn proper integration patterns for both API methods and wallet functionality.

4. **Connect and Transact**: Connect to Bitcoin wallets and test with real transactions.

5. **Switch and Compare**: Toggle between different network environments to compare behavior.

By combining API method exploration, smart contract testing, and wallet integration, METHANE offers a comprehensive toolkit for Bitcoin developers that addresses the full development lifecycle from learning and exploration to testing and deployment.

This product context provides the foundation for understanding why METHANE exists, what problems it solves, and how it should work to meet user needs.