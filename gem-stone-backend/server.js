const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const dns = require('dns');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth.routes');
const gemstoneRoutes = require('./routes/gemstone.routes');
const blockchainRoutes = require('./routes/blockchain.routes');
const ngjaRoutes = require('./routes/ngja.routes');
const priceRoutes = require('./routes/price.routes');
const knowledgeRoutes = require('./routes/knowledge.routes');
const smartContractRoutes = require('./routes/smartcontract.routes');
// ⭐ NEW: Marketplace routes
const marketplaceRoutes = require('./routes/marketplace.routes');
const offerRoutes = require('./routes/offer.routes');
const transactionRoutes = require('./routes/transaction.routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Static files for uploads
app.use('/uploads', express.static('uploads'));

// Force Node.js to use Google's Public DNS servers
dns.setServers(['8.8.8.8', '8.8.4.4']);

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://aluminium-admin:DHvJiCOelpu1yZec@cluster0.vltqmnf.mongodb.net/gem-stone?appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ MongoDB Connected via Google DNS'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/gemstones', gemstoneRoutes);
app.use('/api/blockchain', blockchainRoutes);
app.use('/api/ngja', ngjaRoutes);
app.use('/api/prices', priceRoutes);
app.use('/api/knowledge', knowledgeRoutes);
app.use('/api/smartcontract', smartContractRoutes);
// ⭐ NEW: Marketplace routes
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/transactions', transactionRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'GemChain API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;