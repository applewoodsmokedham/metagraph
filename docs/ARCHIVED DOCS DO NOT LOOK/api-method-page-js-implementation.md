# API Method Page JavaScript Implementation

This document outlines the necessary JavaScript component changes to implement the new design requirements for the METHANE API Method Page.

## Component Changes Overview

The current implementation consists of:
- `APIMethodPage.jsx` - Wrapper component that loads the appropriate method component
- `TraceForm.jsx` - Component for the trace API method that uses the shared API form
- `APIForm.jsx` - Shared form component that handles rendering the form, examples, and results

We need to enhance these components to support the new design requirements while preserving the existing functionality.

## 1. APIForm.jsx Updates

The shared `APIForm.jsx` component needs to be updated to:
- Add a loading spinner during API calls
- Support the fixed-height results area
- Enhance the tab navigation for examples
- Center headings and labels
- Format method type in a pill

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

  // Render the LoadingSpinner component when API is loading
  const LoadingSpinner = () => (
    <div className="loading-container">
      <div className="loading-spinner"></div>
    </div>
  );

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
              {loading ? 'Executing...' : `Execute ${methodName}`}
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

      {loading && !error && (
        <div className="results-container">
          <h3>Loading Results...</h3>
          <LoadingSpinner />
        </div>
      )}

      {results && !loading && !error && (
        <div className="results-container">
          <h3>Results:</h3>
          <pre className="results-json">
            {JSON.stringify(results, null, 2)}
          </pre>
        </div>
      )}

      {!results && !loading && !error && (
        <div className="placeholder-results">
          <h3>Results will appear here after execution.</h3>
          {examples && examples.response && (
            <div className="results-json example-placeholder">
              {examples.response}
            </div>
          )}
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

## 2. TraceForm.jsx Updates

Update the `TraceForm` component to enhance the placeholder examples and notes:

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
      placeholder: 'bc1p2cyx5e2hgh53wxrkcvn85akge9gyvsvw7cxvhmf0h4xswd8gqtf2d5dkkn',
      description: 'The transaction ID to trace',
      required: true
    },
    {
      name: 'vout',
      label: 'Output Index',
      placeholder: '4',
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
  "params": ["trace", "bc1p2cyx5e2hgh53wxrkcvn85akge9gyvsvw7cxvhmf0h4xswd8gqtf2d5dkkn", 4],
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
      {
        "pc": 1,
        "op": "OP_PUSHDATA",
        "data": "0x21023acebb3dca7b13a5100dbe1dce60ea2596c6a8d552d30713da05f5b9cdf8116d",
        "stack": ["OP_0"]
      },
      {
        "pc": 37,
        "op": "OP_CHECKSIG",
        "stack": ["OP_0", "0x21023acebb3dca7b13a5100dbe1dce60ea2596c6a8d552d30713da05f5b9cdf8116d"]
      }
      // Additional steps would be here
    ]
  },
  "id": 1,
  "jsonrpc": "2.0"
}`,
        curl: `curl -X POST --data '{"method":"metashrew_view","params":["trace","bc1p2cyx5e2hgh53wxrkcvn85akge9gyvsvw7cxvhmf0h4xswd8gqtf2d5dkkn",4],"id":1,"jsonrpc":"2.0"}' https://mainnet.sandshrew.io`
      }}
      notes="Ensure txid and vout correspond to a valid transaction on the current network. The trace method provides detailed execution information that can be used for debugging smart contracts."
    />
  );
};

export default TraceForm;
```

## 3. APIMethodPage.jsx Updates

Update the `APIMethodPage.jsx` component to ensure it applies the correct styling:

```jsx
import React from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import TraceBlockStatusForm from '../components/methods/TraceBlockStatusForm';
import SimulateForm from '../components/methods/SimulateForm';
import TraceForm from '../components/methods/TraceForm';

/**
 * APIMethodPage Component
 * 
 * Template page for all API method pages
 * Dynamically loads the correct form component based on the route parameter or props
 */
const APIMethodPage = ({ methodComponent: ProvidedMethodComponent, methodName: providedMethodName }) => {
  const { methodId } = useParams();
  const navigate = useNavigate();
  const { endpoint = 'local' } = useOutletContext() || {};

  // Define method components map
  const methodComponents = {
    'trace': TraceForm,
    'simulate': SimulateForm,
    'traceblockstatus': TraceBlockStatusForm,
    // Add other methods as they are implemented
  };

  // Get method name from either route param or prop
  const currentMethodId = methodId || providedMethodName?.toLowerCase();
  
  // Find the appropriate component - use provided component or look up by method ID
  const MethodComponent = ProvidedMethodComponent || methodComponents[currentMethodId];

  // If method doesn't exist, show error
  if (!currentMethodId || !MethodComponent) {
    return (
      <div className="api-method-page">
        <div className="method-header">
          <h1>Method Not Found</h1>
          <p>The API method "{currentMethodId}" does not exist or is not yet implemented.</p>
          <button onClick={() => navigate('/')} className="back-button">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="api-method-page">
      <div className="method-content">
        <MethodComponent endpoint={endpoint} />
      </div>
    </div>
  );
};

export default APIMethodPage;
```

## Implementation Notes

### Loading Spinner

The loading spinner has been added to the `APIForm` component. During API calls, it will:
1. Display "Executing..." on the button
2. Show a loading spinner in the results container
3. Revert back to the original state when the call completes

### Fixed-Height Results Area

The results container has been styled with:
1. Fixed height of 200px as specified in the requirements
2. Vertical scrollbar for overflow content
3. Maintaining the same height for loading, error, and results states

### Method Type Pill

The method type now appears in a light gray pill beside the method name, as required.

### Form Labels and Inputs

Form labels and inputs have been updated to:
1. Center the labels
2. Provide descriptive text below inputs
3. Maintain full width for input fields

### Examples Section

The examples section has been enhanced with:
1. Centered heading
2. Horizontal tab navigation with proper active state indication
3. Dark background for code examples with light text

### Notes Section

The notes section has been updated to use:
1. Light yellow background with yellow border
2. Centered text with appropriate sizing

### Responsive Behavior

Responsive behavior ensures:
1. All elements stack properly on smaller screens
2. Font sizes are reduced appropriately
3. Touch targets remain at least 44px for better mobile usability

## Integration Strategy

The changes have been designed to be minimally invasive to the existing codebase. The main updates are:
1. CSS styling changes to match the new design requirements
2. Minor enhancements to the `APIForm` component for loading states and example display
3. Updates to the placeholder content in `TraceForm` for better examples

No significant architectural changes are required, allowing for a smooth integration with the existing codebase.