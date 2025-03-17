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
const TraceForm = ({ endpoint = 'mainnet' }) => {
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
      placeholder: 'dfc2b297c1f6341365d6a66af3563a9c72644d8b27e7abff54a39b5457acc4ca',
      description: () => (
        <span>
          The transaction ID to trace. View example transaction on <a
            href="https://mempool.space/tx/dfc2b297c1f6341365d6a66af3563a9c72644d8b27e7abff54a39b5457acc4ca"
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
  "params": ["trace", "dfc2b297c1f6341365d6a66af3563a9c72644d8b27e7abff54a39b5457acc4ca", 4],
  "id": 1,
  "jsonrpc": "2.0"
}`,
        response: `{
  "status": "success",
  "message": "Trace completed",
  "txid": "dfc2b297c1f6341365d6a66af3563a9c72644d8b27e7abff54a39b5457acc4ca",
  "result": [
    {
      "event": "create",
      "data": {
        "block": "0x2",
        "tx": "0xc"
      }
    },
    {
      "event": "invoke",
      "data": {
        "type": "call",
        "context": {
          "myself": {
            "block": "0x2",
            "tx": "0xc"
          },
          "caller": {
            "block": "0x0",
            "tx": "0x0"
          },
          "inputs": [
            "0x0",
            "0x2386f26fc0ffff",
            "0x1",
            "0x2386f26fc0ffff",
            "0x454e494c4f534147",
            "0x4c455546",
            "0x0",
            "0x0",
            "0x0",
            "0x0",
            "0x0",
            "0x0",
            "0x0",
            "0x0",
            "0x0",
            "0x0",
            "0x0"
          ],
          "incomingAlkanes": [],
          "vout": 4
        },
        "fuel": 9017886
      }
    },
    {
      "event": "return",
      "data": {
        "status": "success",
        "response": {
          "alkanes": [
            {
              "id": {
                "block": "0x2",
                "tx": "0xc"
              },
              "value": "0x2386f26fc0ffff"
            }
          ],
          "data": "0x",
          "storage": [
            {
              "key": "/symbol",
              "value": "0x4655454c"
            },
            {
              "key": "/cap",
              "value": "0xffffc06ff28623000000000000000000"
            },
            {
              "key": "/name",
              "value": "0x4741534f4c494e45"
            },
            {
              "key": "/76616c75652d7065722d6d696e74",
              "value": "0x01000000000000000000000000000000"
            },
            {
              "key": "/totalsupply",
              "value": "0xffffc06ff28623000000000000000000"
            },
            {
              "key": "/data",
              "value": "0x"
            }
          ]
        }
      }
    }
  ]
}`,
        curl: `curl -X POST -H "Content-Type: application/json" -H "Accept: application/json" --data '{"method":"metashrew_view","params":["trace","dfc2b297c1f6341365d6a66af3563a9c72644d8b27e7abff54a39b5457acc4ca",4],"id":1,"jsonrpc":"2.0"}' https://mainnet.sandshrew.io`
      }}
      notes="Ensure txid and vout correspond to a valid transaction on the current network. You can view transactions on mempool.space to verify their existence. The trace method provides detailed execution information that can be used for debugging smart contracts."
    />
  );
};

export default TraceForm;