import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';

/**
 * Layout Component
 * 
 * Provides the main application layout structure with header and content area
 * Uses Outlet from react-router-dom to render nested route components
 */
const Layout = () => {
  const [endpoint, setEndpoint] = useState('local');
  
  const handleEndpointChange = (newEndpoint) => {
    setEndpoint(newEndpoint);
  };
  
  return (
    <div className="app-layout">
      <Header 
        onEndpointChange={handleEndpointChange} 
        currentEndpoint={endpoint} 
      />
      <main className="main-content">
        <Outlet context={{ endpoint }} />
      </main>
    </div>
  );
};

export default Layout;
