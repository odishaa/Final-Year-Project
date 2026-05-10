# 🚀 Quick Start Guide - GemChain Backend

## For Your Proposal Defense TODAY

### ⚡ 5-Minute Setup

1. **Install Dependencies** (2 minutes)
```bash
npm install
```

2. **Create .env File** (1 minute)
```bash
cp .env.example .env
```

Edit `.env` and add:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/gemchain
JWT_SECRET=gemchain_secret_key_for_demo_2024
```

3. **Start MongoDB** (1 minute)
```bash
# Ubuntu/Linux
sudo systemctl start mongod

# macOS
brew services start mongodb-community

# Windows
net start MongoDB
```

4. **Run the Server** (30 seconds)
```bash
npm run dev
```

Server will start at: `http://localhost:5000`

### ✅ Verify It's Working

Open browser or Postman and test:
```
GET http://localhost:5000/api/health
```

You should see:
```json
{
  "status": "success",
  "message": "GemChain API is running"
}
```

### 🎯 Demo Flow for Proposal (10 minutes)

Use Postman or Thunder Client (VS Code extension):

#### Step 1: Initialize Blockchain
```
POST http://localhost:5000/api/blockchain/init
```

#### Step 2: Register User
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "Dasun Silva",
  "email": "demo@test.com",
  "password": "demo123",
  "role": "user"
}
```
**Save the token from response!**

#### Step 3: Register Gemstone
```
POST http://localhost:5000/api/gemstones
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "name": "Blue Sapphire",
  "type": "Sapphire",
  "weight": { "carats": 5.2 },
  "color": { "primary": "Blue", "intensity": "Vivid" },
  "clarity": "VS1",
  "cut": "Oval",
  "origin": { "country": "Sri Lanka", "region": "Ratnapura" },
  "treatment": "Heat Treated",
  "isPublic": true
}
```

#### Step 4: View Blockchain
```
GET http://localhost:5000/api/blockchain/info
GET http://localhost:5000/api/blockchain/verify
```

#### Step 5: Get All Gemstones
```
GET http://localhost:5000/api/gemstones
```

### 🎓 Key Points to Highlight in Defense

1. **Blockchain Integration**
   - Show blockchain info endpoint
   - Demonstrate verification
   - Explain hash generation

2. **NGJA Certification**
   - Explain certification workflow
   - Show certificate verification endpoint

3. **Price Analysis**
   - Market trends
   - Price estimation algorithm

4. **Security Features**
   - JWT authentication
   - Role-based access control
   - Password hashing

### 📊 Demo Data

**For NGJA Officer (if asked):**
```json
{
  "name": "Dr. Perera",
  "email": "officer@ngja.lk",
  "password": "demo123",
  "role": "ngja_officer"
}
```

**Sample Gemstones:**
- Sapphire (Blue, Ceylon)
- Ruby (Pigeon Blood)
- Emerald (Green)

### 🐛 Quick Troubleshooting

**MongoDB not starting?**
```bash
# Check status
sudo systemctl status mongod

# View logs
journalctl -u mongod
```

**Port 5000 in use?**
```bash
# Change PORT in .env to 5001 or 3000
PORT=5001
```

**Module errors?**
```bash
# Reinstall
rm -rf node_modules
npm install
```

### 💡 Impressive Features to Mention

1. ✅ **53 API Endpoints** - Comprehensive system
2. ✅ **Blockchain with Proof-of-Work** - SHA-256 hashing
3. ✅ **NGJA Integration Ready** - Certification workflow
4. ✅ **Price Analysis Engine** - ML-ready architecture
5. ✅ **Knowledge Hub** - Educational platform
6. ✅ **Role-Based Access** - 4 user types
7. ✅ **Ownership Tracking** - Complete history
8. ✅ **Scalable Architecture** - Production-ready

### 📱 What to Say During Defense

**About Blockchain:**
"We use SHA-256 hashing to create an immutable chain. Each gemstone registration, transfer, or certification creates a new block linked to the previous one through cryptographic hashing."

**About NGJA:**
"The system integrates with NGJA workflow where officers can verify and certify gemstones. Public certificate verification ensures transparency."

**About Security:**
"JWT-based authentication with bcrypt password hashing. Role-based access control ensures data integrity."

**Future Enhancements:**
"We plan to add QR code generation, mobile app, real NGJA API integration, and ML-based price prediction."

### 🎬 Ready to Present!

You now have a fully functional blockchain-based gemstone authentication system. Just make sure MongoDB is running and the server is up before your defense!

**Best of luck! 🎓💎**
