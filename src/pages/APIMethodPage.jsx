import React from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import TraceBlockStatusForm from '../components/methods/TraceBlockStatusForm';
import SimulateForm from '../components/methods/SimulateForm';
import TraceForm from '../components/methods/TraceForm';
import ProtorunesByOutpointForm from '../components/methods/ProtorunesByOutpointForm';

/**
 * APIMethodPage Component (98.css Integration)
 *
 * Template page for API method forms.
 * Dynamically loads the correct form component based on the route parameter or props.
 * Passes down the endpoint context.
 * Basic styling for the not-found case.
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
    'protorunesbyoutpoint': ProtorunesByOutpointForm,
    // Add other methods as they are implemented
  };

  // Get method name from either route param or prop
  // Ensure consistency in matching (lowercase)
  const currentMethodId = methodId?.toLowerCase() || providedMethodName?.toLowerCase().replace(/\s+/g, '');

  // Find the appropriate component - use provided component or look up by method ID
  const MethodComponent = ProvidedMethodComponent || methodComponents[currentMethodId];

  // If method doesn't exist, show error message with a standard button
  if (!currentMethodId || !MethodComponent) {
    return (
      <div>
        <h1>Method Not Found</h1>
        <p>The API method "{methodId || providedMethodName}" does not exist or is not yet implemented.</p>
        <button onClick={() => navigate('/')}>
          Back to Home
        </button>
      </div>
    );
  }

  // Render the specific method form component, passing the endpoint
  return (
    <div>
       <MethodComponent endpoint={endpoint} />
    </div>
  );
};

export default APIMethodPage;