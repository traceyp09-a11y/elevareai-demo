#!/bin/bash

# Login as admin and get token
ADMIN_TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@elevareai.com","password":"Admin123!"}' | jq -r '.accessToken')

echo "Admin token: ${ADMIN_TOKEN:0:20}..."

# Create manager user
curl -s -X POST http://localhost:3001/api/auth/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "email": "manager@company.com",
    "password": "Manager123!",
    "firstName": "Department",
    "lastName": "Manager",
    "role": "manager",
    "department": "Operations"
  }' | jq '.'
