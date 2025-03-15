import React, { useState } from 'react';

/**
 * EndpointToggle Component
 * 
 * Provides a UI for toggling between different API endpoints (Local/Production/Oylnet)
 * 
 * @param {Object} props
 * @param {Function} props.onChange - Callback when endpoint is changed
 * @param {string} props.initialEndpoint - Initial endpoint value
 */
const EndpointToggle = ({ onChange, initialEndpoint = 'local' }) => {
  const [endpoint, setEndpoint] = useState(initialEndpoint);

  const handleToggle = (newEndpoint) => {
    setEndpoint(newEndpoint);
    if (onChange) onChange(newEndpoint);
  };

  return (
    <div className="endpoint-toggle">
      <h4>Endpoint:</h4>
      <div className="toggle-buttons">
        <button 
          className={`toggle-button ${endpoint === 'local' ? 'active' : ''}`} 
          onClick={() => handleToggle('local')}
        >
          LOCAL
        </button>
        <button 
          className={`toggle-button ${endpoint === 'production' ? 'active' : ''}`} 
          onClick={() => handleToggle('production')}
        >
          PRODUCTION
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