#!/bin/bash

# multisimulate.sh - Test script for the multisimulate API method
# 
# This script tests the multisimulate view function which allows
# executing multiple simulations in a single API call

# ===== CONFIGURATION =====
METHOD_NAME="metashrew_view"
VIEW_FUNCTION="multisimulate"

# Default values
DEFAULT_BLOCK_TAG="latest"
PRODUCTION_ENDPOINT="https://mainnet.sandshrew.io/v2/lasereyes"
LOCAL_ENDPOINT="http://localhost:8080"

# ===== HELP FUNCTION =====
show_help() {
  echo "Usage: $0 [options]"
  echo ""
  echo "Options:"
  echo "  -h, --help                Show this help message"
  echo "  -f, --file FILE           Read message context parcels from file (required)"
  echo "  -b, --block-tag TAG       Block tag (default: $DEFAULT_BLOCK_TAG)"
  echo "  -e, --endpoint URL        Set API endpoint (default: $PRODUCTION_ENDPOINT)"
  echo "  -l, --local               Use local endpoint ($LOCAL_ENDPOINT)"
  echo ""
  echo "Example:"
  echo "  $0 --file message_contexts.hex"
  exit 0
}

# ===== PARAMETER PARSING =====
# Initialize parameters with defaults
BLOCK_TAG=$DEFAULT_BLOCK_TAG
ENDPOINT=$PRODUCTION_ENDPOINT
INPUT_FILE=""

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case "$1" in
    -h|--help)
      show_help
      ;;
    -f|--file)
      INPUT_FILE="$2"
      shift 2
      ;;
    -b|--block-tag)
      BLOCK_TAG="$2"
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

# Check if input file is provided
if [ -z "$INPUT_FILE" ]; then
  echo "Error: Input file is required"
  show_help
fi

# Check if input file exists
if [ ! -f "$INPUT_FILE" ]; then
  echo "Error: Input file '$INPUT_FILE' not found"
  exit 1
fi

# ===== READ ENCODED PARCELS FROM FILE =====
read_encoded_parcels() {
  local file="$1"
  cat "$file"
}

# Encode parameters for the API call
encode_params() {
  local file="$1"
  local blockTag="$2"
  
  local encodedParcels=$(read_encoded_parcels "$file")
  
  # Return properly formatted params array for metashrew_view
  echo "[\"$VIEW_FUNCTION\", \"$encodedParcels\", \"$blockTag\"]"
}

# ===== BUILD REQUEST =====
params=$(encode_params "$INPUT_FILE" "$BLOCK_TAG")
request="{\"method\":\"$METHOD_NAME\",\"params\":$params,\"id\":0,\"jsonrpc\":\"2.0\"}"

# ===== DISPLAY INFO =====
echo "Testing $VIEW_FUNCTION view function..."
echo "Endpoint: $ENDPOINT"
echo "Parameters:"
echo "  - message contexts from file: $INPUT_FILE"
echo "  - block tag: $BLOCK_TAG"
echo ""
echo "Request: $request"
echo ""
echo "Sending request..."

# ===== EXECUTE CURL REQUEST =====
curl -s "$ENDPOINT" -X POST \
  -d "$request" \
  -H 'Content-Type: application/json' | jq .

echo ""
echo "Request complete."
