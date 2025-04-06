// Import Node.js shims first to ensure they're loaded before any other imports
import './sdk/node-shims.js';
import '98.css'; // Import 98.css

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import './index.css'
import router from './routes'

console.log('---DEBUGGING START---');
console.log('DOM ready state:', document.readyState);
console.log('Root element exists:', !!document.getElementById('root'));

try {
  console.log('Attempting to render React application...');
  const rootElement = document.getElementById('root');
  
  if (!rootElement) {
    throw new Error('Root element not found in the DOM');
  }
  
  const root = createRoot(rootElement);
  
  root.render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  );
  
  console.log('React application rendered successfully');
} catch (error) {
  console.error('Error rendering React application:', error);
  // Try to show error on the page itself
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px; color: red; text-align: left;">
        <h2>React Rendering Error</h2>
        <pre>${error.message}</pre>
        <p>Check the console for more details.</p>
      </div>
    `;
  }
}
console.log('---DEBUGGING END---');
