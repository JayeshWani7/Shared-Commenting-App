#!/bin/bash

# Comment App Setup Script
echo "🚀 Setting up Comment App..."

# Create environment files
echo "📝 Creating environment files..."
if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
fi
if [ ! -f frontend/.env.local ]; then
    cp frontend/.env.local.example frontend/.env.local
fi

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
if ! npm install; then
    echo "❌ Backend dependency installation failed"
    exit 1
fi

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd ../frontend
if ! npm install; then
    echo "❌ Frontend dependency installation failed"
    exit 1
fi

# Go back to root
cd ..

echo "✅ Setup complete!"
echo ""
echo "To run the application:"
echo "1. Start with Docker: docker-compose up --build"
echo "2. Or run development servers:"
echo "   - Backend: cd backend && npm run start:dev"
echo "   - Frontend: cd frontend && npm run dev"
echo ""
echo "Access the application at:"
echo "- Frontend: http://localhost:3000"
echo "- Backend API: http://localhost:3001"
echo "- API Documentation: http://localhost:3001/api"
