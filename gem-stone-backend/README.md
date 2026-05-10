# GemChain Backend - Blockchain-based Gemstone Authentication System

## 🚀 Overview

GemChain is a comprehensive blockchain-based gemstone authentication and tracking system integrated with NGJA (National Gem & Jewellery Authority) certification. The system provides secure gemstone registration, ownership tracking, price analysis, and a knowledge hub for gemstone information.

## ✨ Key Features

### 1. **Blockchain Integration**
- Immutable gemstone registration records
- SHA-256 hash generation for each transaction
- Proof-of-work mining simulation
- Complete transaction history tracking
- Blockchain integrity verification

### 2. **NGJA Certification Integration**
- Submit gemstones for NGJA certification
- Certificate verification system
- NGJA officer approval workflow
- Certified gemstone registry

### 3. **Gemstone Management**
- Register new gemstones with detailed properties
- Track ownership history with blockchain
- Transfer ownership securely
- Upload gemstone images and certificates
- Public/private gemstone listings

### 4. **Price Analysis System**
- Historical price tracking
- Market trend analysis
- Price estimation based on properties
- Quality-based price comparisons
- Monthly and yearly trends

### 5. **Knowledge Hub**
- Educational articles about gemstones
- Categorized content (Identification, Treatment, Care, etc.)
- Search and filter functionality
- Like and view tracking
- Author management

### 6. **User Management**
- Role-based access control (User, Seller, NGJA Officer, Admin)
- JWT authentication
- Secure password hashing
- Profile management

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## 🛠️ Installation

### 1. Clone the repository (or extract the zip)

```bash
cd gemchain-backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/gemchain

# JWT Secret (Change this in production!)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# NGJA Integration (for future)
NGJA_API_URL=https://api.ngja.lk
NGJA_API_KEY=your_ngja_api_key

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
```

### 4. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# For Ubuntu/Linux
sudo systemctl start mongod

# For macOS (with Homebrew)
brew services start mongodb-community

# For Windows
net start MongoDB
```

### 5. Run the Application

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Dasun Silva",
  "email": "dasun@example.com",
  "password": "password123",
  "role": "user",
  "phone": "+94771234567",
  "address": {
    "street": "123 Main St",
    "city": "Colombo",
    "province": "Western",
    "country": "Sri Lanka"
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "dasun@example.com",
  "password": "password123"
}

Response:
{
  "status": "success",
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Gemstone Endpoints

#### Register New Gemstone
```http
POST /api/gemstones
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Blue Sapphire",
  "type": "Sapphire",
  "variety": "Ceylon Blue",
  "weight": {
    "carats": 5.2,
    "grams": 1.04
  },
  "color": {
    "primary": "Blue",
    "intensity": "Vivid"
  },
  "clarity": "VS1",
  "cut": "Oval",
  "origin": {
    "country": "Sri Lanka",
    "region": "Ratnapura"
  },
  "treatment": "Heat Treated",
  "description": "Beautiful Ceylon blue sapphire",
  "isPublic": true
}
```

#### Get All Gemstones
```http
GET /api/gemstones?type=Sapphire&page=1&limit=10
```

#### Get Single Gemstone
```http
GET /api/gemstones/:id
```

#### Get Gemstone by GEM ID
```http
GET /api/gemstones/gem/SAP-ABC123-XYZ
```

#### Get My Gemstones
```http
GET /api/gemstones/my/collection
Authorization: Bearer <token>
```

#### Transfer Ownership
```http
POST /api/gemstones/:id/transfer
Authorization: Bearer <token>
Content-Type: application/json

{
  "newOwnerId": "user_id_here"
}
```

### Blockchain Endpoints

#### Get Blockchain Info
```http
GET /api/blockchain/info

Response:
{
  "status": "success",
  "data": {
    "totalBlocks": 15,
    "latestBlockIndex": 14,
    "latestBlockHash": "0abc123...",
    "transactionTypes": [...],
    "lastBlockTime": "2024-02-17T10:30:00.000Z"
  }
}
```

#### Verify Blockchain
```http
GET /api/blockchain/verify

Response:
{
  "status": "success",
  "data": {
    "valid": true,
    "message": "Blockchain is valid",
    "totalBlocks": 15
  }
}
```

#### Get Gemstone Blockchain History
```http
GET /api/blockchain/gemstone/:gemstoneId
```

### NGJA Certification Endpoints

#### Submit for Certification
```http
POST /api/ngja/certify/:gemstoneId
Authorization: Bearer <token>
```

#### Certify Gemstone (NGJA Officer)
```http
POST /api/ngja/approve/:gemstoneId
Authorization: Bearer <ngja_officer_token>
Content-Type: application/json

{
  "certificateNumber": "NGJA-2024-001234",
  "certifiedBy": "Dr. Silva"
}
```

#### Verify Certificate
```http
GET /api/ngja/verify/NGJA-2024-001234

Response:
{
  "status": "success",
  "verified": true,
  "data": {
    "gemstone": { ... }
  }
}
```

#### Get Pending Certifications (NGJA Officer)
```http
GET /api/ngja/pending
Authorization: Bearer <ngja_officer_token>
```

### Price Analysis Endpoints

#### Get Price History
```http
GET /api/prices/Sapphire?quality=Premium&startDate=2024-01-01
```

#### Get Price Analysis
```http
GET /api/prices/analysis/Sapphire

Response:
{
  "status": "success",
  "data": {
    "statistics": {
      "avgPrice": 150000,
      "minPrice": 50000,
      "maxPrice": 500000
    },
    "byQuality": [...],
    "monthlyTrends": [...]
  }
}
```

#### Estimate Price
```http
POST /api/prices/estimate
Content-Type: application/json

{
  "gemstoneType": "Sapphire",
  "carats": 5.2,
  "quality": "Premium",
  "clarity": "VS1"
}
```

#### Market Overview
```http
GET /api/prices/market/overview
```

### Knowledge Hub Endpoints

#### Get All Articles
```http
GET /api/knowledge?category=Identification&page=1
```

#### Get Article by Slug
```http
GET /api/knowledge/how-to-identify-genuine-sapphires
```

#### Create Article (NGJA Officer/Admin)
```http
POST /api/knowledge
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "How to Identify Genuine Sapphires",
  "category": "Identification",
  "tags": ["sapphire", "identification", "authentication"],
  "summary": "Learn the key characteristics...",
  "content": "Full article content here...",
  "isPublished": true
}
```

#### Like Article
```http
POST /api/knowledge/:id/like
Authorization: Bearer <token>
```

## 🔐 User Roles

1. **User** - Basic user who can register gemstones and view public content
2. **Seller** - Can list gemstones for sale
3. **NGJA Officer** - Can certify gemstones and create knowledge articles
4. **Admin** - Full system access

## 🏗️ Project Structure

```
gemchain-backend/
├── controllers/          # Request handlers
│   ├── auth.controller.js
│   ├── gemstone.controller.js
│   ├── blockchain.controller.js
│   ├── ngja.controller.js
│   ├── price.controller.js
│   └── knowledge.controller.js
├── models/              # MongoDB schemas
│   ├── User.model.js
│   ├── Gemstone.model.js
│   ├── Block.model.js
│   ├── PriceHistory.model.js
│   └── KnowledgeArticle.model.js
├── routes/              # API routes
│   ├── auth.routes.js
│   ├── gemstone.routes.js
│   ├── blockchain.routes.js
│   ├── ngja.routes.js
│   ├── price.routes.js
│   └── knowledge.routes.js
├── middleware/          # Express middleware
│   ├── auth.middleware.js
│   └── upload.middleware.js
├── utils/              # Utility functions
│   └── blockchain.utils.js
├── uploads/            # File uploads directory
├── .env               # Environment variables
├── .env.example       # Example environment file
├── server.js          # Application entry point
└── package.json       # Dependencies
```

## 🧪 Testing the API

### Using Postman or Thunder Client

1. **Register a user** (POST /api/auth/register)
2. **Login** to get JWT token (POST /api/auth/login)
3. **Add token to headers** for protected routes:
   ```
   Authorization: Bearer <your_token_here>
   ```
4. **Test blockchain initialization** (POST /api/blockchain/init)
5. **Register a gemstone** (POST /api/gemstones)
6. **Verify blockchain** (GET /api/blockchain/verify)

### Sample User Accounts for Testing

Create these users for different roles:

```javascript
// Regular User
{
  "name": "John Doe",
  "email": "user@test.com",
  "password": "password123",
  "role": "user"
}

// NGJA Officer
{
  "name": "Dr. Silva",
  "email": "officer@ngja.lk",
  "password": "password123",
  "role": "ngja_officer",
  "ngjaLicenseNumber": "NGJA-2024-001"
}

// Admin
{
  "name": "Admin User",
  "email": "admin@gemchain.com",
  "password": "password123",
  "role": "admin"
}
```

## 🔧 Blockchain Explanation

The blockchain in GemChain works as follows:

1. **Genesis Block**: The first block (index 0) is created when you initialize the blockchain
2. **Hash Generation**: Each block contains:
   - Index (block number)
   - Timestamp
   - Data (transaction information)
   - Previous block's hash
   - Current block's hash
   - Nonce (proof of work)

3. **Mining**: Simple proof-of-work where the hash must start with '0'
4. **Verification**: The chain can be verified by recalculating all hashes and checking linkages

## 📊 Database Collections

1. **users** - User accounts and authentication
2. **gemstones** - Gemstone records with all properties
3. **blocks** - Blockchain records for all transactions
4. **pricehistories** - Historical price data
5. **knowledgearticles** - Educational content

## 🚀 Deployment Considerations

### For Production:

1. **Change JWT Secret**: Use a strong, random secret
2. **Enable HTTPS**: Use SSL certificates
3. **Set NODE_ENV**: `NODE_ENV=production`
4. **MongoDB Atlas**: Use cloud MongoDB for reliability
5. **Add Rate Limiting**: Prevent API abuse
6. **Input Validation**: Add comprehensive validation
7. **Error Logging**: Implement proper logging (Winston, Morgan)
8. **CORS Configuration**: Restrict allowed origins
9. **File Upload Limits**: Configure appropriate limits

## 📝 Next Steps for Your Project

1. **Develop Frontend**: Create React/Next.js frontend
2. **Enhance Blockchain**: Add more sophisticated consensus
3. **NGJA API Integration**: Connect to real NGJA systems
4. **Image Processing**: Add gemstone image analysis
5. **QR Code Generation**: Generate QR codes for gemstones
6. **Mobile App**: Build mobile version with React Native
7. **Payment Integration**: Add payment gateways for marketplace
8. **Advanced Analytics**: ML-based price prediction

## 🆘 Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Restart MongoDB
sudo systemctl restart mongod
```

### Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>
```

### Module Not Found Errors
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## 📞 Support

For issues or questions:
- Review the API documentation above
- Check MongoDB connection
- Ensure all environment variables are set
- Verify JWT token format in requests

## 📄 License

MIT License - Feel free to use this for your university project!

---

**Good luck with your proposal defense! 🎓💎**
