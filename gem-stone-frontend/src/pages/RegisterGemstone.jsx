import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gemstoneAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const RegisterGemstone = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [photos, setPhotos] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Sapphire',
    variety: '',
    carats: '',
    color: '',
    intensity: 'Medium',
    clarity: 'VS1',
    cut: 'Oval',
    country: 'Sri Lanka',
    region: '',
    treatment: 'None',
    description: '',
    isPublic: true
  });

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    setPhotos(files);
    const previews = files.map(f => URL.createObjectURL(f));
    setPhotoPreviews(previews);
  };

  const removePhoto = (index) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    const newPreviews = photoPreviews.filter((_, i) => i !== index);
    URL.revokeObjectURL(photoPreviews[index]);
    setPhotos(newPhotos);
    setPhotoPreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    const gemstoneData = {
      name: formData.name,
      type: formData.type,
      variety: formData.variety,
      weight: {
        carats: parseFloat(formData.carats)
      },
      color: {
        primary: formData.color,
        intensity: formData.intensity
      },
      clarity: formData.clarity,
      cut: formData.cut,
      origin: {
        country: formData.country,
        region: formData.region
      },
      treatment: formData.treatment,
      description: formData.description,
      isPublic: formData.isPublic
    };

    const response = await gemstoneAPI.register(gemstoneData);
    const gemstoneId = response.data.data.gemstone._id;

    if (photos.length > 0) {
      const formData = new FormData();
      photos.forEach(photo => formData.append('images', photo));
      await gemstoneAPI.uploadPhotos(gemstoneId, formData);
    }

    // Show success with smart contract info
    const smartContract = response.data.data.smartContract;
    const mongodb = response.data.data.mongodb;

    if (smartContract?.success) {
      alert(`✅ Gemstone registered on BOTH blockchains!

📊 MongoDB Hash: ${mongodb.blockchainHash.substring(0, 16)}...

🔗 Smart Contract:
   • Transaction: ${smartContract.transactionHash}
   • Block: ${smartContract.blockNumber}
   • Gas Used: ${smartContract.gasUsed}

Check Ganache to see your transaction!`);
    } else {
      alert('✅ Gemstone registered successfully! Blockchain record created.');
    }

    navigate(`/my-gemstones`);
  } catch (err) {
    setError(err.response?.data?.message || 'Failed to register gemstone');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Register New Gemstone</h1>
          <p className="text-gray-600 mb-8">Add your gemstone to the blockchain</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gemstone Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Ceylon Blue Sapphire"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type *
                  </label>
                  <select
                    name="type"
                    required
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Sapphire">Sapphire</option>
                    <option value="Ruby">Ruby</option>
                    <option value="Emerald">Emerald</option>
                    <option value="Topaz">Topaz</option>
                    <option value="Garnet">Garnet</option>
                    <option value="Amethyst">Amethyst</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Variety
                  </label>
                  <input
                    type="text"
                    name="variety"
                    value={formData.variety}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Ceylon Blue, Padparadscha"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Weight (Carats) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="carats"
                    required
                    value={formData.carats}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="5.2"
                  />
                </div>
              </div>
            </div>

            {/* Color & Quality */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Color & Quality</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Primary Color *
                  </label>
                  <input
                    type="text"
                    name="color"
                    required
                    value={formData.color}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Blue"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Color Intensity
                  </label>
                  <select
                    name="intensity"
                    value={formData.intensity}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Light">Light</option>
                    <option value="Medium">Medium</option>
                    <option value="Dark">Dark</option>
                    <option value="Vivid">Vivid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Clarity *
                  </label>
                  <select
                    name="clarity"
                    required
                    value={formData.clarity}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="FL">FL (Flawless)</option>
                    <option value="IF">IF (Internally Flawless)</option>
                    <option value="VVS1">VVS1</option>
                    <option value="VVS2">VVS2</option>
                    <option value="VS1">VS1</option>
                    <option value="VS2">VS2</option>
                    <option value="SI1">SI1</option>
                    <option value="SI2">SI2</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Cut & Origin */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Cut & Origin</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cut *
                  </label>
                  <select
                    name="cut"
                    required
                    value={formData.cut}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Round">Round</option>
                    <option value="Oval">Oval</option>
                    <option value="Cushion">Cushion</option>
                    <option value="Emerald">Emerald</option>
                    <option value="Princess">Princess</option>
                    <option value="Cabochon">Cabochon</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Treatment
                  </label>
                  <select
                    name="treatment"
                    value={formData.treatment}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="None">None</option>
                    <option value="Heat Treated">Heat Treated</option>
                    <option value="Oiled">Oiled</option>
                    <option value="Irradiated">Irradiated</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country of Origin *
                  </label>
                  <input
                    type="text"
                    name="country"
                    required
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Region/Mine
                  </label>
                  <input
                    type="text"
                    name="region"
                    value={formData.region}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Ratnapura"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Additional details about the gemstone..."
              />
            </div>

            {/* Photo Upload */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">Gem Photos <span className="text-sm font-normal text-gray-400">(optional, up to 5)</span></h3>
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                <span className="text-sm text-gray-500">Click to select photos (JPEG, PNG)</span>
                <span className="text-xs text-gray-400 mt-1">Max 5MB each</span>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  multiple
                  className="hidden"
                  onChange={handlePhotoChange}
                />
              </label>
              {photoPreviews.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-2">
                  {photoPreviews.map((src, index) => (
                    <div key={index} className="relative w-24 h-24">
                      <img src={src} alt={`preview-${index}`} className="w-24 h-24 object-cover rounded-lg border border-gray-200" />
                      {index === 0 && (
                        <span className="absolute bottom-1 left-1 bg-blue-600 text-white text-xs px-1 rounded">Primary</span>
                      )}
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Public Listing */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isPublic"
                checked={formData.isPublic}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Make this gemstone publicly visible
              </label>
            </div>

            {/* Submit Button */}
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Registering...' : '🔗 Register on Blockchain'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/gemstones')}
                className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterGemstone;
