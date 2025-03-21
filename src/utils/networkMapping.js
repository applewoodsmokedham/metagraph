import { MAINNET, TESTNET } from '@omnisat/lasereyes';

/**
 * Maps METAGRAPH network names to LaserEyes network types
 * @param {string} metagraphNetwork - The METAGRAPH network name ('mainnet', 'regtest', 'oylnet')
 * @returns {string} - The corresponding LaserEyes network type
 */
export const mapNetworkToLaserEyes = (metagraphNetwork) => {
  switch (metagraphNetwork) {
    case 'mainnet':
      return MAINNET;
    case 'regtest':
    case 'oylnet':
      return TESTNET;
    default:
      return MAINNET;
  }
};