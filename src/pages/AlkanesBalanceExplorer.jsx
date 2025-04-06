import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useLaserEyes } from '@omnisat/lasereyes';
import { getAlkanesByAddress, getAlkanesTokenImage } from '../sdk/alkanes';

/**
 * AlkanesBalanceExplorer Component (98.css version)
 * 
 * Page for exploring Alkanes balances by address, styled with 98.css.
 * Allows users to view token balances using connected wallet or manual address entry
 */
const AlkanesBalanceExplorer = () => {
  const { endpoint = 'mainnet' } = useOutletContext() || {};
  const { connected, address: walletAddress } = useLaserEyes();
  
  const [address, setAddress] = useState(''); // Current address being searched
  const [manualAddress, setManualAddress] = useState(''); // User input field value
  const [alkanes, setAlkanes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tokenImages, setTokenImages] = useState({}); // Store fetched image URIs
  const [imageLoading, setImageLoading] = useState({}); // Track image loading state
  
  // Helper function to shorten addresses (optional, can remove if not used)
  const shortenAddress = (addr) => {
    if (!addr) return 'N/A';
    if (addr.length <= 9) return addr;
    return `${addr.substring(0, 4)}...${addr.substring(addr.length - 5)}`;
  };
  
  // Helper function to format AlkaneId (block:tx)
  const formatAlkaneId = (tokenId) => {
    if (!tokenId || !tokenId.block || !tokenId.tx) return 'N/A';
    return `${tokenId.block}:${tokenId.tx}`;
  };
  
  // Function to copy text to clipboard (simple version)
  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text)
      .then(() => {
        console.log('Address copied to clipboard'); // Simple console feedback
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
      });
  };
  
  // Memoize fetchBalances to avoid re-creating it on every render
  // unless endpoint or other dependencies change.
  const fetchBalances = useCallback(async (addrToFetch) => {
    setLoading(true);
    setError(null);
    setAlkanes([]); // Clear previous results

    try {
      const result = await getAlkanesByAddress(addrToFetch, endpoint);

      if (result.status === 'error') {
        throw new Error(result.message || 'Failed to fetch balances');
      }
      
      // Filter out any tokens without a valid tokenId before setting state
      const validAlkanes = (result.alkanes || []).filter(token => token.tokenId && token.tokenId.block && token.tokenId.tx);

      setAlkanes(validAlkanes);

    } catch (err) {
      console.error("Error in fetchBalances:", err); // Log the detailed error
      // Check if it's the specific SDK error
      if (err.message && err.message.includes('Error processing UTXO')) {
        setError(`Failed to process token data from the SDK. Please try again later or check the address. Details: ${err.message}`);
      } else {
        setError(err.message || 'An unknown error occurred while fetching balances.');
      }
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint]); // Re-create fetchBalances if endpoint changes

  // Effect to handle wallet connection changes
  useEffect(() => {
    if (connected && walletAddress) {
      setManualAddress(walletAddress); // Populate input field
      setAddress(walletAddress);       // Set address to fetch
      fetchBalances(walletAddress);
    } else {
      setError('Wallet not connected.');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps 
  }, [address, endpoint]); // Dependency on address and endpoint is correct

  // Fetch token images when alkanes are loaded
  useEffect(() => {
    if (alkanes.length > 0) {
      fetchTokenImages(alkanes);
    }
  }, [alkanes]);

  // Function to fetch token images (remains mostly the same)
  const fetchTokenImages = async (tokens) => {
    const newImageLoading = { ...imageLoading };
    for (const token of tokens) {
      // Ensure tokenId and its properties exist
      if (!token.tokenId || !token.tokenId.block || !token.tokenId.tx) {
        console.warn('Skipping token due to missing ID:', token);
        continue;
      }
      
      const cacheKey = `${endpoint}:${token.tokenId.tx}`;
      if (!tokenImages[cacheKey] && !newImageLoading[cacheKey]) { // Check loading state too
        try {
          newImageLoading[cacheKey] = true;
          setImageLoading(prev => ({ ...prev, [cacheKey]: true })); // Update loading state immutably
          
          const result = await getAlkanesTokenImage(token.tokenId, endpoint);
          
          if (result.status === "success" && result.imageUri) {
            setTokenImages(prev => ({
              ...prev,
              [cacheKey]: result.imageUri
            }));
          }
        } catch (error) {
          console.error(`Error fetching image for token ${token.name} on ${endpoint}:`, error);
        } finally {
          setImageLoading(prev => ({ ...prev, [cacheKey]: false })); // Update loading state immutably
        }
      }
    }
  };

  // Validate Bitcoin address (simple checks)
  const isValidBitcoinAddress = (addr) => {
    if (!addr) return false;
    // Basic checks for common address types (P2PKH, P2SH, Bech32)
    if (/^(1|3)[a-zA-HJ-NP-Z0-9]{25,34}$/.test(addr)) return true; // P2PKH, P2SH
    if (/^bc1[ac-hj-np-z02-9]{11,71}$/i.test(addr)) return true; // Bech32 (P2WPKH, P2WSH)
    if (/^tb1[ac-hj-np-z02-9]{11,71}$/i.test(addr)) return true; // Testnet Bech32
    // Add more checks if needed (e.g., Taproot - bc1p...)
    return false;
  };

  // Handle form submission for manual address
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!manualAddress) {
      setError('Please enter a Bitcoin address.');
      return;
    }
    if (!isValidBitcoinAddress(manualAddress)) {
      setError('Invalid Bitcoin address format.');
      return;
    }
    setAddress(manualAddress); // Set the address to fetch
    fetchBalances(manualAddress);
  };

  // Handle using connected wallet address
  const useConnectedWallet = () => {
    if (connected && walletAddress) {
      setManualAddress(walletAddress); // Populate input field
      setAddress(walletAddress);       // Set address to fetch
      fetchBalances(walletAddress);
    } else {
      setError('Wallet not connected.');
    }
  };

  return (
    // Add role="region" and aria-labelledby for context
    <div role="region" aria-labelledby="balance-explorer-title">
      <h2 id="balance-explorer-title">Alkanes Balance Explorer</h2>
      <p>Enter a Bitcoin address or use your connected wallet to view Alkanes token balances.</p>

      {/* Search Form Group Box */}
      <fieldset className="group-box" aria-labelledby="search-legend">
        <legend id="search-legend">Search Balances</legend>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '10px' }}>
            {/* Associate label and add aria-describedby for errors */}
            <label htmlFor="bitcoinAddress">Bitcoin Address:</label> 
            <input 
              type="text" 
              id="bitcoinAddress" 
              value={manualAddress} 
              onChange={(e) => setManualAddress(e.target.value)}
              placeholder="Enter Bitcoin address (e.g., bc1...)"
              style={{ width: '100%', marginTop: '3px' }}
              disabled={loading} 
              aria-required="true"
              aria-invalid={!!error} // Mark as invalid if there's an error related to input
              aria-describedby="address-error-message" // Link to potential error message
            />
          </div>
          
          <div style={{ marginTop: '10px' }}>
            <button type="submit" disabled={loading || !manualAddress} aria-busy={loading}>
              {loading ? 'Loading...' : 'Search by Address'}
            </button>
            {connected && (
              <button 
                type="button" 
                onClick={useConnectedWallet}
                disabled={loading}
                aria-busy={loading}
                style={{ marginLeft: '10px' }} // Add some space
              >
                Use Connected Wallet ({shortenAddress(walletAddress)})
              </button>
            )}
          </div>
        </form>
      </fieldset>
      
      {/* Results Group Box with ARIA live region */}
      <div 
        aria-live="polite"
        aria-busy={loading}
        role="region"
        aria-labelledby="results-legend" 
      >
        <fieldset className="group-box" style={{ marginTop: '20px' }}>
          <legend id="results-legend">Results {address ? `for ${shortenAddress(address)}` : ''}</legend>
          
          {/* Status Messages */}        
          {loading && (
            <p className="status-message">Loading balances...</p>
          )}
          
          {/* Link error message id to input's aria-describedby */}
          {error && (
            <div className="status-message error" id="address-error-message">
              <p>Error: {error}</p>
              <button onClick={() => fetchBalances(address)} disabled={!address || loading}>
                Retry
              </button>
            </div>
          )}
          
          {!loading && !error && !address && (
              <p className="status-message">Enter an address or connect wallet to search.</p>
          )}
          
          {!loading && !error && address && alkanes.length === 0 && (
            <p className="status-message">No Alkanes tokens found for this address.</p>
          )}
          
          {/* Results Table */}    
          {!loading && !error && alkanes.length > 0 && (() => {
            // Aggregate tokens by AlkaneId (handles potential duplicates from API)
            const aggregatedTokens = {};
            
            alkanes.forEach(token => {
              // Ensure tokenId and its properties exist
              if (!token.tokenId || !token.tokenId.block || !token.tokenId.tx) {
                console.warn('Skipping token due to missing ID:', token);
                return;
              }
              
              const id = formatAlkaneId(token.tokenId);
              if (!aggregatedTokens[id]) {
                aggregatedTokens[id] = {
                  tokenId: token.tokenId,
                  name: token.name,
                  symbol: token.symbol || '-',
                  // Store raw amount (integer)
                  rawAmount: 0
                };
              }
              // Add to the existing balance (raw value)
              aggregatedTokens[id].rawAmount += token.amount || 0;
            });
            
            // Convert to array for rendering and calculate display amount
            const tokenList = Object.values(aggregatedTokens).map(token => ({
              ...token,
              // Calculate display amount with 8 decimals
              amount: token.rawAmount / 100000000 
            }));
            
            return (
              <table>
                <thead>
                  {/* Add scope="col" to table headers */}                  
                  <tr>
                    <th scope="col">AlkaneId (Block:TX)</th>
                    <th scope="col">Symbol</th>
                    <th scope="col">Token Name</th>
                    <th scope="col">Balance</th>
                    {/* Add header for image if needed */}
                  </tr>
                </thead>
                <tbody>
                  {tokenList.map((token) => {
                    const idString = formatAlkaneId(token.tokenId);
                    const imageCacheKey = `${endpoint}:${token.tokenId.tx}`;
                    const isLoadingImage = imageLoading[imageCacheKey];
                    const imageUri = tokenImages[imageCacheKey];
                    
                    return (
                      <tr key={idString}>
                        <td title={`Block: ${token.tokenId.block}, TX: ${token.tokenId.tx}`}>
                          {idString}
                        </td>
                        <td>{token.symbol}</td>
                        <td>{token.name}</td>
                        <td>
                          {token.amount ? token.amount.toLocaleString(undefined, {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 8
                          }) : '0'}
                        </td>
                        {/* Optional: Display image if available */}
                        {/* 
                        <td>
                          {isLoadingImage ? 'Loading...' : 
                            imageUri ? <img src={imageUri} alt={token.name} style={{width: '32px', height: '32px'}} /> : 'No Image'
                          }
                        </td>
                        */}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            );
          })()}
        </fieldset>
      </div> 
    </div>
  );
};

export default AlkanesBalanceExplorer;