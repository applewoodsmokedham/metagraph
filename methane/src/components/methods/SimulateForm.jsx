import React from 'react';
import APIForm from '../shared/APIForm';
import { simulateTransaction } from '../../sdk';

/**
 * SimulateForm Component
 * 
 * Form specific to the simulate API method.
 * Simulates the execution of a transaction to preview the outcome.
 * 
 * @param {Object} props
 * @param {string} props.endpoint - Current endpoint (local, production, oylnet)
 */
const SimulateForm = ({ endpoint = 'local' }) => {
  // Define method details
  const methodDetails = {
    'Method Type': 'Alkanes View Function',
    'JSON-RPC Method': 'metashrew_view',
    'View Function': 'simulate'
  };

  // Define parameters for the form
  const parameters = [
    {
      name: 'txid',
      label: 'Transaction ID',
      placeholder: 'e.g. 3a7e83462a4a94c9fc3d6b46dc6eba39c3d05cb16d2ce4f1670cdf02201',
      description: 'The transaction ID to simulate',
      required: true
    },
    {
      name: 'blockHeight',
      label: 'Block Height',
      placeholder: 'e.g. 887845',
      description: 'Block height for the simulation context',
      required: true
    },
    {
      name: 'vout',
      label: 'Output Index',
      placeholder: 'e.g. 0',
      description: 'The output index (vout) to simulate',
      required: true
    }
  ];

  // Handle form submission
  const handleSubmit = async (values) => {
    const { txid, blockHeight, vout } = values;
    
    // Create simulation parameters
    const simulationParams = {
      txid,
      blockHeight: parseInt(blockHeight, 10),
      vout: parseInt(vout, 10),
      // Additional parameters would be added in a real implementation
    };
    
    // Call the SDK function
    return await simulateTransaction(simulationParams, endpoint);
  };

  return (
    <APIForm
      methodName="simulate"
      methodType="VIEW FUNCTION"
      description="Simulates the execution of a transaction to preview the outcome without actually committing any changes to the blockchain. Useful for testing and verifying contract behavior before broadcasting."
      methodDetails={methodDetails}
      parameters={parameters}
      onSubmit={handleSubmit}
      endpoint={endpoint}
    />
  );
};

export default SimulateForm;