import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useLaserEyes } from '@omnisat/lasereyes';
import { getAlkanesByAddress, getAlkanesTokenImage } from '../sdk/alkanes';

/**
 * AlkanesBalanceExplorer Component
 * 
 * Page for exploring Alkanes balances by address
 * Allows users to view token balances using connected wallet or manual address entry
 */
const AlkanesBalanceExplorer = () => {
  const { endpoint = 'mainnet' } = useOutletContext() || {};
  const { connected, address: walletAddress } = useLaserEyes();
  
  const [address, setAddress] = useState('');
  const [manualAddress, setManualAddress] = useState('');
  const [alkanes, setAlkanes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCopied, setShowCopied] = useState(false);
  const [tokenImages, setTokenImages] = useState({});
  const [imageLoading, setImageLoading] = useState({});
  
  // Helper function to shorten addresses
  const shortenAddress = (addr) => {
    if (!addr) return 'N/A';
    if (addr.length <= 9) return addr;
    return `${addr.substring(0, 4)}...${addr.substring(addr.length - 5)}`;
  };
  
  // Helper function to format AlkaneId
  const formatAlkaneId = (tokenId) => {
    if (!tokenId) return 'N/A';
    
    // Format as block:tx
    const blockPart = tokenId.block ? tokenId.block.substring(0, 6) : '------';
    const txPart = tokenId.tx ? tokenId.tx.substring(0, 6) : '------';
    
    return `${blockPart}:${txPart}`;
  };
  
  // Function to copy text to clipboard
  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text)
      .then(() => {
        setShowCopied(true);
        setTimeout(() => setShowCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
      });
  };
  
  // When wallet address changes and address is empty, update it
  useEffect(() => {
    if (connected && walletAddress && !address) {
      setAddress(walletAddress);
    }
  }, [connected, walletAddress, address]);
  
  // Fetch token images when alkanes are loaded
  useEffect(() => {
    if (alkanes.length > 0) {
      fetchTokenImages(alkanes);
    }
  }, [alkanes, endpoint]);
  
  // Function to fetch token images
  const fetchTokenImages = async (tokens) => {
    const newImageLoading = { ...imageLoading };
    
    // For each token with a tokenId, fetch its image if not already loaded
    for (const token of tokens) {
      if (token.tokenId && !tokenImages[token.tokenId.tx]) {
        try {
          // Set loading state for this token
          newImageLoading[token.tokenId.tx] = true;
          setImageLoading(newImageLoading);
          
          // Fetch the image
          const result = await getAlkanesTokenImage(token.tokenId, endpoint);
          
          // Update the image state
          if (result.status === "success" && result.imageUri) {
            setTokenImages(prev => ({
              ...prev,
              [token.tokenId.tx]: result.imageUri
            }));
          }
        } catch (error) {
          console.error(`Error fetching image for token ${token.name}:`, error);
        } finally {
          // Update loading state
          setImageLoading(prev => ({
            ...prev,
            [token.tokenId.tx]: false
          }));
        }
      }
    }
  };
  
  // Validate Bitcoin address (basic validation)
  const isValidBitcoinAddress = (addr) => {
    // Basic validation - check if it starts with valid prefixes
    return addr && (
      addr.startsWith('bc1') || 
      addr.startsWith('1') || 
      addr.startsWith('3') ||
      addr.startsWith('bcr') || //regtest
      addr.startsWith('tb1') || // testnet
      addr.startsWith('m') || // testnet
      addr.startsWith('n') || // testnet
      addr.startsWith('2') // testnet
    );
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset error state
    setError(null);
    
    // Validate address
    const addressToUse = manualAddress || address;
    if (!addressToUse) {
      setError("Please enter an address");
      return;
    }
    
    if (!isValidBitcoinAddress(addressToUse)) {
      setError("Please enter a valid Bitcoin address");
      return;
    }
    
    // Set loading state
    setLoading(true);
    
    try {
      // Fetch alkanes data
      const result = await getAlkanesByAddress(addressToUse, endpoint);
      
      if (result.status === "error") {
        throw new Error(result.message);
      }
      
      // Set data
      setAlkanes(result.alkanes || []);
      setAddress(addressToUse);
      setManualAddress('');
    } catch (err) {
      console.error("Error fetching Alkanes data:", err);
      setError(err.message || "Failed to fetch Alkanes data");
      setAlkanes([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle using connected wallet
  const useConnectedWallet = () => {
    if (connected && walletAddress) {
      setManualAddress('');
      setAddress(walletAddress);
    }
  };
  
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
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    },
    formRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      flexWrap: 'wrap',
    },
    label: {
      fontWeight: 'bold',
      marginBottom: '8px',
      display: 'block',
      fontFamily: 'Roboto Mono, monospace',
      fontSize: '14px',
    },
    input: {
      padding: '8px',
      border: '1px solid #E0E0E0',
      borderRadius: '4px',
      width: '100%',
      fontFamily: 'Roboto Mono, monospace',
      fontSize: '14px',
    },
    helpText: {
      fontSize: '12px',
      color: '#666666',
      marginTop: '4px',
      fontFamily: 'Roboto Mono, monospace',
    },
    warningText: {
      fontSize: '12px',
      color: '#FF9800',
      marginTop: '4px',
      fontFamily: 'Roboto Mono, monospace',
    },
    button: {
      backgroundColor: '#000000',
      color: '#FFFFFF',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '4px',
      cursor: 'pointer',
      fontFamily: 'Roboto Mono, monospace',
      fontSize: '14px',
      fontWeight: 'bold',
    },
    secondaryButton: {
      backgroundColor: '#FFFFFF',
      color: '#000000',
      border: '1px solid #000000',
      padding: '8px 16px',
      borderRadius: '4px',
      cursor: 'pointer',
      fontFamily: 'Roboto Mono, monospace',
      fontSize: '14px',
    },
    disabledButton: {
      backgroundColor: '#CCCCCC',
      color: '#666666',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '4px',
      cursor: 'not-allowed',
      fontFamily: 'Roboto Mono, monospace',
      fontSize: '14px',
    },
    addressDisplay: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      border: '1px solid #E0E0E0',
      padding: '8px',
      borderRadius: '4px',
      backgroundColor: '#F5F5F5',
    },
    copyButton: {
      backgroundColor: 'transparent',
      border: 'none',
      color: '#000000',
      cursor: 'pointer',
      padding: '2px 6px',
      fontSize: '12px',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    copiedPopup: {
      position: 'absolute',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      color: 'white',
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '12px',
      animation: 'fadeOut 2s forwards',
      zIndex: 10,
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      marginTop: '20px',
      fontFamily: 'Roboto Mono, monospace',
    },
    tableHead: {
      backgroundColor: '#F5F5F5',
      textAlign: 'left',
    },
    tableRow: {
      borderBottom: '1px solid #E0E0E0',
    },
    tableCell: {
      padding: '12px 8px',
      textAlign: 'left',
      fontSize: '14px',
    },
    tableHeaderCell: {
      padding: '12px 8px',
      fontWeight: 'bold',
      textAlign: 'left',
      fontSize: '14px',
    },
    loadingContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '40px 0',
    },
    spinner: {
      border: '4px solid #f3f3f3',
      borderTop: '4px solid #000000',
      borderRadius: '50%',
      width: '30px',
      height: '30px',
      animation: 'spin 1s linear infinite',
    },
    errorContainer: {
      padding: '16px',
      backgroundColor: '#FFEBEE',
      border: '1px solid #FFCDD2',
      borderRadius: '4px',
      marginTop: '20px',
    },
    errorMessage: {
      color: '#B71C1C',
      fontSize: '14px',
      fontFamily: 'Roboto Mono, monospace',
    },
    emptyStateContainer: {
      padding: '40px 16px',
      textAlign: 'center',
      backgroundColor: '#F5F5F5',
      borderRadius: '4px',
      marginTop: '20px',
    },
    emptyStateMessage: {
      color: '#666666',
      fontSize: '16px',
      fontFamily: 'Roboto Mono, monospace',
      marginBottom: '16px',
    },
    tokenImage: {
      width: '40px',
      height: '40px',
      objectFit: 'contain',
      borderRadius: '4px',
      backgroundColor: '#F5F5F5',
    },
    tokenImageContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '50px',
      height: '50px',
    },
    tokenImagePlaceholder: {
      width: '40px',
      height: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#F5F5F5',
      borderRadius: '4px',
      fontSize: '20px',
      color: '#666666',
    },
  };
  
  // Add CSS animations for fadeout and spinner
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes fadeOut {
        0% { opacity: 1; }
        70% { opacity: 1; }
        100% { opacity: 0; }
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  return (
    <div style={styles.container} className="container">
      <h2 style={styles.title}>Alkanes Balance Explorer</h2>
      <p style={styles.description}>
        Explore Alkanes balances across the {endpoint.toUpperCase()} network.
      </p>
      
      <div style={styles.section}>
        <form style={styles.form} onSubmit={handleSubmit}>
          <div>
            <label style={styles.label}>Bitcoin Address</label>
            
            {/* Show address if already set */}
            {address && (
              <div style={{...styles.addressDisplay, position: 'relative', marginBottom: '10px'}}>
                <span title={address}>{shortenAddress(address)}</span>
                <button 
                  style={styles.copyButton}
                  onClick={() => copyToClipboard(address)}
                  title="Copy full address"
                  type="button"
                >
                  📋
                </button>
                {showCopied && <div style={{...styles.copiedPopup, right: '30px'}}>Copied!</div>}
              </div>
            )}
            
            {/* Input for manual address entry */}
            <div style={styles.formRow}>
              <input
                type="text"
                style={styles.input}
                placeholder="Enter a Bitcoin address containing Alkanes"
                value={manualAddress}
                onChange={(e) => setManualAddress(e.target.value)}
                disabled={loading}
              />
              
              {/* Button to use connected wallet */}
              {connected && walletAddress && (
                <button
                  type="button"
                  style={styles.secondaryButton}
                  onClick={useConnectedWallet}
                  disabled={loading}
                >
                  Use Wallet
                </button>
              )}
              
              <button
                type="submit"
                style={loading ? styles.disabledButton : styles.button}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Search'}
              </button>
            </div>
            
            <p style={styles.warningText}>
              <i>⚠️ This should be a Taproot address that contains Alkanes tokens</i>
            </p>
          </div>
        </form>
      </div>
      
      {/* Results section */}
      <div style={styles.section}>
        <h3 style={styles.title}>Results</h3>
        
        {/* Show loading state */}
        {loading && (
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
          </div>
        )}
        
        {/* Show error state */}
        {error && (
          <div style={styles.errorContainer}>
            <p style={styles.errorMessage}>{error}</p>
            <button 
              style={{...styles.secondaryButton, marginTop: '10px'}}
              onClick={() => setError(null)}
            >
              Try Again
            </button>
          </div>
        )}
        
        {/* Show empty state */}
        {!loading && !error && alkanes.length === 0 && (
          <div style={styles.emptyStateContainer}>
            <p style={styles.emptyStateMessage}>No Alkanes tokens found for this address</p>
          </div>
        )}
        
        {/* Show results table */}
        {!loading && !error && alkanes.length > 0 && (
          <table style={styles.table}>
            <thead style={styles.tableHead}>
              <tr style={styles.tableRow}>
                <th style={styles.tableHeaderCell}>Image</th>
                <th style={styles.tableHeaderCell}>AlkaneId</th>
                <th style={styles.tableHeaderCell}>Token Name</th>
                <th style={styles.tableHeaderCell}>Symbol</th>
                <th style={styles.tableHeaderCell}>Balance</th>
              </tr>
            </thead>
            <tbody>
              {alkanes.map((token, index) => (
                <tr key={index} style={{
                  ...styles.tableRow,
                  backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#F5F5F5'
                }}>
                  <td style={styles.tableCell}>
                    <div style={styles.tokenImageContainer}>
                      {token.tokenId && tokenImages[token.tokenId.tx] ? (
                        <img
                          src={tokenImages[token.tokenId.tx]}
                          alt={`${token.name} icon`}
                          style={styles.tokenImage}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><rect width="40" height="40" fill="%23f5f5f5"/><text x="50%" y="50%" font-family="Arial" font-size="14" fill="%23666" text-anchor="middle" dominant-baseline="middle">?</text></svg>';
                          }}
                        />
                      ) : (
                        <div style={styles.tokenImagePlaceholder}>
                          {imageLoading[token.tokenId?.tx] ? '⌛' : '?'}
                        </div>
                      )}
                    </div>
                  </td>
                  <td style={styles.tableCell}>
                    <div style={{ position: 'relative' }}>
                      <span title={token.tokenId ? `Block: ${token.tokenId.block}, TX: ${token.tokenId.tx}` : 'No ID available'}>
                        {formatAlkaneId(token.tokenId)}
                      </span>
                      {token.tokenId && (
                        <button
                          style={{...styles.copyButton, marginLeft: '4px'}}
                          onClick={() => copyToClipboard(JSON.stringify(token.tokenId))}
                          title="Copy full AlkaneId"
                          type="button"
                        >
                          📋
                        </button>
                      )}
                    </div>
                  </td>
                  <td style={styles.tableCell}>{token.name}</td>
                  <td style={styles.tableCell}>{token.symbol || '-'}</td>
                  <td style={styles.tableCell}>
                    {token.amount ? token.amount.toLocaleString() : '0'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AlkanesBalanceExplorer;