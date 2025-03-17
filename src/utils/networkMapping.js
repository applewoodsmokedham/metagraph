import { MAINNET, TESTNET } from '@omnisat/lasereyes';

/**
 * Maps METHANE network names to LaserEyes network types
 * @param {string} methaneNetwork - The METHANE network name ('mainnet', 'regtest', 'oylnet')
 * @returns {string} - The corresponding LaserEyes network type
 */
export const mapNetworkToLaserEyes = (methaneNetwork) => {
  switch (methaneNetwork) {
    case 'mainnet':
      return MAINNET;
    case 'regtest':
    case 'oylnet':
      return TESTNET;
    default:
      return MAINNET;
  }
};