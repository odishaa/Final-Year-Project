# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**GemChain** is a blockchain-based gemstone authentication system targeting Sri Lanka's gem industry, with integration for NGJA (National Gem & Jewellery Authority) certification. It has two sub-projects:

- `gem-stone-backend/` — Node.js/Express REST API with MongoDB and a custom SHA-256 blockchain
- `gem-stone-frontend/` — React + Vite SPA

## Development Commands

### Backend (`gem-stone-backend/`)

```bash
# Start MongoDB first
sudo systemctl start mongod

# Install dependencies
npm install

# Development (auto-reload via nodemon)
npm run dev          # http://localhost:5000

# Production
npm start

# Health check
curl http://localhost:5000/api/health
```

### Smart Contract (`gem-stone-backend/`)

```bash
# Start Ganache local blockchain (port 7545)
npx ganache

# Compile contracts
npx truffle compile

# Deploy contracts
npx truffle migrate

# Test contract
node test-contract.js
```

### Frontend (`gem-stone-frontend/`)

```bash
npm install
npm run dev          # http://localhost:5173
npm run build
npm run preview
```

## Environment Setup

Copy `.env` (already present) or create one in `gem-stone-backend/`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/gemchain
JWT_SECRET=your_secret_here
JWT_EXPIRE=7d
GANACHE_URL=http://127.0.0.1:7545
CONTRACT_ADDRESS=<deployed_contract_address>
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
```

## Architecture

### Dual-Blockchain Design

The system runs **two parallel blockchain mechanisms**:

1. **Custom MongoDB blockchain** (`utils/blockchain.utils.js`, `models/Block.model.js`): SHA-256 based proof-of-work chain stored in MongoDB. Every gemstone registration, transfer, or certification creates a new `Block` document linked by `previousHash`. Mining difficulty requires the hash to start with `'0'`. This is always active.

2. **Ethereum smart contract** (`contracts/GemstoneRegistry.sol`, `utils/web3.utils.js`): Solidity contract deployed to a local Ganache instance. The `Web3Service` singleton in `web3.utils.js` connects to Ganache at port 7545 and uses `CONTRACT_ADDRESS` from `.env`. Smart contract calls are optional — the system degrades gracefully if Ganache is unavailable.

### Backend Layer Conventions

Routes → Controllers → Models/Services pattern:

- **Routes** (`routes/`) — declare endpoints and apply `auth.middleware.js` guards (`protect`, `authorize`)
- **Controllers** (`controllers/`) — handle request/response; call `BlockchainService` and `Web3Service` for blockchain writes
- **Models** (`models/`) — Mongoose schemas; `Gemstone.model.js` auto-generates a `gemId` (`TYPE-TIMESTAMP-RANDOM`) via pre-save hook
- **Middleware** — `auth.middleware.js` (JWT verify + role check), `upload.middleware.js` (multer for image uploads to `uploads/`)
- **Utils** — `BlockchainService` (static class, always-on MongoDB chain), `Web3Service` (singleton, Ganache/Ethereum)

### User Roles

Four roles with ascending permissions: `user` → `seller` → `ngja_officer` → `admin`. Role is encoded in the JWT and enforced via `authorize(...roles)` middleware.

### Frontend Architecture

React SPA with React Router v6. `AuthContext` (`src/context/AuthContext`) wraps the app and provides auth state. All API calls use axios targeting `http://localhost:5000/api`. The `three` library is used for a 3D gem canvas component (`GemCanvas.jsx`).

### API Route Map

| Prefix | Purpose |
|--------|---------|
| `/api/auth` | Register, login, profile |
| `/api/gemstones` | CRUD, ownership transfer, image upload |
| `/api/blockchain` | Chain info, verify, init genesis block, gemstone history |
| `/api/ngja` | Submit/approve certification, verify certificate |
| `/api/prices` | Price history, analysis, estimation, market overview |
| `/api/knowledge` | Articles CRUD, likes, views |
| `/api/smartcontract` | Expose Ethereum contract state via REST |
| `/api/marketplace` | Listings CRUD |
| `/api/offers` | Buyer offers on listings |
| `/api/transactions` | Completed purchase records |

### MongoDB Collections

`users`, `gemstones`, `blocks`, `pricehistories`, `knowledgearticles`, `listings`, `offers`, `transactions`

### Smart Contract Notes

`GemstoneRegistry.sol` (Solidity 0.8.19) manages on-chain gemstone registration, ownership transfer, and NGJA certification. `carats` is stored as an integer × 100 to avoid floating point. Accounts[0] is used as the default user sender; Accounts[1] is used as the NGJA officer sender. The compiled ABI is read from `build/contracts/GemstoneRegistry.json` — this file must exist before `web3.utils.js` can load.
