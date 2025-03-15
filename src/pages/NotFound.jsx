import React from 'react';
import { Link } from 'react-router-dom';

/**
 * NotFound Component
 * 
 * 404 page for handling routes that don't exist
 */
const NotFound = () => {
  return (
    <div className="not-found-content">
      <h1>404</h1>
      <h2>Page Not Found</h2>
      <p>The page you are looking for does not exist or has been moved.</p>
      
      <Link to="/" className="button primary-button">
        Return to Home
      </Link>
    </div>
  );
};

export default NotFound;