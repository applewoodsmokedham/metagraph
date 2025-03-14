# Alkanes Explorer Project Brief - Revised

## Project Overview

This project aims to develop a high-performance web-based explorer for the Alkanes protocol on Bitcoin. The explorer will directly integrate with the alkanes-rs indexer to provide comprehensive data about tokens, contracts, transactions, and addresses in the Alkanes ecosystem.

## Technical Architecture

- **Frontend**: Next.js with TypeScript and Tailwind CSS
- **Backend API**: Node.js service with GraphQL
- **Data Source**: Direct connection to the alkanes-rs indexer database
- **Caching**: Redis for performance optimization
- **Deployment**: Docker containers for consistent environments

## Core Features

### 1. Home Dashboard
- Network statistics and health indicators
- Latest blocks and transactions
- Featured tokens and recent activity
- Search functionality across all entity types

### 2. Token Explorer
- Comprehensive list of all Alkanes tokens
- Advanced filtering and sorting capabilities
- Detailed token pages with supply metrics and transaction history

### 3. Address Viewer
- Complete token holdings for any address
- Transaction history with filtering
- Contract interactions and deployments

### 4. Transaction Inspector
- Detailed transaction information with execution traces
- Input/output visualization
- Token transfers and state changes

### 5. Contract Explorer
- Deployed contract listings
- Interaction history and patterns
- Associated tokens and metrics

## Development Phases

### Phase 1: Indexer Integration (Weeks 1-2)
- Establish connection to alkanes-rs database
- Implement adapters for indexer view functions
- Create data transformation layer
- Build GraphQL API schema and resolvers

### Phase 2: Core Explorer Features (Weeks 3-5)
- Develop main UI pages and navigation
- Implement entity viewers (token, address, transaction, contract)
- Create search functionality

### Phase 3: Enhancement and Optimization (Weeks 6-8)
- Implement caching strategy
- Add advanced filtering tools
- Optimize for large data sets

## Alkanes-rs View Functions to Integrate

Based on the alkanes-rs codebase, these are the key functions to integrate:

1. **Core Data Views**
   - `simulate`: For Alkanes contract simulation
   - `trace`: For detailed transaction execution traces
   - `alkane_inventory`: For token holdings data

2. **Additional Data Access**
   - `protorunesbyaddress`: For address data in the Alkanes protocol
   - `protorunesbyoutpoint`: For UTXO data in the Alkanes context
   - `protorunesbyheight`: For block-level token data
   - `spendablesbyaddress`: For spendable outputs by address

3. **Support Functions**
   - `call_view`: For accessing view functions of Alkanes contracts
   - `simulate_safe`: For safe simulation of Alkanes transactions

## Integration Notes

When integrating with alkanes-rs, it's important to verify:

1. That the functions are indeed Alkanes-specific, not generic Protorunes views
2. The correct data formats and transformations for each view
3. Proper error handling for all indexer interactions

The explorer should interact with the actual Alkanes database tables and utilize the Alkanes-specific views in the indexer, rather than relying on any Protorunes compatibility layer.

## Key Technical Considerations

1. **Direct Indexer Access**
   - Familiarize with the alkanes-rs database schema
   - Use appropriate connection methods for the database type
   - Consider read replicas for high traffic

2. **Real-time Updates**
   - Implement a strategy for new block notifications
   - Design efficient cache invalidation

3. **Data Visualization**
   - Create intuitive visualizations for complex contract traces
   - Design token flow diagrams for transactions
   - Build interactive address relationship views

## Success Criteria

1. **Performance**: Fast loading times with large datasets
2. **Completeness**: Full visibility into the Alkanes ecosystem
3. **Usability**: Intuitive navigation and clear data presentations
4. **Accuracy**: Correct representation of on-chain data

This project will provide a valuable tool for developers, users, and analysts to explore and understand the Alkanes protocol on Bitcoin.