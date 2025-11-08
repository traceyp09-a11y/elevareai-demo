#!/bin/bash

# ElevareIQ Platform - Deployment Verification Script
# This script tests all API endpoints and verifies the platform is working correctly

echo "======================================"
echo "ElevareIQ Platform Verification Script"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# API Base URL
API_BASE="http://localhost:3001"

# Test counter
PASSED=0
FAILED=0

# Function to test endpoint
test_endpoint() {
    local name=$1
    local url=$2

    echo -n "Testing $name... "

    response=$(curl -s -o /dev/null -w "%{http_code}" "$url")

    if [ "$response" -eq 200 ]; then
        echo -e "${GREEN}✓ PASSED${NC} (HTTP $response)"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAILED${NC} (HTTP $response)"
        ((FAILED++))
    fi
}

# Function to test endpoint with JSON validation
test_endpoint_json() {
    local name=$1
    local url=$2
    local expected_key=$3

    echo -n "Testing $name... "

    response=$(curl -s "$url")

    if echo "$response" | grep -q "\"$expected_key\""; then
        echo -e "${GREEN}✓ PASSED${NC} (Found '$expected_key')"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAILED${NC} (Missing '$expected_key')"
        ((FAILED++))
    fi
}

echo "1. Container Health Checks"
echo "-----------------------------------"

# Check if containers are running
if docker ps | grep -q "elevareiq-backend"; then
    echo -e "${GREEN}✓${NC} Backend container is running"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} Backend container is NOT running"
    ((FAILED++))
fi

if docker ps | grep -q "elevareiq-frontend"; then
    echo -e "${GREEN}✓${NC} Frontend container is running"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} Frontend container is NOT running"
    ((FAILED++))
fi

echo ""
echo "2. API Health Check"
echo "-----------------------------------"
test_endpoint "API Health" "$API_BASE/api/health"

echo ""
echo "3. HR Analytics Endpoints"
echo "-----------------------------------"
test_endpoint_json "HR KPIs (Current)" "$API_BASE/api/kpis/current" "success"
test_endpoint_json "HR Pain Points" "$API_BASE/api/pain-points" "pain_points"
test_endpoint "Turnover Rate KPI" "$API_BASE/api/kpi/turnover-rate"
test_endpoint "Time to Hire KPI" "$API_BASE/api/kpi/time-to-hire"

echo ""
echo "4. HSE Analytics Endpoints"
echo "-----------------------------------"
test_endpoint_json "HSE KPIs (Current)" "$API_BASE/api/hse/kpis/current" "success"
test_endpoint_json "HSE Pain Points" "$API_BASE/api/hse/pain-points" "pain_points"
test_endpoint "TRIR KPI" "$API_BASE/api/hse/kpi/trir"
test_endpoint "LTIFR KPI" "$API_BASE/api/hse/kpi/ltifr"
test_endpoint_json "Predictive Analytics" "$API_BASE/api/hse/predictive/risk-prediction" "predictions"

echo ""
echo "5. Operations Analytics Endpoints"
echo "-----------------------------------"
test_endpoint_json "Operations KPIs (Current)" "$API_BASE/api/ops/kpis/current" "success"
test_endpoint_json "Operations Pain Points" "$API_BASE/api/ops/pain-points" "pain_points"
test_endpoint "OEE KPI" "$API_BASE/api/ops/kpi/oee"
test_endpoint "Production Volume KPI" "$API_BASE/api/ops/kpi/production-volume"

echo ""
echo "6. Quality Control Endpoints"
echo "-----------------------------------"
test_endpoint_json "QC KPIs (Current)" "$API_BASE/api/qc/kpis/current" "success"
test_endpoint_json "QC Pain Points" "$API_BASE/api/qc/pain-points" "pain_points"
test_endpoint "Defect Rate KPI" "$API_BASE/api/qc/kpi/defect-rate-ppm"
test_endpoint "First Pass Yield KPI" "$API_BASE/api/qc/kpi/first-pass-yield"

echo ""
echo "7. Supply Chain Endpoints"
echo "-----------------------------------"
test_endpoint_json "Supply Chain KPIs (Current)" "$API_BASE/api/supplychain/kpis/current" "success"
test_endpoint_json "Supply Chain Pain Points" "$API_BASE/api/supplychain/pain-points" "pain_points"
test_endpoint "Perfect Order Rate KPI" "$API_BASE/api/supplychain/kpi/perfect-order-rate"
test_endpoint "OTIF KPI" "$API_BASE/api/supplychain/kpi/otif"
test_endpoint "Inventory Turnover KPI" "$API_BASE/api/supplychain/kpi/inventory-turnover"
test_endpoint "DSO KPI" "$API_BASE/api/supplychain/kpi/dso"
test_endpoint "Cash-to-Cash Cycle KPI" "$API_BASE/api/supplychain/kpi/cash-to-cash-cycle"

echo ""
echo "8. Mobile Safety Endpoints"
echo "-----------------------------------"
test_endpoint "Facilities List" "$API_BASE/api/mobile/facilities"
test_endpoint "Departments List" "$API_BASE/api/mobile/departments"

echo ""
echo "======================================"
echo "Verification Summary"
echo "======================================"
echo -e "${GREEN}Passed:${NC} $PASSED tests"
echo -e "${RED}Failed:${NC} $FAILED tests"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed! Platform is working correctly.${NC}"
    echo ""
    echo "You can now access the platform at:"
    echo "  Frontend: http://localhost:5173"
    echo "  Backend API: http://localhost:3001"
    echo ""
    echo "Available modules:"
    echo "  • HR Analytics: http://localhost:5173/"
    echo "  • HSE Analytics: http://localhost:5173/hse"
    echo "  • Operations Analytics: http://localhost:5173/ops"
    echo "  • Quality Control: http://localhost:5173/qc"
    echo "  • Supply Chain: http://localhost:5173/supplychain"
    exit 0
else
    echo -e "${RED}✗ Some tests failed. Please check the errors above.${NC}"
    echo ""
    echo "Troubleshooting steps:"
    echo "  1. Check container logs: docker-compose logs backend"
    echo "  2. Verify containers are running: docker-compose ps"
    echo "  3. Restart containers: docker-compose restart"
    echo "  4. Rebuild if needed: docker-compose build --no-cache"
    exit 1
fi
