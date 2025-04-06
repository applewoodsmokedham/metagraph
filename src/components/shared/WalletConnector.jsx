import React, { useState, useEffect, useRef } from 'react';
import {
  useLaserEyes,
  UNISAT,
  LEATHER,
  MAGIC_EDEN,
  OKX,
  OYL,
  ORANGE,
  OP_NET,
  PHANTOM,
  SPARROW,
  WIZZ,
  XVERSE
} from '@omnisat/lasereyes';

/**
 * WalletConnector Component (98.css version)
 *
 * Provides wallet connection functionality using the LaserEyes package
 */
function WalletConnector() {
  // Helper function to shorten addresses
  const shortenAddress = (address) => {
    if (!address) return 'N/A';
    if (address.length <= 9) return address;
    return `${address.substring(0, 4)}...${address.substring(address.length - 5)}`;
  };

  // Function to copy text to clipboard
  const copyToClipboard = (text, type) => {
    if (!text) return;
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopiedType(type);
        setTimeout(() => setCopiedType(null), 2000); // Hide after 2 seconds
        console.log('Copied to clipboard:', text);
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
      });
  };

  const {
    connect,
    disconnect,
    connected,
    isConnecting,
    address,
    paymentAddress,
    publicKey,
    paymentPublicKey,
    balance,
    provider,
    network,
    accounts,
    hasLeather,
    hasMagicEden,
    hasOkx,
    hasOyl,
    hasOrange,
    hasOpNet,
    hasPhantom,
    hasUnisat,
    hasSparrow,
    hasWizz,
    hasXverse,
  } = useLaserEyes();

  const [showWalletList, setShowWalletList] = useState(false);
  const [showWalletInfo, setShowWalletInfo] = useState(false);
  const [copiedType, setCopiedType] = useState(null);
  const containerRef = useRef(null);

  // Define available wallets with their detection status
  const wallets = [
    { id: UNISAT, name: 'Unisat', available: hasUnisat },
    { id: LEATHER, name: 'Leather', available: hasLeather },
    { id: MAGIC_EDEN, name: 'Magic Eden', available: hasMagicEden },
    { id: OKX, name: 'OKX', available: hasOkx },
    { id: OYL, name: 'Oyl', available: hasOyl },
    { id: ORANGE, name: 'Orange', available: hasOrange },
    { id: OP_NET, name: 'OpNet', available: hasOpNet },
    { id: PHANTOM, name: 'Phantom', available: hasPhantom },
    { id: SPARROW, name: 'Sparrow', available: hasSparrow },
    { id: WIZZ, name: 'Wizz', available: hasWizz },
    { id: XVERSE, name: 'Xverse', available: hasXverse },
  ];

  const handleConnectClick = () => {
    setShowWalletList(true);
    setShowWalletInfo(false); // Close info if list is opened
  };

  const handleWalletSelect = (walletId) => {
    connect(walletId);
    setShowWalletList(false);
  };

  // Close dropdowns if clicked outside
  useEffect(() => {
      const handleClickOutside = (event) => {
          if (containerRef.current && !containerRef.current.contains(event.target)) {
              setShowWalletList(false);
              setShowWalletInfo(false);
          }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
          document.removeEventListener('mousedown', handleClickOutside);
      };
  }, [containerRef]);

  const toggleWalletInfo = () => {
    setShowWalletInfo(!showWalletInfo);
    setShowWalletList(false); // Close list if info is opened
  };

  // Basic positioning for dropdowns
  const dropdownStyle = {
      position: 'absolute',
      top: '100%',
      right: '0',
      marginTop: '2px',
      zIndex: 10,
      minWidth: '180px'
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
      {!connected ? (
        <>
          <button onClick={handleConnectClick} disabled={isConnecting}>
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </button>
          {showWalletList && (
            <div className="window" style={{...dropdownStyle, padding: '0' }}>
              <ul className="tree-view" style={{ margin: '0', padding: '2px' }}> {/* Using tree-view for border/bg */}
                {wallets.map((wallet) => (
                  <li key={wallet.id} style={{ padding: '2px 4px'}}>
                    <button
                      onClick={() => handleWalletSelect(wallet.id)}
                      disabled={!wallet.available}
                      title={!wallet.available ? 'Wallet not detected' : `Connect ${wallet.name}`}
                      style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: '2px' }} // Minimal button style
                    >
                      {wallet.name} {!wallet.available && <span style={{ color: 'grey' }}> (Not Detected)</span>}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      ) : (
        <>
          <button onClick={toggleWalletInfo}>
             {/* Using button for consistent look */}
            Connected {shortenAddress(address)} {showWalletInfo ? '▲' : '▼'}
          </button>
          {showWalletInfo && (
            <div className="window" style={{ ...dropdownStyle, padding: '5px' }}>
               <div className="window-body" style={{ margin: '0', padding: '5px' }}>
                 {copiedType && (
                    <div style={{ position: 'absolute', top: '-25px', right: '5px', background: '#FFFFE1', border: '1px solid #000', padding: '2px 5px', fontSize: '10px' }}>
                        Copied!
                    </div>
                  )}
                 <div style={{ marginBottom: '5px' }}>
                   <label htmlFor="taprootAddr">Taproot:</label>
                   <div style={{ display: 'flex', alignItems: 'center' }}>
                     <input type="text" id="taprootAddr" readOnly value={address || 'N/A'} style={{ flexGrow: 1, marginRight: '5px' }} title={address} />
                     {address && (
                       <button onClick={() => copyToClipboard(address, 'address')} style={{ flexShrink: 0 }}>Copy</button>
                     )}
                   </div>
                 </div>
                 <div style={{ marginBottom: '5px' }}>
                   <label htmlFor="segwitAddr">Native Segwit:</label>
                   <div style={{ display: 'flex', alignItems: 'center' }}>
                     <input type="text" id="segwitAddr" readOnly value={paymentAddress || 'N/A'} style={{ flexGrow: 1, marginRight: '5px' }} title={paymentAddress} />
                     {paymentAddress && (
                       <button onClick={() => copyToClipboard(paymentAddress, 'paymentAddress')} style={{ flexShrink: 0 }}>Copy</button>
                     )}
                   </div>
                 </div>
                 <div style={{ marginBottom: '5px' }}>
                   <label>Balance:</label>
                   <span style={{ marginLeft: '5px' }}>{balance !== undefined ? `${Number(balance)} sats` : 'Loading...'}</span>
                 </div>
                 <div style={{ marginBottom: '10px' }}>
                   <label>Network:</label>
                   <span style={{ marginLeft: '5px' }}>{network || 'N/A'}</span>
                 </div>
                 <button onClick={disconnect} style={{ width: '100%' }}>
                   Disconnect
                 </button>
               </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default WalletConnector;