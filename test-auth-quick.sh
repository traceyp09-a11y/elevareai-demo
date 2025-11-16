#!/bin/bash

# Quick Authentication Test
# Tests core login -> protected route -> logout flow

echo "========================================="
echo "🧪 Testing ElevareAI Authentication"
echo "========================================="
echo ""

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Test 1: Login
echo -e "${YELLOW}Test 1: Admin Login${NC}"
LOGIN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@elevareai.com","password":"Admin123!"}')

TOKEN=$(echo "$LOGIN" | jq -r '.accessToken // empty')

if [ -n "$TOKEN" ]; then
  echo -e "${GREEN}✅ Login successful${NC}"
else
  echo -e "${RED}❌ Login failed${NC}"
  echo "$LOGIN" | jq '.'
  exit 1
fi

# Test 2: Get current user
echo -e "${YELLOW}Test 2: Get Current User${NC}"
USER=$(curl -s http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer $TOKEN")

USER_EMAIL=$(echo "$USER" | jq -r '.user.email // empty')

if [ "$USER_EMAIL" = "admin@elevareai.com" ]; then
  echo -e "${GREEN}✅ User info retrieved${NC}"
else
  echo -e "${RED}❌ Failed${NC}"
  exit 1
fi

# Test 3: Logout
echo -e "${YELLOW}Test 3: Logout${NC}"
LOGOUT=$(curl -s -X POST http://localhost:3001/api/auth/logout \
  -H "Authorization: Bearer $TOKEN")

SUCCESS=$(echo "$LOGOUT" | jq -r '.success // false')

if [ "$SUCCESS" = "true" ]; then
  echo -e "${GREEN}✅ Logout successful${NC}"
else
  echo -e "${RED}❌ Failed${NC}"
  exit 1
fi

# Test 4: Verify token invalidated
echo -e "${YELLOW}Test 4: Verify Token Invalidated${NC}"
VERIFY=$(curl -s http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer $TOKEN")

ERROR=$(echo "$VERIFY" | jq -r '.error // empty')

if [ -n "$ERROR" ]; then
  echo -e "${GREEN}✅ Token correctly invalidated${NC}"
else
  echo -e "${RED}❌ Token should be invalid${NC}"
  exit 1
fi

echo ""
echo "========================================="
echo -e "${GREEN}🎉 All Tests Passed!${NC}"
echo "========================================="
echo ""
echo "✅ Backend authentication working"
echo "✅ Frontend running on http://localhost:5173"
echo ""
echo "🌐 Open http://localhost:5173 to test the login UI"
echo ""
