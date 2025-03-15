#!/bin/bash

# btc-getblockcount.sh - Test script for the btc_getblockcount API method
#
# This script tests the btc_getblockcount JSON-RPC method which returns 
# the current Bitcoin node height

# ===== CONFIGURATION =====
METHOD_NAME="btc_getblockcount"
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
  echo "  -c, --compare        Also fetch metashrew_height and show comparison"
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
# btc_getblockcount takes no parameters
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
  echo "Current Bitcoin Node Height: $parsed_height"

  # If compare option is set, also get metashrew_height
  if $COMPARE; then
    echo ""
    echo "Fetching Metashrew indexer height for comparison..."
    meta_request="{\"method\":\"metashrew_height\",\"params\":[],\"id\":0,\"jsonrpc\":\"2.0\"}"
    meta_response=$(curl -s "$ENDPOINT" -X POST \
      -d "$meta_request" \
      -H 'Content-Type: application/json')
    
    meta_height=$(echo "$meta_response" | jq -r '.result')
    parsed_meta=$(echo "$meta_height" | tr -d '"')
    
    echo "Metashrew Indexer Height: $parsed_meta"
    
    # Calculate difference
    if [[ "$parsed_height" =~ ^[0-9]+$ ]] && [[ "$parsed_meta" =~ ^[0-9]+$ ]]; then
      difference=$((parsed_meta - parsed_height))
      echo ""
      echo "Difference: $difference blocks"
      
      if [[ $difference -le 1 ]] && [[ $difference -ge 0 ]]; then
        echo "Status: SYNCED (Metashrew is at or ahead of Bitcoin node height)"
      elif [[ $difference -lt 0 ]]; then
        echo "Status: AHEAD (Metashrew is reporting a height ahead of Bitcoin node)"
      else
        echo "Status: SYNCING ($difference blocks behind)"
      fi
    fi
  fi
else
  echo "Error: Unable to retrieve Bitcoin node height"
fi

echo ""
echo "Request complete."
