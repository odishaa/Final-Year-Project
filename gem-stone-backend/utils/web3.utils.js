const { Web3 } = require('web3');
const contract = require('../build/contracts/GemstoneRegistry.json');

// Connect to Ganache
const web3 = new Web3(process.env.GANACHE_URL || 'http://127.0.0.1:7545');

// Contract address
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || '0x71E970B9D29272836eE44cE8ffe50B195Ad26ed8';

// Get contract instance
const gemstoneContract = new web3.eth.Contract(
  contract.abi,
  CONTRACT_ADDRESS
);

// Get accounts
let accounts = [];
let accountsReady = false;

web3.eth.getAccounts().then(accs => {
  accounts = accs;
  accountsReady = true;
  console.log('✅ Web3 connected to Ganache');
  console.log('📍 Contract Address:', CONTRACT_ADDRESS);
  console.log('👥 Accounts available:', accounts.length);
}).catch(err => {
  console.error('❌ Web3 connection failed:', err.message);
});

class Web3Service {
  
  // Helper: Get account (use index 0 for users, 1 for NGJA officer)
  getUserAccount(index = 0) {
    if (!accountsReady) {
      throw new Error('Accounts not ready yet');
    }
    return accounts[index];
  }

  // Register Gemstone on Smart Contract
  // Register Gemstone on Smart Contract
async registerGemstoneOnChain(gemstoneData, userIndex = 0) {
  try {
    const account = this.getUserAccount(userIndex);
    
    console.log('🔗 Registering on blockchain:', gemstoneData.gemId);
    
    const receipt = await gemstoneContract.methods
      .registerGemstone(
        gemstoneData.gemId,
        gemstoneData.name,
        gemstoneData.type,
        Math.floor(gemstoneData.weight.carats * 100),
        gemstoneData.color.primary,
        gemstoneData.clarity,
        gemstoneData.cut,
        gemstoneData.origin.country
      )
      .send({ 
        from: account, 
        gas: 3000000 
      });

    console.log('✅ Smart contract registration successful:', receipt.transactionHash);

    return {
      success: true,
      transactionHash: receipt.transactionHash,
      blockNumber: Number(receipt.blockNumber), // Convert BigInt to Number
      gasUsed: receipt.gasUsed.toString(), // Already string, keep it
      from: account
    };
  } catch (error) {
    console.error('❌ Smart contract registration error:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

  // Get Gemstone from Smart Contract
  // Get Gemstone from Smart Contract
async getGemstoneFromChain(gemId) {
  try {
    const gem = await gemstoneContract.methods
      .getGemstone(gemId)
      .call();

    return {
      success: true,
      data: {
        name: gem.name,
        type: gem.gemType,
        carats: Number(gem.carats) / 100, // Convert BigInt to Number
        color: gem.color,
        clarity: gem.clarity,
        cut: gem.cut,
        origin: gem.origin,
        owner: gem.owner,
        timestamp: Number(gem.timestamp) // Convert BigInt to Number
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

  // Certify Gemstone on Smart Contract
  // Certify Gemstone on Smart Contract
async certifyGemstoneOnChain(gemId, certificateNumber, certifiedBy, officerIndex = 1) {
  try {
    const account = this.getUserAccount(officerIndex);
    
    console.log('🔗 Certifying on blockchain:', gemId);
    
    const receipt = await gemstoneContract.methods
      .certifyGemstone(gemId, certificateNumber, certifiedBy)
      .send({ 
        from: account, 
        gas: 3000000 
      });

    console.log('✅ Smart contract certification successful:', receipt.transactionHash);

    return {
      success: true,
      transactionHash: receipt.transactionHash,
      blockNumber: Number(receipt.blockNumber), // Convert BigInt to Number
      certificateNumber
    };
  } catch (error) {
    console.error('❌ Smart contract certification error:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

  // Verify Certificate on Smart Contract
  async verifyCertificateOnChain(gemId, certificateNumber) {
    try {
      const isValid = await gemstoneContract.methods
        .verifyCertificateNumber(gemId, certificateNumber)
        .call();

      const cert = await gemstoneContract.methods
        .getCertificate(gemId)
        .call();

      return {
        success: true,
        valid: isValid,
        certificate: cert.certified ? {
          certificateNumber: cert.certificateNumber,
          certifiedBy: cert.certifiedBy,
          certificationDate: new Date(parseInt(cert.certificationDate) * 1000),
          onChain: true
        } : null
      };
    } catch (error) {
      return {
        success: false,
        valid: false,
        error: error.message
      };
    }
  }

  // Get Total Gemstones from Smart Contract
  async getTotalGemstones() {
    try {
      const total = await gemstoneContract.methods
        .getTotalGemstones()
        .call();
      return { 
        success: true, 
        total: parseInt(total) 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  // Add this method to the Web3Service class

async transferOwnershipOnChain(gemId, newOwnerAddress, sellerIndex = 0) {
  try {
    const account = this.getUserAccount(sellerIndex);
    
    console.log('🔗 Transferring ownership on blockchain:', gemId);
    
    const receipt = await gemstoneContract.methods
      .transferOwnership(gemId, newOwnerAddress)
      .send({ 
        from: account, 
        gas: 3000000 
      });

    console.log('✅ Smart contract transfer successful:', receipt.transactionHash);

    return {
      success: true,
      transactionHash: receipt.transactionHash,
      blockNumber: Number(receipt.blockNumber),
      gasUsed: receipt.gasUsed.toString()
    };
  } catch (error) {
    console.error('❌ Smart contract transfer error:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

  // Get Contract Info
  getContractInfo() {
    return {
      address: CONTRACT_ADDRESS,
      network: 'Ganache Local',
      rpcUrl: process.env.GANACHE_URL || 'http://127.0.0.1:7545',
      accountsAvailable: accounts.length
    };
  }
}



module.exports = new Web3Service();