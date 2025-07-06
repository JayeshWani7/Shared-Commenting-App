# Railway Environment Variables Update

## Go to your Railway project dashboard
https://railway.app/dashboard

## Update these environment variables:

### Required Environment Variables:
```
NODE_ENV=production
DATABASE_URL=postgresql://postgres:postgres@db.luszqtuugjeqcdwadpgq.supabase.co:5432/postgres
JWT_SECRET=your-super-secret-jwt-key-change-in-production-87324658734687243
JWT_EXPIRATION=1d
BCRYPT_ROUNDS=12
PORT=3001
FRONTEND_URL=https://shared-commenting-app.vercel.app
```

## Steps to update:
1. Go to your Railway project
2. Click on your backend service
3. Go to "Variables" tab
4. Update FRONTEND_URL to: https://shared-commenting-app.vercel.app
5. Click "Deploy" to redeploy with new variables

## After updating:
- Your Railway backend will redeploy automatically
- CORS will be configured for your Vercel domain
- WebSocket connections will work properly
