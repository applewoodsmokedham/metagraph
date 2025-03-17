import React from 'react';
import { Link } from 'react-router-dom';
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
    'Required Parameters': 'txid (transaction ID), vout (output index)'
  };

  // Define parameters for the form
  const parameters = [
    {
      name: 'txid',
      label: 'Transaction ID',
      placeholder: 'bc1p2cyx5e2hgh53wxrkcvn85akge9gyvsvw7cxvhmf0h4xswd8gqtf2d5dkkn',
      description: 'The transaction ID to trace',
      required: true
    },
    {
      name: 'vout',
      label: 'Output Index',
      placeholder: '4',
      description: () => (
        <span>
          The output index (vout) to trace. For protostones, vout indexing begins at tx.output.length + 1. Protostones are laid out in the "<Link to="/docs/shadow-vout" style={{color: '#0000FF', textDecoration: 'none'}}>shadow vout</Link>" range, which virtualizes outputs that do not exist due to Bitcoin consensus rules. These shadow vouts are not physical UTXOs but are indexed as if they were additional OP_RETURN outputs, allowing the protostone[] array on the Runestone to be logically packed onto a single OP_RETURN.
        </span>
      ),
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
  "params": ["trace", "bc1p2cyx5e2hgh53wxrkcvn85akge9gyvsvw7cxvhmf0h4xswd8gqtf2d5dkkn", 4],
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
      {
        "pc": 1,
        "op": "OP_PUSHDATA",
        "data": "0x21023acebb3dca7b13a5100dbe1dce60ea2596c6a8d552d30713da05f5b9cdf8116d",
        "stack": ["OP_0"]
      },
      {
        "pc": 37,
        "op": "OP_CHECKSIG",
        "stack": ["OP_0", "0x21023acebb3dca7b13a5100dbe1dce60ea2596c6a8d552d30713da05f5b9cdf8116d"]
      }
      // Additional steps would be here
    ]
  },
  "id": 1,
  "jsonrpc": "2.0"
}`,
        curl: `curl -X POST --data '{"method":"metashrew_view","params":["trace","bc1p2cyx5e2hgh53wxrkcvn85akge9gyvsvw7cxvhmf0h4xswd8gqtf2d5dkkn",4],"id":1,"jsonrpc":"2.0"}' https://mainnet.sandshrew.io`
      }}
      notes="Ensure txid and vout correspond to a valid transaction on the current network. The trace method provides detailed execution information that can be used for debugging smart contracts."
    />
  );
};

export default TraceForm;