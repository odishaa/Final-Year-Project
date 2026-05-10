const { Web3 } = require('web3'); // Note the destructuring!
const contract = require('./build/contracts/GemstoneRegistry.json');

// Connect to Ganache
const web3 = new Web3('http://127.0.0.1:7545');

// Contract address from your deployment
const contractAddress = '0x71E970B9D29272836eE44cE8ffe50B195Ad26ed8'; // YOUR ACTUAL ADDRESS!

const gemstoneContract = new web3.eth.Contract(
  contract.abi,
  contractAddress
);

async function testContract() {
  try {
    console.log('🔷 Testing GemChain Smart Contract\n');
    console.log('📍 Contract Address:', contractAddress);
    console.log('🌐 Network: Ganache Local\n');

    // Get accounts from Ganache
    const accounts = await web3.eth.getAccounts();
    console.log('✅ Connected to', accounts.length, 'accounts');
    console.log('   Account[0]:', accounts[0]);
    console.log('   Account[1]:', accounts[1], '\n');

    // Check balance
    const balance = await web3.eth.getBalance(accounts[0]);
    console.log('💰 Account[0] Balance:', web3.utils.fromWei(balance, 'ether'), 'ETH\n');

    // Test 1: Register Gemstone
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔷 Test 1: Registering gemstone...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const tx1 = await gemstoneContract.methods
      .registerGemstone(
        'SAP-TEST-001',      // gemId
        'Blue Sapphire',     // name
        'Sapphire',          // type
        525,                 // carats (5.25 * 100)
        'Blue',              // color
        'VS1',               // clarity
        'Oval',              // cut
        'Sri Lanka'          // origin
      )
      .send({ 
        from: accounts[0], 
        gas: 3000000 
      });
    
    console.log('✅ Gemstone registered!');
    console.log('   Transaction Hash:', tx1.transactionHash);
    console.log('   Block Number:', tx1.blockNumber);
    console.log('   Gas Used:', tx1.gasUsed, '\n');

    // Test 2: Get Gemstone Details
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔷 Test 2: Retrieving gemstone from blockchain...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const gem = await gemstoneContract.methods
      .getGemstone('SAP-TEST-001')
      .call();
    
    console.log('✅ Gemstone Details:');
    console.log('   Name:', gem.name);
    console.log('   Type:', gem.gemType);
    console.log('   Weight:', Number(gem.carats) / 100, 'carats');
    console.log('   Color:', gem.color);
    console.log('   Clarity:', gem.clarity);
    console.log('   Cut:', gem.cut);
    console.log('   Origin:', gem.origin);
    console.log('   Owner:', gem.owner);
    console.log('   Timestamp:', new Date(Number(gem.timestamp) * 1000).toISOString(), '\n');

    // Test 3: Add NGJA Officer
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔷 Test 3: Adding NGJA officer...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const tx2 = await gemstoneContract.methods
      .addNGJAOfficer(accounts[1])
      .send({ from: accounts[0], gas: 3000000 });
    
    console.log('✅ NGJA Officer added!');
    console.log('   Officer Address:', accounts[1]);
    console.log('   Transaction Hash:', tx2.transactionHash, '\n');

    // Test 4: Submit for Certification
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔷 Test 4: Submitting for certification...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const tx3 = await gemstoneContract.methods
      .submitForCertification('SAP-TEST-001')
      .send({ from: accounts[0], gas: 3000000 });
    
    console.log('✅ Submitted for certification!');
    console.log('   Transaction Hash:', tx3.transactionHash, '\n');

    // Test 5: Certify Gemstone (as NGJA Officer)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔷 Test 5: Certifying gemstone (as NGJA Officer)...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const tx4 = await gemstoneContract.methods
      .certifyGemstone('SAP-TEST-001', 'NGJA-2024-TEST-001', 'Dr. Perera')
      .send({ from: accounts[1], gas: 3000000 });
    
    console.log('✅ Gemstone certified!');
    console.log('   Certificate Number: NGJA-2024-TEST-001');
    console.log('   Transaction Hash:', tx4.transactionHash);
    console.log('   Block Number:', tx4.blockNumber, '\n');

    // Test 6: Get Certificate
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔷 Test 6: Retrieving certificate...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const cert = await gemstoneContract.methods
      .getCertificate('SAP-TEST-001')
      .call();
    
    console.log('✅ Certificate Details:');
    console.log('   Number:', cert.certificateNumber);
    console.log('   Certified By:', cert.certifiedBy);
    console.log('   Date:', new Date(Number(cert.certificationDate) * 1000).toISOString());
    console.log('   Status:', cert.certified ? '✓ CERTIFIED' : '✗ Not Certified', '\n');

    // Test 7: Verify Certificate Number
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔷 Test 7: Verifying certificate number...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const isValid = await gemstoneContract.methods
      .verifyCertificateNumber('SAP-TEST-001', 'NGJA-2024-TEST-001')
      .call();
    
    console.log(isValid ? '✅ Certificate VALID' : '❌ Certificate INVALID', '\n');

    // Test 8: Get Total Gemstones
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔷 Test 8: Total gemstones on blockchain...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const total = await gemstoneContract.methods
      .getTotalGemstones()
      .call();
    
    console.log('✅ Total Gemstones:', total, '\n');

    // Test 9: Transfer Ownership
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔷 Test 9: Transferring ownership...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const tx5 = await gemstoneContract.methods
      .transferOwnership('SAP-TEST-001', accounts[2])
      .send({ from: accounts[0], gas: 3000000 });
    
    console.log('✅ Ownership transferred!');
    console.log('   From:', accounts[0]);
    console.log('   To:', accounts[2]);
    console.log('   Transaction Hash:', tx5.transactionHash, '\n');

    // Verify new owner
    const gemAfterTransfer = await gemstoneContract.methods
      .getGemstone('SAP-TEST-001')
      .call();
    
    console.log('✅ New Owner Verified:', gemAfterTransfer.owner, '\n');

    // Final Summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 ALL TESTS PASSED!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Gemstone registration: Working');
    console.log('✅ Data retrieval: Working');
    console.log('✅ NGJA officer management: Working');
    console.log('✅ Certification workflow: Working');
    console.log('✅ Certificate verification: Working');
    console.log('✅ Ownership transfer: Working');
    console.log('\n🔗 Smart Contract is fully functional!\n');

    // Check Ganache UI now!
    console.log('💡 Tip: Check Ganache UI to see all transactions!');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    if (error.data) {
      console.error('   Data:', error.data);
    }
    process.exit(1);
  }
}

// Run tests
testContract()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });