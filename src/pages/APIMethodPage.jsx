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