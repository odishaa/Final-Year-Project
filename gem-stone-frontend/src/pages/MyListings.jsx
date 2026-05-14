import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { marketplaceAPI, offerAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const MyListings = () => {
  const { isAuthenticated, isSeller } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [selectedListing, setSelectedListing] = useState(null);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || !isSeller()) {
      navigate('/marketplace');
      return;
    }
    fetchMyListings();
  }, [isAuthenticated]);

  const fetchMyListings = async () => {
    try {
      setLoading(true);
      const response = await marketplaceAPI.getMyListings();
      setListings(response.data.data.listings);
    } catch (error) {
      showToast('Failed to load your listings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchListingOffers = async (listingId) => {
    try {
      const response = await offerAPI.getListingOffers(listingId);
      setOffers(response.data.data.offers);
      setSelectedListing(listingId);
    } catch (error) {
      showToast('Failed to load offers', 'error');
    }
  };

  const handleAcceptOffer = async (offerId) => {
    if (!window.confirm('Accept this offer? Other pending offers will be rejected.')) {
      return;
    }

    setActionLoading(offerId);
    try {
      await offerAPI.acceptOffer(offerId, {
        sellerResponse: 'Offer accepted! Please proceed with payment.'
      });
      showToast('✅ Offer accepted! Listing is now reserved.');
      fetchMyListings();
      fetchListingOffers(selectedListing);
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to accept offer', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectOffer = async (offerId) => {
    if (!window.confirm('Reject this offer?')) {
      return;
    }

    setActionLoading(offerId);
    try {
      await offerAPI.rejectOffer(offerId, {
        sellerResponse: 'Thank you for your offer, but I cannot accept it at this time.'
      });
      showToast('Offer rejected');
      fetchListingOffers(selectedListing);
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to reject offer', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteListing = async (listingId) => {
    if (!window.confirm('Delete this listing? This action cannot be undone.')) {
      return;
    }

    setActionLoading(listingId);
    try {
      await marketplaceAPI.deleteListing(listingId);
      showToast('✅ Listing deleted');
      fetchMyListings();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to delete listing', 'error');
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
      draft: 'bg-gray-100 text-gray-800',
      pending_verification: 'bg-yellow-100 text-yellow-800',
      active: 'bg-green-100 text-green-800',
      reserved: 'bg-blue-100 text-blue-800',
      sold: 'bg-purple-100 text-purple-800',
      removed: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading your listings...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">My Listings</h1>
            <p className="text-gray-600 mt-1">Manage your marketplace listings</p>
          </div>
          <Link
            to="/marketplace/create"
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
          >
            + Create New Listing
          </Link>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow text-center">
            <div className="text-2xl font-bold text-blue-600">{listings.length}</div>
            <div className="text-xs text-gray-600 mt-1">Total Listings</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow text-center">
            <div className="text-2xl font-bold text-green-600">
              {listings.filter(l => l.status === 'active').length}
            </div>
            <div className="text-xs text-gray-600 mt-1">Active</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {listings.filter(l => l.status === 'pending_verification').length}
            </div>
            <div className="text-xs text-gray-600 mt-1">Pending</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow text-center">
            <div className="text-2xl font-bold text-purple-600">
              {listings.filter(l => l.status === 'sold').length}
            </div>
            <div className="text-xs text-gray-600 mt-1">Sold</div>
          </div>
        </div>

        {/* Listings */}
        {listings.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow">
            <div className="text-6xl mb-4">🛒</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No listings yet</h3>
            <p className="text-gray-600 mb-6">Create your first marketplace listing</p>
            <Link
              to="/marketplace/create"
              className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700"
            >
              Create Listing
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {listings.map((listing) => (
              <div key={listing._id} className="bg-white rounded-xl shadow overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    {/* Left: Listing info */}
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="text-4xl">💎</div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">{listing.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(listing.status)}`}>
                            {listing.status.replace('_', ' ').toUpperCase()}
                          </span>
                          {listing.ngjaVerified?.verified && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                              ✓ NGJA Verified
                            </span>
                          )}
                        </div>

                        <p className="text-gray-600 text-sm mb-3">{listing.description}</p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <div className="text-xs text-gray-500">Price</div>
                            <div className="font-bold text-green-600">
                              {formatPrice(listing.price?.amount)}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Type</div>
                            <div className="font-semibold">{listing.gemstone?.type}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Weight</div>
                            <div className="font-semibold">{listing.gemstone?.weight?.carats} ct</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Views</div>
                            <div className="font-semibold">{listing.views || 0}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Listed</div>
                            <div className="font-semibold">{formatDate(listing.createdAt)}</div>
                          </div>
                          {listing.publishedAt && (
                            <div>
                              <div className="text-xs text-gray-500">Published</div>
                              <div className="font-semibold">{formatDate(listing.publishedAt)}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-col space-y-2 flex-shrink-0 min-w-[180px]">
                      {listing.status === 'active' && (
                        <button
                          onClick={() => fetchListingOffers(listing._id)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
                        >
                          {selectedListing === listing._id ? 'Hide Offers' : '👀 View Offers'}
                        </button>
                      )}

                      <Link
                        to={`/marketplace/listings/${listing._id}`}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-700 transition text-center"
                      >
                        🔍 View Listing
                      </Link>

                      {listing.status === 'draft' && (
                        <button
                          onClick={() => handleDeleteListing(listing._id)}
                          disabled={actionLoading === listing._id}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-50 transition"
                        >
                          {actionLoading === listing._id ? 'Deleting...' : '🗑️ Delete'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Offers Dropdown */}
                  {selectedListing === listing._id && (
                    <div className="mt-6 pt-6 border-t border-gray-100">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">
                        💬 Offers ({offers.length})
                      </h4>
                      {offers.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 rounded-lg text-gray-600">
                          No offers yet
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {offers.map((offer) => (
                            <div key={offer._id} className="bg-gray-50 rounded-lg p-4">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <div className="font-semibold text-gray-900">
                                    {offer.buyer?.name}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    {offer.buyer?.email}
                                  </div>
                                  {offer.buyer?.buyerInfo?.rating > 0 && (
                                    <div className="text-xs text-yellow-600 mt-1">
                                      ⭐ {offer.buyer.buyerInfo.rating.toFixed(1)}
                                    </div>
                                  )}
                                </div>
                                <div className="text-right">
                                  <div className="text-xl font-bold text-green-600">
                                    {formatPrice(offer.offerAmount?.amount)}
                                  </div>
                                  <div className={`text-xs px-2 py-1 rounded-full font-semibold mt-1 ${
                                    offer.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    offer.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {offer.status.toUpperCase()}
                                  </div>
                                </div>
                              </div>

                              {offer.message && (
                                <div className="text-sm text-gray-700 bg-white p-3 rounded border border-gray-200 mb-3">
                                  "{offer.message}"
                                </div>
                              )}

                              <div className="text-xs text-gray-500 mb-3">
                                Offered on {formatDate(offer.createdAt)} • 
                                Expires {formatDate(offer.expiresAt)}
                              </div>

                              {offer.status === 'pending' && (
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleAcceptOffer(offer._id)}
                                    disabled={actionLoading === offer._id}
                                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-50"
                                  >
                                    {actionLoading === offer._id ? 'Processing...' : '✓ Accept'}
                                  </button>
                                  <button
                                    onClick={() => handleRejectOffer(offer._id)}
                                    disabled={actionLoading === offer._id}
                                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-50"
                                  >
                                    ✗ Reject
                                  </button>
                                </div>
                              )}

                              {offer.sellerResponse && (
                                <div className="mt-2 text-sm text-gray-600 bg-blue-50 p-2 rounded">
                                  Your response: {offer.sellerResponse}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyListings;