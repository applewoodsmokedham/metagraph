import React, { useState, useEffect } from 'react';
import { getProvider } from '../../sdk';

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
        // In a real implementation, we would use the provider to check connection status
        // For example: const provider = getProvider(endpoint);
        // const blockHeight = await provider.getBlockHeight();
        
        // This is a placeholder that simulates a successful connection
        // with a random block height between 800000 and 900000
        const mockBlockHeight = Math.floor(Math.random() * 100000) + 800000;
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setStatus({
          connected: true,
          blockHeight: mockBlockHeight,
          lastChecked: new Date(),
          loading: false
        });
      } catch (error) {
        console.error('Error checking endpoint status:', error);
        setStatus({
          connected: false,
          blockHeight: null,
          lastChecked: new Date(),
          loading: false
        });
      }
    };

    checkStatus();
    
    // Set up a periodic check every 30 seconds
    const intervalId = setInterval(checkStatus, 30000);
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [endpoint]);

  return (
    <div className="status-indicator">
      <div 
        className={`status-light ${status.loading ? 'loading' : status.connected ? 'connected' : 'disconnected'}`}
        title={status.connected ? 'Connected' : 'Disconnected'}
      ></div>
      <div className="endpoint-info">
        <div className="endpoint-name">
          Endpoint: <span className="endpoint-value">{endpoint.toUpperCase()}</span>
        </div>
        <div className="connection-status">
          Status: {status.loading ? 'CHECKING...' : status.connected ? 'CONNECTED' : 'DISCONNECTED'}
        </div>
        {status.blockHeight && (
          <div className="block-height">
            Height: <span className="height-value">{status.blockHeight.toLocaleString()}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatusIndicator;