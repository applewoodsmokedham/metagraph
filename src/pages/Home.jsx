import React from 'react';
import { Link, useOutletContext } from 'react-router-dom';

/**
 * Home Page Component
 *
 * The main landing page for the METHANE application
 * Displays categories of API methods with links to their specific pages
 * Follows industrial aesthetic design guidelines
 */
const Home = () => {
  const { endpoint = 'regtest' } = useOutletContext() || {};
  
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
      };
    }
    return baseStyles;
  };

  // Apply responsive styles
  const responsiveStyles = applyResponsiveStyles(styles);
  
  return (
    <div style={responsiveStyles.container} className="container">
      <h2 style={responsiveStyles.welcome}>Welcome to METHANE</h2>
      <p style={responsiveStyles.description}>An interactive playground for Alkanes metaprotocol and Sandshrew API methods.</p>
      
      <div style={responsiveStyles.contentColumns}>
        {/* Left Column - Playground */}
        <div style={responsiveStyles.column}>
          <h2 style={responsiveStyles.sectionTitle}>Playground</h2>
          
          <div style={responsiveStyles.methodsList}>
            <h3 style={responsiveStyles.categoryTitle}>Trace Methods</h3>
            <div style={responsiveStyles.methodItem}>
              <Link to="/api-methods/trace" style={responsiveStyles.link}>/api-methods/trace</Link>
            </div>
            <div style={responsiveStyles.methodItem}>
              <Link to="/api-methods/traceblockstatus" style={responsiveStyles.link}>/api-methods/traceblockstatus</Link>
            </div>
            <div style={responsiveStyles.methodItem}>
              <Link to="/api-methods/simulate" style={responsiveStyles.link}>/api-methods/simulate</Link>
            </div>
            
            <h3 style={responsiveStyles.categoryTitle}>Alkanes Methods</h3>
            <div style={responsiveStyles.methodItem}>
              <Link to="/api-methods/getalkanes/address" style={responsiveStyles.link}>/api-methods/getalkanes/address</Link>
            </div>
            <div style={responsiveStyles.methodItem}>
              <Link to="/api-methods/getalkanes/height" style={responsiveStyles.link}>/api-methods/getalkanes/height</Link>
            </div>
          </div>
        </div>
        
        {/* Right Column - Explorer */}
        <div style={responsiveStyles.column}>
          <h2 style={responsiveStyles.sectionTitle}>Explorer</h2>
          
          <div style={responsiveStyles.methodsList}>
            <div style={responsiveStyles.methodItem}>
              <Link to="/explorer/block" style={responsiveStyles.link}>/explorer/block</Link>
            </div>
            <div style={responsiveStyles.methodItem}>
              <Link to="/explorer/transaction" style={responsiveStyles.link}>/explorer/transaction</Link>
            </div>
            <div style={responsiveStyles.methodItem}>
              <Link to="/explorer/address" style={responsiveStyles.link}>/explorer/address</Link>
            </div>
            
            <div style={responsiveStyles.statusSection}>
              <h3 style={responsiveStyles.categoryTitle}>Network Status</h3>
              <p style={responsiveStyles.statusIndicator}>
                Current endpoint: <strong>{endpoint.toUpperCase()}</strong>
              </p>
              <p style={responsiveStyles.helpText}>
                You can change the endpoint using the selector in the header.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;