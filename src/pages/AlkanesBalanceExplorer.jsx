import React from 'react';
import { useOutletContext } from 'react-router-dom';

/**
 * AlkanesBalanceExplorer Component
 * 
 * Page for exploring Alkanes balances
 */
const AlkanesBalanceExplorer = () => {
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
    title: {
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
    contentSection: {
      marginTop: '20px',
      padding: '16px',
      backgroundColor: '#FFFFFF',
      border: '1px solid #cccccc',
    }
  };
  
  return (
    <div style={styles.container} className="container">
      <h2 style={styles.title}>Alkanes Balance Explorer</h2>
      <p style={styles.description}>
        Explore Alkanes balances across the {endpoint.toUpperCase()} network.
      </p>
      
      <div style={styles.contentSection}>
        <p>This page is under development.</p>
      </div>
    </div>
  );
};

export default AlkanesBalanceExplorer;