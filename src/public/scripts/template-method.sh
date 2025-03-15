#!/bin/bash

# template-method.sh - Template for API method test scripts
# Usage: Copy this template and customize for each specific API method

# ===== CONFIGURATION (MODIFY FOR EACH METHOD) =====
METHOD_NAME="method_name"          # Change this for each method script
VIEW_FUNCTION=""                   # Leave empty for direct JSON-RPC methods (like metashrew_height), 
                                   # or set to view function name for metashrew_view methods

# Default values
DEFAULT_PARAM1="param1-default"    # Replace with appropriate defaults
DEFAULT_PARAM2="param2-default"    # Add or remove parameter defaults as needed
PRODUCTION_ENDPOINT="https://mainnet.sandshrew.io/v2/lasereyes"
LOCAL_ENDPOINT="http://localhost:8080"

# ===== HELP FUNCTION =====
show_help() {
  echo "Usage: $0 [options]"
  echo ""
  echo "Options:"
  echo "  -h, --help           Show this help message"
  echo "  -p, --param1 VAL     Set parameter 1 (default: $DEFAULT_PARAM1)"
  echo "  -q, --param2 VAL     Set parameter 2 (default: $DEFAULT_PARAM2)"
  echo "  -e, --endpoint URL   Set API endpoint (default: $PRODUCTION_ENDPOINT)"
  echo "  -l, --local          Use local endpoint ($LOCAL_ENDPOINT)"
  echo ""
  echo "Example:"
  echo "  $0 --param1 value1 --local"
  exit 0
}

# ===== PARAMETER PARSING =====
# Initialize parameters with defaults
PARAM1=$DEFAULT_PARAM1
PARAM2=$DEFAULT_PARAM2
ENDPOINT=$PRODUCTION_ENDPOINT

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case "$1" in
    -h|--help)
      show_help
      ;;
    -p|--param1)
      PARAM1="$2"
      shift 2
      ;;
    -q|--param2)
      PARAM2="$2"
      shift 2
      ;;
    -e|--endpoint)
      ENDPOINT="$2"
      shift 2
      ;;
    -l|--local)
      ENDPOINT=$LOCAL_ENDPOINT
      shift
      ;;
    *)
      echo "Unknown option: $1"
      show_help
      ;;
  esac
done

# ===== PARAMETER ENCODING FUNCTION =====
# Modify this function to correctly encode parameters for your specific method
encode_params() {
  local param1="$1"
  local param2="$2"
  
  # Example encoding - modify for each method
  # For simple methods like metashrew_height, this might return empty array
  # For complex methods, perform appropriate encoding here
  
  if [ -n "$VIEW_FUNCTION" ]; then
    # If this is a view function, we need to encode for metashrew_view
    echo "[$VIEW_FUNCTION, \"$param1\", \"$param2\"]"
  else
    # Direct JSON-RPC method
    echo "[$param1, $param2]"
  fi
}

# ===== BUILD REQUEST =====
build_request() {
  local method_name="$1"
  local params="$2"
  
  if [ -n "$VIEW_FUNCTION" ]; then
    # If using a view function, the method is metashrew_view
    echo "{\"method\":\"metashrew_view\",\"params\":$params,\"id\":0,\"jsonrpc\":\"2.0\"}"
  else
    # Direct JSON-RPC method
    echo "{\"method\":\"$method_name\",\"params\":$params,\"id\":0,\"jsonrpc\":\"2.0\"}"
  fi
}

# ===== EXECUTE REQUEST =====
params=$(encode_params "$PARAM1" "$PARAM2")
request=$(build_request "$METHOD_NAME" "$params")

# ===== DISPLAY INFO =====
echo "Testing $METHOD_NAME method..."
echo "Endpoint: $ENDPOINT"
echo "Parameters:"
echo "  - param1: $PARAM1"
echo "  - param2: $PARAM2"
echo ""
echo "Request: $request"
echo ""
echo "Sending request..."

# ===== EXECUTE CURL REQUEST =====
curl -vvv "$ENDPOINT" -X POST \
  -d "$request" \
  -H 'Content-Type: application/json' | jq .

echo ""
echo "Request complete."
