import React, { useState, useEffect } from 'react';

/**
 * BlockHeight Component
 * 
 * Displays the current block height for the selected network
 * Updates automatically at a configured interval
 * Uses a failsafe implementation to prevent app crashes
 * 
 * @param {Object} props
 * @param {string} props.network - Current network (mainnet, regtest, oylnet)
 * @param {number} props.refreshInterval - Refresh interval in milliseconds
 */
const BlockHeight = ({ network = 'regtest', refreshInterval = 30000 }) => {
  const [blockHeight, setBlockHeight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchBlockHeight = async () => {
    if (!loading) setLoading(true);
    
    try {
      // Import the provider module using the proper package path
      // This will use the @oyl/sdk package reference from package.json
      const getProvider = (await import('../../sdk/provider')).default;
      
      if (typeof getProvider !== 'function') {
        throw new Error('Provider module not properly loaded');
      }
      
      const provider = getProvider(network);
      console.log(`Fetching block height for network: ${network}`);
      
      // Call the provider's getBlockHeight method
      const height = await provider.getBlockHeight();
      console.log(`Block height received: ${height}`);
      
      setBlockHeight(height);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error('Error fetching block height:', err);
      setError(err.message || 'Failed to fetch');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Wrap in try/catch to prevent React rendering issues
    try {
      console.log(`BlockHeight mounted for network: ${network}`);
      
      // Fetch immediately on mount or network change
      fetchBlockHeight();
      
      // Set up interval for periodic updates
      const intervalId = setInterval(fetchBlockHeight, refreshInterval);
      
      // Clean up interval on unmount or network change
      return () => {
        console.log(`Cleaning up BlockHeight for network: ${network}`);
        clearInterval(intervalId);
      };
    } catch (err) {
      console.error('BlockHeight component error:', err);
      // Don't rethrow - prevent app from crashing
    }
  }, [network, refreshInterval]);

  // Failsafe rendering that won't crash the app
  try {
    return (
      <div className="block-height">
        <div className="block-height-label">Block Height:</div>
        <div className="block-height-value">
          {loading ? (
            <span className="loading">Loading...</span>
          ) : error ? (
            <span className="error">{error}</span>
          ) : (
            <span>{blockHeight?.toLocaleString() || 'Unknown'}</span>
          )}
        </div>
        {lastUpdated && (
          <div className="block-height-updated">
            {network}: {lastUpdated.toLocaleTimeString()}
          </div>
        )}
      </div>
    );
  } catch (err) {
    console.error('BlockHeight render error:', err);
    return <div className="block-height">Height: Error</div>;
  }
};

export default BlockHeight;
