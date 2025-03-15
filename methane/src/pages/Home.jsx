import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

/**
 * Home Page Component
 * 
 * The main landing page for the METHANE application
 * Displays categories of API methods with links to their specific pages
 */
const Home = () => {
  const [endpoint, setEndpoint] = useState('local');
  
  return (
    <div className="app-container">
      <Header endpoint={endpoint} onEndpointChange={setEndpoint} />
      
      <main className="main-content">
        <section className="api-status">
          <h2>API Status <button className="refresh-button">Refresh Status</button></h2>
          <div className="status-details">
            <p>Last updated: {new Date().toLocaleTimeString()}</p>
          </div>
        </section>
        
        <section className="main-tools">
          <h2>Main Explorer Tools</h2>
          <div className="tools-group">
            <h3>Explorer Navigation</h3>
            <ul className="tool-list">
              <li><Link to="/explorer/block" className="tool-link">Block Explorer</Link></li>
              <li><Link to="/explorer/transaction" className="tool-link">Transaction Search</Link></li>
              <li><Link to="/explorer/tracer" className="tool-link">Transaction Tracer</Link></li>
            </ul>
          </div>
        </section>
        
        <section className="api-methods">
          <h2>Metashrew API Methods</h2>
          <p className="section-description">Direct access to individual Metashrew API endpoints</p>
          
          <div className="methods-grid">
            <div className="method-group">
              <h3>Core Alkanes Functions</h3>
              <ul className="method-list">
                <li><Link to="/api-methods/simulate" className="method-link">simulate</Link></li>
                <li><Link to="/api-methods/trace" className="method-link">trace</Link></li>
                <li><Link to="/api-methods/traceblock" className="method-link">traceblock</Link></li>
                <li><Link to="/api-methods/multisimulate" className="method-link">multisimulate</Link></li>
              </ul>
            </div>
            
            <div className="method-group">
              <h3>Protorune Functions</h3>
              <ul className="method-list">
                <li><Link to="/api-methods/protorunesbyaddress" className="method-link">protorunesbyaddress</Link></li>
                <li><Link to="/api-methods/protorunesbyoutpoint" className="method-link">protorunesbyoutpoint</Link></li>
                <li><Link to="/api-methods/protorunesbyheight" className="method-link">protorunesbyheight</Link></li>
                <li><Link to="/api-methods/spendablesbyaddress" className="method-link">spendablesbyaddress</Link></li>
              </ul>
            </div>
            
            <div className="method-group">
              <h3>Runes Compatibility</h3>
              <ul className="method-list">
                <li><Link to="/api-methods/runesbyaddress" className="method-link">runesbyaddress</Link></li>
                <li><Link to="/api-methods/runesbyoutpoint" className="method-link">runesbyoutpoint</Link></li>
                <li><Link to="/api-methods/runesbyheight" className="method-link">runesbyheight</Link></li>
              </ul>
            </div>
            
            <div className="method-group">
              <h3>JSON-RPC Methods</h3>
              <ul className="method-list">
                <li><Link to="/api-methods/metashrew_height" className="method-link">metashrew_height</Link></li>
                <li><Link to="/api-methods/sandshrew_multicall" className="method-link">sandshrew_multicall</Link></li>
                <li><Link to="/api-methods/btc_getblockcount" className="method-link">btc_getblockcount</Link></li>
              </ul>
            </div>
          </div>
        </section>
        
        <section className="indexer-methods">
          <h2>Indexer Functions</h2>
          <div className="indexer-note">
            <p>These may be available depending on your Metashrew instance</p>
          </div>
          
          <ul className="method-list">
            <li><Link to="/api-methods/alkane_inventory" className="method-link">alkane_inventory</Link></li>
            <li><Link to="/api-methods/call_view" className="method-link">call_view</Link></li>
            <li><Link to="/api-methods/call_multiview" className="method-link">call_multiview</Link></li>
          </ul>
        </section>
        
        <section className="api-utilities">
          <h2>API Utilities</h2>
          <p className="section-description">Tools to help with API request formatting</p>
          
          <ul className="method-list">
            <li><Link to="/api-methods/protocol_buffer_encoder" className="method-link">Protocol Buffer Encoder</Link></li>
            <li><Link to="/api-methods/hex_converter" className="method-link">Hex Converter</Link></li>
            <li><Link to="/api-methods/bitcoin_address_encoder" className="method-link">Bitcoin Address Encoder</Link></li>
          </ul>
        </section>
        
        <section className="api-methods-index">
          <h2>API Methods Index</h2>
          <p>Complete listing of all available API methods with documentation.</p>
          <Link to="/api-methods" className="view-all-button">
            View All API Methods
          </Link>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Home;