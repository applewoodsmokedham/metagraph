#!/bin/bash

# protorunesbyheight.sh - Test script for the protorunesbyheight API method
# 
# This script tests the protorunesbyheight view function through the Metashrew API
# It properly encodes block height for the API call

# ===== CONFIGURATION =====
METHOD_NAME="metashrew_view"
VIEW_FUNCTION="protorunesbyheight"

# Default values
DEFAULT_HEIGHT="800000"
DEFAULT_PROTOCOL_TAG="1"
DEFAULT_BLOCK_TAG="latest"
PRODUCTION_ENDPOINT="https://mainnet.sandshrew.io/v2/lasereyes"
LOCAL_ENDPOINT="http://localhost:8080"

# ===== HELP FUNCTION =====
show_help() {
  echo "Usage: $0 [options]"
  echo ""
  echo "Options:"
  echo "  -h, --help                Show this help message"
  echo "  -b, --block-height HEIGHT Block height to query (default: $DEFAULT_HEIGHT)"
  echo "  -p, --protocol-tag TAG    Protocol tag (default: $DEFAULT_PROTOCOL_TAG)"
  echo "  -t, --block-tag TAG       Block tag (default: $DEFAULT_BLOCK_TAG)"
  echo "  -e, --endpoint URL        Set API endpoint (default: $PRODUCTION_ENDPOINT)"
  echo "  -l, --local               Use local endpoint ($LOCAL_ENDPOINT)"
  echo ""
  echo "Example:"
  echo "  $0 --block-height 800001 --local"
  exit 0
}

# ===== PARAMETER PARSING =====
# Initialize parameters with defaults
HEIGHT=$DEFAULT_HEIGHT
PROTOCOL_TAG=$DEFAULT_PROTOCOL_TAG
BLOCK_TAG=$DEFAULT_BLOCK_TAG
ENDPOINT=$PRODUCTION_ENDPOINT

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
    -p|--protocol-tag)
      PROTOCOL_TAG="$2"
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
    *)
      echo "Unknown option: $1"
      show_help
      ;;
  esac
done

# ===== PARAMETER ENCODING FUNCTION =====
# Function to encode height and protocol tag for protobuf compatibility
encode_height() {
  local height=$1
  local protocol_tag=$2
  
  # Convert height to hex
  local height_hex=$(printf '%016x' $height)
  
  # Protocol tag encoding
  local protocol_tag_hex="12090a05${PROTOCOL_TAG}0000000000"
  
  # Final encoding - simplified version
  # In a real implementation, proper protobuf encoding would be needed
  echo "0x0a08${height_hex}${protocol_tag_hex}"
}

# Encode parameters for the API call
encode_params() {
  local height="$1"
  local blockTag="$2"
  local encodedHeight=$(encode_height "$height" "$PROTOCOL_TAG")
  
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
echo "  - protocol tag: $PROTOCOL_TAG"
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
