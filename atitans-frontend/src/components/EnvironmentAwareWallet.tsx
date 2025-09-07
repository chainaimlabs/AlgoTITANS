import React, { useState, useEffect } from 'react';
import { useWallet } from '@txnlab/use-wallet-react';
import { getAlgodConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs';

export function EnvironmentAwareWallet() {
  const { wallets, activeAccount } = useWallet();
  const [showLocalNetInstructions, setShowLocalNetInstructions] = useState(false);
  const algoConfig = getAlgodConfigFromViteEnvironment();
  const isLocalNet = algoConfig.network === 'localnet';

  // Auto-connect to Lute on TestNet if available
  useEffect(() => {
    if (!isLocalNet && !activeAccount) {
      const luteWallet = wallets.find(w => w.id === 'lute');
      if (luteWallet && !luteWallet.isConnected) {
        // Auto-attempt connection to Lute on TestNet
        setTimeout(() => {
          try {
            luteWallet.connect();
          } catch (error) {
            console.log('Lute wallet not ready or user cancelled');
          }
        }, 1000);
      }
    }
  }, [isLocalNet, activeAccount, wallets]);

  if (isLocalNet) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-yellow-800">🔧 LocalNet Wallet Setup Required</h3>
          <button
            onClick={() => setShowLocalNetInstructions(!showLocalNetInstructions)}
            className="text-yellow-600 hover:text-yellow-800 text-sm underline"
          >
            {showLocalNetInstructions ? 'Hide' : 'Show'} Instructions
          </button>
        </div>
        
        {showLocalNetInstructions && (
          <div className="mt-3 space-y-3 text-sm text-yellow-700">
            <div className="bg-white p-3 rounded border">
              <h4 className="font-semibold mb-2">Option 1: Use KMD Wallet (Recommended)</h4>
              <ol className="list-decimal list-inside space-y-1">
                <li>Ensure AlgoKit LocalNet is running</li>
                <li>Click "Connect Wallet" and select "KMD"</li>
                <li>Use password: <code className="bg-gray-100 px-1 rounded">""</code> (empty)</li>
                <li>Select from pre-funded accounts</li>
              </ol>
            </div>
            
            <div className="bg-white p-3 rounded border">
              <h4 className="font-semibold mb-2">Option 2: Use Generated Accounts</h4>
              <ol className="list-decimal list-inside space-y-1">
                <li>Go to Admin Dashboard</li>
                <li>Click "Generate All LocalNet Accounts"</li>
                <li>Use the role-based account switcher</li>
                <li>Accounts are auto-funded with 100 ALGO each</li>
              </ol>
            </div>

            <div className="bg-white p-3 rounded border">
              <h4 className="font-semibold mb-2">Option 3: Use Lute Wallet (Advanced)</h4>
              <ol className="list-decimal list-inside space-y-1">
                <li>Open Lute Wallet</li>
                <li>Add Custom Network: <code className="bg-gray-100 px-1 rounded">http://localhost:4001</code></li>
                <li>Import accounts using exported mnemonics</li>
                <li>Connect to your LocalNet setup</li>
              </ol>
            </div>
          </div>
        )}
      </div>
    );
  }

  // TestNet - Show Lute wallet status
  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h3 className="font-semibold text-blue-800 mb-2">🌐 TestNet Wallet Connection</h3>
      {activeAccount ? (
        <div className="space-y-2">
          <div className="text-sm text-blue-700">
            ✅ Connected to <strong>{activeAccount.providerId}</strong>
          </div>
          <div className="text-xs text-blue-600 font-mono">
            {activeAccount.address.substring(0, 12)}...{activeAccount.address.substring(activeAccount.address.length - 8)}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="text-sm text-blue-700">
            🔗 Lute Wallet should auto-connect if configured
          </div>
          <div className="text-xs text-blue-600">
            If not connected, click "Connect Wallet" and select "Lute"
          </div>
        </div>
      )}
    </div>
  );
}
