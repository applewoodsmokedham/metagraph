/**
 * Node.js shims for browser environment
 *
 * This file provides browser-compatible implementations of Node.js-specific
 * features that the Oyl SDK depends on.
 */

// Ensure process object exists
if (typeof process === 'undefined') {
  window.process = {};
}

// Add common Node.js process properties and methods
if (typeof process.version === 'undefined') {
  process.version = 'v16.0.0'; // Simulate Node.js v16
}

if (typeof process.cwd !== 'function') {
  process.cwd = () => '/'; // Return a root path
}

if (typeof process.env === 'undefined') {
  process.env = {};
}

// Add fs module mock
if (typeof window.fs === 'undefined') {
  window.fs = {
    readFileSync: () => '',
    existsSync: () => false,
    mkdirSync: () => {},
    writeFileSync: () => {}
  };
}

// Add path module mock
if (typeof window.path === 'undefined') {
  window.path = {
    join: (...args) => args.join('/'),
    resolve: (...args) => args.join('/'),
    dirname: (p) => p.split('/').slice(0, -1).join('/')
  };
}

// Add other Node.js globals that might be needed
if (typeof global === 'undefined') {
  window.global = window;
}

// Add Buffer if not already defined by polyfills
if (typeof Buffer === 'undefined') {
  window.Buffer = {
    from: (data, encoding) => {
      if (encoding === 'hex') {
        return { data, type: 'hex-string' };
      }
      return { data, type: 'string' };
    },
    isBuffer: (obj) => {
      return obj && obj.type !== undefined;
    }
  };
}

console.log('Node.js shims initialized');

export default {
  initialized: true
};