#!/bin/bash
# Correctly formatted multicall curl example for Metashrew API
# Following all best practices and correct parameter structure

# Set the API URL to the correct endpoint (lasereyes performs better than subfrost)
METASHREW_API_URL="https://mainnet.sandshrew.io/v2/lasereyes"

# Create the request payload with correct field order and proper nested array formats
cat > correct-multicall-request.json << EOF
{
  "method": "sandshrew_multicall",
  "params": [
    [
      ["metashrew_height", []],
      ["btc_getblockcount", []],
      ["alkanes_trace", [{"txid": "9a222f0e9e176e5a70c95dbbe59afce6607bb5a50c7ef96ea91fa49f8f14525e", "vout": 0}]]
    ]
  ],
  "id": 0,
  "jsonrpc": "2.0"
}
EOF

# Execute the curl command - NO X-Sandshrew-Project-ID header (API works better without it)
echo "Sending correct multicall request to ${METASHREW_API_URL}"
curl -vvv -X POST "${METASHREW_API_URL}" \
  -H "Content-Type: application/json" \
  -d @correct-multicall-request.json | jq

# For copy-paste convenience, here's the raw curl command (with correct field order):
echo -e "\n\nRaw curl command for copy-paste:"
echo "curl -vvv -X POST \"${METASHREW_API_URL}\" \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{
  \"method\": \"sandshrew_multicall\",
  \"params\": [
    [
      [\"metashrew_height\", []],
      [\"btc_getblockcount\", []],
      [\"alkanes_trace\", [{\"txid\": \"9a222f0e9e176e5a70c95dbbe59afce6607bb5a50c7ef96ea91fa49f8f14525e\", \"vout\": 0}]]
    ]
  ],
  \"id\": 0,
  \"jsonrpc\": \"2.0\"
}' | jq"
