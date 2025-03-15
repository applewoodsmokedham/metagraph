import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

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
      <App />
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
