#!/bin/bash

# traceblock.sh - Test script for the traceblock API method
# 
# This script tests the traceblock view function through the Metashrew API
# It retrieves execution traces for all transactions in a specific block

# ===== CONFIGURATION =====
METHOD_NAME="metashrew_view"
VIEW_FUNCTION="traceblock"

# Default values
DEFAULT_HEIGHT="800000"
DEFAULT_BLOCK_TAG="latest"
PRODUCTION_ENDPOINT="https://mainnet.sandshrew.io/v2/lasereyes"
LOCAL_ENDPOINT="http://localhost:8080"

# ===== HELP FUNCTION =====
show_help() {
  echo "Usage: $0 [options]"
  echo ""
  echo "Options:"
  echo "  -h, --help                Show this help message"
  echo "  -b, --block-height HEIGHT Block height to trace (default: $DEFAULT_HEIGHT)"
  echo "  -t, --block-tag TAG       Block tag (default: $DEFAULT_BLOCK_TAG)"
  echo "  -e, --endpoint URL        Set API endpoint (default: $PRODUCTION_ENDPOINT)"
  echo "  -l, --local               Use local endpoint ($LOCAL_ENDPOINT)"
  echo "  -o, --output FILE         Save trace data to file"
  echo ""
  echo "Example:"
  echo "  $0 --block-height 800001 --local --output trace_output.json"
  exit 0
}

# ===== PARAMETER PARSING =====
# Initialize parameters with defaults
HEIGHT=$DEFAULT_HEIGHT
BLOCK_TAG=$DEFAULT_BLOCK_TAG
ENDPOINT=$PRODUCTION_ENDPOINT
OUTPUT_FILE=""

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case "$1" in
    -h|--help)
      show_help
      ;;
    -b|--block-height)
      HEIGHT="$2"
      shift 2
      ;;
    -t|--block-tag)
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
    -o|--output)
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
# Function to encode height for the traceblock call
encode_height() {
  local height=$1
  
  # Convert height to hex - 8 bytes, little-endian
  local height_hex=$(printf '%016x' $height | fold -w2 | tac | tr -d '\n')
  
  # Final encoding - this is simplified
  echo "0x${height_hex}"
}

# Encode parameters for the API call
encode_params() {
  local height="$1"
  local blockTag="$2"
  local encodedHeight=$(encode_height "$height")
  
  # Return properly formatted params array for metashrew_view
  echo "[\"$VIEW_FUNCTION\", \"$encodedHeight\", \"$blockTag\"]"
}

# ===== BUILD REQUEST =====
params=$(encode_params "$HEIGHT" "$BLOCK_TAG")
request="{\"method\":\"$METHOD_NAME\",\"params\":$params,\"id\":0,\"jsonrpc\":\"2.0\"}"

# ===== DISPLAY INFO =====
echo "Testing $VIEW_FUNCTION view function..."
echo "Endpoint: $ENDPOINT"
echo "Parameters:"
echo "  - block height: $HEIGHT"
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
