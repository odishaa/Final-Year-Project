import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { transactionAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const MySales = () => {
  const { isAuthenticated, isSeller } = useAuth();
  const navigate = useNavigate();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(null);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');

  useEffect(() => {
    if (!isAuthenticated || !isSeller()) {
      navigate('/marketplace');
      return;
    }
    fetchMySales();
  }, [isAuthenticated]);

  const fetchMySales = async () => {
    try {
      setLoading(true);
      const response = await transactionAPI.getMySales();
      setSales(response.data.data.transactions);
    } catch (error) {
      showToast('Failed to load your sales', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTransaction = async (transactionId) => {
    if (!window.confirm('Transfer ownership to buyer? This will record the transfer on the blockchain.')) {
      return;
    }

    setActionLoading(transactionId);
    try {
      await transactionAPI.completeTransaction(transactionId);
      showToast('✅ Ownership transferred successfully!');
      fetchMySales();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to complete transaction', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRateBuyer = async (e) => {
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
      fetchMySales();
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
          <p className="text-gray-600">Loading your sales...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">My Sales</h1>
            <p className="text-gray-600 mt-1">Track your gemstone sales</p>
          </div>
          <Link
            to="/marketplace/my-listings"
            className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
          >
            My Listings
          </Link>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow text-center">
            <div className="text-2xl font-bold text-blue-600">{sales.length}</div>
            <div className="text-xs text-gray-600 mt-1">Total Sales</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {sales.filter(s => s.status === 'payment_received').length}
            </div>
            <div className="text-xs text-gray-600 mt-1">Pending Transfer</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow text-center">
            <div className="text-2xl font-bold text-green-600">
              {sales.filter(s => s.status === 'ownership_transferred').length}
            </div>
            <div className="text-xs text-gray-600 mt-1">Completed</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow text-center">
            <div className="text-2xl font-bold text-purple-600">
              {sales.reduce((sum, s) => sum + (s.price?.amount || 0), 0).toLocaleString()}
            </div>
            <div className="text-xs text-gray-600 mt-1">Total Revenue (LKR)</div>
          </div>
        </div>

        {/* Sales List */}
        {sales.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow">
            <div className="text-6xl mb-4">💰</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No sales yet</h3>
            <p className="text-gray-600 mb-6">Create listings to start selling your gemstones</p>
            <Link
              to="/marketplace/create"
              className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700"
            >
              Create Listing
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {sales.map((sale) => (
              <div key={sale._id} className="bg-white rounded-xl shadow overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Left: Sale info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">
                            {sale.gemstone?.name}
                          </h3>
                          <div className="text-sm text-gray-600 mt-1">
                            Buyer: {sale.buyer?.name}
                          </div>
                          <div className="font-mono text-xs text-blue-600 mt-1">
                            {sale.gemstone?.gemId}
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(sale.status)}`}>
                          {sale.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                        <div>
                          <div className="text-xs text-gray-500">Sale Price</div>
                          <div className="font-bold text-green-600">
                            {formatPrice(sale.price?.amount)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Type</div>
                          <div className="font-semibold">{sale.gemstone?.type}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Payment Status</div>
                          <div className={`font-semibold ${
                            sale.paymentStatus === 'completed' ? 'text-green-600' : 'text-yellow-600'
                          }`}>
                            {sale.paymentStatus?.replace('_', ' ').toUpperCase()}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Sale Date</div>
                          <div className="font-semibold">{formatDate(sale.createdAt)}</div>
                        </div>
                      </div>

                      {/* Buyer Info */}
                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <div className="text-xs text-gray-500 mb-2">Buyer Information</div>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                            {sale.buyer?.name?.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-sm">{sale.buyer?.name}</div>
                            <div className="text-xs text-gray-600">{sale.buyer?.email}</div>
                            {sale.buyer?.buyerInfo?.rating > 0 && (
                              <div className="text-xs text-yellow-600">
                                ⭐ {sale.buyer.buyerInfo.rating.toFixed(1)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Payment Pending */}
                      {sale.paymentStatus === 'pending' && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                          <div className="flex items-center space-x-2 text-yellow-800">
                            <span className="text-lg">⏳</span>
                            <div className="text-sm font-semibold">
                              Waiting for buyer to complete payment
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Payment Received */}
                      {sale.paymentStatus === 'completed' && sale.status === 'payment_received' && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                          <div className="flex items-center space-x-2 text-blue-800">
                            <span className="text-lg">💳</span>
                            <div className="text-sm font-semibold">
                              Payment received! Ready to transfer ownership.
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Ownership Transferred */}
                      {sale.status === 'ownership_transferred' && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                          <div className="flex items-center space-x-2 text-green-800 mb-2">
                            <span className="text-lg">✅</span>
                            <div className="text-sm font-semibold">
                              Sale completed! Ownership transferred to buyer.
                            </div>
                          </div>
                          {sale.blockchainTxHash && (
                            <div className="text-xs text-green-700 font-mono bg-green-100 p-2 rounded mt-2">
                              Blockchain Tx: {sale.blockchainTxHash}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-col space-y-2 flex-shrink-0 min-w-[200px]">
                      {sale.status === 'payment_received' && (
                        <button
                          onClick={() => handleCompleteTransaction(sale._id)}
                          disabled={actionLoading === sale._id}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-50 transition"
                        >
                          {actionLoading === sale._id ? 'Processing...' : '🔗 Transfer Ownership'}
                        </button>
                      )}

                      <Link
                        to={`/gemstones/${sale.gemstone?._id}`}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-700 transition text-center"
                      >
                        🔍 View Gemstone
                      </Link>

                      {sale.status === 'ownership_transferred' && !sale.sellerRating && (
                        <button
                          onClick={() => setShowRatingModal(sale._id)}
                          className="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-yellow-700 transition"
                        >
                          ⭐ Rate Buyer
                        </button>
                      )}

                      {sale.sellerRating && (
                        <div className="text-center px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-700 font-semibold">
                          ⭐ You rated {sale.sellerRating}/5
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
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Rate Your Buyer</h3>
            <form onSubmit={handleRateBuyer} className="space-y-4">
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

export default MySales;