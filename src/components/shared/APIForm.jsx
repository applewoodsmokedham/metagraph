import React, { useState } from 'react';

/**
 * Generic APIForm Component (98.css version)
 *
 * A reusable form component for API methods, styled with 98.css and accessibility enhancements.
 * Handles form state, submission, loading, error display, and results.
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
  const [formValues, setFormValues] = useState(() => {
    // Initialize form values with default placeholders if available
    const initialValues = {};
    parameters.forEach(param => {
      if (param.placeholder && !param.required) {
        // Use placeholder as default only if not required, to avoid accidental submission
        // Adjust logic if specific default values are needed
      } else if (param.defaultValue) {
        initialValues[param.name] = param.defaultValue;
      }
    });
    return initialValues;
  });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults(null); // Clear previous results

    try {
      if (onSubmit) {
        const result = await onSubmit(formValues, endpoint);
        setResults(result);
      } else {
        setResults({ message: 'onSubmit handler not provided.' });
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      setError(err.message || 'An error occurred while processing your request');
    } finally {
      setLoading(false);
    }
  };

  // Helper to render code/JSON in a textarea within a sunken panel
  const renderCodeBlock = (title, code) => {
    if (!code) return null;
    const content = typeof code === 'string' ? code : JSON.stringify(code, null, 2);
    const rows = Math.min(20, content.split('\n').length + 1); // Limit rows

    return (
      <div style={{ marginBottom: '10px' }}>
        <strong>{title}:</strong>
        <div className="sunken-panel" style={{ marginTop: '5px' }}>
          <textarea
            readOnly
            value={content}
            rows={rows}
            style={{ width: '100%', height: 'auto', boxSizing: 'border-box' }}
          />
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Method Title and Description */}
      <h2>{methodName} {methodType && <span style={{ fontSize: '0.8em', fontWeight: 'normal' }}>({methodType})</span>}</h2>
      <p>{description}</p>

      {/* Method Details Group Box */}
      {Object.keys(methodDetails).length > 0 && (
        <fieldset className="group-box" style={{ marginBottom: '15px' }}>
          <legend>Details</legend>
          {Object.entries(methodDetails).map(([key, value]) => (
            <div key={key} style={{ marginBottom: '5px' }}>
              <strong>{key}:</strong> {typeof value === 'function' ? value() : value}
            </div>
          ))}
        </fieldset>
      )}

      {/* Examples Group Box */}
      {examples && Object.keys(examples).length > 0 && (
        <fieldset className="group-box" style={{ marginBottom: '15px' }}>
          <legend>Examples</legend>
          {renderCodeBlock('JSON-RPC Request', examples.request)}
          {renderCodeBlock('Example Response', examples.response)}
          {renderCodeBlock('cURL Command', examples.curl)}
        </fieldset>
      )}

      {/* Combined Try It & Results Layout */}
      <div style={{ display: 'flex', gap: '15px' }}>

        {/* Try It Form Group Box */}
        <fieldset className="group-box" style={{ flex: 1 }}>
          <legend>Try It</legend>
          <form onSubmit={handleSubmit}>
            {parameters.map((param) => (
              <div key={param.name} style={{ marginBottom: '10px' }}>
                <label htmlFor={`param-${param.name}`} style={{ display: 'block', marginBottom: '3px' }}>
                  {param.label || param.name}:
                </label>
                <input
                  type={param.type || 'text'} // Use type if specified (e.g., 'number')
                  id={`param-${param.name}`}
                  name={param.name}
                  value={formValues[param.name] || ''}
                  onChange={handleInputChange}
                  placeholder={param.placeholder || ''}
                  required={param.required !== false}
                  style={{ width: '100%', marginTop: '3px' }} // Ensure input takes full width
                />
                {param.description && (
                  <p style={{ fontSize: '11px', color: '#555', marginTop: '3px', marginBottom: 0 }}>
                    {typeof param.description === 'function' ? param.description() : param.description}
                  </p>
                )}
              </div>
            ))}
            <button type="submit" disabled={loading}>
              {loading ? 'Executing...' : `Execute ${methodName}`}
            </button>
          </form>
        </fieldset>

        {/* Results Group Box */}
        <div 
          aria-live="polite" 
          aria-busy={loading}
          style={{ marginTop: '20px' }} 
          role="status" // Role status implicitly has aria-live polite
        >
          {loading && (
            <p className="status-message">Loading...</p>
          )}
          {error && (
            <p className="status-message error">Error: {error}</p>
          )}
          {results && (
            <fieldset className="group-box">
              <legend>Result</legend>
              {/* Apply the result box style from index.css */}    
              <div className="api-result-box">
                <pre>
                  {JSON.stringify(results, null, 2)}
                </pre> 
              </div>
            </fieldset>
          )}
        </div>

      </div>

      {/* Notes Group Box */}
      {notes && (
        <fieldset className="group-box" style={{ marginTop: '15px' }}>
          <legend>Notes</legend>
          <p>{notes}</p>
        </fieldset>
      )}
    </div>
  );
};

export default APIForm;