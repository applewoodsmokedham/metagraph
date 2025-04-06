import React from 'react';
import { Link } from 'react-router-dom';

/**
 * ShadowVoutDocs Component (98.css version)
 * 
 * A simple documentation page explaining shadow vouts, using default 98.css element styling.
 */
const ShadowVoutDocs = () => {
  return (
    // Use a simple div; 98.css will style the inner elements
    <div>
      <h2>Shadow Vout Documentation</h2>

      <p>
        In Bitcoin transactions with Runestones, shadow vouts are virtual output indexes 
        that do not correspond to physical UTXOs.
      </p>
      
      <h3>Key Concepts</h3>
      
      <ul>
        <li>Shadow vout indexing begins at tx.output.length + 1</li>
        <li>Protostones are laid out in the "shadow vout" range</li>
        <li>Shadow vouts are not physical UTXOs</li>
        <li>They are indexed as if they were additional OP_RETURN outputs</li>
        <li>This allows the protostone[] array on the Runestone to be logically packed onto a single OP_RETURN</li>
      </ul>
      
      <p>
        Shadow vouts enable the Bitcoin transaction structure to virtually support multiple 
        protostone outputs despite consensus rules that would otherwise limit this capability.
      </p>

      <div style={{ marginTop: '20px' }}>
        <Link to="/api-methods/trace">
          Back to Trace Method
        </Link>
      </div>
    </div>
  );
};

export default ShadowVoutDocs;