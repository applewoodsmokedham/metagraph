# AlkanesRpc Trace Method Integration Guide

## Overview

This guide provides instructions for correctly implementing the `trace` method from the AlkanesRpc class in your React application. The `trace` method allows you to trace the execution of a transaction, showing the execution steps of a smart contract.

## Understanding the AlkanesRpc.trace Method

The `trace` method in the AlkanesRpc class:

- Takes a request object with `{ vout: number; txid: string }`
- Automatically reverses the txid bytes before making the RPC call
- Returns the result directly from the RPC call

## Implementation Steps

### 1. Update the traceTransaction Function

Your current implementation needs to be modified to correctly use the AlkanesRpc.trace method. Here's the corrected implementation:

```javascript
/**
 * Traces a transaction, showing the execution of a smart contract
 * @param {string} txid - Transaction ID to trace
 * @param {number} vout - Output index (default: 0)
 * @param {string} endpoint - API endpoint to use ('regtest', 'mainnet', 'oylnet')
 * @returns {Promise<Object>} - Trace results
 */
export const traceTransaction = async (txid, vout = 0, endpoint = 'regtest') => {
  try {
    const provider = getProvider(endpoint);
    console.log(`Tracing transaction ${txid} with ${endpoint} endpoint`);
    
    // Ensure provider.alkanes exists
    if (!provider.alkanes || typeof provider.alkanes.trace !== 'function') {
      throw new Error('Alkanes trace method not available');
    }
    
    // Use the alkanes.trace method - note that the method will handle txid reversal internally
    const result = await provider.alkanes.trace({ 
      txid, 
      vout 
    });
    
    return {
      status: "success",
      message: "Trace completed",
      txid,
      result: result // Return the full result from the trace method
    };
  } catch (error) {
    console.error('Error tracing transaction:', error);
    return {
      status: "error",
      message: error.message || "Unknown error",
      txid
    };
  }
};
```

### 2. Key Changes to Note

1. **Request Format**: The trace method expects an object with `{ txid, vout }` properties.
2. **TXID Handling**: Do not reverse the txid in your code - the AlkanesRpc class handles this internally.
3. **Response Handling**: Return the full result from the trace method to preserve all data.
4. **Removed blockHeight parameter**: The trace method doesn't require blockHeight as a parameter.

### 3. Example Usage

Here's how to use the updated function in your React components:

```javascript
import { traceTransaction } from './your-api-file';

// In your component
const handleTrace = async () => {
  setLoading(true);
  try {
    const txid = '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
    const vout = 0;
    const endpoint = 'regtest'; // or 'mainnet', 'oylnet'
    
    const traceResult = await traceTransaction(txid, vout, endpoint);
    
    if (traceResult.status === 'success') {
      // Process the trace results
      console.log('Trace results:', traceResult.result);
      setTraceData(traceResult.result);
    } else {
      // Handle error
      console.error('Trace error:', traceResult.message);
      setError(traceResult.message);
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    setError(error.message);
  } finally {
    setLoading(false);
  }
};
```

## Displaying Trace Results

The trace results will contain execution steps and other information about the transaction. You may want to create a component to display this information in a user-friendly way:

```jsx
function TraceResults({ traceData }) {
  if (!traceData) return <div>No trace data available</div>;
  
  return (
    <div className="trace-results">
      <h3>Trace Results</h3>
      
      {traceData.steps && traceData.steps.length > 0 ? (
        <div className="trace-steps">
          <h4>Execution Steps</h4>
          {traceData.steps.map((step, index) => (
            <div key={index} className="trace-step">
              <div>Step {index + 1}</div>
              <pre>{JSON.stringify(step, null, 2)}</pre>
            </div>
          ))}
        </div>
      ) : (
        <div>No execution steps found</div>
      )}
      
      {/* Display other trace information as needed */}
    </div>
  );
}
```

## Troubleshooting

### Common Issues

1. **"Alkanes trace method not available" error**:
   - Ensure the provider is correctly initialized
   - Check that you're using the correct endpoint
   - Verify that the AlkanesRpc class is properly included in your provider

2. **Empty or unexpected results**:
   - Verify the txid is correct and exists on the network
   - Check that the vout parameter is correct
   - Ensure you're using the correct network endpoint

3. **Error handling the response**:
   - The trace method may return different structures based on the transaction
   - Always check for null/undefined before accessing nested properties

## Additional Notes

- The trace method may be resource-intensive for complex transactions
- Consider implementing loading indicators and timeouts for better UX
- For production use, implement proper error handling and retry logic

By following this guide, you should be able to correctly implement and use the AlkanesRpc trace method in your React application.
