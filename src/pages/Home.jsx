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
  const { endpoint = 'local' } = useOutletContext() || {};
  
  // CSS for inline styling according to design guidelines
  const styles = {
    homePage: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      fontFamily: 'Roboto Mono, monospace',
      color: '#000000',
      backgroundColor: '#F5F5F5',
      padding: '16px',
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      marginBottom: '8px',
    },
    tagline: {
      fontSize: '18px',
      marginBottom: '16px',
    },
    description: {
      fontSize: '14px',
      marginBottom: '16px',
      maxWidth: '800px',
    },
    mainContent: {
      display: 'flex',
      flexDirection: 'row',
      gap: '20px',
      marginTop: '16px',
    },
    column: {
      flex: 1,
      padding: '16px',
      backgroundColor: '#FFFFFF',
    },
    sectionTitle: {
      fontSize: '24px',
      fontWeight: 'bold',
      marginBottom: '16px',
      textAlign: 'left',
    },
    sectionDescription: {
      fontSize: '14px',
      marginBottom: '16px',
      textAlign: 'left',
    },
    methodsList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '5px',
      textAlign: 'left',
    },
    methodItem: {
      marginBottom: '16px',
    },
    methodTitle: {
      fontSize: '18px',
      marginBottom: '5px',
    },
    methodDescription: {
      fontSize: '14px',
      marginBottom: '5px',
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
      mainContent: {
        flexDirection: 'column',
      }
    }
  };

  // Helper function to apply responsive styles
  const applyResponsiveStyles = (baseStyles) => {
    if (window.innerWidth <= 768) {
      return {
        ...baseStyles,
        mainContent: {
          ...baseStyles.mainContent,
          flexDirection: 'column',
        },
        column: {
          ...baseStyles.column,
          marginBottom: '16px',
        },
        title: {
          ...baseStyles.title,
          fontSize: '18px',
        },
        sectionTitle: {
          ...baseStyles.sectionTitle,
          fontSize: '18px',
        },
      };
    }
    return baseStyles;
  };

  // Apply responsive styles
  const responsiveStyles = applyResponsiveStyles(styles);
  
  return (
    <div style={responsiveStyles.homePage}>
      <section>
        <h1 style={responsiveStyles.title}>METHANE</h1>
        <p style={responsiveStyles.tagline}>Method Exploration, Testing, and Analysis eNvironment</p>
        <p style={responsiveStyles.description}>
          A development tool for exploring and testing API methods in the Oyl ecosystem.
        </p>
      </section>
      
      <div style={responsiveStyles.mainContent}>
        {/* Left Column - Playground */}
        <div style={responsiveStyles.column}>
          <h2 style={responsiveStyles.sectionTitle}>Playground</h2>
          <p style={responsiveStyles.sectionDescription}>Select a method to test:</p>
          
          <div style={responsiveStyles.methodsList}>
            <div style={responsiveStyles.methodItem}>
              <h3 style={responsiveStyles.methodTitle}>Trace Transaction</h3>
              <p style={responsiveStyles.methodDescription}>Get a detailed execution trace of a transaction, showing each step of contract execution.</p>
              <Link to="/api-methods/trace" style={responsiveStyles.link}>View Method</Link>
            </div>
            
            <div style={responsiveStyles.methodItem}>
              <h3 style={responsiveStyles.methodTitle}>Trace Block Status</h3>
              <p style={responsiveStyles.methodDescription}>Trace all transactions in a block with detailed status information.</p>
              <Link to="/api-methods/traceblockstatus" style={responsiveStyles.link}>View Method</Link>
            </div>
            
            <div style={responsiveStyles.methodItem}>
              <h3 style={responsiveStyles.methodTitle}>Simulate Transaction</h3>
              <p style={responsiveStyles.methodDescription}>Simulate executing a transaction without broadcasting it.</p>
              <Link to="/api-methods/simulate" style={responsiveStyles.link}>View Method</Link>
            </div>
          </div>
        </div>
        
        {/* Right Column - Explorer */}
        <div style={responsiveStyles.column}>
          <h2 style={responsiveStyles.sectionTitle}>Explorer</h2>
          <p style={responsiveStyles.sectionDescription}>View and analyze blockchain data</p>
          
          <div style={responsiveStyles.methodsList}>
            <div style={responsiveStyles.methodItem}>
              {/* Direct to trace block status since explorer route isn't defined */}
              <Link to="/api-methods/traceblockstatus" style={responsiveStyles.link}>Try Block Explorer</Link>
            </div>
            
            <div style={responsiveStyles.statusSection}>
              <h3 style={responsiveStyles.methodTitle}>Network Status</h3>
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