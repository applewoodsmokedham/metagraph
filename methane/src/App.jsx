import React from 'react';
import { RouterProvider } from 'react-router-dom';
import router from './routes';
import './App.css';

/**
 * App Component
 * 
 * The root component of the application
 * Wraps the application with the router provider
 */
function App() {
  return (
    <RouterProvider router={router} />
  );
}

export default App;
