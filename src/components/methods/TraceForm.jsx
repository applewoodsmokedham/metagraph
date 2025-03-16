import React from 'react';
import APIForm from '../shared/APIForm';
import { traceTransaction } from '../../sdk';

/**
 * TraceForm Component
 *
 * Form specific to the trace API method.
 * Gets a detailed execution trace of a transaction.
 *
 * @param {Object} props
 * @param {string} props.endpoint - Current endpoint (regtest, mainnet, oylnet)
 */
const TraceForm = ({ endpoint = 'regtest' }) => {
  // Define method details
  const methodDetails = {
    'Method Type': 'View Function',
    'JSON-RPC Method': 'metashrew_view',
    'View Function': 'trace',
    'Required Parameters': 'txid (transaction ID), vout (output index)'
  };

  // Define parameters for the form
  const parameters = [
    {
      name: 'txid',
      label: 'Transaction ID',
      placeholder: 'Enter txid',
      description: 'The transaction ID to trace',
      required: true
    },
    {
      name: 'vout',
      label: 'Output Index',
      placeholder: 'Enter vout',
      description: 'The output index (vout) to trace (default: 0)',
      required: false
    }
  ];

  // Handle form submission
  const handleSubmit = async (values) => {
    const { txid, vout = 0 } = values;
    
    // Call the SDK function
    return await traceTransaction(
      txid,
      parseInt(vout, 10),
      endpoint
    );
  };

  return (
    <APIForm
      methodName="trace"
      methodType="VIEW FUNCTION"
      description="Gets a detailed execution trace of a transaction, showing each step of contract execution including opcodes, stack values, and execution context. Essential for debugging contract behavior."
      methodDetails={methodDetails}
      parameters={parameters}
      onSubmit={handleSubmit}
      endpoint={endpoint}
      examples={{
        request: `{
  "method": "metashrew_view",
  "params": ["trace", "txid", 0],
  "id": 1,
  "jsonrpc": "2.0"
}`,
        response: `{
  "result": {
    "steps": [
      {
        "pc": 0,
        "op": "OP_0",
        "stack": []
      },
      // Additional steps would be here
    ]
  },
  "id": 1,
  "jsonrpc": "2.0"
}`,
        curl: `curl -X POST --data '{"method":"metashrew_view","params":["trace","txid",0],"id":1,"jsonrpc":"2.0"}' http://localhost:5173`
      }}
      notes="Ensure txid and vout correspond to a valid transaction on the current network. The trace method provides detailed execution information that can be used for debugging smart contracts."
    />
  );
};

export default TraceForm;