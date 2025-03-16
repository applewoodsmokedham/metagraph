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
 * Follows industrial aesthetic design guidelines
 */
function App() {
  const [network, setNetwork] = useState('regtest');

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
    container: {
      width: '100%',
      maxWidth: '1200px',
      margin: '0 auto',
      backgroundColor: '#FFFFFF',
      padding: '16px',
      border: '1px solid #cccccc',
    },
    welcome: {
      fontSize: '24px',
      fontWeight: 'bold',
      marginBottom: '16px',
      textAlign: 'left',
    },
    description: {
      fontSize: '14px',
      marginBottom: '16px',
      textAlign: 'left',
    },
    contentColumns: {
      display: 'flex',
      flexDirection: 'row',
      gap: '20px',
      marginTop: '16px',
    },
    column: {
      flex: 1,
      padding: '16px',
      backgroundColor: '#FFFFFF',
      border: '1px solid #cccccc',
    },
    sectionTitle: {
      fontSize: '24px',
      fontWeight: 'bold',
      marginBottom: '16px',
      textAlign: 'left',
    },
    categoryTitle: {
      fontSize: '16px',
      fontWeight: 'bold',
      marginTop: '20px',
      marginBottom: '8px',
      textAlign: 'left',
      color: '#4A4A4A',
    },
    methodsList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '5px',
      textAlign: 'left',
    },
    methodItem: {
      marginBottom: '8px',
    },
    link: {
      color: '#0000FF',
      textDecoration: 'none',
      fontWeight: 'bold',
      fontSize: '14px',
    },
    // Responsive styles
    '@media (max-width: 768px)': {
      contentColumns: {
        flexDirection: 'column',
      }
    }
  };

  return (
    <div style={styles.app} className="app">
      <header style={styles.header} className="header">
        <div style={styles.headerTitle} className="header-title">
          <h1 style={styles.title}>METHANE</h1>
          <span style={styles.subtitle} className="subtitle">Method Exploration, Testing, and Analysis eNvironment</span>
        </div>
        <div style={styles.headerControls} className="header-controls">
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
      <main style={styles.mainContent} className="main-content">
        <div style={styles.container} className="container">
          <h2 style={styles.welcome}>Welcome to METHANE</h2>
          <p style={styles.description}>An interactive playground for Alkanes metaprotocol and Sandshrew API methods.</p>
          
          <div style={styles.contentColumns}>
            {/* Left Column - Playground */}
            <div style={styles.column}>
              <h2 style={styles.sectionTitle}>Playground</h2>
              
              <div style={styles.methodsList}>
                <h3 style={styles.categoryTitle}>Trace Methods</h3>
                <div style={styles.methodItem}>
                  <a href="/api-methods/traceblockstatus" style={{...styles.link, color: '#0000FF'}}>/api-methods/traceblockstatus</a>
                </div>
                <div style={styles.methodItem}>
                  <a href="/api-methods/tracetransaction" style={{...styles.link, color: '#0000FF'}}>/api-methods/tracetransaction</a>
                </div>
                <div style={styles.methodItem}>
                  <a href="/api-methods/simulate" style={{...styles.link, color: '#0000FF'}}>/api-methods/simulate</a>
                </div>
                
                <h3 style={styles.categoryTitle}>Alkanes Methods</h3>
                <div style={styles.methodItem}>
                  <a href="/api-methods/getalkanes/address" style={{...styles.link, color: '#0000FF'}}>/api-methods/getalkanes/address</a>
                </div>
                <div style={styles.methodItem}>
                  <a href="/api-methods/getalkanes/height" style={{...styles.link, color: '#0000FF'}}>/api-methods/getalkanes/height</a>
                </div>
              </div>
            </div>
            
            {/* Right Column - Explorer */}
            <div style={styles.column}>
              <h2 style={styles.sectionTitle}>Explorer</h2>
              
              <div style={styles.methodsList}>
                <div style={styles.methodItem}>
                  <a href="/explorer/block" style={{...styles.link, color: '#0000FF'}}>/explorer/block</a>
                </div>
                <div style={styles.methodItem}>
                  <a href="/explorer/transaction" style={{...styles.link, color: '#0000FF'}}>/explorer/transaction</a>
                </div>
                <div style={styles.methodItem}>
                  <a href="/explorer/address" style={{...styles.link, color: '#0000FF'}}>/explorer/address</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
