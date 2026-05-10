# GemChain API - Postman Collection Guide

## Quick Start Testing Guide

### Step 1: Setup

1. Install Postman or use Thunder Client (VS Code extension)
2. Set base URL: `http://localhost:5000/api`
3. Start your MongoDB server
4. Run the backend: `npm run dev`

### Step 2: Test Sequence

#### 1. Initialize Blockchain (Admin)
```
POST http://localhost:5000/api/blockchain/init
```

#### 2. Register a User
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "Dasun Silva",
  "email": "dasun@test.com",
  "password": "password123",
  "role": "user",
  "phone": "+94771234567"
}
```

Save the token from response!

#### 3. Login
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "dasun@test.com",
  "password": "password123"
}
```

#### 4. Register a Gemstone (Use token from login)
```
POST http://localhost:5000/api/gemstones
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "name": "Ceylon Blue Sapphire",
  "type": "Sapphire",
  "variety": "Ceylon Blue",
  "weight": {
    "carats": 5.2,
    "grams": 1.04
  },
  "dimensions": {
    "length": 10.5,
    "width": 8.3,
    "depth": 6.2,
    "unit": "mm"
  },
  "color": {
    "primary": "Blue",
    "secondary": "Violet",
    "intensity": "Vivid"
  },
  "clarity": "VS1",
  "cut": "Oval",
  "shape": "Oval",
  "origin": {
    "country": "Sri Lanka",
    "region": "Ratnapura",
    "mine": "Elahera"
  },
  "treatment": "Heat Treated",
  "description": "A stunning Ceylon blue sapphire with excellent clarity and vivid color",
  "isPublic": true,
  "estimatedValue": {
    "amount": 500000,
    "currency": "LKR"
  }
}
```

#### 5. Get All Gemstones
```
GET http://localhost:5000/api/gemstones
```

#### 6. Get Blockchain Info
```
GET http://localhost:5000/api/blockchain/info
```

#### 7. Verify Blockchain
```
GET http://localhost:5000/api/blockchain/verify
```

### Complete Test Flow for Proposal Defense

#### Create Different Users:

**Regular User:**
```json
{
  "name": "John Doe",
  "email": "user@test.com",
  "password": "password123",
  "role": "user"
}
```

**NGJA Officer:**
```json
{
  "name": "Dr. Perera",
  "email": "officer@ngja.lk",
  "password": "password123",
  "role": "ngja_officer",
  "ngjaLicenseNumber": "NGJA-2024-001"
}
```

**Seller:**
```json
{
  "name": "Gem Trader",
  "email": "seller@gems.lk",
  "password": "password123",
  "role": "seller"
}
```

#### Demo Workflow:

1. **User registers gemstone** → Creates blockchain entry
2. **User submits for NGJA certification** → Status changes to 'pending'
3. **NGJA Officer certifies** → Adds certificate to blockchain
4. **Verify certificate** → Public verification
5. **View blockchain history** → Show immutability
6. **Add price data** → Market analysis
7. **Transfer ownership** → New blockchain entry

### Sample Gemstones to Register

**Ruby:**
```json
{
  "name": "Pigeon Blood Ruby",
  "type": "Ruby",
  "variety": "Pigeon Blood",
  "weight": {
    "carats": 3.5
  },
  "color": {
    "primary": "Red",
    "intensity": "Vivid"
  },
  "clarity": "VS2",
  "cut": "Cushion",
  "origin": {
    "country": "Sri Lanka",
    "region": "Moratuwa"
  },
  "treatment": "None",
  "isPublic": true
}
```

**Emerald:**
```json
{
  "name": "Colombian Emerald",
  "type": "Emerald",
  "weight": {
    "carats": 4.2
  },
  "color": {
    "primary": "Green",
    "intensity": "Dark"
  },
  "clarity": "SI1",
  "cut": "Emerald",
  "origin": {
    "country": "Sri Lanka",
    "region": "Ratnapura"
  },
  "treatment": "Oiled",
  "isPublic": true
}
```

### Testing NGJA Workflow

1. **Submit for certification:**
```
POST http://localhost:5000/api/ngja/certify/GEMSTONE_ID
Authorization: Bearer USER_TOKEN
```

2. **NGJA Officer approves:**
```
POST http://localhost:5000/api/ngja/approve/GEMSTONE_ID
Authorization: Bearer NGJA_OFFICER_TOKEN
Content-Type: application/json

{
  "certificateNumber": "NGJA-2024-001234",
  "certifiedBy": "Dr. Perera"
}
```

3. **Verify certificate (Public):**
```
GET http://localhost:5000/api/ngja/verify/NGJA-2024-001234
```

### Testing Price Analysis

1. **Add price data:**
```
POST http://localhost:5000/api/prices
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "gemstoneType": "Sapphire",
  "variety": "Ceylon Blue",
  "weight": {
    "min": 5,
    "max": 6,
    "unit": "carats"
  },
  "quality": "Premium",
  "price": {
    "amount": 500000,
    "currency": "LKR",
    "perCarat": false
  },
  "source": "market",
  "location": {
    "country": "Sri Lanka",
    "city": "Colombo"
  }
}
```

2. **Get price analysis:**
```
GET http://localhost:5000/api/prices/analysis/Sapphire
```

3. **Estimate price:**
```
POST http://localhost:5000/api/prices/estimate
Content-Type: application/json

{
  "gemstoneType": "Sapphire",
  "carats": 5.2,
  "quality": "Premium",
  "clarity": "VS1"
}
```

### Testing Knowledge Hub

1. **Create article:**
```
POST http://localhost:5000/api/knowledge
Authorization: Bearer NGJA_OFFICER_TOKEN
Content-Type: application/json

{
  "title": "How to Identify Genuine Sri Lankan Sapphires",
  "category": "Identification",
  "tags": ["sapphire", "identification", "sri-lanka"],
  "summary": "Learn the key characteristics of authentic Ceylon sapphires",
  "content": "Sri Lankan sapphires, also known as Ceylon sapphires, are renowned worldwide for their exceptional quality and unique characteristics...",
  "isPublished": true
}
```

2. **Get articles:**
```
GET http://localhost:5000/api/knowledge?category=Identification
```

3. **Like article:**
```
POST http://localhost:5000/api/knowledge/ARTICLE_ID/like
Authorization: Bearer USER_TOKEN
```

## Expected Results for Demo

### Blockchain Verification Response:
```json
{
  "status": "success",
  "data": {
    "valid": true,
    "message": "Blockchain is valid",
    "totalBlocks": 5
  }
}
```

### Gemstone with Blockchain Hash:
```json
{
  "status": "success",
  "data": {
    "gemstone": {
      "gemId": "SAP-ABC123-XYZ",
      "blockchainHash": "0a3f5e...",
      "previousHash": "0b4c2d...",
      ...
    }
  }
}
```

### Certificate Verification:
```json
{
  "status": "success",
  "verified": true,
  "message": "Certificate verified"
}
```

## Tips for Proposal Defense

1. **Show the blockchain flow**: Register → Certify → Transfer → Verify
2. **Demonstrate immutability**: Try to modify data, show it breaks the chain
3. **Highlight NGJA integration**: Show certification workflow
4. **Display price analysis**: Show market trends and estimation
5. **Show knowledge hub**: Educational content for users

## Common Issues

**Token Expired:**
- Login again to get a new token
- Tokens expire after 7 days by default

**Blockchain Not Initialized:**
- Call POST /api/blockchain/init first
- Creates the genesis block

**Unauthorized:**
- Check if token is included in headers
- Verify user role has permission

**Gemstone Not Found:**
- Use correct gemstone ID from registration response
- Check if gemstone exists in database

Good luck with your defense! 🎓
