import React, { useState, useEffect } from 'react';
import getProvider from '../../sdk/provider';

/**
 * StatusIndicator Component
 * 
 * Displays the current connection status to the selected endpoint
 * Shows a visual indicator (green for connected, red for disconnected)
 * 
 * @param {Object} props
 * @param {string} props.endpoint - Current endpoint (local, production, oylnet)
 */
const StatusIndicator = ({ endpoint = 'local' }) => {
  const [status, setStatus] = useState({
    connected: false,
    blockHeight: null,
    lastChecked: null,
    loading: true
  });

  // Check connection status
  useEffect(() => {
    const checkStatus = async () => {
      setStatus(prev => ({ ...prev, loading: true }));
      
      try {
        // Get the provider for the current endpoint
        const provider = getProvider(endpoint);
        
        // Check the provider health
        const isHealthy = await provider.checkHealth();
        
        // Get the current block height if connected
        const blockHeight = isHealthy ? await provider.getBlockHeight() : null;
        
        setStatus({
          connected: isHealthy,
          blockHeight,
          lastChecked: new Date(),
          loading: false
        });
      } catch (error) {
        console.error(`Error checking ${endpoint} endpoint status:`, error);
        setStatus({
          connected: false,
          blockHeight: null,
          lastChecked: new Date(),
          loading: false,
          error: error.message
        });
      }
    };

    // Check status immediately and then set up interval
    checkStatus();
    
    // Set up a periodic check every 30 seconds
    const intervalId = setInterval(checkStatus, 30000);
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [endpoint]);

  // Format the network name for display
  const getNetworkName = () => {
    switch(endpoint) {
      case 'production':
        return 'MAINNET';
      case 'oylnet':
        return 'OYLNET';
      case 'local':
      default:
        return 'LOCAL';
    }
  };

  return (
    <div className="status-indicator">
      <div 
        className={`status-dot ${status.loading ? 'loading' : status.connected ? 'connected' : 'error'}`}
        title={status.connected ? 'Connected' : 'Disconnected'}
      ></div>
      <div className="status-text">
        {getNetworkName()}: {status.loading ? 'Checking...' : status.connected ? 'Connected' : 'Disconnected'}
        {status.blockHeight && (
          <span className="block-height"> (Block: {status.blockHeight.toLocaleString()})</span>
        )}
      </div>
    </div>
  );
};

export default StatusIndicator;