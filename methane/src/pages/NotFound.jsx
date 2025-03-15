import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

/**
 * NotFound Component
 * 
 * 404 page for handling routes that don't exist
 */
const NotFound = () => {
  return (
    <div className="app-container">
      <Header />
      
      <main className="main-content not-found">
        <div className="not-found-content">
          <h1>404</h1>
          <h2>Page Not Found</h2>
          <p>The page you are looking for does not exist or has been moved.</p>
          
          <Link to="/" className="home-button">
            Return to Home
          </Link>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default NotFound;