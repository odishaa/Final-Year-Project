import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// Gemstone APIs
export const gemstoneAPI = {
  getAll: (params) => api.get('/gemstones', { params }),
  getById: (id) => api.get(`/gemstones/${id}`),
  getByGemId: (gemId) => api.get(`/gemstones/gem/${gemId}`),
  getMyCollection: () => api.get('/gemstones/my/collection'),
  register: (data) => api.post('/gemstones', data),
  update: (id, data) => api.put(`/gemstones/${id}`, data),
  transfer: (id, newOwnerId) => api.post(`/gemstones/${id}/transfer`, { newOwnerId }),
  uploadPhotos: (id, formData) => api.post(`/gemstones/${id}/photos`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deletePhoto: (id, filename) => api.delete(`/gemstones/${id}/photos/${filename}`),
};

// Blockchain APIs
export const blockchainAPI = {
  getInfo: () => api.get('/blockchain/info'),
  getAllBlocks: (params) => api.get('/blockchain/blocks', { params }),
  getBlockByHash: (hash) => api.get(`/blockchain/block/${hash}`),
  verify: () => api.get('/blockchain/verify'),
  getGemstoneBlocks: (gemstoneId) => api.get(`/blockchain/gemstone/${gemstoneId}`),
  init: () => api.post('/blockchain/init'),
};

// NGJA APIs
export const ngjaAPI = {
  submitForCertification: (gemstoneId) => api.post(`/ngja/certify/${gemstoneId}`),
  certifyGemstone: (gemstoneId, data) => api.post(`/ngja/approve/${gemstoneId}`, data),
  rejectCertification: (gemstoneId, reason) => api.post(`/ngja/reject/${gemstoneId}`, { reason }),
  verifyCertificate: (certificateNumber) => api.get(`/ngja/verify/${certificateNumber}`),
  getPendingCertifications: () => api.get('/ngja/pending'),
  getCertifiedGemstones: () => api.get('/ngja/certified'),
};

// Price APIs
export const priceAPI = {
  addPriceData: (data) => api.post('/prices', data),
  getPriceHistory: (gemstoneType, params) => api.get(`/prices/${gemstoneType}`, { params }),
  getPriceAnalysis: (gemstoneType) => api.get(`/prices/analysis/${gemstoneType}`),
  estimatePrice: (data) => api.post('/prices/estimate', data),
  getMarketOverview: () => api.get('/prices/market/overview'),
};

// Knowledge APIs
export const knowledgeAPI = {
  getAll: (params) => api.get('/knowledge', { params }),
  getBySlug: (slug) => api.get(`/knowledge/${slug}`),
  getByCategory: (category) => api.get(`/knowledge/category/${category}`),
  getPopular: () => api.get('/knowledge/popular'),
  create: (data) => api.post('/knowledge', data),
  update: (id, data) => api.put(`/knowledge/${id}`, data),
  delete: (id) => api.delete(`/knowledge/${id}`),
  like: (id) => api.post(`/knowledge/${id}/like`),
};

// Smart Contract APIs
export const smartContractAPI = {
  getInfo: () => api.get('/smartcontract/info'),
  getGemstone: (gemId) => api.get(`/smartcontract/gemstone/${gemId}`),
  verifyCertificate: (gemId, certNumber) => api.get(`/smartcontract/verify/${gemId}/${certNumber}`),
};

// Add after smartContractAPI, before export default api

// Marketplace APIs
export const marketplaceAPI = {
  getAllListings: (params) => api.get('/marketplace/listings', { params }),
  getListing: (id) => api.get(`/marketplace/listings/${id}`),
  createListing: (data) => api.post('/marketplace/listings', data),
  updateListing: (id, data) => api.put(`/marketplace/listings/${id}`, data),
  deleteListing: (id) => api.delete(`/marketplace/listings/${id}`),
  getMyListings: () => api.get('/marketplace/my-listings'),
  toggleFavorite: (id) => api.post(`/marketplace/listings/${id}/favorite`),
  verifyListing: (id, data) => api.post(`/marketplace/listings/${id}/verify`, data),
};

// Offer APIs
export const offerAPI = {
  createOffer: (data) => api.post('/offers', data),
  getMyOffers: () => api.get('/offers/my-offers'),
  getListingOffers: (listingId) => api.get(`/offers/listing/${listingId}`),
  acceptOffer: (id, data) => api.put(`/offers/${id}/accept`, data),
  rejectOffer: (id, data) => api.put(`/offers/${id}/reject`, data),
  withdrawOffer: (id) => api.put(`/offers/${id}/withdraw`),
};

// Transaction APIs
export const transactionAPI = {
  createPurchase: (data) => api.post('/transactions/purchase', data),
  getMyPurchases: () => api.get('/transactions/my-purchases'),
  getMySales: () => api.get('/transactions/my-sales'),
  completeTransaction: (id) => api.put(`/transactions/${id}/complete`),
  updatePayment: (id, data) => api.put(`/transactions/${id}/payment`, data),
  rateTransaction: (id, data) => api.post(`/transactions/${id}/rate`, data),
};

export default api;
