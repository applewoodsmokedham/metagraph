import React from 'react';
import APIForm from '../shared/APIForm';
import { traceBlock } from '../../sdk';

/**
 * TraceBlockForm Component
 *
 * Form specific to the traceblock API method.
 * Traces all transactions in a block with Alkanes execution.
 *
 * @param {Object} props
 * @param {string} props.endpoint - Current endpoint (regtest, mainnet, oylnet)
 */
const TraceBlockForm = ({ endpoint = 'regtest' }) => {
  // Define method details
  const methodDetails = {
    'Method Type': 'Alkanes View Function',
    'JSON-RPC Method': 'metashrew_view',
    'View Function': 'traceblock'
  };

  // Define parameters for the form
  const parameters = [
    {
      name: 'blockHeight',
      label: 'Block Height',
      placeholder: 'e.g. 887845',
      description: 'The block height to trace all transactions',
      required: true
    }
  ];

  // Handle form submission
  const handleSubmit = async (values) => {
    const { blockHeight } = values;
    
    // Call the SDK function
    return await traceBlock(
      parseInt(blockHeight, 10),
      endpoint
    );
  };

  return (
    <APIForm
      methodName="traceblock"
      methodType="VIEW FUNCTION"
      description="Traces all transactions in a block. Useful for analyzing contract activity within an entire block."
      methodDetails={methodDetails}
      parameters={parameters}
      onSubmit={handleSubmit}
      endpoint={endpoint}
    />
  );
};

export default TraceBlockForm;