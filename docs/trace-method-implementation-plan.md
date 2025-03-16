# Trace Method Page Implementation Plan

## Overview

This document provides a detailed implementation plan for adding a new "trace" method page to the METHANE React application. The page will allow users to visualize and test transaction execution traces using the AlkanesRpc trace method.

## Requirements

- Implement a dedicated page for the "trace" API method
- Use a template component that can be reused for all API methods
- Follow the specified design for Header, Examples, Try It, Result, and Notes sections
- Update the SDK implementation to correctly use the AlkanesRpc trace method

## Implementation Steps

### 1. Update SDK Implementation

Update the `traceTransaction` function in `src/sdk/alkanes.js` to correctly use the AlkanesRpc trace method:

```javascript
/**
 * Traces a transaction, showing the execution of a smart contract
 * @param {string} txid - Transaction ID to trace
 * @param {number} vout - Output index (default: 0)
 * @param {string} endpoint - API endpoint to use ('regtest', 'mainnet', 'oylnet')
 * @returns {Promise<Object>} - Trace results
 */
export const traceTransaction = async (txid, vout = 0, endpoint = 'regtest') => {
  try {
    const provider = getProvider(endpoint);
    console.log(`Tracing transaction ${txid} with ${endpoint} endpoint`);
    
    // Ensure provider.alkanes exists
    if (!provider.alkanes || typeof provider.alkanes.trace !== 'function') {
      throw new Error('Alkanes trace method not available');
    }
    
    // Use the alkanes.trace method - note that the method will handle txid reversal internally
    const result = await provider.alkanes.trace({ 
      txid, 
      vout 
    });
    
    return {
      status: "success",
      message: "Trace completed",
      txid,
      result: result // Return the full result from the trace method
    };
  } catch (error) {
    console.error('Error tracing transaction:', error);
    return {
      status: "error",
      message: error.message || "Unknown error",
      txid
    };
  }
};
```

Key changes:
- Removed the `blockHeight` parameter
- Updated the trace method call to use the correct format
- Updated the response structure to return the full result

### 2. Update TraceForm Component

Update the `TraceForm.jsx` component in `src/components/methods/TraceForm.jsx`:

```jsx
import React from 'react';
import APIForm from '../shared/APIForm';
import { traceTransaction } from '../../sdk';

/**
 * TraceForm Component
 *
 * Form specific to the trace API method.
 * Gets a detailed execution trace of a transaction.
 *
 * @param {Object} props
 * @param {string} props.endpoint - Current endpoint (regtest, mainnet, oylnet)
 */
const TraceForm = ({ endpoint = 'regtest' }) => {
  // Define method details
  const methodDetails = {
    'Method Type': 'View Function',
    'JSON-RPC Method': 'metashrew_view',
    'View Function': 'trace',
    'Required Parameters': 'txid (transaction ID), vout (output index)'
  };

  // Define parameters for the form
  const parameters = [
    {
      name: 'txid',
      label: 'Transaction ID',
      placeholder: 'Enter txid',
      description: 'The transaction ID to trace',
      required: true
    },
    {
      name: 'vout',
      label: 'Output Index',
      placeholder: 'Enter vout',
      description: 'The output index (vout) to trace (default: 0)',
      required: false
    }
  ];

  // Handle form submission
  const handleSubmit = async (values) => {
    const { txid, vout = 0 } = values;
    
    // Call the SDK function
    return await traceTransaction(
      txid, 
      parseInt(vout, 10), 
      endpoint
    );
  };

  return (
    <APIForm
      methodName="trace"
      methodType="VIEW FUNCTION"
      description="Gets a detailed execution trace of a transaction, showing each step of contract execution including opcodes, stack values, and execution context. Essential for debugging contract behavior."
      methodDetails={methodDetails}
      parameters={parameters}
      onSubmit={handleSubmit}
      endpoint={endpoint}
      examples={{
        request: `{
  "method": "metashrew_view",
  "params": ["trace", "txid", 0],
  "id": 1,
  "jsonrpc": "2.0"
}`,
        response: `{
  "result": {
    "steps": [
      {
        "pc": 0,
        "op": "OP_0",
        "stack": []
      },
      // Additional steps would be here
    ]
  },
  "id": 1,
  "jsonrpc": "2.0"
}`,
        curl: `curl -X POST --data '{"method":"metashrew_view","params":["trace","txid",0],"id":1,"jsonrpc":"2.0"}' http://localhost:5173`
      }}
      notes="Ensure txid and vout correspond to a valid transaction on the current network. The trace method provides detailed execution information that can be used for debugging smart contracts."
    />
  );
};

export default TraceForm;
```

Key changes:
- Removed the `blockHeight` parameter
- Updated the method details to include required parameters
- Updated the parameters array to remove blockHeight
- Updated the handleSubmit function to use the updated SDK function
- Added examples and notes properties to the APIForm component

### 3. Update APIForm Component

Update the `APIForm.jsx` component in `src/components/shared/APIForm.jsx` to support the examples and notes sections:

```jsx
import React, { useState } from 'react';

/**
 * Generic APIForm Component
 * 
 * A reusable form component for API method calls
 * Handles form submission, validation, and displaying results
 * 
 * @param {Object} props
 * @param {string} props.methodName - Name of the API method
 * @param {string} props.methodType - Type of method (e.g., "VIEW FUNCTION")
 * @param {string} props.description - Description of what the method does
 * @param {Object} props.methodDetails - Additional details about the method
 * @param {Array} props.parameters - Form field definitions
 * @param {Function} props.onSubmit - Function to call when form is submitted
 * @param {string} props.endpoint - Current endpoint (local, production, oylnet)
 * @param {Object} props.examples - Example request, response, and curl command
 * @param {string} props.notes - Additional notes about the method
 */
const APIForm = ({
  methodName,
  methodType,
  description,
  methodDetails = {},
  parameters = [],
  onSubmit,
  endpoint = 'local',
  examples = {},
  notes = ''
}) => {
  const [formValues, setFormValues] = useState({});
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('request');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      if (onSubmit) {
        const result = await onSubmit(formValues, endpoint);
        setResults(result);
      } else {
        // Sample result if no onSubmit provided
        setResults({
          status: 'success',
          message: 'API call successful (placeholder)',
          data: { ...formValues, endpoint }
        });
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      setError(err.message || 'An error occurred while processing your request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="api-form">
      <div className="method-header">
        <h2>{methodName} <span className="method-type">{methodType}</span></h2>
        <p className="method-description">{description}</p>
      </div>

      <div className="method-details">
        {Object.entries(methodDetails).map(([key, value]) => (
          <div className="detail-item" key={key}>
            <h3>{key}:</h3>
            <div className="detail-value">{value}</div>
          </div>
        ))}
      </div>

      {examples && Object.keys(examples).length > 0 && (
        <div className="examples-section">
          <h3>Examples</h3>
          <div className="tabs">
            <div 
              className={`tab ${activeTab === 'request' ? 'active' : ''}`}
              onClick={() => setActiveTab('request')}
            >
              Request
            </div>
            <div 
              className={`tab ${activeTab === 'response' ? 'active' : ''}`}
              onClick={() => setActiveTab('response')}
            >
              Response
            </div>
            <div 
              className={`tab ${activeTab === 'curl' ? 'active' : ''}`}
              onClick={() => setActiveTab('curl')}
            >
              cURL
            </div>
          </div>
          <div className="tab-content">
            {activeTab === 'request' && examples.request && (
              <pre className="code-example">{examples.request}</pre>
            )}
            {activeTab === 'response' && examples.response && (
              <pre className="code-example">{examples.response}</pre>
            )}
            {activeTab === 'curl' && examples.curl && (
              <pre className="code-example">{examples.curl}</pre>
            )}
          </div>
        </div>
      )}

      <div className="form-container">
        <h3>Try It</h3>
        <form onSubmit={handleSubmit}>
          {parameters.map((param) => (
            <div className="form-group" key={param.name}>
              <label htmlFor={param.name}>{param.label}:</label>
              <input
                type={param.type || 'text'}
                id={param.name}
                name={param.name}
                value={formValues[param.name] || ''}
                onChange={handleInputChange}
                placeholder={param.placeholder}
                required={param.required !== false}
              />
              {param.description && (
                <div className="param-description">{param.description}</div>
              )}
            </div>
          ))}

          <div className="form-actions">
            <button 
              type="submit" 
              className="execute-button" 
              disabled={loading}
            >
              {loading ? 'Executing...' : 'Execute Trace'}
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="error-container">
          <h3>Error</h3>
          <div className="error-message">{error}</div>
        </div>
      )}

      {results && (
        <div className="results-container">
          <h3>Results:</h3>
          <pre className="results-json">
            {JSON.stringify(results, null, 2)}
          </pre>
        </div>
      )}

      {!results && !error && (
        <div className="placeholder-results">
          <h3>Results will appear here after execution.</h3>
        </div>
      )}

      {notes && (
        <div className="notes-section">
          <h3>Notes</h3>
          <div className="notes-content">{notes}</div>
        </div>
      )}
    </div>
  );
};

export default APIForm;
```

Key changes:
- Added support for examples with tabs for request, response, and curl
- Added support for notes section
- Updated the button text to "Execute Trace"
- Added state for tracking the active tab

### 4. Add CSS Styles

Add the following CSS to `src/App.css`:

```css
/* API Form Styles */
.api-form {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.method-header h2 {
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 10px;
}

.method-type {
  font-size: 14px;
  color: #666;
  margin-left: 10px;
}

.method-description {
  font-size: 14px;
  color: #333;
  margin-bottom: 20px;
}

.method-details {
  margin-bottom: 30px;
}

.detail-item {
  display: flex;
  margin-bottom: 10px;
}

.detail-item h3 {
  font-size: 14px;
  font-weight: bold;
  margin-right: 10px;
  min-width: 150px;
}

.detail-value {
  font-size: 14px;
}

/* Examples Section */
.examples-section {
  margin-bottom: 30px;
}

.tabs {
  display: flex;
  border-bottom: 1px solid #ddd;
  margin-bottom: 15px;
}

.tab {
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
}

.tab.active {
  border-bottom: 2px solid #B0B0B0;
}

.tab-content {
  background-color: #f5f5f5;
  padding: 15px;
  border-radius: 4px;
}

.code-example {
  font-family: 'Roboto Mono', monospace;
  font-size: 12px;
  white-space: pre-wrap;
  margin: 0;
}

/* Form Container */
.form-container {
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  font-size: 14px;
  margin-bottom: 5px;
}

.form-group input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.param-description {
  font-size: 12px;
  color: #666;
  margin-top: 5px;
}

.form-actions {
  margin-top: 20px;
}

.execute-button {
  background-color: #FF4500;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.execute-button:disabled {
  background-color: #ccc;
}

/* Results Container */
.results-container {
  margin-top: 30px;
}

.results-json {
  background-color: white;
  padding: 15px;
  border-radius: 4px;
  font-family: 'Roboto Mono', monospace;
  font-size: 12px;
  white-space: pre-wrap;
  overflow-x: auto;
}

.placeholder-results {
  margin-top: 30px;
  color: #666;
  text-align: center;
}

/* Notes Section */
.notes-section {
  margin-top: 30px;
  background-color: #F5F5F5;
  padding: 15px;
  border-radius: 4px;
}

.notes-content {
  font-size: 14px;
  color: #333;
}

/* Error Container */
.error-container {
  margin-top: 30px;
  background-color: #ffebee;
  padding: 15px;
  border-radius: 4px;
}

.error-message {
  color: #c62828;
  font-size: 14px;
}
```

### 5. Update Routes

Update the `routes.jsx` file to include the trace method page:

```jsx
import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import Home from './pages/Home';
import APIMethodPage from './pages/APIMethodPage';
import NotFound from './pages/NotFound';
import Layout from './components/layout/Layout';
import TraceBlockStatusForm from './components/methods/TraceBlockStatusForm';
import SimulateForm from './components/methods/SimulateForm';
import TraceForm from './components/methods/TraceForm';

/**
 * Application Routes
 * 
 * Defines all routes for the METHANE application
 * Including API method routes and 404 handling
 */
const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />
      },
      {
        path: 'api-methods/:methodId',
        element: <APIMethodPage />
      },
      // Direct method routes
      {
        path: 'api-methods/trace',
        element: <APIMethodPage methodComponent={TraceForm} methodName="Trace" />
      },
      {
        path: 'api-methods/traceblockstatus',
        element: <APIMethodPage methodComponent={TraceBlockStatusForm} methodName="Trace Block Status" />
      },
      {
        path: 'api-methods/simulate',
        element: <APIMethodPage methodComponent={SimulateForm} methodName="Simulate Transaction" />
      },
      // Not found route
      {
        path: '*',
        element: <NotFound />
      }
    ]
  }
]);

export default router;
```

Key changes:
- Imported the TraceForm component
- Added a new route for the trace method page

### 6. Update methodComponents Map in APIMethodPage

Update the `methodComponents` map in `APIMethodPage.jsx`:

```jsx
// Define method components map
const methodComponents = {
  'trace': TraceForm,
  'simulate': SimulateForm,
  'traceblockstatus': TraceBlockStatusForm,
  // Add other methods as they are implemented
};
```

Don't forget to import the TraceForm component:

```jsx
import TraceForm from '../components/methods/TraceForm';
```

### 7. Update Home Page to Include Link to Trace Method

If there's a method directory on the Home page, make sure to include a link to the trace method page.

## Testing

After implementing these changes, test the following:

1. Navigate to the trace method page
2. Verify that the page layout matches the requirements
3. Test the form submission with valid parameters
4. Verify that the API call is made correctly
5. Check that the results are displayed properly
6. Test error handling with invalid parameters

## Notes

- The implementation follows the existing patterns and architecture of the METHANE application
- The page is designed to be user-friendly and provide all the necessary information for developers
- The SDK implementation has been updated to correctly use the AlkanesRpc trace method
- The form has been updated to remove the unnecessary blockHeight parameter

## Conclusion

This implementation plan provides a comprehensive approach to adding the trace method page to the METHANE application. By following this plan, you will create a dedicated page that allows users to visualize and test transaction execution traces using the AlkanesRpc trace method.