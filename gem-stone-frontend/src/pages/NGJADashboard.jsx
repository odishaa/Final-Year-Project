import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ngjaAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const NGJADashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [pendingGemstones, setPendingGemstones] = useState([]);
  const [certifiedGemstones, setCertifiedGemstones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [certifyModal, setCertifyModal] = useState({ open: false, gemstone: null });
  const [rejectModal, setRejectModal] = useState({ open: false, gemstone: null });
  const [certForm, setCertForm] = useState({ certificateNumber: '', certifiedBy: '' });
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (user && !['ngja_officer', 'admin'].includes(user.role)) {
      navigate('/');
      return;
    }
    fetchData();
  }, [isAuthenticated, user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pendingRes, certifiedRes] = await Promise.all([
        ngjaAPI.getPendingCertifications(),
        ngjaAPI.getCertifiedGemstones()
      ]);
      setPendingGemstones(pendingRes.data.data.gemstones);
      setCertifiedGemstones(certifiedRes.data.data.gemstones);
    } catch (err) {
      showToast('Failed to fetch data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleCertify = async (e) => {
    e.preventDefault();
    if (!certForm.certificateNumber) return;
    setActionLoading(true);
    try {
      await ngjaAPI.certifyGemstone(certifyModal.gemstone._id, {
        certificateNumber: certForm.certificateNumber,
        certifiedBy: certForm.certifiedBy || user.name
      });
      showToast(`✅ Gemstone certified! Certificate: ${certForm.certificateNumber}`);
      setCertifyModal({ open: false, gemstone: null });
      setCertForm({ certificateNumber: '', certifiedBy: '' });
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Certification failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    if (!rejectReason) return;
    setActionLoading(true);
    try {
      await ngjaAPI.rejectCertification(rejectModal.gemstone._id, rejectReason);
      showToast('Gemstone certification rejected');
      setRejectModal({ open: false, gemstone: null });
      setRejectReason('');
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Rejection failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const autoGenerateCertNumber = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(100000 + Math.random() * 900000);
    setCertForm({ ...certForm, certificateNumber: `NGJA-${year}-${random}` });
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading NGJA Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg text-white text-sm font-medium transition-all ${
          toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'
        }`}>
          {toast.message}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="text-3xl">🏛️</div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">NGJA Officer Dashboard</h1>
              <p className="text-gray-600">National Gem & Jewellery Authority — Certification Panel</p>
            </div>
          </div>
          <div className="mt-3 flex items-center space-x-2 text-sm text-gray-600">
            <span>Logged in as</span>
            <span className="font-semibold text-purple-700">{user?.name}</span>
            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full font-semibold">
              NGJA OFFICER
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6 border-l-4 border-yellow-500">
            <div className="text-2xl font-bold text-yellow-600">{pendingGemstones.length}</div>
            <div className="text-sm text-gray-600 mt-1">Pending Review</div>
          </div>
          <div className="bg-white rounded-xl shadow p-6 border-l-4 border-green-500">
            <div className="text-2xl font-bold text-green-600">{certifiedGemstones.length}</div>
            <div className="text-sm text-gray-600 mt-1">Certified Gemstones</div>
          </div>
          <div className="bg-white rounded-xl shadow p-6 border-l-4 border-blue-500">
            <div className="text-2xl font-bold text-blue-600">
              {pendingGemstones.length + certifiedGemstones.length}
            </div>
            <div className="text-sm text-gray-600 mt-1">Total Processed</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex-1 py-4 px-6 text-sm font-semibold transition ${
                activeTab === 'pending'
                  ? 'bg-yellow-50 text-yellow-700 border-b-2 border-yellow-500'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              ⏳ Pending Certification ({pendingGemstones.length})
            </button>
            <button
              onClick={() => setActiveTab('certified')}
              className={`flex-1 py-4 px-6 text-sm font-semibold transition ${
                activeTab === 'certified'
                  ? 'bg-green-50 text-green-700 border-b-2 border-green-500'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              ✅ Certified ({certifiedGemstones.length})
            </button>
          </div>

          {/* Pending Tab */}
          {activeTab === 'pending' && (
            <div className="p-6">
              {pendingGemstones.length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                  <div className="text-5xl mb-4">🎉</div>
                  <p className="text-lg font-medium">No pending certifications!</p>
                  <p className="text-sm mt-2">All gemstones have been reviewed.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingGemstones.map((gem) => (
                    <div key={gem._id} className="border border-yellow-200 bg-yellow-50 rounded-xl p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        {/* Gem Info */}
                        <div className="flex items-start space-x-4">
                          <div className="text-4xl">💎</div>
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="text-lg font-bold text-gray-900">{gem.name}</h3>
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-semibold">
                                PENDING
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <div>
                                <span className="font-mono text-xs bg-white px-2 py-1 rounded border">{gem.gemId}</span>
                              </div>
                              <div className="flex flex-wrap gap-4 mt-2">
                                <span>Type: <strong>{gem.type}</strong></span>
                                <span>Weight: <strong>{gem.weight?.carats} ct</strong></span>
                                <span>Clarity: <strong>{gem.clarity}</strong></span>
                                <span>Cut: <strong>{gem.cut}</strong></span>
                                <span>Origin: <strong>{gem.origin?.country}, {gem.origin?.region}</strong></span>
                                <span>Treatment: <strong>{gem.treatment}</strong></span>
                              </div>
                            </div>
                            <div className="mt-2 text-xs text-gray-500">
                              Submitted by: <strong>{gem.currentOwner?.name}</strong> ({gem.currentOwner?.email})
                              {gem.currentOwner?.phone && ` · ${gem.currentOwner.phone}`}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              Registered: {formatDate(gem.createdAt)}
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-3 flex-shrink-0">
                          <button
                            onClick={() => {
                              setCertifyModal({ open: true, gemstone: gem });
                              setCertForm({ certificateNumber: '', certifiedBy: user?.name });
                            }}
                            className="bg-green-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition"
                          >
                            ✅ Certify
                          </button>
                          <button
                            onClick={() => setRejectModal({ open: true, gemstone: gem })}
                            className="bg-red-100 text-red-700 px-5 py-2 rounded-lg text-sm font-semibold hover:bg-red-200 transition"
                          >
                            ❌ Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Certified Tab */}
          {activeTab === 'certified' && (
            <div className="p-6">
              {certifiedGemstones.length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                  <div className="text-5xl mb-4">📋</div>
                  <p className="text-lg font-medium">No certified gemstones yet</p>
                  <p className="text-sm mt-2">Approve pending certifications to see them here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {certifiedGemstones.map((gem) => (
                    <div key={gem._id} className="border border-green-200 bg-green-50 rounded-xl p-6">
                      <div className="flex items-start space-x-4">
                        <div className="text-4xl">💎</div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-lg font-bold text-gray-900">{gem.name}</h3>
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-semibold">
                              ✓ CERTIFIED
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 space-y-2">
                            <div className="font-mono text-xs bg-white px-2 py-1 rounded border inline-block">
                              {gem.gemId}
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                              <div>
                                <div className="text-xs text-gray-500">Type</div>
                                <div className="font-semibold">{gem.type}</div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-500">Weight</div>
                                <div className="font-semibold">{gem.weight?.carats} ct</div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-500">Certificate No.</div>
                                <div className="font-semibold text-green-700">{gem.ngja?.certificateNumber}</div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-500">Certified By</div>
                                <div className="font-semibold">{gem.ngja?.certifiedBy}</div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-500">Certification Date</div>
                                <div className="font-semibold">{formatDate(gem.ngja?.certificationDate)}</div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-500">Owner</div>
                                <div className="font-semibold">{gem.currentOwner?.name}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Refresh Button */}
        <div className="mt-6 text-center">
          <button
            onClick={fetchData}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            🔄 Refresh Data
          </button>
        </div>
      </div>

      {/* Certify Modal */}
      {certifyModal.open && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Certify Gemstone</h2>
              <p className="text-sm text-gray-600 mt-1">
                Issue NGJA certificate for <strong>{certifyModal.gemstone?.name}</strong>
              </p>
            </div>

            <form onSubmit={handleCertify} className="p-6 space-y-4">
              {/* Gemstone Summary */}
              <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-600">GEM ID</span>
                  <span className="font-mono font-semibold">{certifyModal.gemstone?.gemId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Type</span>
                  <span className="font-semibold">{certifyModal.gemstone?.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Weight</span>
                  <span className="font-semibold">{certifyModal.gemstone?.weight?.carats} carats</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Owner</span>
                  <span className="font-semibold">{certifyModal.gemstone?.currentOwner?.name}</span>
                </div>
              </div>

              {/* Certificate Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Certificate Number *
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    required
                    value={certForm.certificateNumber}
                    onChange={(e) => setCertForm({ ...certForm, certificateNumber: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-sm"
                    placeholder="NGJA-2024-001234"
                  />
                  <button
                    type="button"
                    onClick={autoGenerateCertNumber}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200 whitespace-nowrap"
                  >
                    Auto Generate
                  </button>
                </div>
              </div>

              {/* Certified By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Certified By *
                </label>
                <input
                  type="text"
                  required
                  value={certForm.certifiedBy}
                  onChange={(e) => setCertForm({ ...certForm, certifiedBy: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-sm"
                  placeholder="Officer name"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
                ⚠️ This action will create a permanent blockchain record that cannot be undone.
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 text-sm"
                >
                  {actionLoading ? 'Processing...' : '✅ Issue Certificate'}
                </button>
                <button
                  type="button"
                  onClick={() => setCertifyModal({ open: false, gemstone: null })}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-200 text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal.open && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Reject Certification</h2>
              <p className="text-sm text-gray-600 mt-1">
                Reject NGJA certification for <strong>{rejectModal.gemstone?.name}</strong>
              </p>
            </div>

            <form onSubmit={handleReject} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Rejection *
                </label>
                <textarea
                  required
                  rows="4"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 text-sm"
                  placeholder="e.g., Insufficient documentation, suspected treatment not declared..."
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 text-sm"
                >
                  {actionLoading ? 'Processing...' : '❌ Reject Certification'}
                </button>
                <button
                  type="button"
                  onClick={() => { setRejectModal({ open: false, gemstone: null }); setRejectReason(''); }}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-200 text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NGJADashboard;
