# Troubleshooting Guide

This document provides solutions for common issues you might encounter when working with the Runestone Visualizer.

## Table of Contents

- [API Connection Issues](#api-connection-issues)
- [Visualization Problems](#visualization-problems)
- [Development Setup Issues](#development-setup-issues)
- [Browser Compatibility](#browser-compatibility)
- [Common Error Messages](#common-error-messages)

## API Connection Issues

### Cannot Connect to Metashrew API

**Symptoms:** API requests fail with timeout or connection errors.

**Solutions:**

1. **Check API Endpoint:**
   - Ensure you're using the correct endpoint: `https://mainnet.sandshrew.io/v2/lasereyes`
   - Try both local and production endpoints using the endpoint toggle

2. **Remove Project ID Header:**
   - The API works better WITHOUT the `X-Sandshrew-Project-ID` header
   - If you're experiencing connection issues, remove this header from your requests

3. **Verify Request Format:**
   - Ensure your JSON-RPC request follows the exact format:
   ```json
   {
     "method": "method_name",
     "params": [],
     "id": 0,
     "jsonrpc": "2.0"
   }
   ```
   - Field order matters! Keep this exact sequence

4. **Check Network:**
   - Verify your internet connection
   - Check if your network blocks certain API endpoints
   - Try using a different network if possible

### API Returns Errors

**Symptoms:** API returns error responses instead of expected data.

**Solutions:**

1. **Check Parameters:**
   - Verify all parameters are correctly formatted
   - For hex inputs, ensure they're properly encoded
   - Double-check addresses and transaction IDs for typos

2. **Response Parsing:**
   - Some API responses return strings that need to be parsed
   - Use `parseInt()` for numeric string responses
   - For binary data, ensure proper decoding

3. **API Method Version:**
   - Confirm you're using the correct API method for your use case
   - Some methods have multiple versions or alternatives

## Visualization Problems

### Visualizations Not Rendering

**Symptoms:** 3D visualizations or charts don't appear.

**Solutions:**

1. **Check Browser Support:**
   - Ensure your browser supports WebGL
   - Try a different browser (Chrome or Firefox recommended)

2. **Clear Cache:**
   - Clear browser cache and reload the page
   - Try incognito/private browsing mode

3. **Check Console Errors:**
   - Open browser developer tools (F12) and check console for errors
   - Look for specific Three.js or Canvas errors

### Performance Issues

**Symptoms:** Visualizations run slowly or cause browser lag.

**Solutions:**

1. **Reduce Complexity:**
   - For large datasets, try reducing the visualization complexity
   - Use the sampling options if available

2. **Hardware Acceleration:**
   - Enable hardware acceleration in your browser settings
   - Close other resource-intensive applications

3. **Update Graphics Drivers:**
   - Ensure your graphics drivers are up to date

## Development Setup Issues

### Build Failures

**Symptoms:** `npm run build` fails with errors.

**Solutions:**

1. **Dependencies:**
   - Ensure all dependencies are installed: `npm install`
   - Check for compatible Node.js version (v16+ required)

2. **TypeScript Errors:**
   - Address any TypeScript errors in your code
   - Check for type compatibility issues

3. **Clean Build:**
   - Remove the `dist` directory and try again
   - Run `npm cache clean --force` and retry

### Server Won't Start

**Symptoms:** `npm start` fails or server crashes immediately.

**Solutions:**

1. **Port Conflicts:**
   - Check if port 3000 is already in use
   - Change the port in `.env` file if needed

2. **Environment Variables:**
   - Ensure `.env` file exists with required variables
   - Check for syntax errors in environment files

3. **File Permissions:**
   - Verify you have the necessary permissions to run the server
   - Check for read/write access to the project directory

## Browser Compatibility

### Supported Browsers

- Chrome 90+
- Firefox 88+
- Edge 90+
- Safari 14+

### Browser-Specific Issues

**Chrome:**
- If visualizations don't render, enable "Use hardware acceleration when available" in Settings

**Firefox:**
- If WebGL doesn't work, ensure it's not disabled in `about:config`

**Safari:**
- Some WebGL features might have limitations
- Ensure "Prevent cross-site tracking" isn't blocking necessary resources

## Common Error Messages

### "Error connecting to endpoint"

**Cause:** Cannot reach the Metashrew API endpoint.

**Solution:**
- Check your internet connection
- Verify the API endpoint URL
- Try switching between local and production endpoints
- Ensure you're not including the `X-Sandshrew-Project-ID` header

### "Invalid JSON-RPC response"

**Cause:** API returned a response that doesn't follow the JSON-RPC format.

**Solution:**
- Check your request format and parameters
- Verify you're using the correct API method
- Try a simpler request to test basic connectivity

### "WebGL not supported"

**Cause:** Your browser doesn't support WebGL or it's disabled.

**Solution:**
- Update your browser to the latest version
- Enable WebGL in your browser settings
- Try a different browser that supports WebGL
- Update your graphics drivers

### "CORS policy" errors

**Cause:** Cross-Origin Resource Sharing restrictions preventing API access.

**Solution:**
- Use the built-in server proxy for API requests
- Don't make direct API calls from client-side code
- Check CORS configuration on the server

If you encounter issues not covered in this guide, please [open an issue](https://github.com/yourusername/runestone-visualizer/issues) on our GitHub repository.
