import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import NavBar from '../components/layout/NavBar';
import TraceForm from '../components/methods/TraceForm';
import SimulateForm from '../components/methods/SimulateForm';
import TraceBlockForm from '../components/methods/TraceBlockForm';

/**
 * APIMethodPage Component
 * 
 * Template page for all API method pages
 * Dynamically loads the correct form component based on the route
 */
const APIMethodPage = () => {
  const { methodName } = useParams();
  const navigate = useNavigate();
  const [endpoint, setEndpoint] = useState('local');

  // Define method components map inside the component
  const methodComponents = {
    'trace': TraceForm,
    'simulate': SimulateForm,
    'traceblock': TraceBlockForm,
    // Add other methods as they are implemented
  };

  // Find the appropriate component for this method
  const MethodComponent = methodComponents[methodName];

  // If method doesn't exist, redirect to 404
  if (!methodName || !MethodComponent) {
    // We could navigate to a not found page, but for now just return directly
    return (
      <div className="app-container">
        <Header endpoint={endpoint} onEndpointChange={setEndpoint} />
        <main className="main-content">
          <h2>Method Not Found</h2>
          <p>The API method "{methodName}" does not exist or is not yet implemented.</p>
          <button onClick={() => navigate('/')} className="back-button">
            Back to Home
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="app-container">
      <Header endpoint={endpoint} onEndpointChange={setEndpoint} />
      
      <div className="content-with-sidebar">
        <aside className="sidebar">
          <NavBar />
        </aside>
        
        <main className="main-content">
          <div className="api-method-container">
            <MethodComponent endpoint={endpoint} />
          </div>
        </main>
      </div>
      
      <Footer />
    </div>
  );
};

export default APIMethodPage;