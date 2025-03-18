import React from 'react';
import { useOutletContext } from 'react-router-dom';

/**
 * AlkanesTokensExplorer Component
 * 
 * Page for exploring all initialized Alkanes tokens
 */
const AlkanesTokensExplorer = () => {
  const { endpoint = 'mainnet' } = useOutletContext() || {};
  
  // CSS for inline styling according to design guidelines
  const styles = {
    container: {
      width: '100%',
      maxWidth: '900px',
      margin: '0 auto',
      backgroundColor: '#FFFFFF',
      padding: '20px',
      border: '1px solid #E0E0E0',
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      marginBottom: '16px',
      textAlign: 'left',
      fontFamily: 'Roboto Mono, monospace',
    },
    description: {
      fontSize: '14px',
      marginBottom: '20px',
      textAlign: 'left',
      fontFamily: 'Roboto Mono, monospace',
    },
    section: {
      marginBottom: '20px',
      padding: '20px',
      backgroundColor: '#FFFFFF',
      border: '1px solid #E0E0E0',
    }
  };
  
  return (
    <div style={styles.container} className="container">
      <h2 style={styles.title}>Alkanes Tokens Explorer</h2>
      <p style={styles.description}>
        Explore all initialized Alkanes tokens on the {endpoint.toUpperCase()} network.
      </p>
      
      <div style={styles.section}>
        <p>This page will display all initialized Alkanes tokens.</p>
      </div>
    </div>
  );
};

export default AlkanesTokensExplorer;