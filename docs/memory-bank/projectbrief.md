# Alkanes Explorer Project Brief

## Core Purpose
Alkanes Explorer is a visualization and exploration tool for the Metashrew API and Alkanes smart contract system on Bitcoin. It provides a user-friendly interface to interact with blockchain data, smart contracts, and transaction traces from the Bitcoin blockchain.

## Core Requirements
1. **API Integration**: Connect to the Metashrew API without using any Sandshrew Project ID
2. **Visualization**: Render transaction traces, blocks, and smart contract data
3. **Explorer Interface**: Provide navigation for blocks, transactions, and smart contracts
4. **Error Handling**: Properly display API errors and sync status information

## Key Goals
- Enable developers to explore and debug Alkanes smart contracts
- Provide a clean, minimalist interface for blockchain data
- Support transaction tracing and simulation
- Maintain real-time connection status with the Metashrew API

## Technical Constraints
- No Sandshrew Project ID should be used in any part of the application
- Must work with the Metashrew API endpoint: https://mainnet.sandshrew.io/v2/lasereyes
- Follow strict JSON-RPC 2.0 formatting standards for all API calls

## Project Scope
The application should include:
1. API status dashboard with sync information
2. Block explorer interface
3. Transaction search functionality
4. Transaction tracer for debugging and analysis
5. Dedicated pages for all supported Metashrew API methods

This project serves as a reference implementation for interacting with the Metashrew API and Alkanes system, following best practices for security, performance, and user experience.
