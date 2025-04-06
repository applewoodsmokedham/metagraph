import React from 'react';
import { useOutletContext } from 'react-router-dom';

/**
 * AlkanesTemplatesExplorer Component (98.css version)
 * 
 * Page for exploring Alkanes factory templates, styled with 98.css.
 */
const AlkanesTemplatesExplorer = () => {
  const { endpoint = 'mainnet' } = useOutletContext() || {};
  
  // Helper function to format Alkane ID (Block:TX)
  const formatAlkaneId = (tokenId) => {
    if (!tokenId || typeof tokenId.block === 'undefined' || typeof tokenId.tx === 'undefined') {
      return 'Invalid ID';
    }
    return `${tokenId.block}:${shortenTx(tokenId.tx)}`;
  };

  // Helper function to format large numbers
  const formatLargeNumber = (num) => {
    if (typeof num !== 'number' || isNaN(num)) {
      return '-'; // Return dash for non-numbers or NaN
    }
    const numStr = String(num);
    if (numStr.length > 15) {
      return num.toExponential(2); // Use scientific notation with 2 decimal places
    } else {
      return num.toLocaleString(); // Use standard locale string with commas
    }
  };

  return (
    <div>
      <h2>Alkanes Templates Explorer</h2>
      <p>
        Explore deployed Alkanes factory templates on the {endpoint.toUpperCase()} network.
      </p>
      
      {/* Content Area */}
      <fieldset className="group-box">
        <legend>Templates</legend>
        <table>
          <tbody>
            {results.map((template, index) => (
              <tr key={`${template.tokenId?.tx}-${index}`}>
                <td>{formatAlkaneId(template.tokenId)}</td>
                <td>{template.name || '-'}</td>
                <td>{template.symbol || '-'}</td>
                <td>{template.description || '-'}</td>
                <td>{formatLargeNumber(template.cap)}</td>
                <td>{template.mint?.toLocaleString() || '-'}</td>
                <td>{template.limit?.toLocaleString() || '-'}</td>
                <td>{template.height_start || '-'} : {template.height_end || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </fieldset>
    </div>
  );
};

export default AlkanesTemplatesExplorer;