import React from 'react';

/**
 * EndpointToggle Component (98.css version)
 *
 * Provides a UI for toggling between different Bitcoin networks using radio buttons
 *
 * @param {Object} props
 * @param {Function} props.onChange - Callback when endpoint is changed
 * @param {string} props.initialEndpoint - Current endpoint value
 */
const EndpointToggle = ({ onChange, initialEndpoint = 'mainnet' }) => {

  const handleToggle = (event) => {
    const newEndpoint = event.target.value;
    if (onChange) onChange(newEndpoint);
  };

  // Unique name for the radio group
  const radioGroupName = "network-toggle";

  return (
    <fieldset className="group-box">
      <legend>Network</legend>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}> {/* Basic layout for radio buttons */}
        <div>
          <input
            type="radio"
            id="regtest-radio"
            name={radioGroupName}
            value="regtest"
            checked={initialEndpoint === 'regtest'}
            onChange={handleToggle}
          />
          <label htmlFor="regtest-radio">Regtest</label>
        </div>
        <div>
          <input
            type="radio"
            id="mainnet-radio"
            name={radioGroupName}
            value="mainnet"
            checked={initialEndpoint === 'mainnet'}
            onChange={handleToggle}
          />
          <label htmlFor="mainnet-radio">Mainnet</label>
        </div>
        <div>
          <input
            type="radio"
            id="oylnet-radio"
            name={radioGroupName}
            value="oylnet"
            checked={initialEndpoint === 'oylnet'}
            onChange={handleToggle}
          />
          <label htmlFor="oylnet-radio">Oylnet</label>
        </div>
      </div>
    </fieldset>
  );
};

export default EndpointToggle;