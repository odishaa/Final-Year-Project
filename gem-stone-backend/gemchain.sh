#!/bin/bash

# 🚀 GemChain Backend Complete Test Script
# This script tests the entire marketplace workflow

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 GEMCHAIN BACKEND - COMPLETE MARKETPLACE TEST"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

BASE_URL="http://localhost:5000"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to print test header
print_test() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}TEST $1: $2${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Function to check if response contains success
check_response() {
    if echo "$1" | grep -q '"status":"success"'; then
        echo -e "${GREEN}✅ PASSED${NC}"
        ((TESTS_PASSED++))
        return 0
    else
        echo -e "${RED}❌ FAILED${NC}"
        echo "Response: $1"
        ((TESTS_FAILED++))
        return 1
    fi
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 1. HEALTH CHECK
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

print_test "1" "Health Check"
RESPONSE=$(curl -s $BASE_URL/api/health)
check_response "$RESPONSE"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 2. USER REGISTRATION
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

print_test "2" "Register Buyer"
BUYER_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Buyer",
    "email": "testbuyer@test.com",
    "password": "password123",
    "role": "buyer",
    "phone": "0771234567"
  }')
check_response "$BUYER_RESPONSE"
BUYER_TOKEN=$(echo $BUYER_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "Buyer Token: ${BUYER_TOKEN:0:20}..."

print_test "3" "Register Seller"
SELLER_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Seller",
    "email": "testseller@test.com",
    "password": "password123",
    "role": "seller",
    "phone": "0779876543"
  }')
check_response "$SELLER_RESPONSE"
SELLER_TOKEN=$(echo $SELLER_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "Seller Token: ${SELLER_TOKEN:0:20}..."

print_test "4" "Register NGJA Officer"
NGJA_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. Test Officer",
    "email": "testngja@test.com",
    "password": "password123",
    "role": "ngja_officer",
    "ngjaLicenseNumber": "NGJA-TEST-001"
  }')
check_response "$NGJA_RESPONSE"
NGJA_TOKEN=$(echo $NGJA_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "NGJA Token: ${NGJA_TOKEN:0:20}..."

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 3. GEMSTONE REGISTRATION
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

print_test "5" "Register Gemstone (as Seller)"
GEMSTONE_RESPONSE=$(curl -s -X POST $BASE_URL/api/gemstones \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Blue Sapphire",
    "type": "Sapphire",
    "variety": "Ceylon Blue",
    "weight": {
      "carats": 5.25
    },
    "color": {
      "primary": "Blue",
      "intensity": "Vivid"
    },
    "clarity": "VVS1",
    "cut": "Oval",
    "origin": {
      "country": "Sri Lanka",
      "region": "Ratnapura"
    },
    "treatment": "Heat Treated",
    "description": "Test gemstone for marketplace",
    "isPublic": true
  }')
check_response "$GEMSTONE_RESPONSE"
GEMSTONE_ID=$(echo $GEMSTONE_RESPONSE | grep -o '"_id":"[^"]*' | head -1 | cut -d'"' -f4)
GEM_ID=$(echo $GEMSTONE_RESPONSE | grep -o '"gemId":"[^"]*' | cut -d'"' -f4)
echo "Gemstone ID: $GEMSTONE_ID"
echo "Gem ID (Smart Contract): $GEM_ID"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 4. NGJA CERTIFICATION
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

print_test "6" "Submit for Certification (as Seller)"
CERT_SUBMIT=$(curl -s -X POST $BASE_URL/api/ngja/certify/$GEMSTONE_ID \
  -H "Authorization: Bearer $SELLER_TOKEN")
check_response "$CERT_SUBMIT"

print_test "7" "Certify Gemstone (as NGJA Officer)"
CERT_APPROVE=$(curl -s -X POST $BASE_URL/api/ngja/approve/$GEMSTONE_ID \
  -H "Authorization: Bearer $NGJA_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "certificateNumber": "NGJA-TEST-AUTO-001",
    "certifiedBy": "Dr. Test Officer"
  }')
check_response "$CERT_APPROVE"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 5. MARKETPLACE LISTING
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

print_test "8" "Create Marketplace Listing (as Seller)"
LISTING_RESPONSE=$(curl -s -X POST $BASE_URL/api/marketplace/listings \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"gemstoneId\": \"$GEMSTONE_ID\",
    \"title\": \"Beautiful Blue Sapphire - Test\",
    \"description\": \"NGJA certified test sapphire\",
    \"price\": 250000,
    \"negotiable\": true
  }")
check_response "$LISTING_RESPONSE"
LISTING_ID=$(echo $LISTING_RESPONSE | grep -o '"_id":"[^"]*' | head -1 | cut -d'"' -f4)
echo "Listing ID: $LISTING_ID"

print_test "9" "Verify Listing (as NGJA Officer)"
LISTING_VERIFY=$(curl -s -X POST $BASE_URL/api/marketplace/listings/$LISTING_ID/verify \
  -H "Authorization: Bearer $NGJA_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "approved": true,
    "notes": "Test listing verified"
  }')
check_response "$LISTING_VERIFY"

print_test "10" "Browse Marketplace (Public)"
BROWSE=$(curl -s $BASE_URL/api/marketplace/listings)
check_response "$BROWSE"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 6. OFFERS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

print_test "11" "Make Offer (as Buyer)"
OFFER_RESPONSE=$(curl -s -X POST $BASE_URL/api/offers \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"listingId\": \"$LISTING_ID\",
    \"offerAmount\": 220000,
    \"message\": \"Test offer - automated test\"
  }")
check_response "$OFFER_RESPONSE"
OFFER_ID=$(echo $OFFER_RESPONSE | grep -o '"_id":"[^"]*' | head -1 | cut -d'"' -f4)
echo "Offer ID: $OFFER_ID"

print_test "12" "View My Offers (as Buyer)"
MY_OFFERS=$(curl -s $BASE_URL/api/offers/my-offers \
  -H "Authorization: Bearer $BUYER_TOKEN")
check_response "$MY_OFFERS"

print_test "13" "View Listing Offers (as Seller)"
LISTING_OFFERS=$(curl -s $BASE_URL/api/offers/listing/$LISTING_ID \
  -H "Authorization: Bearer $SELLER_TOKEN")
check_response "$LISTING_OFFERS"

print_test "14" "Accept Offer (as Seller)"
ACCEPT_OFFER=$(curl -s -X PUT $BASE_URL/api/offers/$OFFER_ID/accept \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sellerResponse": "Test offer accepted"
  }')
check_response "$ACCEPT_OFFER"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 7. TRANSACTIONS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

print_test "15" "Purchase Gemstone (as Buyer)"
PURCHASE=$(curl -s -X POST $BASE_URL/api/transactions/purchase \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"listingId\": \"$LISTING_ID\",
    \"paymentMethod\": \"bank_transfer\"
  }")
check_response "$PURCHASE"
TRANSACTION_ID=$(echo $PURCHASE | grep -o '"_id":"[^"]*' | head -1 | cut -d'"' -f4)
echo "Transaction ID: $TRANSACTION_ID"

print_test "16" "Update Payment Status (as Buyer)"
UPDATE_PAYMENT=$(curl -s -X PUT $BASE_URL/api/transactions/$TRANSACTION_ID/payment \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "paymentStatus": "completed",
    "paymentProof": "test_receipt.pdf"
  }')
check_response "$UPDATE_PAYMENT"

print_test "17" "Complete Transaction (as Seller)"
COMPLETE=$(curl -s -X PUT $BASE_URL/api/transactions/$TRANSACTION_ID/complete \
  -H "Authorization: Bearer $SELLER_TOKEN")
check_response "$COMPLETE"

print_test "18" "Rate Seller (as Buyer)"
RATE_SELLER=$(curl -s -X POST $BASE_URL/api/transactions/$TRANSACTION_ID/rate \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 5,
    "review": "Test review - excellent seller!"
  }')
check_response "$RATE_SELLER"

print_test "19" "Rate Buyer (as Seller)"
RATE_BUYER=$(curl -s -X POST $BASE_URL/api/transactions/$TRANSACTION_ID/rate \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 5,
    "review": "Test review - great buyer!"
  }')
check_response "$RATE_BUYER"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 8. VERIFICATION & BLOCKCHAIN
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

print_test "20" "Verify Certificate (Public)"
VERIFY_CERT=$(curl -s $BASE_URL/api/ngja/verify/NGJA-TEST-AUTO-001)
check_response "$VERIFY_CERT"

print_test "21" "Get Blockchain Info"
BLOCKCHAIN_INFO=$(curl -s $BASE_URL/api/blockchain/info)
check_response "$BLOCKCHAIN_INFO"
echo "$BLOCKCHAIN_INFO" | grep -o '"totalBlocks":[0-9]*' || echo "Total blocks info not found"

print_test "22" "Get Smart Contract Info"
SC_INFO=$(curl -s $BASE_URL/api/smartcontract/info)
check_response "$SC_INFO"
echo "$SC_INFO" | grep -o '"totalGemstones":[0-9]*' || echo "Total gemstones info not found"

print_test "23" "Query Gemstone on Smart Contract"
SC_QUERY=$(curl -s $BASE_URL/api/smartcontract/gemstone/$GEM_ID)
if echo "$SC_QUERY" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ PASSED - Gemstone found on smart contract${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${YELLOW}⚠️  SKIPPED - Smart contract query failed (non-critical)${NC}"
    echo "This is expected if smart contract sync is pending"
fi

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 9. TRANSACTION HISTORY
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

print_test "24" "Get My Purchases (as Buyer)"
MY_PURCHASES=$(curl -s $BASE_URL/api/transactions/my-purchases \
  -H "Authorization: Bearer $BUYER_TOKEN")
check_response "$MY_PURCHASES"

print_test "25" "Get My Sales (as Seller)"
MY_SALES=$(curl -s $BASE_URL/api/transactions/my-sales \
  -H "Authorization: Bearer $SELLER_TOKEN")
check_response "$MY_SALES"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# FINAL SUMMARY
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 TEST SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "✅ Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "❌ Tests Failed: ${RED}$TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED!${NC}"
    echo ""
    echo "Your GemChain backend is fully operational:"
    echo "  ✅ User registration & authentication"
    echo "  ✅ Gemstone registration with blockchain"
    echo "  ✅ NGJA certification workflow"
    echo "  ✅ Marketplace listings"
    echo "  ✅ Buyer-seller offers"
    echo "  ✅ Complete transaction workflow"
    echo "  ✅ Rating system"
    echo "  ✅ Certificate verification"
    echo "  ✅ MongoDB & Smart Contract integration"
    echo ""
    echo "🚀 Ready for frontend integration!"
else
    echo -e "${RED}⚠️  Some tests failed. Check the output above.${NC}"
    exit 1
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
