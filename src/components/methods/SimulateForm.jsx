import React, { useState, useEffect } from 'react';
import { performAlkanesSimulation, getAllAlkanes } from '../../sdk/alkanes';
import TerminalCodeBlock from '../shared/TerminalCodeBlock';

/**
 * SimulateForm Component
 *
 * Enhanced form for simulating Alkanes operations with a user-friendly interface
 * Allows users to select operation types, select an Alkanes ID,
 * and define operation parameters to simulate
 */
const SimulateForm = ({ endpoint = 'regtest' }) => {
  // Core parameters state
  const [selectedAlkanes, setSelectedAlkanes] = useState({ block: '', tx: '' });
  const [operation, setOperation] = useState('');
  
  // Advanced options state
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [advancedOptions, setAdvancedOptions] = useState({
    transaction: '0x',
    block: '0x',
    height: '20000',
    txindex: 0,
    inputs: ['101'],
    pointer: 0,
    refundPointer: 0,
    vout: 0,
    alkanes: []
  });
  
  // Alkanes list state
  const [availableAlkanes, setAvailableAlkanes] = useState([]);
  const [isLoadingAlkanes, setIsLoadingAlkanes] = useState(false);
  const [alkanesError, setAlkanesError] = useState(null);
  
  // Form state
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Fetch available Alkanes on component mount
  useEffect(() => {
    fetchAvailableAlkanes();
  }, [endpoint]);
  
  // Function to fetch available Alkanes
  const fetchAvailableAlkanes = async () => {
    setIsLoadingAlkanes(true);
    setAlkanesError(null);
    
    try {
      const result = await getAllAlkanes(20, 0, endpoint);
      
      if (result.status === 'error') {
        throw new Error(result.message);
      }
      
      setAvailableAlkanes(result.tokens || []);
    } catch (err) {
      console.error('Error fetching Alkanes:', err);
      setAlkanesError(err.message || 'Failed to load Alkanes');
    } finally {
      setIsLoadingAlkanes(false);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResults(null);
    
    try {
      // Validate required fields
      if (!selectedAlkanes.block || !selectedAlkanes.tx || !operation) {
        throw new Error('Please fill in all required fields');
      }
      
      // Construct simulation request
      const simulationRequest = {
        target: {
          block: selectedAlkanes.block,
          tx: selectedAlkanes.tx
        },
        inputs: [operation],
        transaction: advancedOptions.transaction,
        block: advancedOptions.block,
        height: advancedOptions.height,
        txindex: parseInt(advancedOptions.txindex, 10),
        pointer: parseInt(advancedOptions.pointer, 10),
        refundPointer: parseInt(advancedOptions.refundPointer, 10),
        vout: parseInt(advancedOptions.vout, 10),
        alkanes: advancedOptions.alkanes
      };
      
      // Call the simulation API
      const simulationResult = await performAlkanesSimulation(simulationRequest, endpoint);
      
      if (simulationResult.status === 'error') {
        throw new Error(simulationResult.message || 'Simulation failed');
      }
      
      setResults(simulationResult);
    } catch (err) {
      console.error('Error simulating operation:', err);
      setError(err.message || 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle advanced options change
  const handleAdvancedOptionChange = (option, value) => {
    setAdvancedOptions(prev => ({
      ...prev,
      [option]: value
    }));
  };
  
  // Handle Alkanes selection
  const handleAlkanesSelection = (e) => {
    const selectedValue = e.target.value;
    if (selectedValue) {
      const [block, tx] = selectedValue.split(':');
      setSelectedAlkanes({ block, tx });
    } else {
      setSelectedAlkanes({ block: '', tx: '' });
    }
  };

  return (
    <div className="simulation-form">
      <h2>Simulate Alkanes Operation</h2>
      <p className="api-description">
        This method simulates the execution of Alkanes operations to preview outcomes without broadcasting to the network.
      </p>
      
      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>Core Parameters</h3>
          
          <div className="form-group">
            <label htmlFor="alkanesId">Alkanes ID:</label>
            <select
              id="alkanesId"
              value={selectedAlkanes.block && selectedAlkanes.tx ? `${selectedAlkanes.block}:${selectedAlkanes.tx}` : ''}
              onChange={handleAlkanesSelection}
              disabled={isLoadingAlkanes}
              required
              className="alkanes-dropdown"
            >
              <option value="">Select an Alkanes ID</option>
              {availableAlkanes.map((alkanes, index) => (
                <option
                  key={index}
                  value={`${alkanes.id.block}:${alkanes.id.tx}`}
                >
                  {`${alkanes.id.block}:${alkanes.id.tx} - ${alkanes.name || 'Unnamed'}`}
                </option>
              ))}
            </select>
            {isLoadingAlkanes && <span className="loading-indicator">Loading Alkanes...</span>}
            {alkanesError && <span className="error-text">{alkanesError}</span>}
            <small className="helper-text">Select the Alkanes ID to simulate against</small>
          </div>
          
          <div className="form-group">
            <label htmlFor="operation">Operation:</label>
            <input
              type="text"
              id="operation"
              value={operation}
              onChange={(e) => setOperation(e.target.value)}
              placeholder="Enter operation code to simulate"
              required
            />
            <small className="helper-text">The operation code to execute</small>
          </div>
        </div>
        
        <div className="form-section advanced-options">
          <div
            className="advanced-toggle"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <span>{showAdvanced ? '▼' : '►'} Advanced Options</span>
          </div>
          
          {showAdvanced && (
            <div className="advanced-fields">
              <div className="form-group">
                <label htmlFor="transaction">Transaction Hash:</label>
                <input
                  type="text"
                  id="transaction"
                  value={advancedOptions.transaction}
                  onChange={(e) => handleAdvancedOptionChange('transaction', e.target.value)}
                  placeholder="0x"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="block">Block Hash:</label>
                <input
                  type="text"
                  id="block"
                  value={advancedOptions.block}
                  onChange={(e) => handleAdvancedOptionChange('block', e.target.value)}
                  placeholder="0x"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="height">Block Height:</label>
                <input
                  type="text"
                  id="height"
                  value={advancedOptions.height}
                  onChange={(e) => handleAdvancedOptionChange('height', e.target.value)}
                  placeholder="20000"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="txindex">Transaction Index:</label>
                <input
                  type="number"
                  id="txindex"
                  value={advancedOptions.txindex}
                  onChange={(e) => handleAdvancedOptionChange('txindex', e.target.value)}
                  placeholder="0"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="inputs">Inputs Array:</label>
                <input
                  type="text"
                  id="inputs"
                  value={JSON.stringify(advancedOptions.inputs)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      handleAdvancedOptionChange('inputs', Array.isArray(parsed) ? parsed : [parsed]);
                    } catch (err) {
                      // If not valid JSON, store as string
                      handleAdvancedOptionChange('inputs', [e.target.value]);
                    }
                  }}
                  placeholder='["101"]'
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="pointer">Pointer:</label>
                <input
                  type="number"
                  id="pointer"
                  value={advancedOptions.pointer}
                  onChange={(e) => handleAdvancedOptionChange('pointer', e.target.value)}
                  placeholder="0"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="refundPointer">Refund Pointer:</label>
                <input
                  type="number"
                  id="refundPointer"
                  value={advancedOptions.refundPointer}
                  onChange={(e) => handleAdvancedOptionChange('refundPointer', e.target.value)}
                  placeholder="0"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="vout">Output Index (vout):</label>
                <input
                  type="number"
                  id="vout"
                  value={advancedOptions.vout}
                  onChange={(e) => handleAdvancedOptionChange('vout', e.target.value)}
                  placeholder="0"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="alkanes">Alkanes Array:</label>
                <input
                  type="text"
                  id="alkanes"
                  value={JSON.stringify(advancedOptions.alkanes)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      handleAdvancedOptionChange('alkanes', Array.isArray(parsed) ? parsed : []);
                    } catch (err) {
                      // If not valid JSON, keep previous value
                    }
                  }}
                  placeholder="[]"
                />
              </div>
            </div>
          )}
        </div>
        
        <button type="submit" disabled={isLoading} className="submit-button">
          {isLoading ? 'Simulating...' : 'Simulate Operation'}
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
          <p>Simulating operation... This may take a moment.</p>
        </div>
      )}
      
      {results && !isLoading && (
        <div className="results-container">
          <h3>Simulation Results</h3>
          
          <div className="result-item">
            <h4>Operation Status</h4>
            <p className={`status ${results.status}`}>
              {results.status === 'success' ? 'Success' : 'Failed'}
            </p>
          </div>
          
          <div className="result-details">
            <h4>Full Results</h4>
            <TerminalCodeBlock
              code={JSON.stringify(results.data || results, null, 2)}
              language="json"
              title="Simulation Response"
              showLineNumbers={true}
            />
          </div>
        </div>
      )}
      
      <style jsx>{`
        .simulation-form {
          font-family: 'Roboto Mono', monospace;
          max-width: 800px;
          margin: 0 auto;
        }
        
        .form-section {
          margin-bottom: 20px;
          padding: 15px;
          background-color: white;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
        }
        
        .form-group {
          margin-bottom: 15px;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
        }
        
        .form-group input,
        .form-group select {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-family: 'Roboto Mono', monospace;
          font-size: 14px;
        }
        
        .helper-text {
          display: block;
          font-size: 12px;
          color: #666;
          margin-top: 4px;
        }
        
        .advanced-toggle {
          cursor: pointer;
          padding: 10px 0;
          font-weight: 500;
          user-select: none;
        }
        
        .advanced-toggle:hover {
          color: #0056b3;
        }
        
        .advanced-fields {
          padding-top: 10px;
          border-top: 1px solid #eee;
        }
        
        .submit-button {
          background-color: #0066cc;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
          font-family: 'Roboto Mono', monospace;
          font-size: 14px;
          margin-top: 10px;
        }
        
        .submit-button:hover {
          background-color: #0056b3;
        }
        
        .submit-button:disabled {
          background-color: #cccccc;
          cursor: not-allowed;
        }
        
        .error-message {
          margin-top: 20px;
          padding: 15px;
          background-color: #fff0f0;
          border-left: 4px solid #ff0000;
          color: #c00000;
        }
        
        .loading-message {
          margin-top: 20px;
          padding: 15px;
          background-color: #f0f0ff;
          border-left: 4px solid #0000ff;
          color: #000080;
        }
        
        .results-container {
          margin-top: 30px;
        }
        
        .result-item {
          margin-bottom: 15px;
        }
        
        .status {
          display: inline-block;
          padding: 5px 10px;
          border-radius: 4px;
          font-weight: 500;
        }
        
        .status.success {
          background-color: #e6ffe6;
          color: #006600;
        }
        
        .status.error {
          background-color: #ffe6e6;
          color: #cc0000;
        }
        
        .alkanes-dropdown {
          font-family: 'Roboto Mono', monospace;
        }
        
        .loading-indicator {
          margin-left: 10px;
          font-size: 12px;
          color: #666;
        }
        
        .error-text {
          color: #cc0000;
          font-size: 12px;
          margin-left: 10px;
        }
      `}</style>
    </div>
  );
};

export default SimulateForm;