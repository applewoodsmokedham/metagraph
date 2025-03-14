#!/bin/bash
# Simple height check curl example for Metashrew API
# Following best practices - no project ID, correct field order, proper format

# Set the API URL to the correct endpoint
METASHREW_API_URL="https://mainnet.sandshrew.io/v2/lasereyes"

# Create the request payload with correct field order
cat > height-request.json << EOF
{
  "method": "metashrew_height",
  "params": [],
  "id": 0,
  "jsonrpc": "2.0"
}
EOF

# Execute the curl command - NO X-Sandshrew-Project-ID header
echo "Sending height request to ${METASHREW_API_URL}"
curl -v -X POST "${METASHREW_API_URL}" \
  -H "Content-Type: application/json" \
  -d @height-request.json | jq

# Raw curl command for copy-paste
echo -e "\n\nRaw curl command for copy-paste:"
echo "curl -v -X POST \"${METASHREW_API_URL}\" \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{
  \"method\": \"metashrew_height\",
  \"params\": [],
  \"id\": 0,
  \"jsonrpc\": \"2.0\"
}' | jq"
