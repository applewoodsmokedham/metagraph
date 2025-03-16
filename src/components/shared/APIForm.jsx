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