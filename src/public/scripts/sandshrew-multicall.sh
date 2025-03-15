#!/bin/bash

# sandshrew-multicall.sh - Test script for the sandshrew_multicall API method
#
# This script tests the sandshrew_multicall JSON-RPC method which allows
# batching multiple API calls into a single request

# ===== CONFIGURATION =====
METHOD_NAME="sandshrew_multicall"

# Default values
PRODUCTION_ENDPOINT="https://mainnet.sandshrew.io/v2/lasereyes"
LOCAL_ENDPOINT="http://localhost:8080"

# ===== HELP FUNCTION =====
show_help() {
  echo "Usage: $0 [options]"
  echo ""
  echo "Options:"
  echo "  -h, --help           Show this help message"
  echo "  -e, --endpoint URL   Set API endpoint (default: $PRODUCTION_ENDPOINT)"
  echo "  -l, --local          Use local endpoint ($LOCAL_ENDPOINT)"
  echo "  -c, --calls LIST     Comma-separated list of methods to call (default: metashrew_height,btc_getblockcount)"
  echo ""
  echo "Example:"
  echo "  $0 --local --calls metashrew_height,btc_getblockcount"
  exit 0
}

# ===== PARAMETER PARSING =====
# Initialize parameters with defaults
ENDPOINT=$PRODUCTION_ENDPOINT
CALLS="metashrew_height,btc_getblockcount"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case "$1" in
    -h|--help)
      show_help
      ;;
    -e|--endpoint)
      ENDPOINT="$2"
      shift 2
      ;;
    -l|--local)
      ENDPOINT=$LOCAL_ENDPOINT
      shift
      ;;
    -c|--calls)
      CALLS="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1"
      show_help
      ;;
  esac
done

# ===== BUILD CALLS ARRAY =====
build_calls_array() {
  local IFS=','
  read -ra methods <<< "$CALLS"
  local calls_array="["
  
  for i in "${!methods[@]}"; do
    if [ $i -gt 0 ]; then
      calls_array+=","
    fi
    # Add each method with empty params array
    calls_array+="[\"${methods[$i]}\",[]]"
  done
  
  calls_array+="]"
  echo "$calls_array"
}

# ===== BUILD REQUEST =====
calls_array=$(build_calls_array)
request="{\"method\":\"$METHOD_NAME\",\"params\":[$calls_array],\"id\":0,\"jsonrpc\":\"2.0\"}"

# ===== DISPLAY INFO =====
echo "Testing $METHOD_NAME method with multiple calls..."
echo "Endpoint: $ENDPOINT"
echo "Calls: $CALLS"
echo ""
echo "Request: $request"
echo ""
echo "Sending request..."

# ===== EXECUTE CURL REQUEST =====
response=$(curl -s "$ENDPOINT" -X POST \
  -d "$request" \
  -H 'Content-Type: application/json')

echo ""
echo "Response:"
echo "$response" | jq .

echo ""
echo "Summary of Results:"

# Extract and display each result
if [ "$(echo "$response" | jq -r 'has("result")')" == "true" ]; then
  results=$(echo "$response" | jq -r '.result')
  count=$(echo "$results" | jq -r 'length')
  
  IFS=',' read -ra method_names <<< "$CALLS"
  
  for i in $(seq 0 $(($count-1))); do
    method="${method_names[$i]}"
    result=$(echo "$results" | jq -r ".[$i]")
    error=$(echo "$result" | jq -r 'if has("error") then .error else "null" end')
    
    echo "----- $method -----"
    if [ "$error" != "null" ]; then
      echo "Error: $error"
    else
      value=$(echo "$result" | jq -r '.result')
      echo "Result: $value"
    fi
    echo ""
  done
else
  echo "Error in multicall response"
  echo "$response" | jq -r '.error'
fi

echo "Request complete."
