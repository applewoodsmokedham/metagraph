import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { LaserEyesProvider } from '@omnisat/lasereyes';
import './App.css';
import EndpointToggle from './components/shared/EndpointToggle';
import WalletConnector from './components/shared/WalletConnector';
import { mapNetworkToLaserEyes } from './utils/networkMapping';

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
 * Follows industrial aesthetic design guidelines
 */
function App() {
  const [network, setNetwork] = useState('mainnet');
  const [isClient, setIsClient] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleNetworkChange = (newNetwork) => {
    console.log('Network changed to:', newNetwork);
    setNetwork(newNetwork);
  };

  // CSS for inline styling according to design guidelines
  const styles = {
    app: {
      fontFamily: 'Roboto Mono, monospace',
      color: '#000000',
      backgroundColor: '#F5F5F5',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px',
      backgroundColor: '#FFFFFF',
      borderBottom: '1px solid #cccccc',
      width: '100%',
      maxWidth: '1200px',
      margin: '0 auto',
    },
    headerTitle: {
      display: 'flex',
      flexDirection: 'column',
      textAlign: 'left',
    },
    headerControls: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      marginBottom: '4px',
      letterSpacing: '0.05em',
      fontFamily: 'var(--font-mono)',  // Use original font
    },
    subtitle: {
      fontSize: '14px',
      color: '#4A4A4A',
    },
    mainContent: {
      flex: 1,
      padding: '16px',
    },
  };

  return (
    <>
      {isClient ? (
        <LaserEyesProvider config={{ network: mapNetworkToLaserEyes(network) }}>
          <div style={styles.app} className="app">
            <header style={styles.header} className="header">
              <div style={styles.headerTitle} className="header-title">
                <h1 style={styles.title}>METHANE</h1>
                <span style={styles.subtitle} className="subtitle">Method Exploration, Testing, and Analysis eNvironment</span>
                <Link
                  to="/"
                  style={{
                    color: '#0000FF',
                    textDecoration: 'none',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    marginTop: '4px',
                    display: 'block',
                    textAlign: 'left'
                  }}
                >
                  /home
                </Link>
              </div>
              <div style={styles.headerControls} className="header-controls">
                <EndpointToggle
                  onChange={handleNetworkChange}
                  initialEndpoint={network}
                />
                <WalletConnector />
                <ErrorBoundary fallback={<div className="block-height">Height: Unavailable</div>}>
                  <Suspense fallback={<div className="block-height">Loading height...</div>}>
                    <BlockHeight network={network} refreshInterval={10000} />
                  </Suspense>
                </ErrorBoundary>
              </div>
            </header>
            <main style={styles.mainContent} className="main-content">
              {/* This is where we render the current route's component */}
              <Outlet context={{ endpoint: network }} />
            </main>
          </div>
        </LaserEyesProvider>
      ) : null}
    </>
  );
}

export default App;
