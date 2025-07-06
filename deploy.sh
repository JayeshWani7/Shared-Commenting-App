#!/bin/bash

# Comment App Production Deployment Script

set -e

echo "🚀 Starting Comment App Production Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

# Load environment variables
if [ -f .env.production ]; then
    source .env.production
    echo -e "${GREEN}✅ Loaded production environment variables${NC}"
else
    echo -e "${YELLOW}⚠️  No .env.production file found. Using defaults.${NC}"
fi

# Stop any existing containers
echo -e "${YELLOW}🛑 Stopping existing containers...${NC}"
docker-compose -f docker-compose.prod.yml down --remove-orphans

# Remove old images (optional - saves space)
echo -e "${YELLOW}🧹 Cleaning up old images...${NC}"
docker system prune -f

# Build and start services
echo -e "${YELLOW}🏗️  Building and starting services...${NC}"
docker-compose -f docker-compose.prod.yml up --build -d

# Wait for services to be healthy
echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"
sleep 30

# Check service health
echo -e "${YELLOW}🔍 Checking service health...${NC}"

# Check database
if docker-compose -f docker-compose.prod.yml exec postgres pg_isready -U postgres > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Database is healthy${NC}"
else
    echo -e "${RED}❌ Database is not healthy${NC}"
    exit 1
fi

# Check backend
if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is healthy${NC}"
else
    echo -e "${RED}❌ Backend is not healthy${NC}"
    exit 1
fi

# Check frontend
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend is healthy${NC}"
else
    echo -e "${RED}❌ Frontend is not healthy${NC}"
    exit 1
fi

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo ""
echo "📝 Application URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:3001/api"
echo "   Database: localhost:5432"
echo ""
echo "📋 Useful commands:"
echo "   View logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "   Stop services: docker-compose -f docker-compose.prod.yml down"
echo "   Update services: ./deploy.sh"
echo ""
echo "🔐 Security reminders:"
echo "   - Change default passwords in .env.production"
echo "   - Configure SSL certificates for production"
echo "   - Set up firewall rules"
echo "   - Configure backups"
