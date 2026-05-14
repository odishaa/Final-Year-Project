import { useState, useEffect } from 'react';
import { smartContractAPI, blockchainAPI } from '../services/api';

const SmartContractExplorer = () => {
  const [contractInfo, setContractInfo] = useState(null);
  const [mongoStats, setMongoStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchGemId, setSearchGemId] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [scRes, mongoRes] = await Promise.all([
        smartContractAPI.getInfo(),
        blockchainAPI.getInfo()
      ]);
      setContractInfo(scRes.data.data);
      setMongoStats(mongoRes.data.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
  e.preventDefault();
  const trimmedGemId = searchGemId.trim().toUpperCase();
  
  if (!trimmedGemId) {
    setSearchResult({ 
      success: false, 
      error: 'Please enter a Gemstone ID' 
    });
    return;
  }
  
  setSearching(true);
  setSearchResult(null);
  
  try {
    const response = await smartContractAPI.getGemstone(trimmedGemId);
    
    // Backend returns: { status: 'success', success: true, data: {...} }
    // So we access response.data (which has success and data inside)
    if (response.data.success && response.data.data) {
      setSearchResult({
        success: true,
        data: response.data.data  // This contains the actual gemstone data
      });
    } else {
      setSearchResult({ 
        success: false, 
        error: 'Gemstone not found on smart contract' 
      });
    }
  } catch (error) {
    setSearchResult({ 
      success: false, 
      error: error.response?.data?.error || error.response?.data?.message || 'Gemstone not found on blockchain'
    });
  } finally {
    setSearching(false);
  }
};

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading smart contract data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔗 Smart Contract Explorer
          </h1>
          <p className="text-gray-600">
            Solidity smart contract on Ganache blockchain (Local Ethereum)
          </p>
        </div>

        {/* Ganache Instructions */}
<div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8 rounded-r-lg">
  <div className="flex items-start space-x-4">
    <div className="text-3xl">💡</div>
    <div className="flex-1">
      <h3 className="font-semibold text-blue-900 mb-2">Using Ganache</h3>
      <div className="text-sm text-blue-800 space-y-1">
        <p>• Open your Ganache application to see real-time blockchain transactions</p>
        <p>• Each gemstone registration creates a new block (check "Blocks" tab)</p>
        <p>• View transaction details, gas usage, and account balances</p>
        <p>• The contract address and all data is stored on your local Ethereum blockchain</p>
      </div>
      <div className="mt-3 text-xs text-blue-700 bg-blue-100 px-3 py-2 rounded inline-block">
        <strong>Tip:</strong> Keep Ganache running while using the app to see live updates!
      </div>
    </div>
  </div>
</div>

        {/* Contract Info Card */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">GemstoneRegistry Contract</h2>
              <p className="text-purple-100">Deployed on {contractInfo?.network}</p>
            </div>
            <div className="text-5xl">⚡</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <div className="text-sm text-purple-100 mb-1">Contract Address</div>
              <div className="font-mono text-sm break-all">{contractInfo?.address}</div>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <div className="text-sm text-purple-100 mb-1">RPC Endpoint</div>
              <div className="font-mono text-sm">{contractInfo?.rpcUrl}</div>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <div className="text-sm text-purple-100 mb-1">Accounts Available</div>
              <div className="text-2xl font-bold">{contractInfo?.accountsAvailable}</div>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <div className="text-sm text-purple-100 mb-1">Total Gemstones</div>
              <div className="text-2xl font-bold">{contractInfo?.totalGemstones}</div>
            </div>
          </div>
        </div>

        {/* Comparison Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Smart Contract Stats */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-purple-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">⚡ Smart Contract</h3>
              <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded-full">
                Solidity + Ganache
              </span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Gemstones:</span>
                <span className="text-2xl font-bold text-purple-600">
                  {contractInfo?.totalGemstones}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Technology:</span>
                <span className="font-semibold text-gray-900">Ethereum</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Language:</span>
                <span className="font-semibold text-gray-900">Solidity</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Decentralized:</span>
                <span className="text-green-600 font-semibold">✓ Yes</span>
              </div>
            </div>
          </div>

          {/* MongoDB Stats */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-blue-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">📊 MongoDB Blockchain</h3>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                Custom + MongoDB
              </span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Blocks:</span>
                <span className="text-2xl font-bold text-blue-600">
                  {mongoStats?.totalBlocks}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Technology:</span>
                <span className="font-semibold text-gray-900">Custom</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Language:</span>
                <span className="font-semibold text-gray-900">JavaScript</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Fast Queries:</span>
                <span className="text-green-600 font-semibold">✓ Yes</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search Gemstone on Blockchain */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            🔍 Query Smart Contract
          </h3>
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter Gemstone ID
              </label>
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={searchGemId}
                  onChange={(e) => setSearchGemId(e.target.value)}
                  placeholder="e.g., RUB-MLV12E1T-YXGM"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                />
                <button
                  type="submit"
                  disabled={searching}
                  className="bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50"
                >
                  {searching ? 'Querying...' : 'Query Blockchain'}
                </button>
              </div>
            </div>
          </form>

          {/* Search Results */}
          {searchResult && (
            <div className={`mt-6 p-6 rounded-lg ${
              searchResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              {searchResult.success ? (
                <>
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="text-2xl">✅</span>
                    <h4 className="text-lg font-bold text-gray-900">Found on Blockchain!</h4>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600">Name</div>
                      <div className="font-semibold">{searchResult.data.name}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Type</div>
                      <div className="font-semibold">{searchResult.data.type}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Weight</div>
                      <div className="font-semibold">{searchResult.data.carats} ct</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Color</div>
                      <div className="font-semibold">{searchResult.data.color}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Clarity</div>
                      <div className="font-semibold">{searchResult.data.clarity}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Cut</div>
                      <div className="font-semibold">{searchResult.data.cut}</div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-green-200">
                    <div className="text-xs text-gray-600 mb-1">Owner Address</div>
                    <div className="font-mono text-sm break-all">{searchResult.data.owner}</div>
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">❌</span>
                  <div className="text-red-700">{searchResult.error}</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Features Comparison */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            📋 Dual Blockchain Architecture
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4">Feature</th>
                  <th className="text-center py-3 px-4">Smart Contract</th>
                  <th className="text-center py-3 px-4">MongoDB</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium">Immutability</td>
                  <td className="text-center py-3 px-4 text-green-600 font-semibold">✓ True</td>
                  <td className="text-center py-3 px-4 text-yellow-600 font-semibold">⚠ Simulated</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium">Query Speed</td>
                  <td className="text-center py-3 px-4 text-yellow-600 font-semibold">Moderate</td>
                  <td className="text-center py-3 px-4 text-green-600 font-semibold">✓ Fast</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium">Gas Fees</td>
                  <td className="text-center py-3 px-4 text-yellow-600 font-semibold">Yes</td>
                  <td className="text-center py-3 px-4 text-green-600 font-semibold">✓ None</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium">Decentralized</td>
                  <td className="text-center py-3 px-4 text-green-600 font-semibold">✓ Yes</td>
                  <td className="text-center py-3 px-4 text-red-600 font-semibold">✗ No</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium">Public Verification</td>
                  <td className="text-center py-3 px-4 text-green-600 font-semibold">✓ Yes</td>
                  <td className="text-center py-3 px-4 text-yellow-600 font-semibold">Via API</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">Production Ready</td>
                  <td className="text-center py-3 px-4 text-green-600 font-semibold">✓ Yes</td>
                  <td className="text-center py-3 px-4 text-green-600 font-semibold">✓ Yes</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-900">
              <strong>💡 Architecture:</strong> This system uses BOTH blockchains in parallel. 
              MongoDB provides fast queries for the UI, while the smart contract provides 
              true immutability and decentralization. Best of both worlds!
            </p>
          </div>
        </div>

        {/* Refresh Button */}
        <div className="mt-8 text-center">
          <button
            onClick={fetchData}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
          >
            🔄 Refresh Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default SmartContractExplorer;