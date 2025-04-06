import React, { useState, useEffect } from 'react';

/**
 * BlockHeight Component (98.css version)
 *
 * Displays the current block height for the selected network in a status bar field.
 * Updates automatically at a configured interval.
 * Uses a failsafe implementation to prevent app crashes.
 *
 * @param {Object} props
 * @param {string} props.network - Current network (mainnet, regtest, oylnet)
 * @param {number} props.refreshInterval - Refresh interval in milliseconds
 */
const BlockHeight = ({ network = 'regtest', refreshInterval = 30000 }) => {
  const [blockHeight, setBlockHeight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  const fetchBlockHeight = async () => {
    if (!loading) setLoading(true);

    try {
      const getProvider = (await import('../../sdk/provider')).default;
      if (typeof getProvider !== 'function') {
        throw new Error('Provider module not properly loaded');
      }
      const provider = getProvider(network);
      console.log(`Fetching block height for network: ${network}`);
      const height = await provider.getBlockHeight();
      console.log(`Block height received: ${height}`);
      setBlockHeight(height);
      setError(null);
      setRetryCount(0); // Reset retry count on success
    } catch (err) {
      console.error('Error fetching block height:', err);
      setError(err.message || 'Failed to fetch');
      setRetryCount(prev => prev + 1); // Increment retry count
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    try {
      console.log(`BlockHeight mounted for network: ${network}`);
      setRetryCount(0);
      setLoading(true); // Ensure loading state is true initially
      setError(null);
      setBlockHeight(null);

      fetchBlockHeight();

      const intervalId = setInterval(() => {
        // Retry fetching only if there was an error and retries are left
        if (error && retryCount < maxRetries) {
           console.log(`Retrying block height fetch (${retryCount + 1}/${maxRetries})`);
           fetchBlockHeight();
        } else if (!error) {
            // If no error, continue regular fetching
            fetchBlockHeight();
        }
      }, refreshInterval);

      return () => {
        console.log(`Cleaning up BlockHeight for network: ${network}`);
        clearInterval(intervalId);
      };
    } catch (err) {
      console.error('BlockHeight component error:', err);
      setError('Component Error');
      setLoading(false);
    }
  }, [network, refreshInterval]); // Rerun effect when network or interval changes

  // Failsafe rendering
  try {
    let statusText = 'Block: ';
    let titleText = `Network: ${network}`;

    if (loading && !error) {
      statusText += 'Loading...';
    } else if (error) {
      if (retryCount >= maxRetries) {
        statusText += `Error (${error})`;
        titleText += ` - Failed after ${maxRetries} retries.`;
      } else {
        statusText += `Retrying (${retryCount}/${maxRetries})...`;
        titleText += ` - Error: ${error}`;      }
    } else {
      statusText += blockHeight?.toLocaleString() || 'Unknown';
    }

    return (
      <div className="status-bar-field" title={titleText}>
        {statusText}
      </div>
    );
  } catch (err) {
    console.error('BlockHeight render error:', err);
    // Render simplified error state in case of unexpected render issues
    return <div className="status-bar-field" title={`Network: ${network} - Render Error`}>Block: Error</div>;
  }
};

export default BlockHeight;
