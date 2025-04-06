# Implementation Plan: alkanes_protorunesbyoutpoint API Method

## Overview

This document outlines the implementation plan for the `alkanes_protorunesbyoutpoint` JSON-RPC method in the METAGRAPH application. This method retrieves Protorunes by outpoint (txid, vout) at a specific block height.

## Key Requirements

1. Implement a direct fetch method instead of using the SDK
2. Document the function well, making explicit the fact that the txid is reversed
3. Default the protocol ID but make it clear that it can change
4. Ensure the method works across different network providers (oylnet, mainnet, regtest)

## Implementation Details

### 1. SDK Function Implementation

Create a new function in `src/sdk/alkanes.js` that makes a direct fetch request to the API endpoint:

```javascript
/**
 * Gets Protorunes by outpoint at a specific block height using direct JSON-RPC call
 * @param {Object} params - Parameters for the query
 * @param {string} params.txid - Transaction ID (will be reversed for the API call)
 * @param {number} params.vout - Output index
 * @param {string} params.protocolTag - Protocol tag (default: "1")
 * @param {number} height - Block height to query
 * @param {string} endpoint - API endpoint to use ('regtest', 'mainnet', 'oylnet')
 * @returns {Promise<Object>} - Protorunes at the specified outpoint and height
 */
export const getProtorunesByOutpoint = async (params, height, endpoint = 'regtest') => {
  try {
    console.log(`Getting Protorunes by outpoint ${params.txid}:${params.vout} at height ${height} with ${endpoint} endpoint`);
    
    // Validate inputs
    if (!params.txid || typeof params.txid !== 'string') {
      throw new Error('Invalid txid: must be a non-empty string');
    }
    
    if (params.vout === undefined || params.vout === null || isNaN(parseInt(params.vout, 10))) {
      throw new Error('Invalid vout: must be a number');
    }
    
    if (!height || isNaN(parseInt(height, 10))) {
      throw new Error('Invalid height: must be a number');
    }
    
    // Reverse the txid for the API call
    // This converts from the standard display format to the internal byte order
    const reversedTxid = params.txid
      .match(/.{2}/g)
      ?.reverse()
      .join('') || params.txid;
    
    // Determine the API URL based on the endpoint
    const url = endpoint === 'mainnet' ? 'https://mainnet.sandshrew.io/v2/lasereyes' :
                endpoint === 'oylnet' ? 'https://oylnet.oyl.gg/v2/lasereyes' :
                'http://localhost:18888/v1/lasereyes';
    
    // Make the JSON-RPC request
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 0,
        method: 'alkanes_protorunesbyoutpoint',
        params: [
          {
            protocolTag: params.protocolTag || '1',
            txid: reversedTxid,
            vout: parseInt(params.vout, 10)
          },
          parseInt(height, 10)
        ]
      })
    });
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message || 'Error fetching Protorunes by outpoint');
    }
    
    return {
      status: "success",
      message: "Protorunes retrieved",
      outpoint: `${params.txid}:${params.vout}`,
      height,
      protorunes: data.result
    };
  } catch (error) {
    console.error('Error getting Protorunes by outpoint:', error);
    return {
      status: "error",
      message: error.message || "Unknown error",
      outpoint: `${params.txid}:${params.vout}`,
      height
    };
  }
};
```

### 2. Form Component Implementation

Create a new form component in `src/components/methods/ProtorunesByOutpointForm.jsx`:

```jsx
import React from 'react';
import { Link } from 'react-router-dom';
import APIForm from '../shared/APIForm';
import { getProtorunesByOutpoint } from '../../sdk';

/**
 * ProtorunesByOutpointForm Component
 *
 * Form specific to the protorunesByOutpoint API method.
 * Gets Protorunes by outpoint at a specific block height.
 *
 * @param {Object} props
 * @param {string} props.endpoint - Current endpoint (regtest, mainnet, oylnet)
 */
const ProtorunesByOutpointForm = ({ endpoint = 'mainnet' }) => {
  // Define method details
  const methodDetails = {
    'Method Type': 'View Function',
    'JSON-RPC Method': 'alkanes_protorunesbyoutpoint',
    'Required Parameters': 'txid (transaction ID), vout (output index), height (block height)'
  };

  // Define parameters for the form
  const parameters = [
    {
      name: 'txid',
      label: 'Transaction ID',
      placeholder: '64c85a06ca2ac0e2d3bb7dc3f1a69a83c0fb23f11638c45d250633f20bb0dc06',
      description: () => (
        <span>
          The transaction ID to query. <strong>Important:</strong> The txid will be reversed internally when making the API call. The txid you enter should be in the standard display format as seen on block explorers. View example transaction on <a
            href="https://mempool.space/tx/64c85a06ca2ac0e2d3bb7dc3f1a69a83c0fb23f11638c45d250633f20bb0dc06"
            target="_blank"
            rel="noopener noreferrer"
            style={{color: '#0000FF', textDecoration: 'none'}}>
            mempool.space
          </a>
        </span>
      ),
      required: true
    },
    {
      name: 'vout',
      label: 'Output Index',
      placeholder: '0',
      description: () => (
        <span>
          The output index (vout) to query. For protostones, vout indexing begins at tx.output.length + 1. Protostones are laid out in the "<Link to="/docs/shadow-vout" style={{color: '#0000FF', textDecoration: 'none'}}>shadow vout</Link>" range.
        </span>
      ),
      required: true
    },
    {
      name: 'height',
      label: 'Block Height',
      placeholder: '890550',
      description: 'The block height at which to query the outpoint.',
      required: true
    },
    {
      name: 'protocolTag',
      label: 'Protocol Tag',
      placeholder: '1',
      description: 'The protocol tag to use. Defaults to "1" if not specified, but can be changed for different protocols.',
      required: false
    }
  ];

  // Handle form submission
  const handleSubmit = async (values) => {
    const { txid, vout, height, protocolTag = '1' } = values;
    
    // Call the SDK function
    return await getProtorunesByOutpoint(
      {
        txid,
        vout: parseInt(vout, 10),
        protocolTag
      },
      parseInt(height, 10),
      endpoint
    );
  };

  return (
    <APIForm
      methodName="protorunesByOutpoint"
      methodType="VIEW FUNCTION"
      description="Gets Protorunes by outpoint (txid, vout) at a specific block height. This method allows you to query the state of Protorunes at a particular transaction output and block height."
      methodDetails={methodDetails}
      parameters={parameters}
      onSubmit={handleSubmit}
      endpoint={endpoint}
      examples={{
        request: `{
  "id": 0,
  "jsonrpc": "2.0",
  "method": "alkanes_protorunesbyoutpoint",
  "params": [
    {
      "protocolTag": "1",
      "txid": "06dcb00bf23306255dc43816f123fbc0839aa6f1c37dbbd3e2c02aca065ac864",
      "vout": 0
    },
    890550
  ]
}`,
        response: `{
  "status": "success",
  "message": "Protorunes retrieved",
  "outpoint": "64c85a06ca2ac0e2d3bb7dc3f1a69a83c0fb23f11638c45d250633f20bb0dc06:0",
  "height": 890550,
  "protorunes": [
    {
      "id": "example-id",
      "name": "Example Token",
      "symbol": "EXT",
      "balance": "1000000"
    }
  ]
}`,
        curl: `curl -X POST -H "Content-Type: application/json" -d '{
  "id": 0,
  "jsonrpc": "2.0",
  "method": "alkanes_protorunesbyoutpoint",
  "params": [
    {
      "protocolTag": "1",
      "txid": "06dcb00bf23306255dc43816f123fbc0839aa6f1c37dbbd3e2c02aca065ac864",
      "vout": 0
    },
    890550
  ]
}' https://mainnet.sandshrew.io/v2/lasereyes`
      }}
      notes="Note that the txid in the API call is reversed compared to how it appears in block explorers. The implementation handles this reversal internally, so you should enter the txid as it appears in block explorers. The protocol tag defaults to '1' but can be changed for different protocols. Ensure the txid, vout, and height correspond to a valid transaction on the current network."
    />
  );
};

export default ProtorunesByOutpointForm;
```

### 3. Update Routes

Update `src/routes.jsx` to include the new method page:

```jsx
// Add import for the new form component
import ProtorunesByOutpointForm from './components/methods/ProtorunesByOutpointForm';

// Add to the routes array
{
  path: 'api-methods/protorunesbyoutpoint',
  element: <APIMethodPage methodComponent={ProtorunesByOutpointForm} methodName="Protorunes By Outpoint" />
}
```

### 4. Update APIMethodPage

Update the method components map in `src/pages/APIMethodPage.jsx`:

```jsx
// Add import for the new form component
import ProtorunesByOutpointForm from '../components/methods/ProtorunesByOutpointForm';

// Update the methodComponents object
const methodComponents = {
  'trace': TraceForm,
  'simulate': SimulateForm,
  'traceblockstatus': TraceBlockStatusForm,
  'protorunesbyoutpoint': ProtorunesByOutpointForm,
  // Add other methods as they are implemented
};
```

### 5. Update SDK Index

Ensure the new function is exported from the SDK index file:

```jsx
// In src/sdk/index.js
export { 
  // ... other exports
  getProtorunesByOutpoint 
} from './alkanes';
```

## Implementation Considerations

### 1. Txid Reversal

The txid reversal is a critical aspect of this implementation. Bitcoin transaction IDs are typically displayed in a reversed format in block explorers compared to how they are used internally in the Bitcoin protocol. The implementation handles this reversal internally, so users can enter the txid as they see it in block explorers.

The reversal logic is:
```javascript
const reversedTxid = txid
  .match(/.{2}/g)
  ?.reverse()
  .join('') || txid;
```

This splits the txid into pairs of characters (bytes), reverses the order, and joins them back together.

### 2. Error Handling

The implementation includes comprehensive error handling:
- Input validation to ensure txid, vout, and height are valid
- Error handling for API request failures
- Structured error responses with meaningful messages

### 3. Documentation

The form component includes detailed documentation:
- Clear explanation of the txid reversal behavior
- Description of the protocol tag parameter and its default value
- Links to relevant documentation (shadow vout)
- Example request and response

### 4. Network Support

The implementation supports all three network environments:
- Mainnet: https://mainnet.sandshrew.io/v2/lasereyes
- Oylnet: https://oylnet.oyl.gg/v2/lasereyes
- Regtest: http://localhost:18888/v1/lasereyes

## Testing Plan

1. Test with valid inputs on each network environment
2. Test with invalid txid format
3. Test with non-existent txid
4. Test with invalid vout
5. Test with invalid height
6. Test with different protocol tags
7. Verify txid reversal works correctly

## Next Steps

1. Switch to Code mode to implement the changes
2. Test the implementation with real data
3. Update the progress.md file to reflect the completion of this task
4. Consider adding additional validation or features as needed