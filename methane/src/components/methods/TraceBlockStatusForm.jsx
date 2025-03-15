import React, { useState } from 'react';
import { traceBlock, traceTransaction } from '../../sdk/alkanes';

/**
 * TraceBlockStatusForm Component
 * 
 * Form for tracing transactions in a block and organizing them by status
 * Allows seeing all successful and reverted transactions in a given block
 */
const TraceBlockStatusForm = ({ endpoint = 'local' }) => {
  const [blockHeight, setBlockHeight] = useState('');
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [transactionStatuses, setTransactionStatuses] = useState({});
  const [error, setError] = useState(null);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResults(null);
    setTransactionStatuses({});

    try {
      // Trace the block to get all transactions
      const blockResult = await traceBlock(blockHeight, endpoint);
      setResults(blockResult);

      // Process each transaction to get its status
      if (blockResult.transactions && blockResult.transactions.length > 0) {
        const statuses = {};
        
        // Initialize with pending status
        blockResult.transactions.forEach(tx => {
          statuses[tx.txid] = { status: 'pending', details: null };
        });
        
        setTransactionStatuses(statuses);
        
        // Process transactions in parallel with a limit
        const processInBatches = async (txs, batchSize = 3) => {
          for (let i = 0; i < txs.length; i += batchSize) {
            const batch = txs.slice(i, i + batchSize);
            await Promise.all(batch.map(async (tx) => {
              try {
                const traceResult = await traceTransaction(tx.txid, blockHeight, 0, endpoint);
                
                // Find the final status in the trace steps
                let finalStatus = 'success';
                let details = null;
                
                if (traceResult.steps && traceResult.steps.length > 0) {
                  const returnStep = traceResult.steps.find(step => step.event === 'return');
                  if (returnStep) {
                    finalStatus = returnStep.status || 'success';
                    details = returnStep.data;
                  }
                }
                
                setTransactionStatuses(prev => ({
                  ...prev,
                  [tx.txid]: { status: finalStatus, details }
                }));
              } catch (err) {
                console.error(`Error tracing transaction ${tx.txid}:`, err);
                setTransactionStatuses(prev => ({
                  ...prev,
                  [tx.txid]: { status: 'error', details: { error: err.message } }
                }));
              }
            }));
          }
        };
        
        await processInBatches(blockResult.transactions);
      }
    } catch (err) {
      console.error('Error tracing block:', err);
      setError(err.message || 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Group transactions by status
  const groupedTransactions = React.useMemo(() => {
    if (!results || !results.transactions) return null;
    
    const groups = {
      success: [],
      revert: [],
      error: [],
      pending: []
    };
    
    results.transactions.forEach(tx => {
      const status = transactionStatuses[tx.txid]?.status || 'pending';
      groups[status] = groups[status] || [];
      groups[status].push({
        ...tx,
        details: transactionStatuses[tx.txid]?.details
      });
    });
    
    return groups;
  }, [results, transactionStatuses]);

  return (
    <div className="trace-block-status-form">
      <h2>Trace Block Status</h2>
      <p className="api-description">
        This method traces all transactions in a block and organizes them by status (success/revert).
      </p>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="blockHeight">Block Height:</label>
          <input
            type="text"
            id="blockHeight"
            value={blockHeight}
            onChange={(e) => setBlockHeight(e.target.value)}
            placeholder="Enter block height (e.g., 100000)"
            required
          />
        </div>
        
        <button type="submit" disabled={isLoading} className="submit-button">
          {isLoading ? 'Tracing...' : 'Trace Block'}
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
          <p>Tracing transactions... This may take a moment.</p>
        </div>
      )}
      
      {results && !isLoading && (
        <div className="results-container">
          <h3>Block #{results.blockHeight}</h3>
          <p>Block Hash: {results.blockHash || 'N/A'}</p>
          <p>Timestamp: {results.timestamp ? new Date(results.timestamp * 1000).toLocaleString() : 'N/A'}</p>
          <p>Total Transactions: {results.transactions?.length || 0}</p>
          
          {groupedTransactions && (
            <div className="transaction-groups">
              {/* Successful Transactions */}
              <div className="transaction-group success">
                <h4>
                  Successful Transactions ({groupedTransactions.success?.length || 0})
                </h4>
                {groupedTransactions.success?.length > 0 ? (
                  <ul>
                    {groupedTransactions.success.map((tx) => (
                      <li key={tx.txid}>
                        <code>{tx.txid}</code>
                        {tx.details && (
                          <div className="transaction-details">
                            <pre>{JSON.stringify(tx.details, null, 2)}</pre>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No successful transactions found.</p>
                )}
              </div>
              
              {/* Reverted Transactions */}
              <div className="transaction-group revert">
                <h4>
                  Reverted Transactions ({groupedTransactions.revert?.length || 0})
                </h4>
                {groupedTransactions.revert?.length > 0 ? (
                  <ul>
                    {groupedTransactions.revert.map((tx) => (
                      <li key={tx.txid}>
                        <code>{tx.txid}</code>
                        {tx.details && (
                          <div className="transaction-details">
                            <pre>{JSON.stringify(tx.details, null, 2)}</pre>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No reverted transactions found.</p>
                )}
              </div>
              
              {/* Error Transactions */}
              <div className="transaction-group error">
                <h4>
                  Error Transactions ({groupedTransactions.error?.length || 0})
                </h4>
                {groupedTransactions.error?.length > 0 ? (
                  <ul>
                    {groupedTransactions.error.map((tx) => (
                      <li key={tx.txid}>
                        <code>{tx.txid}</code>
                        {tx.details && (
                          <div className="transaction-details">
                            <pre>{JSON.stringify(tx.details, null, 2)}</pre>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No error transactions found.</p>
                )}
              </div>
              
              {/* Pending Transactions */}
              {groupedTransactions.pending?.length > 0 && (
                <div className="transaction-group pending">
                  <h4>
                    Pending Transactions ({groupedTransactions.pending.length})
                  </h4>
                  <ul>
                    {groupedTransactions.pending.map((tx) => (
                      <li key={tx.txid}>
                        <code>{tx.txid}</code>
                        <span className="pending-indicator"> (Processing...)</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TraceBlockStatusForm;
