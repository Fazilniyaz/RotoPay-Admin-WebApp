# RotaPay - Deployment Guide

## Quick Start

### Local Development
```bash
# Install dependencies
pnpm install

# Set up environment
cp .env.example .env.local

# Start dev server
pnpm dev
```

The app will be available at `http://localhost:3000`

## Environment Variables

Create `.env.local` in the project root:

```env
# Backend API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000

# Google OAuth (get from Google Cloud Console)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
```

## Production Build

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

## Deployment to Vercel

### Option 1: Direct Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Option 2: GitHub Integration
1. Push code to GitHub repository
2. Connect repository to Vercel dashboard
3. Set environment variables in Vercel settings
4. Deploy automatically on push

### Environment Variables on Vercel

Set these in Vercel project settings:

- `NEXT_PUBLIC_API_URL` - Your backend API URL (production)
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` - Google OAuth Client ID

## Backend API Setup

### Required Endpoints

The frontend expects these backend endpoints:

#### Authentication
- `POST /api/auth/login` - Email/password login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Token refresh
- `POST /api/auth/verify-email` - Email verification
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Confirm password reset
- `POST /api/auth/logout` - Logout
- `POST /api/auth/google` - Google OAuth callback

#### Response Format
All endpoints should return:
```json
{
  "success": true/false,
  "message": "Human-readable message",
  "data": { /* endpoint-specific payload */ },
  "errors": { /* Only on validation errors */ }
}
```

#### Headers
All authenticated requests include:
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

### Token Refresh Flow
1. Access token expires (401 response)
2. Frontend automatically calls `/api/auth/refresh` with refreshToken
3. Backend returns new accessToken
4. Request is retried automatically
5. On refresh failure, redirect to login

## Database Setup

If using the provided backend template:

### PostgreSQL Migrations
```sql
-- User table (example)
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  displayName VARCHAR(255),
  passwordHash VARCHAR(255),
  emailVerified BOOLEAN DEFAULT false,
  pinEnabled BOOLEAN DEFAULT false,
  createdAt TIMESTAMP DEFAULT NOW()
);

-- Add other tables for shifts, employers, etc.
```

## Security Checklist

- [ ] Enable HTTPS
- [ ] Set secure CORS policy
- [ ] Implement rate limiting on auth endpoints
- [ ] Use strong password hashing (bcrypt)
- [ ] Rotate JWT secrets regularly
- [ ] Set HTTPOnly flag on refresh token cookie
- [ ] Implement CSRF protection
- [ ] Validate all inputs on backend
- [ ] Use environment variables for secrets
- [ ] Enable security headers (CSP, X-Frame-Options, etc.)

## Performance Optimization

### Image Optimization
- Images are automatically optimized by Next.js
- Use `next/image` component for best performance

### Code Splitting
- Routes are automatically code-split
- Components are lazy-loaded where appropriate

### Caching Strategy
- Static pages cached at build time
- Dynamic pages cached in browser
- API responses cached via Axios

### Monitoring
```bash
# Build analysis
pnpm build -- --analyze

# Performance metrics
pnpm build && pnpm start
# Check Lighthouse scores in browser DevTools
```

## Troubleshooting

### "NEXT_PUBLIC_API_URL is not set"
- Add `NEXT_PUBLIC_API_URL` to `.env.local`
- Restart dev server after changing env vars

### "Google OAuth components must be used within GoogleOAuthProvider"
- Already handled in app - ensure Providers wrapper is in layout.tsx
- Check that GoogleOAuthProvider is properly initialized

### 401 Unauthorized on API calls
- Check that accessToken is being set in auth store
- Verify token refresh is working
- Check backend is returning tokens in correct format

### CORS errors
- Ensure backend allows requests from frontend origin
- Set `Access-Control-Allow-Origin` header on backend
- Configure `Access-Control-Allow-Methods` and `Access-Control-Allow-Headers`

### Build errors
- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `pnpm install`
- Check TypeScript errors: `pnpm tsc --noEmit`

## SSL/TLS Certificate

### For Production
- Use Vercel's automatic SSL (included with deployment)
- Or set up manual certificate with Let's Encrypt

### Local Development
- Self-signed certificates not needed for local dev
- Use `http://localhost:3000`

## Database Backups

### Regular Backups
```bash
# PostgreSQL example
pg_dump rotapay_db > backup.sql
```

### Restore from Backup
```bash
psql rotapay_db < backup.sql
```

## Monitoring & Logging

### Application Errors
- Use error tracking service (Sentry recommended)
- View real-time errors in Vercel dashboard

### Performance Metrics
- Monitor Core Web Vitals
- Check build times and deployment logs
- Review API response times

### User Analytics
- Integrate with analytics provider (Google Analytics, Mixpanel)
- Track user flows and conversion funnels

## Maintenance

### Regular Updates
```bash
# Check for outdated packages
pnpm outdated

# Update packages
pnpm update

# Check security vulnerabilities
pnpm audit
```

### Database Maintenance
- Regular backups (daily recommended)
- Monitor disk usage
- Optimize slow queries
- Clean up old records (configurable retention)

## Rollback Procedure

### If Deployment Breaks
1. Identify last working deployment
2. On Vercel: Dashboard → Deployments → Rollback
3. Or redeploy from previous git commit

### Database Rollback
1. Stop the application
2. Restore database from backup
3. Deploy previous API version
4. Restart application

## Support & Documentation

- Frontend Source: `/vercel/share/v0-project`
- API Documentation: Backend README
- GitHub Issues: Report bugs
- Deployment Logs: Vercel dashboard

## Next Steps

1. ✅ Set up backend API
2. ✅ Configure environment variables
3. ✅ Run local development
4. ✅ Connect to real backend
5. ✅ Test authentication flow
6. ✅ Deploy to staging
7. ✅ QA testing
8. ✅ Deploy to production
9. ✅ Monitor performance
10. ✅ Gather user feedback

---

For detailed setup instructions, see README.md and IMPLEMENTATION.md
