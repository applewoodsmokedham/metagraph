import React from 'react';
import { Link, useOutletContext } from 'react-router-dom';

/**
 * Home Page Component
 *
 * The main landing page for the METAGRAPH application
 * Displays categories of API methods with links to their specific pages
 * Follows industrial aesthetic design guidelines
 */
const Home = () => {
  const { endpoint = 'mainnet' } = useOutletContext() || {};
  
  // CSS for inline styling according to design guidelines
  const styles = {
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
    playgroundColumn: {
      flex: 1,
      padding: '16px',
      backgroundColor: '#f8f9fa',
      border: '1px solid #000000',
      borderLeft: '5px solid #000000',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    explorerColumn: {
      flex: 1,
      padding: '16px',
      backgroundColor: '#f8f9fa',
      border: '1px solid #000000',
      borderLeft: '5px solid #000000',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
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
    statusSection: {
      marginTop: '16px',
      padding: '16px',
      backgroundColor: '#F5F5F5',
      textAlign: 'left',
    },
    statusIndicator: {
      fontSize: '14px',
      marginBottom: '5px',
    },
    helpText: {
      fontSize: '14px',
      color: '#4A4A4A',
    },
    // Responsive styles
    '@media (max-width: 768px)': {
      contentColumns: {
        flexDirection: 'column',
      }
    }
  };

  // Helper function to apply responsive styles
  const applyResponsiveStyles = (baseStyles) => {
    if (window.innerWidth <= 768) {
      return {
        ...baseStyles,
        contentColumns: {
          ...baseStyles.contentColumns,
          flexDirection: 'column',
        },
        column: {
          ...baseStyles.column,
          marginBottom: '16px',
        },
        playgroundColumn: {
          ...baseStyles.playgroundColumn,
          marginBottom: '16px',
        },
        explorerColumn: {
          ...baseStyles.explorerColumn,
          marginBottom: '16px',
        }
      };
    }
    return baseStyles;
  };

  // Apply responsive styles
  const responsiveStyles = applyResponsiveStyles(styles);
  
  return (
    <div style={responsiveStyles.container} className="container">
      <h2 style={responsiveStyles.welcome}>Welcome to METAGRAPH</h2>
      <p style={responsiveStyles.description}>An interactive playground for Alkanes metaprotocol and Sandshrew API methods.</p>
      
      <div style={responsiveStyles.contentColumns}>
        {/* Left Column - Playground */}
        <div style={responsiveStyles.playgroundColumn}>
          <h2 style={responsiveStyles.sectionTitle}>Playground</h2>
          
          <div style={responsiveStyles.methodsList}>
            <div style={responsiveStyles.methodItem}>
              <Link to="/api-methods/trace" style={responsiveStyles.link}>/api-methods/trace</Link>
              <p style={{marginTop: '4px', fontSize: '12px', color: '#666666'}}>
                Explore and debug transaction execution with detailed trace output
              </p>
            </div>
            
            <div style={responsiveStyles.methodItem}>
              <Link to="/api-methods/simulate" style={responsiveStyles.link}>/api-methods/simulate</Link>
              <p style={{marginTop: '4px', fontSize: '12px', color: '#666666'}}>
                Simulate Alkanes operations to preview outcomes without broadcasting to the network
              </p>
            </div>
            
            <div style={responsiveStyles.methodItem}>
              <Link to="/api-methods/protorunesbyoutpoint" style={responsiveStyles.link}>/api-methods/protorunesbyoutpoint</Link>
              <p style={{marginTop: '4px', fontSize: '12px', color: '#666666'}}>
                Query Protorunes by outpoint (txid, vout) at a specific block height
              </p>
            </div>
          </div>
        </div>
        
        {/* Right Column - Explorer */}
        <div style={responsiveStyles.explorerColumn}>
          <h2 style={responsiveStyles.sectionTitle}>Explorer</h2>
          
          <div style={responsiveStyles.methodsList}>
            <div style={responsiveStyles.methodItem}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link to="/explorer/alkanes-tokens" style={responsiveStyles.link}>/explorer/alkanes-tokens</Link>
                <span style={{ fontSize: '12px', color: '#666666', fontWeight: 'bold' }}>[2,n]</span>
              </div>
              <p style={{marginTop: '4px', fontSize: '12px', color: '#666666'}}>
                View all <strong>initialized</strong> Alkanes tokens
              </p>
            </div>
            
            <div style={responsiveStyles.methodItem}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link to="/explorer/alkanes-templates" style={responsiveStyles.link}>/explorer/alkanes-templates</Link>
                <span style={{ fontSize: '12px', color: '#666666', fontWeight: 'bold' }}>[4,n]</span>
              </div>
              <p style={{marginTop: '4px', fontSize: '12px', color: '#666666'}}>
                View all deployed Alkanes factory templates
              </p>
            </div>
            
            <div style={responsiveStyles.methodItem}>
              <Link to="/explorer/alkanes-balance" style={responsiveStyles.link}>/explorer/alkanes-balance</Link>
              <p style={{marginTop: '4px', fontSize: '12px', color: '#666666'}}>
                Explore Alkanes balances across the network
              </p>
            </div>
            
            <div style={responsiveStyles.methodItem}>
              <Link to="/explorer/address" style={responsiveStyles.link}>/explorer/address</Link>
              <p style={{marginTop: '4px', fontSize: '12px', color: '#666666'}}>
                Explore transactions for an address
              </p>
            </div>
            
            <div style={responsiveStyles.methodItem}>
              <Link to="/explorer/transaction-io" style={responsiveStyles.link}>/explorer/transaction-io</Link>
              <p style={{marginTop: '4px', fontSize: '12px', color: '#666666'}}>
                Explore transaction inputs and outputs
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;