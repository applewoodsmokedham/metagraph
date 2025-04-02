import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useLaserEyes } from '@omnisat/lasereyes';
import {
  getAddressInfo,
  getAddressTransactionsChain,
  getTransactionInfo,
  getAddressTransactionsWithTrace
} from '../sdk/esplora';
import { traceTransaction } from '../sdk/alkanes';

/**
 * BitcoinAddressExplorer Component
 * 
 * Page for exploring Bitcoin address transactions with trace functionality
 * Allows users to view transactions and trace them
 */
const BitcoinAddressExplorer = () => {
  const { endpoint = 'mainnet' } = useOutletContext() || {};
  const { connected, address: walletAddress } = useLaserEyes();
  
  const [address, setAddress] = useState('');
  const [manualAddress, setManualAddress] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedTxid, setExpandedTxid] = useState(null);
  const [traceResults, setTraceResults] = useState({});
  const [traceLoading, setTraceLoading] = useState({});
  const [activeVout, setActiveVout] = useState(4);
  const [activeView, setActiveView] = useState('digested');
  const [activeTab, setActiveTab] = useState('general');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [pageLoading, setPageLoading] = useState(false);
  const [lastSeenTxid, setLastSeenTxid] = useState(null);
  const transactionsPerPage = 10;
  
  // Helper function to shorten txids
  const shortenTxid = (txid) => {
    if (!txid) return 'N/A';
    if (txid.length <= 13) return txid;
    return `${txid.substring(0, 6)}...${txid.substring(txid.length - 6)}`;
  };
  
  // Function to copy text to clipboard
  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text)
      .then(() => {
        console.log('Copied to clipboard:', text);
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
      });
  };
  
  // Reset component state when endpoint/network changes
  useEffect(() => {
    // Reset the state to prevent issues when switching networks
    setTransactions([]);
    setTraceResults({});
    setTraceLoading({});
    setError(null);
    setPage(1);
    setTotalPages(1);
    
    console.log(`Network switched to ${endpoint}`);
  }, [endpoint]);
  
  // Only populate the address field when both wallet connects and no address is already entered
  useEffect(() => {
    if (connected && walletAddress && !address && !manualAddress) {
      // Only set the wallet address when both address and manualAddress are empty
      // This prevents overriding any user input
      setAddress(walletAddress);
    }
  }, [connected, walletAddress, address, manualAddress]);
  
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
    
    // Reset all states before making a new request
    setError(null);
    setTraceResults({});
    setTraceLoading({});
    setPage(1);
    
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
    setTransactions([]); // Clear previous results
    
    try {
      console.log(`Searching for transactions on network ${endpoint} for address ${addressToUse}`);
      
      // First get the address info to get the total transaction count
      const addressInfoResult = await getAddressInfo(addressToUse, endpoint);
      
      if (addressInfoResult.status === "error") {
        throw new Error(addressInfoResult.message);
      }
      
      // Fetch first page of transactions with cursor-based pagination
      const result = await getAddressTransactionsChain(
        addressToUse,
        endpoint,
        null // null for first page
      );
      
      if (result.status === "error") {
        throw new Error(result.message);
      }
      
      // Set data
      const txs = result.transactions || [];
      setTransactions(txs);
      setAddress(addressToUse);
      
      // Set pagination data
      const totalTxCount = addressInfoResult.totalTxCount;
      setTotalTransactions(totalTxCount);
      setTotalPages(Math.max(1, Math.ceil(totalTxCount / transactionsPerPage)));
      
      // Store the last seen txid for pagination
      if (txs.length > 0) {
        setLastSeenTxid(txs[txs.length - 1].txid);
      }
      
      console.log(`Total transactions: ${totalTxCount}, Pages: ${Math.ceil(totalTxCount / transactionsPerPage)}`);
      
    } catch (err) {
      console.error("Error fetching transactions data:", err);
      setError(err.message || "Failed to fetch transactions data");
      setTransactions([]);
      setTotalTransactions(0);
      setTotalPages(1);
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
  
  // Handle tracing a transaction
  const handleTraceTransaction = async (txid) => {
    if (traceLoading[txid]) return;
    
    setTraceLoading(prev => ({ ...prev, [txid]: true }));
    
    try {
      // Trace both vout 4 and vout 5
      const result4 = await traceTransaction(txid, 4, endpoint);
      const result5 = await traceTransaction(txid, 5, endpoint);
      
      setTraceResults(prev => ({
        ...prev,
        [txid]: {
          vout4: result4,
          vout5: result5
        }
      }));
      
      // Expand the transaction to show trace results
      setExpandedTxid(txid);
      // Set default active vout and view
      setActiveVout(4);
      setActiveView('digested');
    } catch (error) {
      console.error(`Error tracing transaction ${txid}:`, error);
      setTraceResults(prev => ({
        ...prev,
        [txid]: { status: "error", message: error.message }
      }));
    } finally {
      setTraceLoading(prev => ({ ...prev, [txid]: false }));
    }
  };
  
  // Function to fetch transactions for a specific page
  const fetchTransactionsPage = async (pageNumber) => {
    if (!address) return;
    
    setPageLoading(true);
    
    try {
      // For page 1, we don't need a lastSeenTxid
      if (pageNumber === 1) {
        // Get address info first to get total transaction count
        const addressInfoResult = await getAddressInfo(address, endpoint);
        
        if (addressInfoResult.status === "error") {
          throw new Error(addressInfoResult.message);
        }
        
        // Fetch first page of transactions
        const result = await getAddressTransactionsChain(
          address,
          endpoint,
          null // null for first page
        );
        
        if (result.status === "error") {
          throw new Error(result.message);
        }
        
        // Update transactions
        const txs = result.transactions || [];
        setTransactions(txs);
        
        // Update pagination data
        setTotalTransactions(addressInfoResult.totalTxCount);
        
        // Store the last seen txid for pagination
        if (txs.length > 0) {
          setLastSeenTxid(txs[txs.length - 1].txid);
        }
      } else {
        // For pages > 1, we need to implement a different approach
        // since we're using cursor-based pagination
        
        // This is a simplified implementation - in a real app, you would
        // need to keep track of the lastSeenTxid for each page
        
        // For now, we'll just fetch the first page and then fetch additional
        // pages one by one until we reach the requested page
        
        let currentPage = 1;
        let currentLastSeenTxid = null;
        let currentTxs = [];
        
        while (currentPage < pageNumber) {
          const result = await getAddressTransactionsChain(
            address,
            endpoint,
            currentLastSeenTxid
          );
          
          if (result.status === "error" || !result.transactions || !result.transactions.length) {
            break;
          }
          
          currentTxs = result.transactions;
          currentLastSeenTxid = result.pagination.lastSeenTxid;
          currentPage++;
        }
        
        // Now fetch the actual page we want
        const result = await getAddressTransactionsChain(
          address,
          endpoint,
          currentLastSeenTxid
        );
        
        if (result.status === "error") {
          throw new Error(result.message);
        }
        
        // Update transactions
        const txs = result.transactions || [];
        setTransactions(txs);
        
        // Store the last seen txid for pagination
        if (txs.length > 0) {
          setLastSeenTxid(txs[txs.length - 1].txid);
        }
      }
      
      // Scroll to top of results
      window.scrollTo(0, 0);
      
    } catch (err) {
      console.error(`Error fetching page ${pageNumber}:`, err);
      setError(`Failed to fetch page ${pageNumber}: ${err.message || "Unknown error"}`);
    } finally {
      setPageLoading(false);
    }
  };
  
  // Handle pagination
  const handlePreviousPage = () => {
    if (page > 1) {
      const newPage = page - 1;
      setPage(newPage);
      fetchTransactionsPage(newPage);
    }
  };
  
  const handleNextPage = () => {
    if (page < totalPages) {
      const newPage = page + 1;
      setPage(newPage);
      fetchTransactionsPage(newPage);
    }
  };
  
  // Get current page transactions - now just returns the current transactions state
  // since we're fetching each page from the server
  const getCurrentPageTransactions = () => {
    return transactions;
  };
  
  // Format date from timestamp
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Helper function to convert hex to decimal
  const hexToDec = (hexString) => {
    if (!hexString || typeof hexString !== 'string') return 'N/A';
    // Remove '0x' prefix if present
    const cleanHex = hexString.startsWith('0x') ? hexString.slice(2) : hexString;
    try {
      return BigInt(`0x${cleanHex}`).toString(10);
    } catch (error) {
      console.error("Error converting hex to decimal:", error);
      return hexString; // Return original if conversion fails
    }
  };

  // Create a digested view of the trace results
  const createDigestedView = (traceResult) => {
    if (!traceResult || traceResult.status === "error") {
      return { error: traceResult?.message || "Failed to process trace results" };
    }

    try {
      // Extract key information from the trace result
      const digestedData = {
        status: traceResult.status,
        txid: traceResult.txid,
        summary: {}
      };

      // Process the result array to extract meaningful data
      if (traceResult.result && Array.isArray(traceResult.result)) {
        // Find invoke event
        const invokeEvent = traceResult.result.find(event => event.event === "invoke");
        if (invokeEvent && invokeEvent.data) {
          // Convert fuel from hex to decimal
          const fuelHex = invokeEvent.data.fuel;
          const fuelDec = typeof fuelHex === 'number' ? fuelHex : hexToDec(fuelHex);
          
          // Convert inputs from hex to decimal
          const inputsArray = invokeEvent.data.context?.inputs || [];
          const convertedInputs = inputsArray.map(input => hexToDec(input));
          
          digestedData.summary.invoke = {
            type: invokeEvent.data.type,
            vout: invokeEvent.data.context?.vout,
            fuel: fuelDec,
            inputs: convertedInputs
          };
        }

        // Find return event
        const returnEvent = traceResult.result.find(event => event.event === "return");
        if (returnEvent && returnEvent.data) {
          const returnStatus = returnEvent.data.status;
          
          digestedData.summary.return = {
            status: returnStatus,
            statusColor: returnStatus === "success" ? "#4CAF50" : "#F44336" // Green for success, red for revert
          };

          // Extract alkanes if available
          if (returnEvent.data.response?.alkanes) {
            digestedData.summary.alkanes = returnEvent.data.response.alkanes.map(alkane => {
              // Convert block and tx from hex to decimal
              const blockDec = hexToDec(alkane.id?.block);
              const txDec = hexToDec(alkane.id?.tx);
              const valueDec = hexToDec(alkane.value);
              
              return {
                alkaneId: `[${blockDec}, ${txDec}]`,
                value: valueDec
              };
            });
          }

          // Extract storage if available
          if (returnEvent.data.response?.storage) {
            digestedData.summary.storage = returnEvent.data.response.storage.map(item => {
              // Parse key and value
              const keyString = item.key;
              const valueDec = hexToDec(item.value);
              
              // Special handling for /totalsupply - divide by 10^8
              if (keyString === '/totalsupply') {
                try {
                  const bigIntValue = BigInt(valueDec);
                  const divisor = BigInt(10 ** 8);
                  const result = Number(bigIntValue) / Number(divisor);
                  return {
                    key: keyString,
                    value: result.toString()
                  };
                } catch (e) {
                  console.error("Error processing /totalsupply:", e);
                  return {
                    key: keyString,
                    value: valueDec
                  };
                }
              }
              
              return {
                key: keyString,
                value: valueDec
              };
            });
          }

          // Extract data if available
          if (returnEvent.data.response?.data) {
            digestedData.summary.data = returnEvent.data.response.data;
          }
        }
      }

      return digestedData;
    } catch (error) {
      console.error("Error creating digested view:", error);
      return { error: "Failed to process trace results" };
    }
  };
  
  // CSS for inline styling according to design guidelines
  const styles = {
    container: {
      width: '100%',
      maxWidth: '1200px',
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
    paginationContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '16px',
      marginTop: '20px',
    },
    paginationText: {
      fontFamily: 'Roboto Mono, monospace',
      fontSize: '14px',
    },
    expandableSection: {
      backgroundColor: '#F5F5F5',
      padding: '16px',
      marginTop: '8px',
      borderRadius: '4px',
      overflow: 'auto',
      maxHeight: '400px',
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
    txidContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    actionButton: {
      backgroundColor: '#000000',
      color: '#FFFFFF',
      border: 'none',
      padding: '4px 8px',
      borderRadius: '4px',
      cursor: 'pointer',
      fontFamily: 'Roboto Mono, monospace',
      fontSize: '12px',
      marginRight: '4px',
    },
    viewButton: {
      backgroundColor: '#FFFFFF',
      color: '#000000',
      border: '1px solid #000000',
      padding: '4px 8px',
      borderRadius: '4px',
      cursor: 'pointer',
      fontFamily: 'Roboto Mono, monospace',
      fontSize: '12px',
      textDecoration: 'none',
      display: 'inline-block',
    },
    tabContainer: {
      display: 'flex',
      marginBottom: '10px',
      borderBottom: '1px solid #E0E0E0',
    },
    tab: {
      padding: '8px 16px',
      cursor: 'pointer',
      fontFamily: 'Roboto Mono, monospace',
      fontSize: '14px',
      backgroundColor: '#F5F5F5',
      border: '1px solid #E0E0E0',
      borderBottom: 'none',
      marginRight: '4px',
      borderTopLeftRadius: '4px',
      borderTopRightRadius: '4px',
    },
    activeTab: {
      backgroundColor: '#FFFFFF',
      borderBottom: '1px solid #FFFFFF',
      marginBottom: '-1px',
      fontWeight: 'bold',
    },
  };
  
  // Add CSS animations for spinner
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
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
      <h2 style={styles.title}>Address Transaction Explorer</h2>
      <p style={styles.description}>
        Explore transactions for an address across the {endpoint.toUpperCase()} network.
      </p>
      
      <div style={styles.section}>
        <form style={styles.form} onSubmit={handleSubmit}>
          <div>
            <label style={styles.label}>Address</label>
            
            <div style={styles.formRow}>
              <input
                type="text"
                style={styles.input}
                placeholder="Enter an address"
                value={manualAddress}
                onChange={(e) => setManualAddress(e.target.value)}
                disabled={loading}
              />
              
              {connected && (
                <button
                  type="button"
                  style={styles.secondaryButton}
                  onClick={useConnectedWallet}
                  disabled={loading || !walletAddress}
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
        {!loading && !error && transactions.length === 0 && (
          <div style={styles.emptyStateContainer}>
            <p style={styles.emptyStateMessage}>No transactions found for this address</p>
          </div>
        )}
        
        {/* Show results table */}
        {!loading && !error && transactions.length > 0 && (
          <>
            <table style={styles.table}>
              <thead style={styles.tableHead}>
                <tr style={styles.tableRow}>
                  <th style={styles.tableHeaderCell}>Transaction ID</th>
                  <th style={styles.tableHeaderCell}>Block Height</th>
                  <th style={styles.tableHeaderCell}>Time</th>
                  <th style={styles.tableHeaderCell}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {getCurrentPageTransactions().map((tx, index) => (
                  <React.Fragment key={tx.txid}>
                    <tr style={{
                      ...styles.tableRow,
                      backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#F5F5F5'
                    }}>
                      <td style={styles.tableCell}>
                        <div style={styles.txidContainer}>
                          {shortenTxid(tx.txid)}
                          <button 
                            style={styles.copyButton}
                            onClick={() => copyToClipboard(tx.txid)}
                            title="Copy TXID"
                          >
                            📋
                          </button>
                        </div>
                      </td>
                      <td style={styles.tableCell}>
                        {tx.status && tx.status.block_height ? tx.status.block_height : 'Unconfirmed'}
                      </td>
                      <td style={styles.tableCell}>
                        {tx.status && tx.status.block_time ? formatDate(tx.status.block_time) : 'Pending'}
                      </td>
                      <td style={styles.tableCell}>
                        <button
                          style={styles.actionButton}
                          onClick={() => handleTraceTransaction(tx.txid)}
                          disabled={traceLoading[tx.txid]}
                        >
                          {traceLoading[tx.txid] ? 'Tracing...' : 'Trace'}
                        </button>
                        <a
                          href={`https://mempool.space/${endpoint === 'mainnet' ? '' : endpoint + '/'}tx/${tx.txid}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={styles.viewButton}
                        >
                          View
                        </a>
                      </td>
                    </tr>
                    {expandedTxid === tx.txid && traceResults[tx.txid] && (
                      <tr>
                        <td colSpan="4" style={{ padding: 0 }}>
                          <div style={styles.expandableSection}>
                            <h4 style={{ margin: '0 0 10px 0', fontFamily: 'Roboto Mono, monospace' }}>
                              Trace Results
                            </h4>
                            
                            {/* View Type Tabs */}
                            <div style={styles.tabContainer}>
                              <div
                                style={{
                                  ...styles.tab,
                                  ...(activeView === 'digested' ? styles.activeTab : {})
                                }}
                                onClick={() => setActiveView('digested')}
                              >
                                Digested View
                              </div>
                              <div
                                style={{
                                  ...styles.tab,
                                  ...(activeView === 'raw' ? styles.activeTab : {})
                                }}
                                onClick={() => setActiveView('raw')}
                              >
                                Raw View
                              </div>
                            </div>
                            
                            {/* Vout Tabs - Show for both views */}
                            <div style={styles.tabContainer}>
                              <div
                                style={{
                                  ...styles.tab,
                                  ...(activeVout === 4 ? styles.activeTab : {})
                                }}
                                onClick={() => setActiveVout(4)}
                              >
                                Vout 4
                              </div>
                              <div
                                style={{
                                  ...styles.tab,
                                  ...(activeVout === 5 ? styles.activeTab : {})
                                }}
                                onClick={() => setActiveVout(5)}
                              >
                                Vout 5
                              </div>
                            </div>
                            
                            {/* Content based on active view and vout */}
                            {activeView === 'digested' ? (
                              // Digested View
                              <div>
                                {traceResults[tx.txid].status === "error" ? (
                                  <div style={{ color: '#B71C1C' }}>
                                    Error: {traceResults[tx.txid].message}
                                  </div>
                                ) : (
                                  <div>
                                    {/* Get the appropriate vout data based on activeVout */}
                                    {(() => {
                                      const voutData = activeVout === 4
                                        ? traceResults[tx.txid].vout4
                                        : traceResults[tx.txid].vout5;
                                      
                                      const digestedData = createDigestedView(voutData);
                                      
                                      if (digestedData.error) {
                                        return (
                                          <div style={{ color: '#B71C1C' }}>
                                            Error: {digestedData.error}
                                          </div>
                                        );
                                      }
                                      
                                      // Check if we have data for each tab
                                      const hasInputs = digestedData.summary.invoke?.inputs && digestedData.summary.invoke.inputs.length > 0;
                                      const hasAlkanes = digestedData.summary.alkanes && digestedData.summary.alkanes.length > 0;
                                      const hasStorage = digestedData.summary.storage && digestedData.summary.storage.length > 0;
                                      
                                      return (
                                        <div style={{ fontFamily: 'Roboto Mono, monospace' }}>
                                          {/* Content Tabs */}
                                          <div style={styles.tabContainer}>
                                            <div
                                              style={{
                                                ...styles.tab,
                                                ...(activeTab === 'general' ? styles.activeTab : {})
                                              }}
                                              onClick={() => setActiveTab('general')}
                                            >
                                              General
                                            </div>
                                            {hasInputs && (
                                              <div
                                                style={{
                                                  ...styles.tab,
                                                  ...(activeTab === 'inputs' ? styles.activeTab : {})
                                                }}
                                                onClick={() => setActiveTab('inputs')}
                                              >
                                                Inputs
                                              </div>
                                            )}
                                            {hasAlkanes && (
                                              <div
                                                style={{
                                                  ...styles.tab,
                                                  ...(activeTab === 'alkanes' ? styles.activeTab : {})
                                                }}
                                                onClick={() => setActiveTab('alkanes')}
                                              >
                                                Alkanes
                                              </div>
                                            )}
                                            {hasStorage && (
                                              <div
                                                style={{
                                                  ...styles.tab,
                                                  ...(activeTab === 'storage' ? styles.activeTab : {})
                                                }}
                                                onClick={() => setActiveTab('storage')}
                                              >
                                                Storage
                                              </div>
                                            )}
                                          </div>
                                          
                                          {/* General Tab Content */}
                                          {activeTab === 'general' && (
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
                                              {/* Transaction Status */}
                                              <div style={{ flex: '1 0 45%', minWidth: '200px' }}>
                                                <h5 style={{ marginBottom: '5px' }}>Transaction Status</h5>
                                                <div style={{
                                                  display: 'inline-block',
                                                  padding: '4px 8px',
                                                  backgroundColor: digestedData.summary.return?.statusColor || '#F5F5F5',
                                                  color: '#FFFFFF',
                                                  borderRadius: '4px',
                                                  fontWeight: 'bold'
                                                }}>
                                                  {digestedData.summary.return?.status || 'Unknown'}
                                                </div>
                                              </div>
                                              
                                              {/* Fuel Information */}
                                              {digestedData.summary.invoke?.fuel && (
                                                <div style={{ flex: '1 0 45%', minWidth: '200px' }}>
                                                  <h5 style={{ marginBottom: '5px' }}>Fuel</h5>
                                                  <div>
                                                    <span style={{ fontWeight: 'bold' }}>Value: </span>
                                                    {digestedData.summary.invoke.fuel}
                                                  </div>
                                                </div>
                                              )}
                                              
                                              {/* Data */}
                                              {digestedData.summary.data && (
                                                <div style={{ flex: '1 0 100%' }}>
                                                  <h5 style={{ marginBottom: '5px' }}>Data</h5>
                                                  <div>{digestedData.summary.data}</div>
                                                </div>
                                              )}
                                            </div>
                                          )}
                                          
                                          {/* Inputs Tab Content */}
                                          {activeTab === 'inputs' && hasInputs && (
                                            <div>
                                              <h5 style={{ marginBottom: '5px' }}>Inputs</h5>
                                              <div style={{
                                                maxHeight: '200px',
                                                overflow: 'auto',
                                                border: '1px solid #E0E0E0',
                                                padding: '8px',
                                                borderRadius: '4px'
                                              }}>
                                                <div style={{
                                                  display: 'grid',
                                                  gridTemplateColumns: `repeat(${digestedData.summary.invoke.inputs.length}, minmax(30px, 1fr))`,
                                                  gap: '5px'
                                                }}>
                                                  {/* Header row with indices */}
                                                  {digestedData.summary.invoke.inputs.map((_, index) => (
                                                    <div key={`header-${index}`} style={{
                                                      textAlign: 'center',
                                                      fontWeight: 'bold',
                                                      padding: '4px',
                                                      backgroundColor: '#F5F5F5',
                                                      borderRadius: '4px'
                                                    }}>
                                                      {index}
                                                    </div>
                                                  ))}
                                                  
                                                  {/* Value row */}
                                                  {digestedData.summary.invoke.inputs.map((input, index) => (
                                                    <div key={`value-${index}`} style={{
                                                      textAlign: 'center',
                                                      padding: '4px',
                                                      backgroundColor: '#FFFFFF',
                                                      border: '1px solid #E0E0E0',
                                                      borderRadius: '4px',
                                                      overflow: 'hidden',
                                                      textOverflow: 'ellipsis'
                                                    }}>
                                                      {input}
                                                    </div>
                                                  ))}
                                                </div>
                                              </div>
                                            </div>
                                          )}
                                          
                                          {/* Alkanes Tab Content */}
                                          {activeTab === 'alkanes' && hasAlkanes && (
                                            <div>
                                              <h5 style={{ marginBottom: '5px' }}>Alkanes</h5>
                                              <div style={{
                                                maxHeight: '200px',
                                                overflow: 'auto',
                                                border: '1px solid #E0E0E0',
                                                padding: '8px',
                                                borderRadius: '4px'
                                              }}>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
                                                  {digestedData.summary.alkanes.map((alkane, index) => (
                                                    <div key={index} style={{
                                                      flex: '1 0 45%',
                                                      minWidth: '200px',
                                                      padding: '8px',
                                                      backgroundColor: '#F5F5F5',
                                                      borderRadius: '4px'
                                                    }}>
                                                      <div><span style={{ fontWeight: 'bold' }}>alkaneId: </span>{alkane.alkaneId}</div>
                                                      <div><span style={{ fontWeight: 'bold' }}>Value: </span>{alkane.value}</div>
                                                    </div>
                                                  ))}
                                                </div>
                                              </div>
                                            </div>
                                          )}
                                          
                                          {/* Storage Tab Content */}
                                          {activeTab === 'storage' && hasStorage && (
                                            <div>
                                              <h5 style={{ marginBottom: '5px' }}>Storage</h5>
                                              <div style={{
                                                maxHeight: '200px',
                                                overflow: 'auto',
                                                border: '1px solid #E0E0E0',
                                                padding: '8px',
                                                borderRadius: '4px'
                                              }}>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
                                                  {digestedData.summary.storage.map((item, index) => (
                                                    <div key={index} style={{
                                                      flex: '1 0 45%',
                                                      minWidth: '200px',
                                                      padding: '8px',
                                                      backgroundColor: '#F5F5F5',
                                                      borderRadius: '4px'
                                                    }}>
                                                      <div><span style={{ fontWeight: 'bold' }}>Key: </span>{item.key}</div>
                                                      <div><span style={{ fontWeight: 'bold' }}>Value: </span>{item.value}</div>
                                                    </div>
                                                  ))}
                                                </div>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })()}
                                  </div>
                                )}
                              </div>
                            ) : (
                              // Raw View
                              <pre style={{ margin: 0, overflow: 'auto' }}>
                                {JSON.stringify(
                                  activeVout === 4 ? traceResults[tx.txid].vout4 : traceResults[tx.txid].vout5,
                                  null,
                                  2
                                )}
                              </pre>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div style={styles.paginationContainer}>
                <button
                  style={page === 1 || pageLoading ? styles.disabledButton : styles.secondaryButton}
                  onClick={handlePreviousPage}
                  disabled={page === 1 || pageLoading}
                >
                  Previous
                </button>
                <span style={styles.paginationText}>
                  Page {page} of {totalPages} ({totalTransactions} transactions)
                  {pageLoading && <span style={{marginLeft: '10px', color: '#666666'}}>Loading...</span>}
                </span>
                <button
                  style={page === totalPages || pageLoading ? styles.disabledButton : styles.secondaryButton}
                  onClick={handleNextPage}
                  disabled={page === totalPages || pageLoading}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BitcoinAddressExplorer;