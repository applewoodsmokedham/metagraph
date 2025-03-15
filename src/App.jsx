import React, { useState, Suspense, lazy } from 'react';
import './App.css';
import EndpointToggle from './components/shared/EndpointToggle';

// Lazy load BlockHeight component to prevent initial render issues
const BlockHeight = lazy(() => import('./components/shared/BlockHeight'));

/**
 * ErrorBoundary component to catch and handle errors
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Component error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div>Something went wrong.</div>;
    }
    return this.props.children;
  }
}

/**
 * App Component - With Safe Component Loading
 * 
 * This version adds components safely with error boundaries
 * to prevent blank page issues
 */
function App() {
  const [network, setNetwork] = useState('regtest');

  const handleNetworkChange = (newNetwork) => {
    console.log('Network changed to:', newNetwork);
    setNetwork(newNetwork);
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-title">
          <h1>METHANE</h1>
          <span className="subtitle">Method Exploration, Testing, and Analysis eNvironment</span>
        </div>
        <div className="header-controls">
          <EndpointToggle 
            onChange={handleNetworkChange} 
            initialEndpoint={network} 
          />
          <ErrorBoundary fallback={<div className="block-height">Height: Unavailable</div>}>
            <Suspense fallback={<div className="block-height">Loading height...</div>}>
              <BlockHeight network={network} refreshInterval={10000} />
            </Suspense>
          </ErrorBoundary>
        </div>
      </header>
      <main className="main-content">
        <div className="container">
          <h2>Welcome to METHANE</h2>
          <p>An interactive playground for Alkanes metaprotocol and Sandshrew API methods.</p>
          
          <div className="network-info">
            <h3>Current Network: {network.toUpperCase()}</h3>
            <p>The application is currently connected to the {network} network.</p>
          </div>
          
          <div className="debug-info">
            <h3>Debug Information</h3>
            <p>Application is rendering correctly.</p>
            <p>Current Time: {new Date().toLocaleTimeString()}</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
