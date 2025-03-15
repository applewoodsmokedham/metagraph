import React from 'react';
import { Link, useOutletContext } from 'react-router-dom';

/**
 * Home Page Component
 * 
 * The main landing page for the METHANE application
 * Displays categories of API methods with links to their specific pages
 */
const Home = () => {
  const { endpoint = 'local' } = useOutletContext() || {};
  
  return (
    <div className="home-page">
      <section className="hero-section">
        <h1>METHANE</h1>
        <p className="tagline">Method Exploration, Testing, and Analysis eNvironment</p>
        <p className="description">
          A development tool for exploring and testing API methods in the Oyl ecosystem.
        </p>
      </section>
      
      <section className="api-methods">
        <h2>Available Methods</h2>
        <p className="section-description">Select a method to test:</p>
        
        <div className="methods-grid">
          <div className="method-card">
            <h3>Trace Block Status</h3>
            <p>Trace all transactions in a block with detailed status information.</p>
            <Link to="/api-methods/traceblockstatus" className="method-link">Try it</Link>
          </div>
          
          <div className="method-card">
            <h3>Simulate Transaction</h3>
            <p>Simulate executing a transaction without broadcasting it.</p>
            <Link to="/api-methods/simulate" className="method-link">Try it</Link>
          </div>
        </div>
      </section>
      
      <section className="current-status">
        <h2>Environment</h2>
        <div className="status-indicator">
          <p>Current endpoint: <strong>{endpoint.toUpperCase()}</strong></p>
          <p className="help-text">You can change the endpoint using the selector in the header.</p>
        </div>
      </section>
    </div>
  );
};

export default Home;