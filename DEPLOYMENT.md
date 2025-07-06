# Comment App Deployment Guide

This guide provides multiple options for hosting your Comment App with real-time notifications.

## 🚀 Quick Start (Local Production)

### Prerequisites
- Docker Desktop installed
- 8GB+ RAM recommended
- Ports 80, 3000, 3001, 5432 available

### 1. Clone and Configure

```bash
# Clone the repository
git clone <your-repo-url>
cd comment-app

# Copy and edit environment variables
cp .env.production.example .env.production
# Edit .env.production with your settings
```

### 2. Deploy with Docker

**Windows:**
```powershell
powershell -ExecutionPolicy Bypass -File deploy.ps1
```

**Linux/Mac:**
```bash
chmod +x deploy.sh
./deploy.sh
```

### 3. Access Your App
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api
- Database: localhost:5432

## 🌐 Cloud Hosting Options

### Option 1: DigitalOcean Droplet (Recommended)

**Cost:** $12-24/month
**Perfect for:** Small to medium traffic

```bash
# 1. Create a droplet (Ubuntu 22.04, 2GB RAM)
# 2. SSH into your droplet
ssh root@your-droplet-ip

# 3. Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# 4. Install Docker Compose
sudo apt install docker-compose-plugin

# 5. Upload your app files
# 6. Run deployment script
./deploy.sh
```

### Option 2: AWS EC2 with RDS

**Cost:** $25-50/month
**Perfect for:** Production applications

```bash
# 1. Launch EC2 instance (t3.small or larger)
# 2. Create RDS PostgreSQL instance
# 3. Configure security groups
# 4. SSH into EC2 instance
# 5. Install Docker and deploy
```

### Option 3: Heroku (Easy Deploy)

**Cost:** $25-50/month
**Perfect for:** Quick deployment

```bash
# 1. Install Heroku CLI
# 2. Create Heroku apps
heroku create your-app-backend
heroku create your-app-frontend

# 3. Add PostgreSQL addon
heroku addons:create heroku-postgresql:mini -a your-app-backend

# 4. Deploy backend
git subtree push --prefix backend heroku-backend main

# 5. Deploy frontend
git subtree push --prefix frontend heroku-frontend main
```

### Option 4: Vercel + Railway

**Cost:** $15-30/month
**Perfect for:** Modern deployment

```bash
# 1. Deploy backend to Railway
# 2. Deploy frontend to Vercel
# 3. Configure environment variables
```

## 🔧 Environment Configuration

### Required Environment Variables

```env
# Database
POSTGRES_PASSWORD=your-secure-password

# Backend
JWT_SECRET=your-very-secure-jwt-secret-key
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_NAME=comment_app
DATABASE_USERNAME=postgres

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Production Security Checklist

- [ ] Change default passwords
- [ ] Use strong JWT secret (32+ characters)
- [ ] Configure SSL certificates
- [ ] Set up firewall rules
- [ ] Enable backup strategy
- [ ] Configure monitoring
- [ ] Set up log rotation

## 🛡️ SSL Configuration

### Using Let's Encrypt (Free SSL)

```bash
# 1. Install certbot
sudo apt install certbot python3-certbot-nginx

# 2. Get certificate
sudo certbot --nginx -d your-domain.com

# 3. Update nginx.conf to use SSL
# 4. Restart services
docker-compose -f docker-compose.prod.yml restart nginx
```

### Using Cloudflare (Recommended)

1. Sign up for Cloudflare
2. Add your domain
3. Enable SSL/TLS encryption
4. Configure DNS records
5. Update environment variables

## 📊 Monitoring & Maintenance

### View Logs
```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f backend
```

### Health Checks
```bash
# Backend health
curl http://localhost:3001/api/health

# Frontend health
curl http://localhost:3000

# Database health
docker-compose -f docker-compose.prod.yml exec postgres pg_isready -U postgres
```

### Backup Database
```bash
# Create backup
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U postgres comment_app > backup.sql

# Restore backup
docker-compose -f docker-compose.prod.yml exec postgres psql -U postgres comment_app < backup.sql
```

## 🔄 Updates & Maintenance

### Update Application
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.prod.yml up --build -d

# Check health
./deploy.sh
```

### Scale Services
```bash
# Scale backend to 3 instances
docker-compose -f docker-compose.prod.yml up --scale backend=3 -d
```

## 🚨 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Find process using port
   lsof -i :3000
   # Kill process
   kill -9 PID
   ```

2. **Database Connection Failed**
   ```bash
   # Check database logs
   docker-compose -f docker-compose.prod.yml logs postgres
   # Restart database
   docker-compose -f docker-compose.prod.yml restart postgres
   ```

3. **Build Failed**
   ```bash
   # Clear Docker cache
   docker system prune -a
   # Rebuild from scratch
   docker-compose -f docker-compose.prod.yml build --no-cache
   ```

### Performance Optimization

1. **Enable Redis Caching**
   ```yaml
   # Add to docker-compose.prod.yml
   redis:
     image: redis:alpine
     ports:
       - "6379:6379"
   ```

2. **Configure Database Connection Pool**
   ```env
   DATABASE_MAX_CONNECTIONS=20
   DATABASE_CONNECTION_TIMEOUT=30000
   ```

3. **Enable Frontend Caching**
   ```javascript
   // next.config.js
   module.exports = {
     experimental: {
       serverComponentsExternalPackages: ['@your-package']
     }
   }
   ```

## 🎯 Production Recommendations

### Small Traffic (< 1000 users)
- **Platform:** DigitalOcean Droplet
- **Size:** 2GB RAM, 1 CPU
- **Cost:** ~$12/month
- **Database:** PostgreSQL on same server

### Medium Traffic (1000-10000 users)
- **Platform:** AWS EC2 + RDS
- **Size:** t3.medium, db.t3.micro
- **Cost:** ~$40/month
- **Database:** Managed PostgreSQL

### Large Traffic (10000+ users)
- **Platform:** Kubernetes cluster
- **Size:** Multiple nodes with auto-scaling
- **Cost:** $200+/month
- **Database:** Managed PostgreSQL with read replicas

## 📞 Support

For deployment issues or questions:
1. Check the troubleshooting section
2. Review Docker logs
3. Open an issue in the repository
4. Contact the development team

## 📄 License

This project is licensed under the MIT License.
