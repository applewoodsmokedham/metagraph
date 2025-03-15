import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Add Node.js polyfills for Bitcoin libraries
    nodePolyfills({
      // Whether to polyfill specific globals
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      // Whether to polyfill `node:` protocol imports
      protocolImports: true,
      // Include additional polyfills for streams and other Node.js features
      include: ['stream', 'util', 'path', 'crypto', 'events', 'os', 'fs']
    }),
  ],
  define: {
    // Ensure process.env is properly handled
    'process.env': process.env,
    // Add specific process.version for SDK compatibility
    'process.version': JSON.stringify('v16.0.0'),
  },
  resolve: {
    alias: {
      // Add aliases for problematic Node.js modules
      stream: 'stream-browserify',
      crypto: 'crypto-browserify',
    }
  },
  optimizeDeps: {
    esbuildOptions: {
      // Define Node.js global variables during build
      define: {
        global: 'globalThis',
      },
    },
  },
})
