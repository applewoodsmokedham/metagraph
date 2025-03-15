import React from 'react';
import { Link } from 'react-router-dom';
import EndpointToggle from '../shared/EndpointToggle';
import StatusIndicator from '../shared/StatusIndicator';

/**
 * Header Component
 * 
 * Main application header containing the title, endpoint toggle and status
 * 
 * @param {Object} props
 * @param {string} props.currentEndpoint - Current selected endpoint
 * @param {Function} props.onEndpointChange - Callback when endpoint is changed
 */
const Header = ({ currentEndpoint = 'local', onEndpointChange }) => {
  return (
    <header className="header">
      <div className="header-title">
        <h1>
          <Link to="/" className="logo">
            METHANE
          </Link>
        </h1>
        <span className="subtitle">Method Exploration, Testing, and Analysis eNvironment</span>
      </div>

      <div className="header-controls">
        <EndpointToggle 
          onChange={onEndpointChange} 
          initialEndpoint={currentEndpoint} 
        />
        <StatusIndicator endpoint={currentEndpoint} />
      </div>
    </header>
  );
};

export default Header;