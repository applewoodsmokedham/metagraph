/**
 * Mock Provider for the METHANE application
 * 
 * This is a simplified mock implementation of the Oyl SDK Provider
 * for demonstration purposes. In a real application, this would use
 * the actual @oyl/sdk library.
 */

// Simulate different providers for different environments
const providers = {
  production: {
    url: 'https://mainnet.sandshrew.io',
    version: 'v2',
    projectId: import.meta.env.VITE_SANDSHREW_PROJECT_ID || 'mock-project-id',
    networkType: 'mainnet',
    
    // Mock method to get current block height
    getBlockHeight: async () => {
      // Return a random number between 880000 and 890000 to simulate block height
      return Math.floor(Math.random() * 10000) + 880000;
    },
    
    // Mock alkanes methods
    alkanes: {
      trace: async (params) => {
        console.log('Mock trace call with params:', params);
        return {
          status: 'success',
          txid: params.txid,
          steps: [
            { event: 'contract_execution', data: { code: '...' } },
            { event: 'return', data: { status: 'success' } }
          ]
        };
      },
      
      simulate: async (params) => {
        console.log('Mock simulate call with params:', params);
        return {
          status: 'success',
          gasUsed: 1000,
          result: { value: 42 }
        };
      }
    }
  },
  
  local: {
    url: 'http://localhost:18888',
    projectId: 'regtest',
    networkType: 'regtest',
    
    // Mock method to get current block height
    getBlockHeight: async () => 12345,
    
    // Mock alkanes methods
    alkanes: {
      trace: async (params) => {
        console.log('Mock trace call with params:', params);
        return {
          status: 'success',
          txid: params.txid,
          steps: [
            { event: 'contract_execution', data: { code: '...' } },
            { event: 'return', data: { status: 'success' } }
          ]
        };
      },
      
      simulate: async (params) => {
        console.log('Mock simulate call with params:', params);
        return {
          status: 'success',
          gasUsed: 1000,
          result: { value: 42 }
        };
      }
    }
  },
  
  oylnet: {
    url: 'https://oylnet.oyl.gg',
    version: 'v2',
    projectId: 'regtest',
    networkType: 'regtest',
    
    // Mock method to get current block height
    getBlockHeight: async () => 54321,
    
    // Mock alkanes methods
    alkanes: {
      trace: async (params) => {
        console.log('Mock trace call with params:', params);
        return {
          status: 'success',
          txid: params.txid,
          steps: [
            { event: 'contract_execution', data: { code: '...' } },
            { event: 'return', data: { status: 'success' } }
          ]
        };
      },
      
      simulate: async (params) => {
        console.log('Mock simulate call with params:', params);
        return {
          status: 'success',
          gasUsed: 1000,
          result: { value: 42 }
        };
      }
    }
  }
};

/**
 * Get a provider for the specified environment
 * @param {string} env - Environment name ('production', 'local', 'oylnet')
 * @returns {Object} Provider instance
 */
const getProvider = (env = 'local') => providers[env] || providers.local;

export default getProvider;