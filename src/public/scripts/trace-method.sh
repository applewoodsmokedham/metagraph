#!/bin/bash

# trace-method.sh - Test script for the trace API method
# 
# This script tests the trace view function through the Metashrew API
# It retrieves execution traces for a specific transaction

# ===== CONFIGURATION =====
METHOD_NAME="metashrew_view"
VIEW_FUNCTION="trace"

# Default values
DEFAULT_TX_ID="0000000000000000000000000000000000000000000000000000000000000000"
DEFAULT_OUTPUT_INDEX="0"
DEFAULT_BLOCK_TAG="latest"
PRODUCTION_ENDPOINT="https://mainnet.sandshrew.io/v2/lasereyes"
LOCAL_ENDPOINT="http://localhost:8080"

# ===== HELP FUNCTION =====
show_help() {
  echo "Usage: $0 [options]"
  echo ""
  echo "Options:"
  echo "  -h, --help                Show this help message"
  echo "  -t, --tx-id TXID          Transaction ID to trace (default: $DEFAULT_TX_ID)"
  echo "  -o, --output-index INDEX  Output index (default: $DEFAULT_OUTPUT_INDEX)"
  echo "  -b, --block-tag TAG       Block tag (default: $DEFAULT_BLOCK_TAG)"
  echo "  -e, --endpoint URL        Set API endpoint (default: $PRODUCTION_ENDPOINT)"
  echo "  -l, --local               Use local endpoint ($LOCAL_ENDPOINT)"
  echo "  -f, --output-file FILE    Save trace data to file"
  echo ""
  echo "Example:"
  echo "  $0 --tx-id abcdef1234 --output-index 1 --output-file trace.json"
  exit 0
}

# ===== PARAMETER PARSING =====
# Initialize parameters with defaults
TX_ID=$DEFAULT_TX_ID
OUTPUT_INDEX=$DEFAULT_OUTPUT_INDEX
BLOCK_TAG=$DEFAULT_BLOCK_TAG
ENDPOINT=$PRODUCTION_ENDPOINT
OUTPUT_FILE=""

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case "$1" in
    -h|--help)
      show_help
      ;;
    -t|--tx-id)
      TX_ID="$2"
      shift 2
      ;;
    -o|--output-index)
      OUTPUT_INDEX="$2"
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
    -f|--output-file)
      OUTPUT_FILE="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1"
      show_help
      ;;
  esac
done

# ===== PARAMETER ENCODING FUNCTION =====
# Function to encode outpoint for the trace call
encode_outpoint() {
  local tx_id=$1
  local output_index=$2
  
  # Convert output index to little-endian hex
  local output_hex=$(printf '%08x' $output_index | fold -w2 | tac | tr -d '\n')
  
  # Final encoding - this is a simplified version
  echo "0x${tx_id}${output_hex}"
}

# Encode parameters for the API call
encode_params() {
  local tx_id="$1"
  local output_index="$2"
  local blockTag="$3"
  
  local encodedOutpoint=$(encode_outpoint "$tx_id" "$output_index")
  
  # Return properly formatted params array for metashrew_view
  echo "[\"$VIEW_FUNCTION\", \"$encodedOutpoint\", \"$blockTag\"]"
}

# ===== BUILD REQUEST =====
params=$(encode_params "$TX_ID" "$OUTPUT_INDEX" "$BLOCK_TAG")
request="{\"method\":\"$METHOD_NAME\",\"params\":$params,\"id\":0,\"jsonrpc\":\"2.0\"}"

# ===== DISPLAY INFO =====
echo "Testing $VIEW_FUNCTION view function..."
echo "Endpoint: $ENDPOINT"
echo "Parameters:"
echo "  - transaction ID: $TX_ID"
echo "  - output index: $OUTPUT_INDEX"
echo "  - block tag: $BLOCK_TAG"
if [ -n "$OUTPUT_FILE" ]; then
  echo "  - output file: $OUTPUT_FILE"
fi
echo ""
echo "Request: $request"
echo ""
echo "Sending request..."

# ===== EXECUTE CURL REQUEST =====
if [ -n "$OUTPUT_FILE" ]; then
  # Save to file
  curl -s "$ENDPOINT" -X POST \
    -d "$request" \
    -H 'Content-Type: application/json' > "$OUTPUT_FILE"
  
  echo "Trace data saved to $OUTPUT_FILE"
  # Show file size
  file_size=$(du -h "$OUTPUT_FILE" | cut -f1)
  echo "File size: $file_size"
else
  # Display to console with jq formatting - can be large!
  curl -s "$ENDPOINT" -X POST \
    -d "$request" \
    -H 'Content-Type: application/json' | jq .
fi

echo ""
echo "Request complete."
