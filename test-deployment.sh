#!/bin/bash

# Comment App Deployment Test Script

echo "🧪 Testing Comment App Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test backend health
echo -e "${YELLOW}Testing backend health...${NC}"
if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend health check passed${NC}"
else
    echo -e "${RED}❌ Backend health check failed${NC}"
    exit 1
fi

# Test frontend
echo -e "${YELLOW}Testing frontend...${NC}"
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend is accessible${NC}"
else
    echo -e "${RED}❌ Frontend is not accessible${NC}"
    exit 1
fi

# Test database connection
echo -e "${YELLOW}Testing database connection...${NC}"
if docker-compose -f docker-compose.prod.yml exec postgres pg_isready -U postgres > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Database connection is healthy${NC}"
else
    echo -e "${RED}❌ Database connection failed${NC}"
    exit 1
fi

# Test WebSocket connection (basic test)
echo -e "${YELLOW}Testing WebSocket endpoint...${NC}"
if curl -f http://localhost:3001/socket.io/?EIO=4&transport=polling > /dev/null 2>&1; then
    echo -e "${GREEN}✅ WebSocket endpoint is accessible${NC}"
else
    echo -e "${RED}❌ WebSocket endpoint is not accessible${NC}"
    exit 1
fi

echo -e "${GREEN}🎉 All tests passed! Your Comment App is ready to use.${NC}"
echo ""
echo "📝 Test Results:"
echo "   ✅ Backend API: http://localhost:3001/api"
echo "   ✅ Frontend: http://localhost:3000"
echo "   ✅ Database: Connected"
echo "   ✅ WebSocket: Connected"
echo ""
echo "🔗 Try these URLs:"
echo "   - App: http://localhost:3000"
echo "   - API Health: http://localhost:3001/api/health"
echo "   - API Docs: http://localhost:3001/api/docs"
