import React, { useState, useEffect } from 'react';
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
  // Helper function to shorten addresses
  const shortenAddress = (address) => {
    if (!address) return 'N/A';
    if (address.length <= 9) return address;
    return `${address.substring(0, 4)}...${address.substring(address.length - 5)}`;
  };
  
  // Function to copy text to clipboard
  const copyToClipboard = (text, type) => {
    if (!text) return;
    navigator.clipboard.writeText(text)
      .then(() => {
        // Show the copied notification
        setCopiedType(type);
        // Hide the notification after 2 seconds
        setTimeout(() => setCopiedType(null), 2000);
        console.log('Copied to clipboard:', text);
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
      });
  };
  
  const {
    connect,
    disconnect,
    connected,
    isConnecting,
    address,
    paymentAddress,
    publicKey,
    paymentPublicKey,
    balance,
    provider,
    network,
    accounts,
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
  const [showWalletInfo, setShowWalletInfo] = useState(false);
  const [copiedType, setCopiedType] = useState(null); // To track which address was copied

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
      color: '#000000', // Black color to match app style
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
    },
    walletInfo: {
      backgroundColor: '#F5F5F5',
      border: '1px solid #000000',
      borderRadius: '4px',
      padding: '12px',
      fontSize: '12px',
      fontFamily: 'Roboto Mono, monospace',
      position: 'absolute',
      top: '100%',
      right: '0',
      marginTop: '10px',
      zIndex: 10,
      minWidth: '300px',
      maxWidth: '400px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    infoRow: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '6px',
      wordBreak: 'break-all',
    },
    infoLabel: {
      fontWeight: 'bold',
      marginRight: '10px',
    },
    infoValue: {
      maxWidth: '250px',
      textAlign: 'right',
    },
    disconnectButton: {
      backgroundColor: '#FFFFFF',
      border: '1px solid #000000',
      color: '#000000',
      padding: '6px 10px',
      fontSize: '12px',
      fontFamily: 'Roboto Mono, monospace',
      cursor: 'pointer',
      fontWeight: 'bold',
      marginTop: '10px',
      width: '100%',
    },
    copyButton: {
      backgroundColor: 'transparent',
      border: 'none',
      color: '#000000',
      cursor: 'pointer',
      padding: '2px 6px',
      fontSize: '12px',
      marginLeft: '5px',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    addressContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
    copiedMessage: {
      position: 'absolute',
      right: '40px',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      color: 'white',
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '12px',
      animation: 'fadeOut 2s forwards',
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
    setShowWalletInfo(false);
  };

  const toggleWalletInfo = () => {
    setShowWalletInfo(!showWalletInfo);
  };

  // Add CSS animation for fadeout
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes fadeOut {
        0% { opacity: 1; }
        70% { opacity: 1; }
        100% { opacity: 0; }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

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
        <>
          <span
            style={{...styles.connectedText, cursor: 'pointer'}}
            onClick={toggleWalletInfo}
          >
            Connected {showWalletInfo ? '▲' : '▼'}
          </span>
          {showWalletInfo && (
            <>
              <div style={styles.backdrop} onClick={handleClickOutside}></div>
              <div style={styles.walletInfo}>
                {copiedType && <div style={styles.copiedMessage}>Copied!</div>}
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Taproot:</span>
                  <div style={styles.addressContainer}>
                    <span style={styles.infoValue} title={address}>{shortenAddress(address)}</span>
                    {address && (
                      <button
                        style={styles.copyButton}
                        onClick={() => copyToClipboard(address, 'address')}
                        title="Copy full address"
                      >
                        📋
                      </button>
                    )}
                  </div>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Native Segwit:</span>
                  <div style={styles.addressContainer}>
                    <span style={styles.infoValue} title={paymentAddress}>{shortenAddress(paymentAddress)}</span>
                    {paymentAddress && (
                      <button
                        style={styles.copyButton}
                        onClick={() => copyToClipboard(paymentAddress, 'paymentAddress')}
                        title="Copy full payment address"
                      >
                        📋
                      </button>
                    )}
                  </div>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Balance:</span>
                  <span style={styles.infoValue}>{balance !== undefined ? `${Number(balance)} satoshis` : 'Loading...'}</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Network:</span>
                  <span style={styles.infoValue}>{network || 'N/A'}</span>
                </div>
                <button style={styles.disconnectButton} onClick={disconnect}>
                  Disconnect
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default WalletConnector;