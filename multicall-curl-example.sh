#!/bin/bash
# Example curl command for a multicall to trace multiple transactions

# Load environment variables
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# Set default values if not found in env
METASHREW_API_URL=${METASHREW_API_URL:-"https://mainnet.sandshrew.io/v2/subfrost"}
SANDSHREW_PROJECT_ID=${SANDSHREW_PROJECT_ID:-""}

# Format the multicall request body
cat > multicall-request.json << EOF
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "sandshrew_multicall",
  "params": [
    [
      ["alkanes_trace", [{"txid": "9a222f0e9e176e5a70c95dbbe59afce6607bb5a50c7ef96ea91fa49f8f14525e", "vout": 0}]],
      ["alkanes_trace", [{"txid": "9a222f0e9e176e5a70c95dbbe59afce6607bb5a50c7ef96ea91fa49f8f14525e", "vout": 1}]],
      ["alkanes_trace", [{"txid": "9a222f0e9e176e5a70c95dbbe59afce6607bb5a50c7ef96ea91fa49f8f14525e", "vout": 2}]],
      ["alkanes_trace", [{"txid": "4cb697d3e3028c4e82458e620e3b53fe16c37f51e82f261dce1c3e4a5285da3c", "vout": 0}]],
      ["alkanes_trace", [{"txid": "5dead174fbf3cf80803bd4d9c05cd411c8d66ee94a5c1d6b2a6b0ea36e7bb9f0", "vout": 1}]]
    ]
  ]
}
EOF

# Execute the curl command
echo "Sending multicall request to ${METASHREW_API_URL}"
curl -X POST "${METASHREW_API_URL}" \
  -H "Content-Type: application/json" \
  -H "X-Sandshrew-Project-ID: ${SANDSHREW_PROJECT_ID}" \
  -d @multicall-request.json | jq

# Output the equivalent curl command for reference
echo -e "\nEquivalent curl command (with environment variables expanded):"
echo "curl -X POST \"${METASHREW_API_URL}\" \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -H \"X-Sandshrew-Project-ID: ${SANDSHREW_PROJECT_ID}\" \\"
echo "  -d '{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"sandshrew_multicall\",\"params\":[[
    [\"alkanes_trace\", [{\"txid\": \"9a222f0e9e176e5a70c95dbbe59afce6607bb5a50c7ef96ea91fa49f8f14525e\", \"vout\": 0}]],
    [\"alkanes_trace\", [{\"txid\": \"9a222f0e9e176e5a70c95dbbe59afce6607bb5a50c7ef96ea91fa49f8f14525e\", \"vout\": 1}]],
    [\"alkanes_trace\", [{\"txid\": \"9a222f0e9e176e5a70c95dbbe59afce6607bb5a50c7ef96ea91fa49f8f14525e\", \"vout\": 2}]],
    [\"alkanes_trace\", [{\"txid\": \"4cb697d3e3028c4e82458e620e3b53fe16c37f51e82f261dce1c3e4a5285da3c\", \"vout\": 0}]],
    [\"alkanes_trace\", [{\"txid\": \"5dead174fbf3cf80803bd4d9c05cd411c8d66ee94a5c1d6b2a6b0ea36e7bb9f0\", \"vout\": 1}]]
  ]]}'" | jq
