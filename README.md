# Comment App - Full-Stack System

A minimalistic and highly scalable comment application emphasizing backend performance, clean architecture, and Docker-based containerization.

## 🚀 Features

- 🔐 **Secure Authentication** - JWT-based user authentication with bcrypt password hashing
- 🧵 **Nested Comments** - Multi-level comment threads with visual nesting
- ✏️ **Edit Comments** - Edit comments within 15 minutes of posting
- 🗑️ **Delete/Restore** - Soft delete with 15-minute restoration window
- 🔔 **Real-time Notifications** - WebSocket-based notifications for replies
- 📈 **Scalable Architecture** - Designed for high traffic with Redis caching
- 📦 **Docker Ready** - Complete containerization for easy deployment
- 🎨 **Clean UI** - Minimalistic design focusing on functionality

## 🛠️ Tech Stack

### Backend
- **NestJS** - Progressive Node.js framework
- **TypeScript** - Type-safe development
- **PostgreSQL** - Robust relational database
- **Redis** - High-performance caching and sessions
- **TypeORM** - Type-safe database operations
- **JWT** - Secure authentication
- **WebSocket** - Real-time communication
- **Swagger** - API documentation

### Frontend
- **Next.js** - React framework with SSR/SSG
- **TypeScript** - Type-safe frontend development
- **Tailwind CSS** - Utility-first CSS framework
- **React Query** - Server state management
- **React Hook Form** - Efficient form handling
- **Socket.io** - Real-time client communication

### Infrastructure
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Reverse proxy (production)

## 🚦 Quick Start

### Prerequisites
- Node.js 18+ 
- Docker & Docker Compose
- Git

### Option 1: Docker (Recommended)
```bash
# Clone the repository
git clone <repository-url>
cd comment-app

# Start all services
docker-compose up --build

# The application will be available at:
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:3001
# - API Documentation: http://localhost:3001/api
```

### Option 2: Local Development
```bash
# Clone and setup
git clone <repository-url>
cd comment-app

# Run setup script
# Windows:
setup.bat

# Linux/Mac:
chmod +x setup.sh
./setup.sh

# Start backend
cd backend
npm run start:dev

# Start frontend (in new terminal)
cd frontend
npm run dev
```

## 📁 Project Structure

```
comment-app/
├── backend/                 # NestJS backend
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── users/          # User management
│   │   ├── comments/       # Comment system
│   │   ├── notifications/  # Notification system
│   │   ├── websocket/      # WebSocket gateway
│   │   └── health/         # Health checks
│   ├── Dockerfile
│   └── package.json
├── frontend/               # Next.js frontend
│   ├── pages/             # Next.js pages
│   ├── components/        # React components
│   ├── contexts/          # React contexts
│   ├── services/          # API services
│   ├── styles/            # Global styles
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml      # Docker orchestration
├── setup.sh               # Setup script (Linux/Mac)
├── setup.bat              # Setup script (Windows)
└── README.md
```

## 🔧 Configuration

### Backend Environment Variables
Create `backend/.env`:
```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/comment_app
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRATION=1d
BCRYPT_ROUNDS=12
FRONTEND_URL=http://localhost:3000
```

### Frontend Environment Variables
Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 🏗️ Architecture

### Backend Architecture
- **Modular Design** - Each feature is encapsulated in its own module
- **Repository Pattern** - Clean separation of data access logic
- **Dependency Injection** - Loose coupling between components
- **Caching Strategy** - Redis for performance optimization
- **Real-time Updates** - WebSocket for live notifications

### Database Schema
- **Users** - Authentication and profile data
- **Comments** - Hierarchical comment structure
- **Notifications** - User notification system
- **Optimized Indexes** - For performance at scale

### Frontend Architecture
- **Component-Based** - Reusable UI components
- **State Management** - React Query for server state
- **Context API** - Global state management
- **Type Safety** - Full TypeScript coverage

## 🔐 Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - Bcrypt with configurable rounds
- **Input Validation** - Comprehensive validation on all inputs
- **Rate Limiting** - Protection against abuse
- **CORS Configuration** - Proper cross-origin setup
- **SQL Injection Prevention** - Parameterized queries
- **XSS Protection** - Content sanitization

## 🚀 Performance Optimizations

- **Redis Caching** - Fast data retrieval
- **Database Indexes** - Optimized queries
- **Connection Pooling** - Efficient database connections
- **Lazy Loading** - Frontend code splitting
- **Compression** - Gzip compression enabled
- **CDN Ready** - Static asset optimization

## 📊 Scalability Considerations

- **Horizontal Scaling** - Stateless backend design
- **Database Optimization** - Efficient queries and indexes
- **Caching Layer** - Redis for high-throughput scenarios
- **Load Balancing** - Docker services can be scaled
- **Monitoring Ready** - Health checks and logging

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📚 API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:3001/api
- **Health Check**: http://localhost:3001/api/health

### Key Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/comments` - Fetch comments with pagination
- `POST /api/comments` - Create new comment
- `PUT /api/comments/:id` - Update comment (15min window)
- `DELETE /api/comments/:id` - Delete comment
- `PUT /api/comments/:id/restore` - Restore deleted comment
- `GET /api/notifications` - Get user notifications

## 🔄 Grace Period Features

### Edit Comments
- Users can edit their comments within **15 minutes** of posting
- Edited comments are marked with "(edited)" indicator
- Edit timestamp is tracked

### Delete/Restore Comments
- Soft delete preserves comment in database
- **15-minute window** for restoration
- Deleted comments show as "[deleted]" but maintain thread structure

## 🌐 Real-time Features

- **Live Notifications** - Instant notification delivery
- **Comment Updates** - Real-time comment thread updates
- **Connection Status** - Visual connection indicator
- **Automatic Reconnection** - Resilient WebSocket connections

## 🐳 Docker Services

- **PostgreSQL** - Primary database
- **Redis** - Caching and session storage
- **Backend API** - NestJS application
- **Frontend** - Next.js application

## 📈 Production Deployment

1. **Environment Setup**
   - Set production environment variables
   - Configure SSL certificates
   - Set up monitoring and logging

2. **Database Migration**
   - Run database migrations
   - Set up database backups

3. **Docker Deployment**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the [Issues](../../issues) page
2. Review the API documentation
3. Check Docker logs: `docker-compose logs`

## 🚧 Roadmap

- [ ] File upload support
- [ ] Advanced search and filtering
- [ ] Comment reactions (like/dislike)
- [ ] User profiles and avatars
- [ ] Email notifications
- [ ] Comment moderation tools
- [ ] Mobile app (React Native)
- [ ] Admin dashboard
