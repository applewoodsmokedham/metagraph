import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { LaserEyesProvider } from '@omnisat/lasereyes';
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
 * App Component - Reskinned with 98.css
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

  // Basic inline style for the main window positioning
  const windowStyle = {
    width: 'calc(100% - 40px)', // Adjust width as needed
    margin: '20px auto'          // Center the window with margins
  };

  return (
    <>
      {isClient ? (
        <LaserEyesProvider config={{ network: mapNetworkToLaserEyes(network) }}>
          {/* Apply 98.css window structure */}
          <div className="window app-window" style={windowStyle}>
            <div className="title-bar">
              <div className="title-bar-text">Metagraph - Windows 98 Edition</div>
              {/* Standard window controls (non-functional placeholders) */}
              <div className="title-bar-controls">
                <button aria-label="Minimize"></button>
                <button aria-label="Maximize"></button>
                <button aria-label="Close"></button>
              </div>
            </div>

            <div className="window-body">
              {/* Original Header Content - Needs further styling */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '10px', borderBottom: '1px solid silver', marginBottom: '10px' }}>
                 {/* Left side: Title, Subtitle, Home Link */}
                <div>
                  <h1>METAGRAPH</h1>
                  <span>Method Exploration, Tool And Graph Renderer for Alkanes Protocol Handling</span>
                  <div>
                    <Link
                      to="/"
                      style={{ color: 'blue', textDecoration: 'underline', fontSize: '12px', marginTop: '4px' }}
                    >
                      /home
                    </Link>
                   </div>
                </div>
                 {/* Right side: Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {/* These components will need internal styling updates */}
                  <EndpointToggle
                    onChange={handleNetworkChange}
                    initialEndpoint={network}
                  />
                  <WalletConnector />
                  <ErrorBoundary fallback={<div className="status-bar-field">Height: Err</div>}>
                    <Suspense fallback={<div className="status-bar-field">Loading...</div>}>
                       {/* Wrap BlockHeight in a field for potential status bar look */}
                       <div className="status-bar-field">
                         <BlockHeight network={network} refreshInterval={10000} />
                       </div>
                    </Suspense>
                  </ErrorBoundary>
                </div>
              </div>

              {/* Main Content Area */}
              <main>
                {/* Renders the current route's component */}
                <Outlet context={{ endpoint: network }} />
              </main>

            </div> {/* End window-body */}

             {/* Optional: Add a status bar */}
             <div className="status-bar">
               <p className="status-bar-field">Network: {network}</p>
               <p className="status-bar-field">Ready</p>
               <p className="status-bar-field">CPU: 5%</p> {/* Example field */}
             </div>

          </div> {/* End window */}
        </LaserEyesProvider>
      ) : null}
    </>
  );
}

export default App;
