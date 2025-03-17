import React from 'react';
import { Link } from 'react-router-dom';

/**
 * ShadowVoutDocs Component
 * 
 * A simple documentation page explaining shadow vouts
 */
const ShadowVoutDocs = () => {
  return (
    <div className="container" style={{maxWidth: '1200px', margin: '0 auto', padding: '16px', backgroundColor: '#FFFFFF', border: '1px solid #cccccc'}}>
      <h2 style={{fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', textAlign: 'left'}}>Shadow Vout Documentation</h2>

      <div style={{backgroundColor: '#FFFFFF', border: '1px solid #cccccc', padding: '16px', marginBottom: '16px'}}>
        <p style={{fontSize: '14px', marginBottom: '16px', textAlign: 'left'}}>
          In Bitcoin transactions with Runestones, shadow vouts are virtual output indexes that do not correspond to physical UTXOs.
        </p>
        
        <h3 style={{fontSize: '16px', fontWeight: 'bold', marginTop: '20px', marginBottom: '8px', textAlign: 'left'}}>Key Concepts</h3>
        
        <ul style={{listStyleType: 'disc', paddingLeft: '20px', marginBottom: '16px'}}>
          <li>Shadow vout indexing begins at tx.output.length + 1</li>
          <li>Protostones are laid out in the "shadow vout" range</li>
          <li>Shadow vouts are not physical UTXOs</li>
          <li>They are indexed as if they were additional OP_RETURN outputs</li>
          <li>This allows the protostone[] array on the Runestone to be logically packed onto a single OP_RETURN</li>
        </ul>
        
        <p style={{fontSize: '14px', marginBottom: '16px', textAlign: 'left'}}>
          Shadow vouts enable the Bitcoin transaction structure to virtually support multiple protostone outputs despite consensus rules that would otherwise limit this capability.
        </p>
      </div>

      <div style={{marginTop: '20px'}}>
        <Link to="/api-methods/trace" style={{color: '#0000FF', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px'}}>
          Back to Trace Method
        </Link>
      </div>
    </div>
  );
};

export default ShadowVoutDocs;