import React, { useState } from 'react';
import APIForm from '../shared/APIForm';
import { traceTransaction } from '../../sdk';

/**
 * TraceForm Component
 * 
 * Form specific to the trace API method.
 * Gets a detailed execution trace of a transaction.
 * 
 * @param {Object} props
 * @param {string} props.endpoint - Current endpoint (local, production, oylnet)
 */
const TraceForm = ({ endpoint = 'local' }) => {
  // Define method details
  const methodDetails = {
    'Method Type': 'Alkanes View Function',
    'JSON-RPC Method': 'metashrew_view',
    'View Function': 'trace'
  };

  // Define parameters for the form
  const parameters = [
    {
      name: 'txid',
      label: 'Transaction ID',
      placeholder: 'e.g. 3a7e83462a4a94c9fc3d6b46dc6eba39c3d05cb16d2ce4f1670cdf02201',
      description: 'The transaction ID to trace',
      required: true
    },
    {
      name: 'blockHeight',
      label: 'Block Height',
      placeholder: 'e.g. 887845 or 0x00076FE0',
      description: 'Block height where the transaction was confirmed',
      required: true
    },
    {
      name: 'vout',
      label: 'Output Index',
      placeholder: 'e.g. 0',
      description: 'The output index (vout) to trace (default: 0)',
      required: false
    }
  ];

  // Handle form submission
  const handleSubmit = async (values) => {
    const { txid, blockHeight, vout = 0 } = values;
    
    // Convert blockHeight to number if provided as hex
    const parsedBlockHeight = blockHeight.startsWith('0x') 
      ? parseInt(blockHeight, 16) 
      : parseInt(blockHeight, 10);
    
    // Call the SDK function
    return await traceTransaction(
      txid, 
      parsedBlockHeight, 
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
    />
  );
};

export default TraceForm;