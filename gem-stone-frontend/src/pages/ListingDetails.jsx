import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { marketplaceAPI, offerAPI, transactionAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ListingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isBuyer } = useAuth();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  const [toast, setToast] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchListing();
  }, [id]);

  const fetchListing = async () => {
    try {
      setLoading(true);
      const response = await marketplaceAPI.getListing(id);
      setListing(response.data.data.listing);
      // Pre-fill offer with listing price
      setOfferAmount(response.data.data.listing.price?.amount || '');
    } catch (error) {
      console.error('Failed to fetch listing:', error);
      showToast('Listing not found', 'error');
      navigate('/marketplace');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleMakeOffer = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setActionLoading(true);
    try {
      await offerAPI.createOffer({
        listingId: listing._id,
        offerAmount: parseFloat(offerAmount),
        message: offerMessage
      });
      showToast('✅ Offer submitted successfully!');
      setShowOfferModal(false);
      setOfferMessage('');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to submit offer', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDirectPurchase = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!window.confirm(`Confirm purchase for ${formatPrice(listing.price?.amount)}?`)) {
      return;
    }

    setActionLoading(true);
    try {
      await transactionAPI.createPurchase({
        listingId: listing._id,
        paymentMethod: 'bank_transfer'
      });
      showToast('✅ Purchase initiated! Please complete payment.');
      navigate('/marketplace/my-purchases');
    } catch (error) {
      showToast(error.response?.data?.message || 'Purchase failed', 'error');
    } finally {
      setActionLoading(false);
    }
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading listing...</p>
        </div>
      </div>
    );
  }

  if (!listing) {
    return null;
  }

  const isOwner = user?._id === listing.seller?._id;
  const canMakeOffer = isAuthenticated && !isOwner && listing.status === 'active' && isBuyer();
  const canPurchase = isAuthenticated && !isOwner && listing.status === 'active' && isBuyer();

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
        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-gray-600">
          <Link to="/marketplace" className="hover:text-blue-600">Marketplace</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{listing.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Image & Gemstone Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="h-96 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center relative">
                <div className="text-9xl">💎</div>
                {listing.ngjaVerified?.verified && (
                  <div className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg font-bold flex items-center space-x-2">
                    <span>✓</span>
                    <span>NGJA Verified</span>
                  </div>
                )}
                <div className={`absolute top-4 left-4 px-4 py-2 rounded-lg font-bold text-white ${
                  listing.status === 'active' ? 'bg-green-600' :
                  listing.status === 'reserved' ? 'bg-yellow-600' :
                  'bg-gray-600'
                }`}>
                  {listing.status.toUpperCase()}
                </div>
              </div>
            </div>

            {/* Listing Description */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{listing.title}</h1>
              <p className="text-gray-700 leading-relaxed">{listing.description}</p>
            </div>

            {/* Gemstone Details */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Gemstone Specifications</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Type</div>
                  <div className="font-semibold text-gray-900">{listing.gemstone?.type}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Weight</div>
                  <div className="font-semibold text-gray-900">{listing.gemstone?.weight?.carats} carats</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Color</div>
                  <div className="font-semibold text-gray-900">{listing.gemstone?.color?.primary}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Clarity</div>
                  <div className="font-semibold text-gray-900">{listing.gemstone?.clarity}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Cut</div>
                  <div className="font-semibold text-gray-900">{listing.gemstone?.cut}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Gemstone ID</div>
                  <div className="font-mono text-sm text-blue-600">{listing.gemstone?.gemId}</div>
                </div>
              </div>

              {listing.gemstone?.ngja?.certified && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-2xl">✓</span>
                      <h4 className="font-semibold text-green-900">NGJA Certified</h4>
                    </div>
                    <div className="text-sm text-green-800 space-y-1">
                      <div>Certificate: <span className="font-mono font-semibold">{listing.gemstone.ngja.certificateNumber}</span></div>
                      <div>Certified by: {listing.gemstone.ngja.certifiedBy}</div>
                      <div>Date: {formatDate(listing.gemstone.ngja.certificationDate)}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Blockchain Record */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">🔗 Blockchain Verification</h3>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Blockchain Hash</div>
                  <div className="font-mono text-xs bg-gray-900 text-green-400 p-3 rounded-lg break-all">
                    {listing.gemstone?.blockchainHash}
                  </div>
                </div>
                <Link
                  to={`/gemstones/${listing.gemstone?._id}`}
                  className="inline-block text-blue-600 hover:text-blue-700 font-semibold text-sm"
                >
                  View full blockchain record →
                </Link>
              </div>
            </div>
          </div>

          {/* Right: Price & Actions */}
          <div className="space-y-6">
            {/* Price Card */}
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-6">
              <div className="mb-6">
                <div className="text-sm text-gray-500 mb-1">Price</div>
                <div className="text-4xl font-bold text-green-600">
                  {formatPrice(listing.price?.amount, listing.price?.currency)}
                </div>
                {listing.price?.negotiable && (
                  <div className="text-sm text-blue-600 font-semibold mt-1">
                    💬 Price is negotiable
                  </div>
                )}
              </div>

              {/* Seller Info */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <div className="text-sm text-gray-500 mb-2">Seller</div>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {listing.seller?.name?.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{listing.seller?.name}</div>
                    {listing.seller?.sellerInfo?.rating > 0 && (
                      <div className="text-sm text-yellow-600">
                        ⭐ {listing.seller.sellerInfo.rating.toFixed(1)} ({listing.seller.sellerInfo.totalSales} sales)
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {isOwner ? (
                  <div className="text-center py-4 bg-gray-100 rounded-lg text-gray-700 font-semibold">
                    This is your listing
                  </div>
                ) : listing.status !== 'active' ? (
                  <div className="text-center py-4 bg-yellow-100 rounded-lg text-yellow-800 font-semibold">
                    This listing is {listing.status}
                  </div>
                ) : (
                  <>
                    {canPurchase && (
                      <button
                        onClick={handleDirectPurchase}
                        disabled={actionLoading}
                        className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition"
                      >
                        {actionLoading ? 'Processing...' : '🛒 Buy Now'}
                      </button>
                    )}

                    {canMakeOffer && listing.price?.negotiable && (
                      <button
                        onClick={() => setShowOfferModal(true)}
                        className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                      >
                        💬 Make an Offer
                      </button>
                    )}

                    {!isAuthenticated && (
                      <Link
                        to="/login"
                        className="block w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition text-center"
                      >
                        Login to Purchase
                      </Link>
                    )}
                  </>
                )}
              </div>

              {/* Stats */}
              <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-2 gap-4 text-center text-sm">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{listing.views || 0}</div>
                  <div className="text-gray-500">Views</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{listing.favorites?.length || 0}</div>
                  <div className="text-gray-500">Favorites</div>
                </div>
              </div>

              <div className="mt-4 text-xs text-gray-500 text-center">
                Listed on {formatDate(listing.createdAt)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Offer Modal */}
      {showOfferModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Make an Offer</h3>
            <form onSubmit={handleMakeOffer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Offer Amount (LKR)
                </label>
                <input
                  type="number"
                  required
                  value={offerAmount}
                  onChange={(e) => setOfferAmount(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your offer"
                />
                <div className="text-xs text-gray-500 mt-1">
                  Listed price: {formatPrice(listing.price?.amount)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message to Seller (Optional)
                </label>
                <textarea
                  value={offerMessage}
                  onChange={(e) => setOfferMessage(e.target.value)}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Add a message..."
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
                >
                  {actionLoading ? 'Submitting...' : 'Submit Offer'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowOfferModal(false)}
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

export default ListingDetails;