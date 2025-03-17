import React from 'react';
import { useLaserEyes } from '@omnisat/lasereyes';

/**
 * Example component demonstrating how to use LaserEyes functionality
 * This component shows how to access wallet information and functionality
 * in other components of the application
 */
function WalletExample() {
  const {
    connected,
    address,
    balance,
    sendBTC,
    sign,
    signPsbt,
  } = useLaserEyes();

  // Styling according to design guidelines
  const styles = {
    container: {
      fontFamily: 'Roboto Mono, monospace',
      color: '#000000',
      backgroundColor: '#FFFFFF',
      padding: '16px',
      border: '1px solid #cccccc',
      maxWidth: '600px',
      margin: '0 auto',
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      marginBottom: '16px',
      textAlign: 'left',
    },
    infoItem: {
      marginBottom: '8px',
      fontSize: '14px',
    },
    address: {
      color: '#0000FF',
      fontWeight: 'bold',
    },
    notConnected: {
      color: '#4A4A4A',
      fontStyle: 'italic',
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Wallet Information Example</h2>
      
      {connected ? (
        <div>
          <div style={styles.infoItem}>
            <strong>Connected Address:</strong> <span style={styles.address}>{address}</span>
          </div>
          <div style={styles.infoItem}>
            <strong>Balance:</strong> {balance} sats
          </div>
          <p>
            This component demonstrates how to access wallet information using the useLaserEyes hook.
            You can use this pattern in any component that needs access to wallet functionality.
          </p>
        </div>
      ) : (
        <p style={styles.notConnected}>
          Please connect your wallet from the header to see your wallet information.
        </p>
      )}
    </div>
  );
}

export default WalletExample;