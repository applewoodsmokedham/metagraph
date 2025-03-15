#!/bin/bash

# metashrew_height.sh - Test script for the metashrew_height API method
#
# This script tests the metashrew_height JSON-RPC method which returns 
# the current indexer height of the Metashrew API

# ===== CONFIGURATION =====
METHOD_NAME="metashrew_height"
# No view function name since this is a direct JSON-RPC method

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
  echo "  -c, --compare        Also fetch btc_getblockcount and show comparison"
  echo ""
  echo "Example:"
  echo "  $0 --local --compare"
  exit 0
}

# ===== PARAMETER PARSING =====
# Initialize parameters with defaults
ENDPOINT=$PRODUCTION_ENDPOINT
COMPARE=false

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
    -c|--compare)
      COMPARE=true
      shift
      ;;
    *)
      echo "Unknown option: $1"
      show_help
      ;;
  esac
done

# ===== BUILD REQUEST =====
# metashrew_height takes no parameters
request="{\"method\":\"$METHOD_NAME\",\"params\":[],\"id\":0,\"jsonrpc\":\"2.0\"}"

# ===== DISPLAY INFO =====
echo "Testing $METHOD_NAME method..."
echo "Endpoint: $ENDPOINT"
echo ""
echo "Request: $request"
echo ""
echo "Sending request..."

# ===== EXECUTE CURL REQUEST =====
response=$(curl -s "$ENDPOINT" -X POST \
  -d "$request" \
  -H 'Content-Type: application/json')

# Extract height value from response
height=$(echo "$response" | jq -r '.result')

echo ""
echo "Response: $response"
echo ""

# Try to format the height as a number if it's not an error
if [[ "$height" != "null" ]]; then
  parsed_height=$(echo "$height" | tr -d '"')
  echo "Current Metashrew Height: $parsed_height"

  # If compare option is set, also get btc_getblockcount
  if $COMPARE; then
    echo ""
    echo "Fetching Bitcoin node height for comparison..."
    btc_request="{\"method\":\"btc_getblockcount\",\"params\":[],\"id\":0,\"jsonrpc\":\"2.0\"}"
    btc_response=$(curl -s "$ENDPOINT" -X POST \
      -d "$btc_request" \
      -H 'Content-Type: application/json')
    
    btc_height=$(echo "$btc_response" | jq -r '.result')
    parsed_btc=$(echo "$btc_height" | tr -d '"')
    
    echo "Bitcoin Node Height: $parsed_btc"
    
    # Calculate difference
    if [[ "$parsed_height" =~ ^[0-9]+$ ]] && [[ "$parsed_btc" =~ ^[0-9]+$ ]]; then
      difference=$((parsed_height - parsed_btc))
      echo ""
      echo "Difference: $difference blocks"
      
      if [[ $difference -le 1 ]] && [[ $difference -ge 0 ]]; then
        echo "Status: SYNCED (Metashrew is at or ahead of Bitcoin node height)"
      else
        echo "Status: SYNCING ($difference blocks behind)"
      fi
    fi
  fi
else
  echo "Error: Unable to retrieve height"
fi

echo ""
echo "Request complete."
