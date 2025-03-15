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
 * @param {string} props.endpoint - Current selected endpoint
 * @param {Function} props.onEndpointChange - Callback when endpoint is changed
 */
const Header = ({ endpoint = 'local', onEndpointChange }) => {
  return (
    <header className="main-header">
      <div className="header-left">
        <h1>
          <Link to="/" className="logo">
            Alkanes Explorer
          </Link>
        </h1>
      </div>

      <div className="header-right">
        <EndpointToggle 
          onChange={onEndpointChange} 
          initialEndpoint={endpoint} 
        />
        <StatusIndicator endpoint={endpoint} />
      </div>
    </header>
  );
};

export default Header;