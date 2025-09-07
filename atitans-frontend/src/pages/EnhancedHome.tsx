import React, { useState } from 'react';
import { useWallet } from '@txnlab/use-wallet-react';
import ConnectWallet from '../components/ConnectWallet';
import Account from '../components/Account';
import { BLDashboard } from '../components/BLDashboard';
import { EnhancedExporterDashboard } from '../components/EnhancedExporterDashboard';
import { MarketplaceDashboard } from '../components/MarketplaceDashboard';
import CarrierDashboard from '../components/CarrierDashboard';
import { ImporterDashboard } from '../components/ImporterDashboard';
import InvestorDashboard from '../components/InvestorDashboard';
import RegulatorDashboard from '../components/RegulatorDashboard';
import AdminDashboard from '../components/AdminDashboard';
import MetaMaskStyleRoleManager from '../components/MetaMaskStyleRoleManager';
import ProxyTest from '../components/ProxyTest';
import { EnvironmentAwareWallet } from '../components/EnvironmentAwareWallet';
import { SmartWalletButton } from '../components/SmartWalletButton';
import { useAddressManager } from '../hooks/useAddressManager';
import { getAlgodConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs';
import UniversalRoleSwitcher from '../components/universal/UniversalRoleSwitcher';

type TabType = 'home' | 'exporter' | 'carrier' | 'importer' | 'investor' | 'marketplace' | 'regulator' | 'admin' | 'about' | 'proxy-test';

export default function EnhancedHome() {
  const [openWalletModal, setOpenWalletModal] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [selectedBuyer, setSelectedBuyer] = useState<'BUYER_1' | 'BUYER_2'>('BUYER_1');
  const [selectedInvestor, setSelectedInvestor] = useState<'INVESTOR_SMALL_1' | 'INVESTOR_SMALL_2' | 'INVESTOR_SMALL_3' | 'INVESTOR_SMALL_4' | 'INVESTOR_SMALL_5' | 'INVESTOR_LARGE_1' | 'INVESTOR_LARGE_2'>('INVESTOR_SMALL_1');
  const { activeAddress } = useWallet();
  const { isLocalNet, switchToRole, assignCurrentAddressToRole, getAllRoleAccounts } = useAddressManager();
  const algoConfig = getAlgodConfigFromViteEnvironment();

  // Helper function to handle main tab switching with automatic role switching
  const handleTabSwitch = async (tab: TabType) => {
    console.log(`📦 Tab switch initiated: ${tab}`);
    setActiveTab(tab);
    
    // Auto-switch wallet role for LocalNet when switching to role-specific tabs
    // Note: Marketplace preserves current role from other tabs
    if (isLocalNet && activeAddress) {
      const roleMap: { [key in TabType]?: string } = {
        'exporter': 'EXPORTER',
        'carrier': 'CARRIER',
        'importer': selectedBuyer, // Use current selected buyer
        'investor': selectedInvestor, // Use current selected investor
        'regulator': 'REGULATOR',
        // 'marketplace': 'MARKETPLACE_OPERATOR' // REMOVED: Marketplace preserves current role
      };
      
      const targetRole = roleMap[tab];
      if (targetRole) {
        const allAccounts = getAllRoleAccounts();
        const roleAccount = allAccounts.find(acc => acc.role === targetRole);
        
        if (roleAccount && roleAccount.address) {
          console.log(`✅ Auto-switching to ${targetRole} for ${tab} page - Address: ${roleAccount.address}`);
          await switchToRole(targetRole);
          
          // Add small delay to ensure state propagation, then log success
          setTimeout(() => {
            console.log(`🎯 Role switch completed for ${tab} - Should now show ${targetRole} address`);
          }, 100);
        } else if (activeAddress) {
          console.log(`📝 Assigning current address to ${targetRole}`);
          assignCurrentAddressToRole(targetRole);
        }
      } else if (tab === 'marketplace') {
        // Marketplace: Preserve current role and address
        const currentRole = getAllRoleAccounts().find(acc => acc.isActive)?.role;
        console.log(`🏬 Marketplace accessed - Preserving current role: ${currentRole || 'No role'} with current address`);
      } else {
        console.log(`🟡 No role mapping for tab: ${tab} - keeping current role`);
      }
    }
  };

  const toggleWalletModal = () => {
    setOpenWalletModal(!openWalletModal);
  };

  // Helper function to handle buyer selection with automatic wallet switching
  const handleBuyerSelection = async (buyer: 'BUYER_1' | 'BUYER_2') => {
    console.log(`🛍️ Buyer selection: ${buyer}`);
    setSelectedBuyer(buyer);
    setActiveTab('importer');
    
    // Auto-switch wallet for LocalNet
    if (isLocalNet) {
      const allAccounts = getAllRoleAccounts();
      const buyerAccount = allAccounts.find(acc => acc.role === buyer);
      
      if (buyerAccount && buyerAccount.address) {
        console.log(`✅ Switching to ${buyer} wallet: ${buyerAccount.address}`);
        await switchToRole(buyer);
      } else if (activeAddress) {
        console.log(`📝 Assigning current address to ${buyer}`);
        assignCurrentAddressToRole(buyer);
      }
    }
  };

  // Helper function to handle investor selection with automatic wallet switching
  const handleInvestorSelection = async (investor: 'INVESTOR_SMALL_1' | 'INVESTOR_SMALL_2' | 'INVESTOR_SMALL_3' | 'INVESTOR_SMALL_4' | 'INVESTOR_SMALL_5' | 'INVESTOR_LARGE_1' | 'INVESTOR_LARGE_2') => {
    console.log(`💰 Investor selection: ${investor}`);
    setSelectedInvestor(investor);
    setActiveTab('investor');
    
    // Auto-switch wallet for LocalNet
    if (isLocalNet) {
      const allAccounts = getAllRoleAccounts();
      const investorAccount = allAccounts.find(acc => acc.role === investor);
      
      if (investorAccount && investorAccount.address) {
        console.log(`✅ Switching to ${investor} wallet: ${investorAccount.address}`);
        await switchToRole(investor);
      } else if (activeAddress) {
        console.log(`📝 Assigning current address to ${investor}`);
        assignCurrentAddressToRole(investor);
      }
    }
  };

  if (!activeAddress) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Welcome to <span className={`${isLocalNet ? 'text-red-600' : 'text-blue-600'}`}>AlgoTITANS V2</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Revolutionary RWA Tokenization with Enhanced Bills of Lading
            </p>
            
            {/* Environment-aware wallet connection section */}
            <div className="mb-8">
              <EnvironmentAwareWallet />
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-semibold mb-4">🚀 Revolutionary Features</h2>
              <div className="grid md:grid-cols-2 gap-6 text-left">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <span className="text-green-500 text-xl">✅</span>
                    <div>
                      <h3 className="font-semibold">Deep DCSA v3 Integration</h3>
                      <p className="text-sm text-gray-600">Enhanced metadata for precise RWA classification</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-green-500 text-xl">⚡</span>
                    <div>
                      <h3 className="font-semibold">Atomic Settlement</h3>
                      <p className="text-sm text-gray-600">Instant cross-border financing in ~3 seconds</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-green-500 text-xl">🏦</span>
                    <div>
                      <h3 className="font-semibold">MSME Access</h3>
                      <p className="text-sm text-gray-600">$50 minimum investment for global participation</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <span className="text-blue-500 text-xl">🔐</span>
                    <div>
                      <h3 className="font-semibold">Open vs Straight BL Logic</h3>
                      <p className="text-sm text-gray-600">Only negotiable BLs can access marketplace</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-blue-500 text-xl">📊</span>
                    <div>
                      <h3 className="font-semibold">Real-time Analytics</h3>
                      <p className="text-sm text-gray-600">Live funding progress and yield tracking</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-blue-500 text-xl">🌐</span>
                    <div>
                      <h3 className="font-semibold">IPFS Integration</h3>
                      <p className="text-sm text-gray-600">Decentralized document storage</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <SmartWalletButton />
              <p className="text-sm text-gray-500">
                Connect your Algorand wallet to access the enhanced RWA tokenization platform
              </p>
            </div>
          </div>
        </div>
        
        <ConnectWallet openModal={openWalletModal} closeModal={toggleWalletModal} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4">
          {/* Navigation Tabs with Title and Account Info - Two Row Layout */}
          <div className="py-3">
            {/* First Row - Title + Main Navigation + Account Info */}
            <div className="flex items-center mb-2">
              {/* Left: Title */}
              <h1 className="text-xl font-bold text-gray-900 mr-8">
                AlgoTITANS V2
              </h1>
              
              {/* Center: Main Navigation */}
              <div className="flex-1 flex justify-center">
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleTabSwitch('home')}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'home'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    🏠 Home
                  </button>
                  <button
                    onClick={() => handleTabSwitch('marketplace')}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'marketplace'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    🏬 Marketplace
                  </button>
                  <button
                    onClick={() => handleTabSwitch('admin')}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'admin'
                        ? 'bg-red-100 text-red-700'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    ⚙️ Admin
                  </button>
                  <button
                    onClick={() => handleTabSwitch('about')}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'about'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    ℹ️ About
                  </button>
                  <button
                    onClick={() => handleTabSwitch('proxy-test')}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'proxy-test'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    🔧 Proxy Test
                  </button>
                </div>
              </div>
              
              {/* Right: Account Info + Role Switcher */}
              <div className="flex items-center space-x-4">
                <div className="text-xs text-gray-600">
                  Network: {algoConfig.network}
                </div>
                <UniversalRoleSwitcher currentTab={activeTab} />
                <SmartWalletButton />
              </div>
            </div>
            
            {/* Second Row - Role-Based Navigation */}
            <div className="flex justify-center space-x-2 mb-2">
              <button
                onClick={() => handleTabSwitch('exporter')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'exporter'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                📦 Exporter
              </button>
              <button
                onClick={() => handleTabSwitch('carrier')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'carrier'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                🚢 Carrier
              </button>
              
              <button
                onClick={() => handleTabSwitch('importer')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'importer'
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                🏪 Importer
              </button>
              
              <button
                onClick={() => handleTabSwitch('investor')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'investor'
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                💰 Investor
              </button>
              
              <button
                onClick={() => handleTabSwitch('regulator')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'regulator'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                🏛️ Regulator
              </button>
            </div>
            
            {/* Third Row - Sub-roles for Importer and Investor (only show when relevant tab is active) */}
            {(activeTab === 'importer' || activeTab === 'investor') && (
              <div className="flex justify-center space-x-6">
                {/* Importer sub-roles - only show when importer tab is active */}
                {activeTab === 'importer' && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-600">🏪 Importer:</span>
                    <button
                      onClick={() => handleBuyerSelection('BUYER_1')}
                      className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                        selectedBuyer === 'BUYER_1'
                          ? 'bg-green-100 text-green-700'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Buyer 1
                    </button>
                    <button
                      onClick={() => handleBuyerSelection('BUYER_2')}
                      className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                        selectedBuyer === 'BUYER_2'
                          ? 'bg-green-100 text-green-700'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Buyer 2
                    </button>
                  </div>
                )}
              
                {/* Investor sub-roles - only show when investor tab is active */}
                {activeTab === 'investor' && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-600">💰 Investor:</span>
                    <div className="flex items-center space-x-1">
                      <span className="text-xs text-gray-500">Large:</span>
                      <button
                        onClick={() => handleInvestorSelection('INVESTOR_LARGE_1')}
                        className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                          selectedInvestor === 'INVESTOR_LARGE_1'
                            ? 'bg-purple-100 text-purple-700'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        1
                      </button>
                      <button
                        onClick={() => handleInvestorSelection('INVESTOR_LARGE_2')}
                        className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                          selectedInvestor === 'INVESTOR_LARGE_2'
                            ? 'bg-purple-100 text-purple-700'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        2
                      </button>
                      <span className="text-sm text-gray-400 mx-3 font-bold">|</span>
                      <span className="text-xs text-gray-500">Small:</span>
                      <button
                        onClick={() => handleInvestorSelection('INVESTOR_SMALL_1')}
                        className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                          selectedInvestor === 'INVESTOR_SMALL_1'
                            ? 'bg-purple-100 text-purple-700'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        1
                      </button>
                      <button
                        onClick={() => handleInvestorSelection('INVESTOR_SMALL_2')}
                        className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                          selectedInvestor === 'INVESTOR_SMALL_2'
                            ? 'bg-purple-100 text-purple-700'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        2
                      </button>
                      <button
                        onClick={() => handleInvestorSelection('INVESTOR_SMALL_3')}
                        className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                          selectedInvestor === 'INVESTOR_SMALL_3'
                            ? 'bg-purple-100 text-purple-700'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        3
                      </button>
                      <button
                        onClick={() => handleInvestorSelection('INVESTOR_SMALL_4')}
                        className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                          selectedInvestor === 'INVESTOR_SMALL_4'
                            ? 'bg-purple-100 text-purple-700'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        4
                      </button>
                      <button
                        onClick={() => handleInvestorSelection('INVESTOR_SMALL_5')}
                        className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                          selectedInvestor === 'INVESTOR_SMALL_5'
                            ? 'bg-purple-100 text-purple-700'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        5
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* MetaMask-Style Role Manager - Shows current role and switching options */}
      <MetaMaskStyleRoleManager 
        currentTab={activeTab} 
        selectedBuyer={selectedBuyer}
        selectedInvestor={selectedInvestor}
      />

      {/* Main Content */}
      <main className="min-h-screen">
        {activeTab === 'home' && <HomeSection />}
        {activeTab === 'exporter' && <EnhancedExporterDashboard />}
        {activeTab === 'carrier' && <CarrierDashboard />}
        {activeTab === 'importer' && <ImporterDashboard />}
        {activeTab === 'investor' && <InvestorDashboard />}
        {activeTab === 'marketplace' && <EnhancedMarketplaceDashboard />}
        {activeTab === 'regulator' && <RegulatorDashboard />}
        {activeTab === 'admin' && <AdminDashboard />}
        {activeTab === 'about' && <AboutSection />}
        {activeTab === 'proxy-test' && <ProxyTest />}
      </main>

      <ConnectWallet openModal={openWalletModal} closeModal={toggleWalletModal} />
    </div>
  );
}

function HomeSection() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="mx-auto max-w-5xl text-center">
            <div className="mb-6 mx-auto w-fit px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
              Powered by Algorand • Fully Regulated
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl text-balance mx-auto">
              <span className="text-blue-600 tracking-widest">AlgoTITANS V2</span>
              <br />
              <span className="text-2xl sm:text-3xl lg:text-4xl font-medium text-gray-600 block mt-2">
                Trade Intelligence & Tokenized Asset Network
              </span>
              <br />
              <span className="text-blue-600 leading-6 text-lg sm:text-xl text-balance max-w-2xl mx-auto block mt-4">
                Unlock Web3 for Your Small Business Working Capital
              </span>
            </h1>
            <div className="mt-8 max-w-3xl mx-auto">
              <ul className="text-lg leading-8 text-gray-600 text-left space-y-4 max-w-2xl mx-auto">
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl">✅</span>
                  <span>
                    Stop waiting weeks for payments - transform invoices, bills of lading, and trade documents into
                    instant liquidity
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl">✅</span>
                  <span>
                    Access global markets and earn better yields on cash through regulated blockchain technology
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl">✅</span>
                  <span>Get paid faster with automated smart contracts and compliance built for small businesses</span>
                </li>
              </ul>
            </div>
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-x-6">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium text-lg transition-colors">
                Start Free Trial →
              </button>
              <button className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg font-medium text-lg transition-colors">
                Watch Demo
              </button>
            </div>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4 text-sm text-gray-600">
              <span>Supports:</span>
              <span className="px-2 py-1 border border-gray-300 rounded text-xs">ALGO</span>
              <span className="px-2 py-1 border border-gray-300 rounded text-xs">USDC</span>
              <span className="px-2 py-1 border border-gray-300 rounded text-xs">Pera Wallet</span>
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-1/2 top-0 -translate-x-1/2 blur-3xl opacity-20">
            <div className="aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-blue-600 to-purple-600" />
          </div>
        </div>
      </section>

      {/* All other sections remain the same... */}
      <TradeNewsSection />
      <PainPointsSection />
      <TestimonialsSection />
      <UserTypesSection />
      <PricingSection />
      <CTASection />
      <FooterSection />
    </div>
  );
}

// All other sections (TradeNewsSection, PainPointsSection, etc.) would be implemented here
// For brevity, I'll include just the marketplace components

function EnhancedMarketplaceDashboard() {
  const [flowType, setFlowType] = useState<'direct' | 'financing'>('direct');

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          🏬 Marketplace Dashboard
        </h1>
        <p className="text-xl text-gray-600">
          Complete Trade Finance Ecosystem - Direct Sales & Investment Opportunities
        </p>
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 font-semibold">
            💰 Choose Your Flow: Direct Sale (1% fee) or Financing/Tokenization (yield-based)
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Select Transaction Type</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div 
            onClick={() => setFlowType('direct')}
            className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
              flowType === 'direct' 
                ? 'border-orange-500 bg-orange-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center mb-4">
              <span className="text-3xl mr-3">🏪</span>
              <div>
                <h3 className="text-xl font-bold">Direct Sale</h3>
                <p className="text-gray-600">Simple Exporter → Importer</p>
              </div>
            </div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>1% marketplace fee</li>
              <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>Instant settlement</li>
              <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>Direct title transfer</li>
              <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>USDC/ALGO payment</li>
            </ul>
          </div>

          <div 
            onClick={() => setFlowType('financing')}
            className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
              flowType === 'financing' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center mb-4">
              <span className="text-3xl mr-3">🚀</span>
              <div>
                <h3 className="text-xl font-bold">Financing/Tokenization</h3>
                <p className="text-gray-600">Fractionalized Investment</p>
              </div>
            </div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>Fractionalized shares</li>
              <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>Global investor access</li>
              <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>Yield opportunities</li>
              <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>$50 minimum investment</li>
            </ul>
          </div>
        </div>
      </div>

      {flowType === 'direct' && <DirectSaleSection />}
      {flowType === 'financing' && <MarketplaceDashboard />}
      <MarketplaceStats />
    </div>
  );
}

function DirectSaleSection() {
  const [listedBLs] = useState([
    {
      id: 'BL-DIRECT-001',
      seller: 'Tirupur Textiles Ltd',
      title: 'Cotton Fabric Export to Hamburg',
      price: 150000,
      currency: 'USDC',
      description: 'High-quality cotton fabric, 10 tons',
      route: 'Chennai → Hamburg',
      status: 'available'
    },
    {
      id: 'BL-DIRECT-002', 
      seller: 'Kerala Spices Co',
      title: 'Cardamom Export to Dubai',
      price: 75000,
      currency: 'USDC',
      description: 'Premium cardamom, 2 tons',
      route: 'Kochi → Dubai',
      status: 'available'
    }
  ]);

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">🏪 List BL for Direct Sale</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">BL Reference</label>
            <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="BL-2025-001" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sale Price (USDC)</label>
            <input type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="150000" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2" rows={3} placeholder="Describe your cargo..."></textarea>
          </div>
        </div>
        <button className="mt-4 bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-medium">
          🏪 List for Direct Sale (1% fee)
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">🛒 Available BLs for Direct Purchase</h2>
        <div className="grid gap-6">
          {listedBLs.map(bl => (
            <div key={bl.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{bl.title}</h3>
                  <p className="text-sm text-gray-600">Seller: {bl.seller}</p>
                  <p className="text-sm text-gray-600">Route: {bl.route}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-orange-600">
                    ${bl.price.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">{bl.currency}</div>
                </div>
              </div>
              <p className="text-gray-700 mb-4">{bl.description}</p>
              <div className="flex justify-between items-center">
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                  Available for Purchase
                </span>
                <button className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-medium">
                  💰 Buy Now (+ 1% fee)
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MarketplaceStats() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">📊 Marketplace Statistics</h2>
      <div className="grid md:grid-cols-4 gap-6">
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600">$2.3M</div>
          <div className="text-sm text-gray-600">Total Volume</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-green-600">156</div>
          <div className="text-sm text-gray-600">Active Listings</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-orange-600">$23K</div>
          <div className="text-sm text-gray-600">Fees Collected</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-purple-600">847</div>
          <div className="text-sm text-gray-600">Total Transactions</div>
        </div>
      </div>
    </div>
  );
}

// Placeholder components for sections that would be implemented
function TradeNewsSection() { return <div className="py-20 bg-gray-50"><div className="container mx-auto px-4 text-center"><h2 className="text-3xl font-bold">Trade News Section</h2><p>WTO Updates, Trade Finance, Supply Chain Impact</p></div></div>; }
function PainPointsSection() { return <div className="py-20 bg-gray-100"><div className="container mx-auto px-4 text-center"><h2 className="text-3xl font-bold">Why MSMEs Choose AlgoTITANS V2</h2></div></div>; }
function TestimonialsSection() { return <div className="py-20 bg-white"><div className="container mx-auto px-4 text-center"><h2 className="text-3xl font-bold">Customer Testimonials</h2></div></div>; }
function UserTypesSection() { return <div className="py-20 bg-gray-50"><div className="container mx-auto px-4 text-center"><h2 className="text-3xl font-bold">Built for Every Trade Participant</h2></div></div>; }
function PricingSection() { return <div className="py-20 bg-gray-100"><div className="container mx-auto px-4 text-center"><h2 className="text-3xl font-bold">Choose Your Plan</h2></div></div>; }
function CTASection() { return <div className="py-20 bg-blue-600"><div className="container mx-auto px-4 text-center"><h2 className="text-3xl font-bold text-white">Ready to Accelerate Your Business?</h2></div></div>; }
function FooterSection() { return <footer className="border-t bg-gray-100"><div className="container mx-auto py-12 px-4 text-center"><p>&copy; 2024 AlgoTITANS V2</p></div></footer>; }

function AboutSection() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">About AlgoTITANS V2</h1>
        <p className="text-xl text-gray-600">Revolutionary RWA Tokenization Platform for Trade Finance</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-semibold mb-4 text-blue-600">🔬 Technical Innovation</h2>
        <ul className="space-y-3 text-gray-700">
          <li className="flex items-start space-x-2">
            <span className="text-green-500 mt-1">✓</span>
            <span><strong>DCSA v3.0 Integration:</strong> Deep Bill of Lading metadata for enhanced RWA classification</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-green-500 mt-1">✓</span>
            <span><strong>Atomic Settlement:</strong> Single-transaction payment + title transfer</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
