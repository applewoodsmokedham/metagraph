import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { getAllAlkanes } from '../sdk/alkanes';

/**
 * AlkanesTokensExplorer Component (98.css version)
 *
 * Page for exploring all initialized Alkanes tokens with pagination, styled with 98.css.
 */
const AlkanesTokensExplorer = () => {
  const { endpoint = 'mainnet' } = useOutletContext() || {};
  
  // State for tokens data
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTokens, setTotalTokens] = useState(0);
  const tokensPerPage = 200;
  
  // Fetch tokens on component mount and when page or endpoint changes
  useEffect(() => {
    fetchTokens();
  }, [currentPage, endpoint]);
  
  // Function to fetch tokens with pagination
  const fetchTokens = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const offset = (currentPage - 1) * tokensPerPage;
      const result = await getAllAlkanes(tokensPerPage, offset, endpoint);
      
      if (result.status === 'error') {
        throw new Error(result.message || 'Failed to fetch Alkanes tokens');
      }
      
      setTokens(result.tokens || []);
      
      // Set total tokens count for pagination
      if (result.pagination && result.pagination.total) {
        setTotalTokens(result.pagination.total);
      } else if (result.tokens && result.tokens.length === tokensPerPage) {
        setTotalTokens((currentPage * tokensPerPage) + tokensPerPage); // Estimate if full page
      } else {
        setTotalTokens((currentPage - 1) * tokensPerPage + (result.tokens ? result.tokens.length : 0));
      }
    } catch (err) {
      console.error('Error fetching Alkanes tokens:', err);
      setError(err.message || 'An error occurred while fetching tokens');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage > 0 && (!totalTokens || (newPage - 1) * tokensPerPage < totalTokens)) {
      setCurrentPage(newPage);
      window.scrollTo(0, 0); // Scroll to top on page change
    }
  };
  
  // Calculate total pages
  const totalPages = Math.ceil(totalTokens / tokensPerPage) || 1;
  
  return (
    <div>
      <h2>Alkanes Tokens Explorer</h2>
      <p>
        Browse through all initialized Alkanes tokens. Results are paginated.
      </p>

      <fieldset className="group-box">
        <legend>Tokens</legend>
        {loading ? (
          <p>Loading tokens...</p>
        ) : error ? (
          <div>
            <p style={{ color: 'red' }}>Error: {error}</p>
            <button onClick={fetchTokens}>Retry</button>
          </div>
        ) : tokens.length === 0 ? (
          <p>No Alkanes tokens found.</p>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th>AlkaneId</th>
                  <th>Symbol</th>
                  <th>Name</th>
                  <th>Circulating Supply</th>
                  <th>Cap</th>
                  <th>Minted</th>
                  <th>Mint Amount</th>
                </tr>
              </thead>
              <tbody>
                {tokens.map((token, index) => (
                  <tr key={index}>
                    <td>
                      {/* Display Alkane ID */} 
                      {token.id.block}:{token.id.tx}
                    </td>
                    <td>{token.symbol || '-'}</td>
                    <td>{token.name}</td>
                    <td>
                      {/* Format circulating supply */} 
                      {(token.totalSupply ? (token.totalSupply / 100000000) : 0).toLocaleString(undefined, {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 8
                      })}
                    </td>
                    <td>
                      {/* Format cap */} 
                      {(token.cap ? token.cap : 0).toLocaleString(undefined, {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                      })}
                    </td>
                    <td>
                      {/* Format minted count and percentage */} 
                      {(token.minted ? token.minted : 0).toLocaleString(undefined, {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                      })}
                      {token.percentageMinted ? ` (${token.percentageMinted}%)` : ''}
                    </td>
                    <td>
                      {/* Format mint amount */} 
                      {(token.mintAmount ? (token.mintAmount / 100000000) : 0).toLocaleString(undefined, {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 8
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Pagination controls - centered */} 
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
              >
                First
              </button>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                style={{ marginLeft: '5px' }}
              >
                Previous
              </button>
              
              <span style={{ margin: '0 10px' }}>
                Page {currentPage} of {totalPages}
              </span>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                style={{ marginLeft: '5px' }}
              >
                Last
              </button>
            </div>
          </>
        )}
      </fieldset>
    </div>
  );
};

export default AlkanesTokensExplorer;