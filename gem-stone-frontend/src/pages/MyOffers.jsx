import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { offerAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const MyOffers = () => {
  const { isAuthenticated, isBuyer } = useAuth();
  const navigate = useNavigate();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || !isBuyer()) {
      navigate('/marketplace');
      return;
    }
    fetchMyOffers();
  }, [isAuthenticated]);

  const fetchMyOffers = async () => {
    try {
      setLoading(true);
      const response = await offerAPI.getMyOffers();
      setOffers(response.data.data.offers);
    } catch (error) {
      showToast('Failed to load your offers', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawOffer = async (offerId) => {
    if (!window.confirm('Withdraw this offer?')) {
      return;
    }

    setActionLoading(offerId);
    try {
      await offerAPI.withdrawOffer(offerId);
      showToast('✅ Offer withdrawn');
      fetchMyOffers();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to withdraw offer', 'error');
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
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      withdrawn: 'bg-gray-100 text-gray-800',
      expired: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading your offers...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">My Offers</h1>
            <p className="text-gray-600 mt-1">Track your gemstone offers</p>
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
            <div className="text-2xl font-bold text-blue-600">{offers.length}</div>
            <div className="text-xs text-gray-600 mt-1">Total Offers</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {offers.filter(o => o.status === 'pending').length}
            </div>
            <div className="text-xs text-gray-600 mt-1">Pending</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow text-center">
            <div className="text-2xl font-bold text-green-600">
              {offers.filter(o => o.status === 'accepted').length}
            </div>
            <div className="text-xs text-gray-600 mt-1">Accepted</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow text-center">
            <div className="text-2xl font-bold text-red-600">
              {offers.filter(o => o.status === 'rejected').length}
            </div>
            <div className="text-xs text-gray-600 mt-1">Rejected</div>
          </div>
        </div>

        {/* Offers List */}
        {offers.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow">
            <div className="text-6xl mb-4">💬</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No offers yet</h3>
            <p className="text-gray-600 mb-6">Browse the marketplace and make your first offer</p>
            <Link
              to="/marketplace"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700"
            >
              Browse Marketplace
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {offers.map((offer) => (
              <div key={offer._id} className="bg-white rounded-xl shadow overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Left: Listing info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <Link
                            to={`/marketplace/listings/${offer.listing?._id}`}
                            className="text-xl font-bold text-gray-900 hover:text-blue-600"
                          >
                            {offer.listing?.title}
                          </Link>
                          <div className="text-sm text-gray-600 mt-1">
                            Seller: {offer.listing?.seller?.name}
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(offer.status)}`}>
                          {offer.status.toUpperCase()}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                        <div>
                          <div className="text-xs text-gray-500">Your Offer</div>
                          <div className="font-bold text-blue-600">
                            {formatPrice(offer.offerAmount?.amount)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Listed Price</div>
                          <div className="font-semibold text-gray-700">
                            {formatPrice(offer.listing?.price?.amount)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Gemstone</div>
                          <div className="font-semibold">
                            {offer.listing?.gemstone?.type} - {offer.listing?.gemstone?.weight?.carats}ct
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Offered On</div>
                          <div className="font-semibold">{formatDate(offer.createdAt)}</div>
                        </div>
                      </div>

                      {offer.message && (
                        <div className="bg-gray-50 p-3 rounded-lg mb-3">
                          <div className="text-xs text-gray-500 mb-1">Your message:</div>
                          <div className="text-sm text-gray-700">"{offer.message}"</div>
                        </div>
                      )}

                      {offer.sellerResponse && (
                        <div className="bg-blue-50 p-3 rounded-lg mb-3">
                          <div className="text-xs text-blue-600 mb-1">Seller's response:</div>
                          <div className="text-sm text-blue-900 font-semibold">"{offer.sellerResponse}"</div>
                        </div>
                      )}

                      {offer.status === 'pending' && (
                        <div className="text-xs text-gray-500">
                          Expires on {formatDate(offer.expiresAt)}
                        </div>
                      )}

                      {offer.status === 'accepted' && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
                          <div className="flex items-center space-x-2 text-green-800">
                            <span className="text-lg">✅</span>
                            <div className="text-sm font-semibold">
                              Offer accepted! The listing is now reserved for you.
                            </div>
                          </div>
                          <Link
                            to="/marketplace/my-purchases"
                            className="text-sm text-green-700 hover:text-green-800 font-semibold mt-2 inline-block"
                          >
                            Complete purchase →
                          </Link>
                        </div>
                      )}
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-col space-y-2 flex-shrink-0 min-w-[160px]">
                      <Link
                        to={`/marketplace/listings/${offer.listing?._id}`}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-700 transition text-center"
                      >
                        🔍 View Listing
                      </Link>

                      {offer.status === 'pending' && (
                        <button
                          onClick={() => handleWithdrawOffer(offer._id)}
                          disabled={actionLoading === offer._id}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-50 transition"
                        >
                          {actionLoading === offer._id ? 'Withdrawing...' : '✗ Withdraw'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOffers;