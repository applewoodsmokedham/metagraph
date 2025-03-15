#!/bin/bash

# simulate.sh - Test script for the simulate API method
# 
# This script tests the simulate view function which executes
# Alkanes smart contracts in a simulation environment

# ===== CONFIGURATION =====
METHOD_NAME="metashrew_view"
VIEW_FUNCTION="simulate"

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
  echo "  -t, --tx-id TXID          Transaction ID to simulate (default: $DEFAULT_TX_ID)"
  echo "  -o, --output-index INDEX  Output index (default: $DEFAULT_OUTPUT_INDEX)"
  echo "  -d, --data HEX            Call data in hex format"
  echo "  -b, --block-tag TAG       Block tag (default: $DEFAULT_BLOCK_TAG)"
  echo "  -e, --endpoint URL        Set API endpoint (default: $PRODUCTION_ENDPOINT)"
  echo "  -l, --local               Use local endpoint ($LOCAL_ENDPOINT)"
  echo "  -f, --file FILE           Read message context parcel from file"
  echo ""
  echo "Example:"
  echo "  $0 --tx-id abcdef1234 --output-index 1 --data 0xffaa"
  echo "  $0 --file message_context.hex"
  exit 0
}

# ===== PARAMETER PARSING =====
# Initialize parameters with defaults
TX_ID=$DEFAULT_TX_ID
OUTPUT_INDEX=$DEFAULT_OUTPUT_INDEX
CALL_DATA=""
BLOCK_TAG=$DEFAULT_BLOCK_TAG
ENDPOINT=$PRODUCTION_ENDPOINT
INPUT_FILE=""

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
    -d|--data)
      CALL_DATA="$2"
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
    -f|--file)
      INPUT_FILE="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1"
      show_help
      ;;
  esac
done

# ===== PARAMETER ENCODING FUNCTION =====
# Function to encode message context parcel
encode_message_context() {
  local tx_id=$1
  local output_index=$2
  local call_data=$3
  
  # This is a simplified encoding - in a real implementation, 
  # proper protobuf encoding would be needed for MessageContextParcel
  
  # Convert values to hex format
  local tx_hex=$(echo -n "$tx_id" | xxd -p -r)
  local output_hex=$(printf '%08x' $output_index)
  local calldata_hex=$call_data
  
  # Create a basic encoding with outpoint and calldata
  echo "0x${tx_id}${output_hex}${calldata_hex}"
}

# Encode parameters for the API call
encode_params() {
  local tx_id="$1"
  local output_index="$2"
  local call_data="$3"
  local blockTag="$4"
  local file="$5"
  
  local encodedContext
  
  if [ -n "$file" ] && [ -f "$file" ]; then
    # Read hex from file
    encodedContext=$(cat "$file")
  else
    # Encode from parameters
    encodedContext=$(encode_message_context "$tx_id" "$output_index" "$call_data")
  fi
  
  # Return properly formatted params array for metashrew_view
  echo "[\"$VIEW_FUNCTION\", \"$encodedContext\", \"$blockTag\"]"
}

# ===== BUILD REQUEST =====
params=$(encode_params "$TX_ID" "$OUTPUT_INDEX" "$CALL_DATA" "$BLOCK_TAG" "$INPUT_FILE")
request="{\"method\":\"$METHOD_NAME\",\"params\":$params,\"id\":0,\"jsonrpc\":\"2.0\"}"

# ===== DISPLAY INFO =====
echo "Testing $VIEW_FUNCTION view function..."
echo "Endpoint: $ENDPOINT"
echo "Parameters:"

if [ -n "$INPUT_FILE" ]; then
  echo "  - Using message context from file: $INPUT_FILE"
else
  echo "  - transaction ID: $TX_ID"
  echo "  - output index: $OUTPUT_INDEX"
  if [ -n "$CALL_DATA" ]; then
    echo "  - call data: $CALL_DATA"
  else
    echo "  - call data: none"
  fi
fi

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
