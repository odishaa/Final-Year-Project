const crypto = require('crypto');
const Block = require('../models/Block.model');

class BlockchainService {
  /**
   * Create SHA-256 hash from data
   */
  static createHash(data) {
    return crypto
      .createHash('sha256')
      .update(JSON.stringify(data))
      .digest('hex');
  }

  /**
   * Calculate block hash
   */
  static calculateHash(index, timestamp, data, previousHash, nonce = 0) {
    return this.createHash({
      index,
      timestamp,
      data,
      previousHash,
      nonce
    });
  }

  /**
   * Create genesis block (first block)
   */
  static async createGenesisBlock() {
    try {
      const existingBlock = await Block.findOne({ index: 0 });
      if (existingBlock) {
        return existingBlock;
      }

      const genesisData = {
        message: 'GemChain Genesis Block',
        createdBy: 'System',
        timestamp: new Date().toISOString()
      };

      const genesisBlock = new Block({
        index: 0,
        timestamp: new Date(),
        data: genesisData,
        previousHash: '0',
        hash: this.calculateHash(0, new Date(), genesisData, '0'),
        nonce: 0,
        transactionType: 'registration',
        verified: true
      });

      await genesisBlock.save();
      return genesisBlock;
    } catch (error) {
      throw new Error(`Genesis block creation failed: ${error.message}`);
    }
  }

  /**
   * Get the latest block
   */
  static async getLatestBlock() {
    try {
      let latestBlock = await Block.findOne().sort({ index: -1 });
      
      if (!latestBlock) {
        latestBlock = await this.createGenesisBlock();
      }
      
      return latestBlock;
    } catch (error) {
      throw new Error(`Failed to get latest block: ${error.message}`);
    }
  }

  /**
   * Add new block to blockchain
   */
  static async addBlock(data, transactionType, gemstoneId = null, userId = null) {
    try {
      const latestBlock = await this.getLatestBlock();
      const newIndex = latestBlock.index + 1;
      const timestamp = new Date();
      const previousHash = latestBlock.hash;
      
      // Simple proof of work (for demo - can be enhanced later)
      let nonce = 0;
      let hash = this.calculateHash(newIndex, timestamp, data, previousHash, nonce);
      
      // Mining: find hash starting with '0' (very basic difficulty)
      while (!hash.startsWith('0')) {
        nonce++;
        hash = this.calculateHash(newIndex, timestamp, data, previousHash, nonce);
      }

      const newBlock = new Block({
        index: newIndex,
        timestamp,
        data,
        previousHash,
        hash,
        nonce,
        transactionType,
        gemstoneId,
        userId,
        verified: true
      });

      await newBlock.save();
      return newBlock;
    } catch (error) {
      throw new Error(`Failed to add block: ${error.message}`);
    }
  }

  /**
   * Verify blockchain integrity
   */
  static async verifyChain() {
    try {
      const blocks = await Block.find().sort({ index: 1 });
      
      if (blocks.length === 0) {
        return { valid: false, message: 'No blocks in chain' };
      }

      for (let i = 1; i < blocks.length; i++) {
        const currentBlock = blocks[i];
        const previousBlock = blocks[i - 1];

        // Verify hash
        const calculatedHash = this.calculateHash(
          currentBlock.index,
          currentBlock.timestamp,
          currentBlock.data,
          currentBlock.previousHash,
          currentBlock.nonce
        );

        if (currentBlock.hash !== calculatedHash) {
          return {
            valid: false,
            message: `Invalid hash at block ${currentBlock.index}`,
            blockIndex: currentBlock.index
          };
        }

        // Verify chain linkage
        if (currentBlock.previousHash !== previousBlock.hash) {
          return {
            valid: false,
            message: `Chain broken at block ${currentBlock.index}`,
            blockIndex: currentBlock.index
          };
        }
      }

      return {
        valid: true,
        message: 'Blockchain is valid',
        totalBlocks: blocks.length
      };
    } catch (error) {
      throw new Error(`Chain verification failed: ${error.message}`);
    }
  }

  /**
   * Get block by hash
   */
  static async getBlockByHash(hash) {
    try {
      return await Block.findOne({ hash }).populate('gemstoneId userId');
    } catch (error) {
      throw new Error(`Failed to get block: ${error.message}`);
    }
  }

  /**
   * Get blocks for a specific gemstone
   */
  static async getGemstoneBlocks(gemstoneId) {
    try {
      return await Block.find({ gemstoneId })
        .sort({ index: 1 })
        .populate('userId', 'name email');
    } catch (error) {
      throw new Error(`Failed to get gemstone blocks: ${error.message}`);
    }
  }

  /**
   * Get blockchain statistics
   */
  static async getBlockchainStats() {
    try {
      const totalBlocks = await Block.countDocuments();
      const latestBlock = await this.getLatestBlock();
      const transactionTypes = await Block.aggregate([
        {
          $group: {
            _id: '$transactionType',
            count: { $sum: 1 }
          }
        }
      ]);

      return {
        totalBlocks,
        latestBlockIndex: latestBlock.index,
        latestBlockHash: latestBlock.hash,
        transactionTypes,
        lastBlockTime: latestBlock.timestamp
      };
    } catch (error) {
      throw new Error(`Failed to get blockchain stats: ${error.message}`);
    }
  }
}

module.exports = BlockchainService;
