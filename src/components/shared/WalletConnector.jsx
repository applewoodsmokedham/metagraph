import React, { useState } from 'react';
import {
  useLaserEyes,
  UNISAT,
  LEATHER,
  MAGIC_EDEN,
  OKX,
  OYL,
  ORANGE,
  OP_NET,
  PHANTOM,
  SPARROW,
  WIZZ,
  XVERSE
} from '@omnisat/lasereyes';

/**
 * WalletConnector Component
 *
 * Provides wallet connection functionality using the LaserEyes package
 * Shows a list of supported wallets for the user to choose from
 * Follows the design guidelines for styling
 */
function WalletConnector() {
  const {
    connect,
    connected,
    hasLeather,
    hasMagicEden,
    hasOkx,
    hasOyl,
    hasOrange,
    hasOpNet,
    hasPhantom,
    hasUnisat,
    hasSparrow,
    hasWizz,
    hasXverse,
  } = useLaserEyes();

  const [showWalletList, setShowWalletList] = useState(false);

  // Define available wallets with their detection status
  const wallets = [
    { id: UNISAT, name: 'Unisat', available: hasUnisat },
    { id: LEATHER, name: 'Leather', available: hasLeather },
    { id: MAGIC_EDEN, name: 'Magic Eden', available: hasMagicEden },
    { id: OKX, name: 'OKX', available: hasOkx },
    { id: OYL, name: 'Oyl', available: hasOyl },
    { id: ORANGE, name: 'Orange', available: hasOrange },
    { id: OP_NET, name: 'OpNet', available: hasOpNet },
    { id: PHANTOM, name: 'Phantom', available: hasPhantom },
    { id: SPARROW, name: 'Sparrow', available: hasSparrow },
    { id: WIZZ, name: 'Wizz', available: hasWizz },
    { id: XVERSE, name: 'Xverse', available: hasXverse },
  ];

  // Styling according to design guidelines
  const styles = {
    container: {
      display: 'flex',
      alignItems: 'center',
      marginRight: '16px',
      position: 'relative',
    },
    button: {
      backgroundColor: '#FFFFFF',
      border: '1px solid #000000',
      color: '#000000',
      padding: '8px 12px',
      fontSize: '14px',
      fontFamily: 'Roboto Mono, monospace',
      cursor: 'pointer',
      fontWeight: 'bold',
    },
    connectedText: {
      fontSize: '14px',
      fontFamily: 'Roboto Mono, monospace',
      color: '#A7D', // Green for connected status
      fontWeight: 'bold',
    },
    walletList: {
      position: 'absolute',
      top: '100%',
      right: '0',
      backgroundColor: '#FFFFFF',
      border: '1px solid #000000',
      borderRadius: '4px',
      padding: '8px 0',
      marginTop: '4px',
      zIndex: 10,
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      minWidth: '180px',
    },
    walletItem: {
      padding: '8px 16px',
      fontSize: '14px',
      fontFamily: 'Roboto Mono, monospace',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    walletItemAvailable: {
      color: '#000000',
      fontWeight: 'bold',
    },
    walletItemUnavailable: {
      color: '#999999',
      fontStyle: 'italic',
    },
    availableBadge: {
      display: 'inline-block',
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      backgroundColor: '#A7D',
      marginLeft: '8px',
    },
    backdrop: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 5,
    }
  };

  const handleConnectClick = () => {
    setShowWalletList(true);
  };

  const handleWalletSelect = async (walletId) => {
    try {
      await connect(walletId);
      setShowWalletList(false);
    } catch (error) {
      console.error(`Failed to connect ${walletId} wallet:`, error);
    }
  };

  const handleClickOutside = () => {
    setShowWalletList(false);
  };

  return (
    <div style={styles.container}>
      {!connected ? (
        <>
          <button style={styles.button} onClick={handleConnectClick}>Connect Wallet</button>
          {showWalletList && (
            <>
              <div style={styles.backdrop} onClick={handleClickOutside}></div>
              <div style={styles.walletList}>
                {wallets.map((wallet) => (
                  <div
                    key={wallet.id}
                    style={{
                      ...styles.walletItem,
                      ...(wallet.available ? styles.walletItemAvailable : styles.walletItemUnavailable)
                    }}
                    onClick={() => wallet.available && handleWalletSelect(wallet.id)}
                  >
                    {wallet.name}
                    {wallet.available && <span style={styles.availableBadge}></span>}
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      ) : (
        <span style={styles.connectedText}>Connected</span>
      )}
    </div>
  );
}

export default WalletConnector;