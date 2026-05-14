import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { transactionAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const MyPurchases = () => {
  const { isAuthenticated, isBuyer } = useAuth();
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(null);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');

  useEffect(() => {
    if (!isAuthenticated || !isBuyer()) {
      navigate('/marketplace');
      return;
    }
    fetchMyPurchases();
  }, [isAuthenticated]);

  const fetchMyPurchases = async () => {
    try {
      setLoading(true);
      const response = await transactionAPI.getMyPurchases();
      setPurchases(response.data.data.transactions);
    } catch (error) {
      showToast('Failed to load your purchases', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePayment = async (transactionId) => {
    setActionLoading(transactionId);
    try {
      await transactionAPI.updatePayment(transactionId, {
        paymentStatus: 'completed',
        paymentProof: 'payment_confirmation.pdf'
      });
      showToast('✅ Payment marked as completed!');
      fetchMyPurchases();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to update payment', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRateSeller = async (e) => {
    e.preventDefault();
    setActionLoading(showRatingModal);
    try {
      await transactionAPI.rateTransaction(showRatingModal, {
        rating,
        review
      });
      showToast('✅ Thank you for your feedback!');
      setShowRatingModal(null);
      setRating(5);
      setReview('');
      fetchMyPurchases();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to submit rating', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const formatPrice = (amount, currency = 'LKR') => {
    return new Intl.NumberFormat('en-US').format(amount) + ' ' + currency;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      payment_received: 'bg-blue-100 text-blue-800',
      ownership_transferred: 'bg-green-100 text-green-800',
      completed: 'bg-purple-100 text-purple-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading your purchases...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg text-white text-sm font-medium ${
          toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'
        }`}>
          {toast.message}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Purchases</h1>
            <p className="text-gray-600 mt-1">Track your gemstone purchases</p>
          </div>
          <Link
            to="/marketplace"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Browse Marketplace
          </Link>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow text-center">
            <div className="text-2xl font-bold text-blue-600">{purchases.length}</div>
            <div className="text-xs text-gray-600 mt-1">Total Purchases</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {purchases.filter(p => p.status === 'pending').length}
            </div>
            <div className="text-xs text-gray-600 mt-1">Pending Payment</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow text-center">
            <div className="text-2xl font-bold text-green-600">
              {purchases.filter(p => p.status === 'ownership_transferred').length}
            </div>
            <div className="text-xs text-gray-600 mt-1">Completed</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow text-center">
            <div className="text-2xl font-bold text-purple-600">
              {purchases.reduce((sum, p) => sum + (p.price?.amount || 0), 0).toLocaleString()}
            </div>
            <div className="text-xs text-gray-600 mt-1">Total Spent (LKR)</div>
          </div>
        </div>

        {/* Purchases List */}
        {purchases.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow">
            <div className="text-6xl mb-4">🛒</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No purchases yet</h3>
            <p className="text-gray-600 mb-6">Browse the marketplace and make your first purchase</p>
            <Link
              to="/marketplace"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700"
            >
              Browse Marketplace
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {purchases.map((purchase) => (
              <div key={purchase._id} className="bg-white rounded-xl shadow overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Left: Purchase info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">
                            {purchase.gemstone?.name}
                          </h3>
                          <div className="text-sm text-gray-600 mt-1">
                            Seller: {purchase.seller?.name}
                          </div>
                          <div className="font-mono text-xs text-blue-600 mt-1">
                            {purchase.gemstone?.gemId}
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(purchase.status)}`}>
                          {purchase.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                        <div>
                          <div className="text-xs text-gray-500">Price Paid</div>
                          <div className="font-bold text-green-600">
                            {formatPrice(purchase.price?.amount)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Type</div>
                          <div className="font-semibold">{purchase.gemstone?.type}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Payment Method</div>
                          <div className="font-semibold">{purchase.paymentMethod?.replace('_', ' ')}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Purchase Date</div>
                          <div className="font-semibold">{formatDate(purchase.createdAt)}</div>
                        </div>
                      </div>

                      {/* Payment Status */}
                      {purchase.paymentStatus === 'pending' && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                          <div className="flex items-center space-x-2 text-yellow-800">
                            <span className="text-lg">⏳</span>
                            <div className="text-sm font-semibold">
                              Payment pending. Please complete payment to proceed.
                            </div>
                          </div>
                        </div>
                      )}

                      {purchase.status === 'ownership_transferred' && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                          <div className="flex items-center space-x-2 text-green-800 mb-2">
                            <span className="text-lg">✅</span>
                            <div className="text-sm font-semibold">
                              Ownership transferred! This gemstone is now yours.
                            </div>
                          </div>
                          {purchase.blockchainTxHash && (
                            <div className="text-xs text-green-700 font-mono bg-green-100 p-2 rounded mt-2">
                              Blockchain Tx: {purchase.blockchainTxHash}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-col space-y-2 flex-shrink-0 min-w-[180px]">
                      {purchase.paymentStatus === 'pending' && (
                        <button
                          onClick={() => handleUpdatePayment(purchase._id)}
                          disabled={actionLoading === purchase._id}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-50 transition"
                        >
                          {actionLoading === purchase._id ? 'Processing...' : '💳 Mark as Paid'}
                        </button>
                      )}

                      <Link
                        to={`/gemstones/${purchase.gemstone?._id}`}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-700 transition text-center"
                      >
                        🔍 View Gemstone
                      </Link>

                      {purchase.status === 'ownership_transferred' && !purchase.buyerRating && (
                        <button
                          onClick={() => setShowRatingModal(purchase._id)}
                          className="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-yellow-700 transition"
                        >
                          ⭐ Rate Seller
                        </button>
                      )}

                      {purchase.buyerRating && (
                        <div className="text-center px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-700 font-semibold">
                          ⭐ You rated {purchase.buyerRating}/5
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Rate Your Seller</h3>
            <form onSubmit={handleRateSeller} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating
                </label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`text-3xl ${star <= rating ? 'text-yellow-500' : 'text-gray-300'}`}
                    >
                      ⭐
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Review (Optional)
                </label>
                <textarea
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Share your experience..."
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={actionLoading === showRatingModal}
                  className="flex-1 bg-yellow-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-yellow-700 disabled:opacity-50"
                >
                  {actionLoading === showRatingModal ? 'Submitting...' : 'Submit Rating'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowRatingModal(null)}
                  className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
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

export default MyPurchases;