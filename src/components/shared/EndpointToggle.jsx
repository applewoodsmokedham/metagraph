import React from 'react';

/**
 * EndpointToggle Component
 *
 * Provides a UI for toggling between different Bitcoin networks (mainnet/regtest/oylnet)
 *
 * @param {Object} props
 * @param {Function} props.onChange - Callback when endpoint is changed
 * @param {string} props.initialEndpoint - Current endpoint value
 */
const EndpointToggle = ({ onChange, initialEndpoint = 'mainnet' }) => {
  // Use the parent's state directly, no local state
  const endpoint = initialEndpoint;
  
  const handleToggle = (newEndpoint) => {
    // Only call the parent onChange, don't maintain local state
    if (onChange) onChange(newEndpoint);
  };

  return (
    <div className="endpoint-toggle">
      <h4>Network:</h4>
      <div className="toggle-buttons">
        <button 
          className={`toggle-button ${endpoint === 'regtest' ? 'active' : ''}`} 
          onClick={() => handleToggle('regtest')}
        >
          REGTEST
        </button>
        <button 
          className={`toggle-button ${endpoint === 'mainnet' ? 'active' : ''}`} 
          onClick={() => handleToggle('mainnet')}
        >
          MAINNET
        </button>
        <button 
          className={`toggle-button ${endpoint === 'oylnet' ? 'active' : ''}`}
          onClick={() => handleToggle('oylnet')}
        >
          OYLNET
        </button>
      </div>
    </div>
  );
};

export default EndpointToggle;