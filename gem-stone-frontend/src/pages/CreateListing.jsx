import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { marketplaceAPI, gemstoneAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const CreateListing = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [myGemstones, setMyGemstones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    gemstoneId: '',
    title: '',
    description: '',
    price: '',
    negotiable: true
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchMyGemstones();
  }, [isAuthenticated]);

  const fetchMyGemstones = async () => {
    try {
      const response = await gemstoneAPI.getMyCollection();
      // Filter out already-listed gemstones
      const available = response.data.data.gemstones.filter(
        gem => !gem.isListed
      );
      setMyGemstones(available);
    } catch (err) {
      setError('Failed to load your gemstones');
    }
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleGemstoneSelect = (e) => {
    const gemId = e.target.value;
    setFormData({ ...formData, gemstoneId: gemId });

    // Auto-fill title based on selected gemstone
    if (gemId) {
      const gem = myGemstones.find(g => g._id === gemId);
      if (gem) {
        setFormData({
          ...formData,
          gemstoneId: gemId,
          title: `${gem.name} - ${gem.weight?.carats}ct ${gem.type}`,
          description: gem.description || `Beautiful ${gem.type} from ${gem.origin?.country}`
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const listingData = {
        gemstoneId: formData.gemstoneId,
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        negotiable: formData.negotiable
      };

      const response = await marketplaceAPI.createListing(listingData);
      alert('✅ Listing created! It is now live on the marketplace.');
      navigate('/marketplace/my-listings');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Marketplace Listing</h1>
          <p className="text-gray-600 mb-8">List your gemstone for sale on the marketplace</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {myGemstones.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <div className="text-6xl mb-4">💎</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No gemstones available to list
              </h3>
              <p className="text-gray-600 mb-6">
                Register a gemstone first, then come back to list it.
              </p>
              <button
                onClick={() => navigate('/my-gemstones')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
              >
                Go to My Gemstones
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Select Gemstone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Gemstone *
                </label>
                <select
                  name="gemstoneId"
                  required
                  value={formData.gemstoneId}
                  onChange={handleGemstoneSelect}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Choose a gemstone...</option>
                  {myGemstones.map(gem => (
                    <option key={gem._id} value={gem._id}>
                      {gem.name} - {gem.weight?.carats}ct {gem.type} (Cert: {gem.ngja?.certificateNumber})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Gemstones already listed are not shown here
                </p>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Listing Title *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Stunning Royal Blue Sapphire - 5.25ct"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  name="description"
                  required
                  value={formData.description}
                  onChange={handleChange}
                  rows="5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe your gemstone, its unique features, quality, etc."
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (LKR) *
                </label>
                <input
                  type="number"
                  name="price"
                  required
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="250000"
                />
              </div>

              {/* Negotiable */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="negotiable"
                  checked={formData.negotiable}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Price is negotiable (buyers can make offers)
                </label>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">📋 Listing Process</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Your listing goes live immediately on the marketplace</li>
                  <li>• Buyers can make offers or purchase directly</li>
                  <li>• You can manage your listings from "My Listings"</li>
                </ul>
              </div>

              {/* Submit */}
              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? 'Creating...' : '🛒 Create Listing'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/marketplace')}
                  className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateListing;