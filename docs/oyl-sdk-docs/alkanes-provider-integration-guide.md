I'll help you create an integration guide for the RPC calls in your SDK, focusing on Alkanes. Let me first explore the codebase to understand the available RPC calls and their implementations.

Ran tool
I'll help you create an integration guide for the RPC calls in the SDK, focusing on Alkanes. Let me explore the codebase to understand the available RPC operations.

Ran tool
I'll help you create an integration guide for the RPC calls in the SDK, focusing on Alkanes. Let me explore the codebase to understand the available RPC operations and their implementations.

Ran tool
I'll help you create an integration guide for the RPC calls in the SDK, focusing on Alkanes. Let me first explore the relevant parts of the codebase to understand the available RPC operations.

Ran tool
I'll help you create an integration guide for the RPC calls in the SDK, focusing on Alkanes. Let me examine the relevant files to understand the available RPC operations.

Read file: src/alkanes/index.ts
I'll create an integration guide for the RPC calls in the SDK, focusing on Alkanes. Let me examine the implementation details to provide accurate information.

Read file: src/alkanes/alkanes.ts
I'll create an integration guide for the RPC calls in the SDK, focusing on Alkanes. Let me examine more of the codebase to understand the provider implementation and RPC methods.

Read file: src/provider/provider.ts
I'll create an integration guide for the RPC calls in the SDK, focusing on Alkanes. Let me examine the AlkanesRpc implementation to understand the available methods.

Ran tool
I'll create an integration guide for the RPC calls in the SDK, focusing on Alkanes. Let me examine the AlkanesRpc implementation to understand the available methods.

Read file: src/rpclient/alkanes.ts
# Alkanes SDK Integration Guide

This guide provides a comprehensive overview of the RPC operations available in the Oyl SDK, focusing on Alkanes functionality. It covers the key methods, their parameters, and return values to help you integrate the SDK into your React application.

## Getting Started

### Installation

```bash
npm install oyl-sdk
# or
yarn add oyl-sdk
```

### Provider Setup

```javascript
import { Provider } from 'oyl-sdk';
import * as bitcoin from 'bitcoinjs-lib';

const provider = new Provider({
  url: 'https://api.oyl.com',
  projectId: 'your-project-id',
  network: bitcoin.networks.mainnet, // or testnet, regtest, signet
  networkType: 'mainnet', // or 'testnet', 'regtest', 'signet'
  version: 'v1' // optional
});
```

## Alkanes RPC Operations

### 1. Get Alkanes By Address

Retrieves all Alkanes owned by a specific address.

```typescript
// RPC call: "alkanes_protorunesbyaddress"
// Method: provider.alkanes.getAlkanesByAddress

// Parameters
interface GetAlkanesByAddressParams {
  address: string;      // Bitcoin address to query
  protocolTag?: string; // Protocol tag (default: "1")
  name?: string;        // Optional filter by Alkane name
}

// Return Value
interface Outpoint {
  runes: {
    rune: {
      id: { block: string; tx: string };
      name: string;
      spacedName: string;
      divisibility: number;
      spacers: number;
      symbol: string;
    };
    balance: string;
  }[];
  outpoint: { txid: string; vout: number };
  output: { value: string; script: string };
  txindex: number;
  height: number;
}

// Example usage
const alkanes = await provider.alkanes.getAlkanesByAddress({
  address: 'bc1qxyz...',
  protocolTag: '1'
});
```

### 2. Get Alkanes By Height

Retrieves all Alkanes at a specific block height.

```typescript
// RPC call: "alkanes_protorunesbyheight"
// Method: provider.alkanes.getAlkanesByHeight

// Parameters
interface GetAlkanesByHeightParams {
  height: number;       // Block height to query
  protocolTag: string;  // Protocol tag
}

// Return Value
interface AlkanesResponse {
  outpoints: Outpoint[];
  balanceSheet: any[];
}

// Example usage
const alkanes = await provider.alkanes.getAlkanesByHeight({
  height: 800000,
  protocolTag: '1'
});
```

### 3. Get Alkanes By Outpoint

Retrieves Alkanes associated with a specific transaction output.

```typescript
// RPC call: Used internally
// Method: provider.alkanes.getAlkanesByOutpoint

// Parameters
interface GetAlkanesByOutpointParams {
  txid: string;         // Transaction ID
  vout: number;         // Output index
  protocolTag?: string; // Protocol tag (default: "1")
}

// Return Value
// Returns Alkane data associated with the outpoint

// Example usage
const alkanes = await provider.alkanes.getAlkanesByOutpoint({
  txid: '1234abcd...',
  vout: 0,
  protocolTag: '1'
});
```

### 4. Get Alkane By ID

Retrieves detailed information about a specific Alkane by its ID.

```typescript
// RPC call: Used internally
// Method: provider.alkanes.getAlkaneById

// Parameters
interface GetAlkaneByIdParams {
  block: string;  // Block hash or height
  tx: string;     // Transaction ID
}

// Return Value
interface AlkaneToken {
  name: string;
  symbol: string;
  totalSupply: number;
  cap: number;
  minted: number;
  mintActive: boolean;
  percentageMinted: number;
  mintAmount: number;
}

// Example usage
const alkane = await provider.alkanes.getAlkaneById({
  block: '000000...',
  tx: 'abcdef...'
});
```

### 5. Get All Alkanes

Retrieves a list of all Alkanes with pagination support.

```typescript
// RPC call: Used internally
// Method: provider.alkanes.getAlkanes

// Parameters
interface GetAlkanesParams {
  limit: number;   // Number of Alkanes to retrieve
  offset?: number; // Starting offset (default: 0)
}

// Return Value
// Returns an array of AlkaneToken objects

// Example usage
const alkanes = await provider.alkanes.getAlkanes({
  limit: 10,
  offset: 0
});
```

### 6. Simulate Alkane Transaction

Simulates the execution of an Alkane transaction to preview the outcome.

```typescript
// RPC call: Used internally
// Method: provider.alkanes.simulate

// Parameters
interface AlkaneSimulateRequest {
  alkanes: any[];
  transaction: string;
  block: string;
  height: string;
  txindex: number;
  target: {
    block: string;
    tx: string;
  };
  inputs: string[];
  pointer: number;
  refundPointer: number;
  vout: number;
}

// Example usage
const simulationResult = await provider.alkanes.simulate({
  // Simulation parameters
});
```

## Alkane Operations

The SDK also provides higher-level functions for working with Alkanes:

### 1. Find Alkane UTXOs

```typescript
// Method: findAlkaneUtxos from alkanes module

// Parameters
interface FindAlkaneUtxosParams {
  address: string;
  greatestToLeast: boolean;
  provider: Provider;
  alkaneId: { block: string; tx: string };
  targetNumberOfAlkanes: number;
}

// Example usage
import { findAlkaneUtxos } from 'oyl-sdk';

const alkaneUtxos = await findAlkaneUtxos({
  address: 'bc1qxyz...',
  greatestToLeast: true,
  provider: provider,
  alkaneId: { block: '000000...', tx: 'abcdef...' },
  targetNumberOfAlkanes: 5
});
```

### 2. Execute Alkane Transaction

```typescript
// Method: execute from alkanes module

// Parameters
interface ExecuteParams {
  alkaneUtxos?: {
    alkaneUtxos: any[];
    totalSatoshis: number;
  };
  gatheredUtxos: GatheredUtxos;
  account: Account;
  protostone: Buffer;
  provider: Provider;
  feeRate?: number;
  signer: Signer;
}

// Example usage
import { execute } from 'oyl-sdk';

const result = await execute({
  // Transaction parameters
});
```

## Error Handling

The SDK uses custom error types for different failure scenarios:

```typescript
import { OylTransactionError } from 'oyl-sdk';

try {
  const alkanes = await provider.alkanes.getAlkanesByAddress({
    address: 'bc1qxyz...'
  });
} catch (error) {
  if (error instanceof OylTransactionError) {
    console.error('Transaction error:', error.message);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Complete Example

```javascript
import { Provider, Account, Signer } from 'oyl-sdk';
import * as bitcoin from 'bitcoinjs-lib';

// Initialize provider
const provider = new Provider({
  url: 'https://api.oyl.com',
  projectId: 'your-project-id',
  network: bitcoin.networks.mainnet,
  networkType: 'mainnet'
});

// Get Alkanes for an address
async function getAlkanesForAddress(address) {
  try {
    const alkanes = await provider.alkanes.getAlkanesByAddress({
      address: address,
      protocolTag: '1'
    });
    
    console.log(`Found ${alkanes.length} Alkanes for address ${address}`);
    return alkanes;
  } catch (error) {
    console.error('Error fetching Alkanes:', error);
    throw error;
  }
}


This integration guide covers the main RPC operations available in the Oyl SDK for working with Alkanes. For more advanced usage, refer to the full SDK documentation.
