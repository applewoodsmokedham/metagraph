import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import Home from './pages/Home';
import APIMethodPage from './pages/APIMethodPage';
import NotFound from './pages/NotFound';

/**
 * Application Routes
 * 
 * Defines all routes for the application
 */
const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/api-methods/:methodName',
    element: <APIMethodPage />,
  },
  // Redirect from the old endpoint
  {
    path: '/methods/:methodName',
    element: <APIMethodPage />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);

export default router;