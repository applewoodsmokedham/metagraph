#!/bin/bash
# Optimized multicall curl example following best practices for Metashrew API
# Based on findings that the API works better WITHOUT X-Sandshrew-Project-ID headers

# Load environment variables
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# Set the correct URL - using lasereyes endpoint which works better than subfrost
METASHREW_API_URL=${METASHREW_API_URL:-"https://mainnet.sandshrew.io/v2/lasereyes"}

# Create the request payload with correct method, params, id, jsonrpc field order
cat > optimized-multicall-request.json << EOF
{
  "method": "sandshrew_multicall",
  "params": [[
    ["metashrew_height", []],
    ["btc_getblockcount", []],
    ["alkanes_trace", [{"txid": "9a222f0e9e176e5a70c95dbbe59afce6607bb5a50c7ef96ea91fa49f8f14525e", "vout": 0}]],
    ["alkanes_trace", [{"txid": "9a222f0e9e176e5a70c95dbbe59afce6607bb5a50c7ef96ea91fa49f8f14525e", "vout": 1}]],
    ["alkanes_trace", [{"txid": "4cb697d3e3028c4e82458e620e3b53fe16c37f51e82f261dce1c3e4a5285da3c", "vout": 0}]]
  ]],
  "id": 0,
  "jsonrpc": "2.0"
}
EOF

# Execute the curl command - NO X-Sandshrew-Project-ID header
echo "Sending optimized multicall request to ${METASHREW_API_URL}"
curl -vvv -X POST "${METASHREW_API_URL}" \
  -H "Content-Type: application/json" \
  -d @optimized-multicall-request.json | jq

# For copy-paste convenience, here's the raw curl command (with correct field order):
echo -e "\n\nRaw curl command for copy-paste:"
echo "curl -vvv -X POST \"${METASHREW_API_URL}\" \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{
  \"method\": \"sandshrew_multicall\",
  \"params\": [[
    [\"metashrew_height\", []],
    [\"btc_getblockcount\", []],
    [\"alkanes_trace\", {\"txid\": \"9a222f0e9e176e5a70c95dbbe59afce6607bb5a50c7ef96ea91fa49f8f14525e\", \"vout\": 0}],
    [\"alkanes_trace\", {\"txid\": \"9a222f0e9e176e5a70c95dbbe59afce6607bb5a50c7ef96ea91fa49f8f14525e\", \"vout\": 1}],
    [\"alkanes_trace\", {\"txid\": \"4cb697d3e3028c4e82458e620e3b53fe16c37f51e82f261dce1c3e4a5285da3c\", \"vout\": 0}]
  ]],
  \"id\": 0,
  \"jsonrpc\": \"2.0\"
}' | jq"
