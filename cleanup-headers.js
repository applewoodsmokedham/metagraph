/**
 * Cleanup script to remove X-Sandshrew-Project-ID headers from all test files
 * Based on findings that the API works better WITHOUT these headers
 */

const fs = require('fs');
const path = require('path');

// List of files to clean up (excluding the main application files)
const filesToClean = [
  'alkanes-trace-analyzer.js',
  'alkanes-traceblock-test.js',
  'alkanes-transaction-tracer.js',
  'block-trace-multicall.js',
  'bytes-reversed-trace-test.js',
  'check-alkanes-tx.js',
  'check-all-vouts.js',
  'correct-multicall-example.js',
  'direct-trace-test.js',
  'oyl-trace-test.js',
  'protobuf-trace-test.js',
  'simple-trace-test.js',
  'test-alkanes-trace.js',
  'test-trace-integration.js',
  'trace-format-test.js',
  'transaction-trace-test.js',
  'verify-transaction.js'
];

// Regular expressions for patterns to remove/replace
const projectIdHeaderRegex = /'X-Sandshrew-Project-ID':\s*\w+/g;
const curlProjectIdRegex = /-H\s+"X-Sandshrew-Project-ID:[^"]*"/g;

// Counter for modified files
let modifiedFiles = 0;

// Process each file
filesToClean.forEach(filename => {
  const filePath = path.join(__dirname, filename);
  
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filename}`);
    return;
  }
  
  try {
    // Read file content
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Remove project ID header from API calls
    content = content.replace(projectIdHeaderRegex, '// Removed Sandshrew Project ID header - API works better without it');
    
    // Remove project ID from curl examples
    content = content.replace(curlProjectIdRegex, '');
    
    // Only write back if changes were made
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Cleaned up ${filename}`);
      modifiedFiles++;
    } else {
      console.log(`ℹ️ No changes needed in ${filename}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filename}:`, error);
  }
});

console.log(`\nSummary: Cleaned up ${modifiedFiles} files`);
console.log('All test files now follow the best practice of not using X-Sandshrew-Project-ID headers');
