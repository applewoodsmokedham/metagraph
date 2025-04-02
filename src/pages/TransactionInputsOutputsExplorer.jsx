import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useLaserEyes } from '@omnisat/lasereyes';
import {
  getAddressInfo,
  getAddressTransactionsChain,
  getTransactionInfo,
  getTransactionOutspends
} from '../sdk/esplora';
import getProvider from '../sdk/provider';

/**
 * TransactionInputsOutputsExplorer Component
 * 
 * Page for exploring Bitcoin transaction inputs and outputs
 * Allows users to search for an address and view all its transactions
 * with detailed inputs and outputs visualization
 */
const TransactionInputsOutputsExplorer = () => {
  const { endpoint = 'mainnet' } = useOutletContext() || {};
  const { connected, address: walletAddress } = useLaserEyes();
  
  // State for address input
  const [address, setAddress] = useState('');
  const [manualAddress, setManualAddress] = useState('');
  
  // State for transaction data
  const [transactions, setTransactions] = useState([]);
  const [processedTransactions, setProcessedTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // State for pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [pageLoading, setPageLoading] = useState(false);
  const [fetchingAllTransactions, setFetchingAllTransactions] = useState(false);
  const [fetchProgress, setFetchProgress] = useState(0);
  const [maxTransactionsToFetch, setMaxTransactionsToFetch] = useState(10000);
  const transactionsPerPage = 25; // Default page size from Esplora API
  
  // Reset component state when endpoint/network changes
  useEffect(() => {
    // Reset the state to prevent issues when switching networks
    setTransactions([]);
    setProcessedTransactions([]);
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
  
  // Helper function to shorten txids and addresses
  const shortenTxid = (txid) => {
    if (!txid) return 'N/A';
    if (txid.length <= 13) return txid;
    return `${txid.substring(0, 6)}...${txid.substring(txid.length - 6)}`;
  };
  
  const shortenAddress = (address) => {
    if (!address) return 'Unknown';
    if (address === 'OP_RETURN') return address;
    if (address.length <= 15) return address;
    return `${address.substring(0, 6)}...${address.substring(address.length - 6)}`;
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
  
  // Note: We now use the getAddressInfo function from esplora.js
  
  // Fetch all transactions for an address up to the maximum limit
  const fetchAllTransactions = async (address) => {
    try {
      setFetchingAllTransactions(true);
      setFetchProgress(0);
      
      // First get the total transaction count
      const addressInfoResult = await getAddressInfo(address, endpoint);
      
      if (addressInfoResult.status === "error") {
        throw new Error(addressInfoResult.message);
      }
      
      const totalTxCount = Math.min(addressInfoResult.totalTxCount, maxTransactionsToFetch);
      setTotalTransactions(totalTxCount);
      
      // Start with an empty array of transactions
      let allTransactions = [];
      let lastSeenTxid = null;
      
      // Update progress
      let progress = 0;
      setFetchProgress(progress);
      
      // Fetch transactions in batches using cursor-based pagination
      while (allTransactions.length < totalTxCount && allTransactions.length < maxTransactionsToFetch) {
        // Fetch the next batch
        const result = await getAddressTransactionsChain(
          address,
          endpoint,
          lastSeenTxid
        );
        
        if (result.status === "error" || !result.transactions || !result.transactions.length) {
          break; // No more transactions or error
        }
        
        // Add transactions to our collection
        allTransactions = [...allTransactions, ...result.transactions];
        
        // Update progress
        progress = Math.min(100, Math.round((allTransactions.length / totalTxCount) * 100));
        setFetchProgress(progress);
        
        // Update the last seen txid for the next batch
        lastSeenTxid = result.pagination.lastSeenTxid;
        
        // If we don't have more transactions or we've reached the maximum, stop fetching
        if (!result.pagination.hasMore || allTransactions.length >= maxTransactionsToFetch) {
          break;
        }
      }
      
      return {
        status: "success",
        message: "All transactions retrieved",
        address,
        transactions: allTransactions,
        pagination: {
          total: totalTxCount,
          fetched: allTransactions.length
        }
      };
    } catch (error) {
      console.error('Error fetching all transactions:', error);
      return {
        status: "error",
        message: error.message || "Unknown error",
        address,
        transactions: []
      };
    } finally {
      setFetchingAllTransactions(false);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset all states before making a new request
    setError(null);
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
    setProcessedTransactions([]);
    
    try {
      console.log(`Searching for transactions on network ${endpoint} for address ${addressToUse}`);
      
      // Fetch all transactions for the address (up to maxTransactionsToFetch)
      const result = await fetchAllTransactions(addressToUse);
      
      if (result.status === "error") {
        throw new Error(result.message);
      }
      
      // Set data
      const txs = result.transactions || [];
      setTransactions(txs);
      setAddress(addressToUse);
      
      // Set pagination data for UI display
      if (result.pagination) {
        setTotalTransactions(result.pagination.total);
        // Calculate total pages based on the number of transactions we actually fetched
        const calculatedPages = Math.max(1, Math.ceil(txs.length / transactionsPerPage));
        setTotalPages(calculatedPages);
        
        console.log(`Total transactions: ${result.pagination.total}, Fetched: ${txs.length}, Pages: ${calculatedPages}`);
      } else {
        // Fallback if pagination info is not available
        setTotalTransactions(txs.length);
        setTotalPages(Math.max(1, Math.ceil(txs.length / transactionsPerPage)));
        
        console.log(`Total transactions: ${txs.length}, Pages: ${Math.ceil(txs.length / transactionsPerPage)}`);
      }
      
      // Process transactions to get inputs and outputs
      await processTransactions(txs);
      
    } catch (err) {
      console.error("Error fetching transactions data:", err);
      setError(err.message || "Failed to fetch transactions data");
      setTransactions([]);
      setProcessedTransactions([]);
      setTotalTransactions(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };
  
  // Process transactions to get detailed input and output information
  const processTransactions = async (txs) => {
    const processed = [];
    
    // Process transactions in batches to avoid overwhelming the browser
    const batchSize = 25;
    const totalBatches = Math.ceil(txs.length / batchSize);
    
    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const startIndex = batchIndex * batchSize;
      const endIndex = Math.min(startIndex + batchSize, txs.length);
      const batch = txs.slice(startIndex, endIndex);
      
      console.log(`Processing batch ${batchIndex + 1}/${totalBatches} (${startIndex}-${endIndex} of ${txs.length} transactions)`);
      
      // Process each transaction in the batch
      for (const tx of batch) {
        try {
          // Get detailed transaction info
          const txInfo = await getTransactionInfo(tx.txid, endpoint);
          
          if (txInfo.status === "error") {
            processed.push({
              ...tx,
              error: txInfo.message,
              inputs: [],
              outputs: []
            });
            continue;
          }
          
          const transaction = txInfo.transaction;
          
          // Get outspends to determine if outputs have been spent
          const outspends = await getTransactionOutspends(tx.txid, endpoint);
          
          // Process inputs
          const inputs = transaction.vin.map(input => ({
            txid: input.txid,
            vout: input.vout,
            address: input.prevout?.scriptpubkey_address || 'Unknown',
            value: input.prevout?.value || 0,
            valueBTC: (input.prevout?.value || 0) / 100000000, // Convert satoshis to BTC
            isCoinbase: input.is_coinbase || false
          }));
          
          // Process outputs
          const outputs = transaction.vout.map((output, index) => {
            const isSpent = outspends.status === "success" &&
                           outspends.outspends &&
                           outspends.outspends[index] &&
                           outspends.outspends[index].spent;
            
            return {
              n: output.n,
              address: output.scriptpubkey_address || 'OP_RETURN',
              value: output.value || 0,
              valueBTC: (output.value || 0) / 100000000, // Convert satoshis to BTC
              type: output.scriptpubkey_type,
              isOpReturn: output.scriptpubkey_type === 'op_return',
              spent: isSpent
            };
          });
          
          // Calculate total input and output values
          const totalInput = inputs.reduce((sum, input) => sum + input.value, 0);
          const totalOutput = outputs.reduce((sum, output) => sum + output.value, 0);
          
          processed.push({
            ...tx,
            inputs,
            outputs,
            totalInput,
            totalOutput,
            totalInputBTC: totalInput / 100000000,
            totalOutputBTC: totalOutput / 100000000,
            fee: totalInput - totalOutput,
            feeBTC: (totalInput - totalOutput) / 100000000
          });
          
        } catch (error) {
          console.error(`Error processing transaction ${tx.txid}:`, error);
          processed.push({
            ...tx,
            error: error.message,
            inputs: [],
            outputs: []
          });
        }
      }
      
      // Update the processed transactions after each batch
      setProcessedTransactions([...processed]);
      
      // Update progress
      const progress = Math.min(100, Math.round((processed.length / txs.length) * 100));
      setFetchProgress(progress);
    }
    
    console.log(`Processed ${processed.length} transactions in total`);
    setProcessedTransactions(processed);
  };
  
  // Get current page transactions - paginate locally since we've fetched all transactions
  const getCurrentPageTransactions = () => {
    const startIndex = (page - 1) * transactionsPerPage;
    const endIndex = startIndex + transactionsPerPage;
    const pageTransactions = processedTransactions.slice(startIndex, endIndex);
    
    console.log(`Getting page ${page} transactions: ${startIndex}-${endIndex} of ${processedTransactions.length}`);
    return pageTransactions;
  };
  
  // Handle pagination - now just updates the page state for local pagination
  const handlePreviousPage = () => {
    if (page > 1) {
      const newPage = page - 1;
      setPage(newPage);
      // Scroll to top of results
      window.scrollTo(0, 0);
    }
  };
  
  const handleNextPage = () => {
    if (page < totalPages) {
      const newPage = page + 1;
      setPage(newPage);
      // Scroll to top of results
      window.scrollTo(0, 0);
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
    subtitle: {
      fontSize: '20px',
      fontWeight: 'bold',
      marginBottom: '12px',
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
    transactionCard: {
      marginBottom: '20px',
      padding: '15px',
      border: '1px solid #E0E0E0',
      borderRadius: '4px',
      backgroundColor: '#FFFFFF',
    },
    transactionHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '10px',
      padding: '5px 0',
      borderBottom: '1px solid #E0E0E0',
    },
    txid: {
      fontFamily: 'monospace',
      cursor: 'pointer',
    },
    inputOutputContainer: {
      display: 'flex',
      gap: '20px',
    },
    column: {
      flex: 1,
      padding: '10px',
      backgroundColor: '#F5F5F5',
      borderRadius: '4px',
    },
    columnHeader: {
      fontSize: '16px',
      fontWeight: 'bold',
      marginBottom: '10px',
      textAlign: 'center',
    },
    item: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px',
      marginBottom: '5px',
      backgroundColor: '#FFFFFF',
      borderRadius: '4px',
      border: '1px solid #E0E0E0',
    },
    itemAddress: {
      display: 'flex',
      alignItems: 'center',
      gap: '5px',
    },
    address: {
      fontFamily: 'monospace',
      cursor: 'pointer',
    },
    itemValue: {
      fontWeight: 'bold',
    },
    redCircle: {
      color: '#F44336',
      fontSize: '12px',
    },
    greenCircle: {
      color: '#4CAF50',
      fontSize: '12px',
    },
    totalRow: {
      padding: '10px',
      textAlign: 'right',
      fontWeight: 'bold',
      borderTop: '1px solid #E0E0E0',
      marginTop: '10px',
    },
    feeRow: {
      padding: '10px',
      textAlign: 'right',
      fontWeight: 'bold',
      borderTop: '1px solid #E0E0E0',
      marginTop: '10px',
    },
    pagination: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '10px',
      marginTop: '20px',
    },
    paginationButton: {
      padding: '5px 10px',
      backgroundColor: '#000000',
      color: '#FFFFFF',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
    },
    pageInfo: {
      fontFamily: 'Roboto Mono, monospace',
    },
    opReturn: {
      fontFamily: 'monospace',
      backgroundColor: '#E0E0E0',
      padding: '2px 5px',
      borderRadius: '4px',
    },
    runestone: {
      backgroundColor: '#9C27B0',
      color: '#FFFFFF',
      padding: '2px 5px',
      borderRadius: '4px',
      marginLeft: '5px',
      fontSize: '12px',
    },
    detailsButton: {
      backgroundColor: '#2196F3',
      color: '#FFFFFF',
      border: 'none',
      padding: '5px 10px',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '12px',
    },
    progressContainer: {
      marginTop: '20px',
      marginBottom: '20px',
      textAlign: 'center',
    },
    progressBar: {
      width: '100%',
      height: '20px',
      backgroundColor: '#E0E0E0',
      borderRadius: '4px',
      margin: '10px 0',
      overflow: 'hidden',
    },
    progressBarFill: {
      height: '100%',
      backgroundColor: '#4CAF50',
      borderRadius: '4px',
      transition: 'width 0.3s ease',
    },
    transactionStats: {
      marginBottom: '15px',
      padding: '10px',
      backgroundColor: '#F5F5F5',
      borderRadius: '4px',
      textAlign: 'center',
    },
  };
  
  return (
    <div style={styles.container}>
      <div style={styles.section}>
        <h2 style={styles.title}>Transaction Inputs & Outputs Explorer</h2>
        <p style={styles.description}>
          Search for a Bitcoin address to view all its transactions with inputs and outputs.
        </p>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formRow}>
            <label style={styles.label}>
              Bitcoin Address:
              <input
                type="text"
                value={manualAddress}
                onChange={(e) => setManualAddress(e.target.value)}
                placeholder="Enter Bitcoin address"
                style={styles.input}
              />
            </label>
          </div>
          
          <div style={styles.formRow}>
            <button 
              type="submit" 
              style={loading ? styles.disabledButton : styles.button}
              disabled={loading}
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
            
            {connected && walletAddress && (
              <button
                type="button"
                onClick={useConnectedWallet}
                style={styles.secondaryButton}
              >
                Use Connected Wallet
              </button>
            )}
          </div>
        </form>
        
        {error && (
          <div style={{ color: 'red', marginTop: '10px' }}>
            Error: {error}
          </div>
        )}
      </div>
      
      {address && (
        <div style={styles.section}>
          <h3 style={styles.subtitle}>Transactions for {address}</h3>
          
          {loading ? (
            <div>Loading transactions...</div>
          ) : fetchingAllTransactions ? (
            <div style={styles.progressContainer}>
              <div>Fetching transactions... {fetchProgress}% complete</div>
              <div style={styles.progressBar}>
                <div
                  style={{
                    ...styles.progressBarFill,
                    width: `${fetchProgress}%`
                  }}
                ></div>
              </div>
              <div>This may take a while for addresses with many transactions.</div>
            </div>
          ) : processedTransactions.length > 0 ? (
            <div>
              <div style={styles.transactionStats}>
                <p>Showing {getCurrentPageTransactions().length} of {processedTransactions.length} transactions (Total: {totalTransactions})</p>
              </div>
              
              {getCurrentPageTransactions().map((tx, index) => (
                <div key={tx.txid} style={styles.transactionCard}>
                  <div style={styles.transactionHeader}>
                    <div>
                      <strong>Transaction:</strong> 
                      <span 
                        style={styles.txid}
                        onClick={() => copyToClipboard(tx.txid)}
                        title="Click to copy"
                      >
                        {tx.txid}
                      </span>
                    </div>
                    <div>
                      <strong>Date:</strong> {formatDate(tx.status?.block_time)}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h4 style={{ margin: 0 }}>Inputs & Outputs</h4>
                    <button style={styles.detailsButton}>Details</button>
                  </div>
                  
                  <div style={styles.inputOutputContainer}>
                    {/* Inputs Column */}
                    <div style={styles.column}>
                      <h4 style={styles.columnHeader}>Inputs</h4>
                      {tx.inputs.map((input, i) => (
                        <div key={i} style={styles.item}>
                          <div style={styles.itemAddress}>
                            <span style={styles.redCircle}>●</span>
                            {input.isCoinbase ? (
                              <span style={styles.opReturn}>Coinbase (New Coins)</span>
                            ) : (
                              <span 
                                style={styles.address}
                                onClick={() => copyToClipboard(input.address)}
                                title="Click to copy"
                              >
                                {shortenAddress(input.address)}
                              </span>
                            )}
                          </div>
                          <div style={styles.itemValue}>
                            {input.valueBTC.toFixed(8)} BTC
                          </div>
                        </div>
                      ))}
                      <div style={styles.totalRow}>
                        <strong>Total:</strong> {tx.totalInputBTC.toFixed(8)} BTC
                      </div>
                    </div>
                    
                    {/* Outputs Column */}
                    <div style={styles.column}>
                      <h4 style={styles.columnHeader}>Outputs</h4>
                      {tx.outputs.map((output, i) => (
                        <div key={i} style={styles.item}>
                          <div style={styles.itemAddress}>
                            <span style={styles.greenCircle}>●</span>
                            {output.isOpReturn ? (
                              <div>
                                <span style={styles.opReturn}>OP_RETURN</span>
                                <span style={styles.runestone}>Runestone</span>
                              </div>
                            ) : (
                              <span 
                                style={styles.address}
                                onClick={() => copyToClipboard(output.address)}
                                title="Click to copy"
                              >
                                {shortenAddress(output.address)}
                              </span>
                            )}
                          </div>
                          <div style={styles.itemValue}>
                            {output.valueBTC.toFixed(8)} BTC
                          </div>
                        </div>
                      ))}
                      <div style={styles.totalRow}>
                        <strong>Total:</strong> {tx.totalOutputBTC.toFixed(8)} BTC
                      </div>
                    </div>
                  </div>
                  
                  <div style={styles.feeRow}>
                    <strong>Fee:</strong> {tx.feeBTC.toFixed(8)} BTC
                  </div>
                </div>
              ))}
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div style={styles.pagination}>
                  <button
                    onClick={handlePreviousPage}
                    disabled={page === 1}
                    style={page === 1 ? styles.disabledButton : styles.paginationButton}
                  >
                    Previous
                  </button>
                  <span style={styles.pageInfo}>
                    Page {page} of {totalPages} ({processedTransactions.length} of {totalTransactions} transactions)
                  </span>
                  <button
                    onClick={handleNextPage}
                    disabled={page === totalPages}
                    style={page === totalPages ? styles.disabledButton : styles.paginationButton}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div>No transactions found for this address.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default TransactionInputsOutputsExplorer;