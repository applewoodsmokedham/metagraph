#!/bin/bash
# Multicall curl examples for Alkanes transaction tracing

# Load API key from .env
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

TARGET_TXID="9a222f0e9e176e5a70c95dbbe59afce6607bb5a50c7ef96ea91fa49f8f14525e"
API_URL=${METASHREW_API_URL:-"https://mainnet.sandshrew.io/v2/subfrost"}
API_KEY=${SANDSHREW_PROJECT_ID}

echo "========= MULTICALL APPROACH ==========="
echo "API URL: $API_URL"

# Format 1: Using direct method calls without metashrew_view
echo -e "\n1. Direct multicall for transaction traces:"
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "X-Sandshrew-Project-ID: $API_KEY" \
  -d '{
    "jsonrpc": "2.0", 
    "id": 1, 
    "method": "sandshrew_multicall", 
    "params": [[
      ["getrawtransaction", ["'$TARGET_TXID'", true]],
      ["alkanes_trace", [{"txid": "'$TARGET_TXID'", "vout": 0}]],
      ["alkanes_trace", [{"txid": "'$TARGET_TXID'", "vout": 1}]]
    ]]
  }'

# Format 2: Using a mix of direct methods and metashrew_view
echo -e "\n\n2. Mixed multicall with metashrew_view:"
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "X-Sandshrew-Project-ID: $API_KEY" \
  -d '{
    "jsonrpc": "2.0", 
    "id": 2, 
    "method": "sandshrew_multicall", 
    "params": [[
      ["getrawtransaction", ["'$TARGET_TXID'", true]],
      ["metashrew_view", ["trace", "{\"txid\":\"'$TARGET_TXID'\",\"vout\":0}", "latest"]],
      ["metashrew_view", ["trace", "{\"txid\":\"'$TARGET_TXID'\",\"vout\":1}", "latest"]]
    ]]
  }'

# Format 3: Create hex-encoded trace input for metashrew_view
TRACE_INPUT=$(echo -n '{"txid":"'$TARGET_TXID'","vout":0}' | xxd -p | tr -d '\n')
echo -e "\n\n3. Hex-encoded input for metashrew_view trace:"
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "X-Sandshrew-Project-ID: $API_KEY" \
  -d '{
    "jsonrpc": "2.0", 
    "id": 3, 
    "method": "sandshrew_multicall", 
    "params": [[
      ["getrawtransaction", ["'$TARGET_TXID'", true]],
      ["metashrew_view", ["trace", "'$TRACE_INPUT'", "latest"]]
    ]]
  }'

# Format 4: Try using metashrew_height and btc_getblockcount (known to work from memory)
echo -e "\n\n4. Proven working format from documentation:"
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "X-Sandshrew-Project-ID: $API_KEY" \
  -d '{
    "jsonrpc": "2.0", 
    "id": 4, 
    "method": "sandshrew_multicall", 
    "params": [[
      ["metashrew_height", []],
      ["btc_getblockcount", []]
    ]]
  }'

echo -e "\n\n========= INDIVIDUAL METHODS ==========="

# Individual call to get transaction details
echo -e "\n5. Individual call for transaction details:"
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "X-Sandshrew-Project-ID: $API_KEY" \
  -d '{
    "jsonrpc": "2.0", 
    "id": 5, 
    "method": "getrawtransaction", 
    "params": ["'$TARGET_TXID'", true]
  }'

# Individual call to alkanes_trace
echo -e "\n\n6. Individual call for alkanes_trace:"
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "X-Sandshrew-Project-ID: $API_KEY" \
  -d '{
    "jsonrpc": "2.0", 
    "id": 6, 
    "method": "alkanes_trace", 
    "params": [{"txid": "'$TARGET_TXID'", "vout": 0}]
  }'
