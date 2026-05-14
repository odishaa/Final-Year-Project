import { useState } from 'react';
import { ngjaAPI } from '../services/api';

const VerifyCertificate = () => {
  const [certificateNumber, setCertificateNumber] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);

    try {
      const response = await ngjaAPI.verifyCertificate(certificateNumber);
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
      setResult({ verified: false });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            NGJA Certificate Verification
          </h1>
          <p className="text-gray-600">
            Enter the certificate number to verify authenticity
          </p>
        </div>

        {/* Verification Form */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <form onSubmit={handleVerify} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                NGJA Certificate Number
              </label>
              <input
                type="text"
                value={certificateNumber}
                onChange={(e) => setCertificateNumber(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-lg"
                placeholder="e.g., NGJA-2024-001234"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Verifying...' : '🔍 Verify Certificate'}
            </button>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-8">
            <div className="flex items-center">
              <span className="text-2xl mr-3">❌</span>
              <div>
                <div className="font-semibold">Verification Failed</div>
                <div className="text-sm">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className={`rounded-lg shadow-lg p-8 ${
            result.verified ? 'bg-green-50 border-2 border-green-500' : 'bg-red-50 border-2 border-red-500'
          }`}>
            <div className="text-center mb-6">
              <div className="text-6xl mb-3">
                {result.verified ? '✅' : '❌'}
              </div>
              <h2 className="text-2xl font-bold mb-2">
                {result.verified ? 'Certificate Verified' : 'Certificate Not Found'}
              </h2>
              <p className="text-gray-600">
                {result.verified 
                  ? 'This is an authentic NGJA certificate' 
                  : 'No matching certificate found in the system'}
              </p>
            </div>

            {result.verified && result.data?.gemstone && (
  <div className="space-y-4 bg-white rounded-lg p-6">
    <h3 className="font-semibold text-lg mb-4">Gemstone Details</h3>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <div className="text-sm text-gray-600">Gemstone ID</div>
        <div className="font-semibold">{result.data.gemstone.gemId}</div>
      </div>

      <div>
        <div className="text-sm text-gray-600">Name</div>
        <div className="font-semibold">{result.data.gemstone.name}</div>
      </div>

      <div>
        <div className="text-sm text-gray-600">Type</div>
        <div className="font-semibold">{result.data.gemstone.type}</div>
      </div>

      <div>
        <div className="text-sm text-gray-600">Weight</div>
        <div className="font-semibold">{result.data.gemstone.weight?.carats} carats</div>
      </div>

      <div>
        <div className="text-sm text-gray-600">Certificate Number</div>
        <div className="font-semibold">{result.data.gemstone.certificateNumber}</div>
      </div>

      <div>
        <div className="text-sm text-gray-600">Certification Date</div>
        <div className="font-semibold">
          {new Date(result.data.gemstone.certificationDate).toLocaleDateString()}
        </div>
      </div>

      <div>
        <div className="text-sm text-gray-600">Certified By</div>
        <div className="font-semibold">{result.data.gemstone.certifiedBy}</div>
      </div>
    </div>

    {/* NEW: Blockchain Verification Status */}
    {result.data.blockchain && (
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-2xl">⚡</span>
            <h4 className="font-semibold text-gray-900">Smart Contract Verification</h4>
          </div>
          
          {result.data.blockchain.success && result.data.blockchain.valid ? (
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2 text-green-700">
                <span className="text-xl">✅</span>
                <span className="font-semibold">Verified on Ethereum Smart Contract</span>
              </div>
              <div className="text-gray-700 ml-7">
                Certificate Number: <span className="font-mono font-semibold">{result.data.blockchain.certificate?.certificateNumber}</span>
              </div>
              <div className="text-gray-700 ml-7">
                Certified By: <span className="font-semibold">{result.data.blockchain.certificate?.certifiedBy}</span>
              </div>
              <div className="text-xs text-gray-600 ml-7 mt-2">
                This certificate exists on the immutable blockchain and cannot be forged.
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-600">
              Blockchain verification not available for this certificate.
            </div>
          )}
        </div>
      </div>
    )}

    <div className="mt-6 pt-6 border-t border-gray-200 text-center">
      <p className="text-sm text-gray-600">
        This certificate is registered on BOTH MongoDB and Ethereum smart contract for maximum security.
      </p>
    </div>
  </div>
)}
          </div>
        )}

        {/* Info Section */}
        <div className="mt-12 bg-blue-50 rounded-lg p-6">
          <h3 className="font-semibold text-lg mb-3">About NGJA Certification</h3>
          <div className="space-y-2 text-sm text-gray-700">
            <p>
              • The National Gem & Jewellery Authority (NGJA) of Sri Lanka is the official gemstone certification body
            </p>
            <p>
              • All certificates are recorded on the blockchain for immutability and transparency
            </p>
            <p>
              • You can verify any NGJA certificate by entering its unique certificate number
            </p>
            <p>
              • Certificate numbers follow the format: NGJA-YEAR-NUMBER (e.g., NGJA-2024-001234)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyCertificate;
