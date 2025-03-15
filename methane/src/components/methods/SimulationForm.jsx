import React, { useState } from 'react';
import { simulateTransaction } from '../../sdk/alkanes';

/**
 * SimulationForm Component
 * 
 * Form for simulating transactions before they are broadcast to the network
 * Allows previewing the outcome of a transaction execution
 */
const SimulationForm = ({ endpoint = 'local' }) => {
  const [txid, setTxid] = useState('');
  const [scriptHex, setScriptHex] = useState('');
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      // Create simulation parameters
      const params = {
        txid: txid,
        script: scriptHex || undefined
      };
      
      // Call the simulation API
      const simulationResult = await simulateTransaction(params, endpoint);
      
      if (simulationResult.status === 'error') {
        throw new Error(simulationResult.message);
      }
      
      setResults(simulationResult);
    } catch (err) {
      console.error('Error simulating transaction:', err);
      setError(err.message || 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="simulation-form">
      <h2>Simulate Transaction</h2>
      <p className="api-description">
        This method simulates the execution of a transaction to preview its outcome without broadcasting it to the network.
      </p>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="txid">Transaction ID:</label>
          <input
            type="text"
            id="txid"
            value={txid}
            onChange={(e) => setTxid(e.target.value)}
            placeholder="Enter transaction ID to simulate"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="scriptHex">Script Hex (Optional):</label>
          <input
            type="text"
            id="scriptHex"
            value={scriptHex}
            onChange={(e) => setScriptHex(e.target.value)}
            placeholder="Optional: Enter script hex to use for simulation"
          />
        </div>
        
        <button type="submit" disabled={isLoading} className="submit-button">
          {isLoading ? 'Simulating...' : 'Simulate Transaction'}
        </button>
      </form>
      
      {error && (
        <div className="error-message">
          <h3>Error</h3>
          <p>{error}</p>
        </div>
      )}
      
      {isLoading && (
        <div className="loading-message">
          <p>Simulating transaction... This may take a moment.</p>
        </div>
      )}
      
      {results && !isLoading && (
        <div className="results-container">
          <h3>Simulation Results</h3>
          
          <div className="result-item">
            <h4>Transaction Status</h4>
            <p className={`status ${results.status}`}>
              {results.status === 'success' ? 'Success' : 'Failed'}
            </p>
          </div>
          
          {results.results && (
            <>
              {results.results.gasUsed && (
                <div className="result-item">
                  <h4>Gas Used</h4>
                  <p>{results.results.gasUsed}</p>
                </div>
              )}
              
              {results.results.value && (
                <div className="result-item">
                  <h4>Return Value</h4>
                  <p>{results.results.value.toString()}</p>
                </div>
              )}
              
              <div className="result-details">
                <h4>Full Results</h4>
                <pre>{JSON.stringify(results.results, null, 2)}</pre>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SimulationForm;
