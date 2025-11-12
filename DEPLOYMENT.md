# Deployment Guide

This guide covers deploying the RadSciCPD platform to production.

## Table of Contents

- [Vercel Deployment (Recommended)](#vercel-deployment-recommended)
- [Database Setup](#database-setup)
- [Environment Variables](#environment-variables)
- [Post-Deployment](#post-deployment)
- [Alternative Platforms](#alternative-platforms)

---

## Vercel Deployment (Recommended)

Vercel is the easiest way to deploy Next.js applications.

### Prerequisites

1. GitHub account
2. Vercel account (sign up at [vercel.com](https://vercel.com))
3. PostgreSQL database (see [Database Setup](#database-setup))

### Steps

1. **Push to GitHub**

```bash
git remote add origin https://github.com/yourusername/cpd-platform.git
git push -u origin main
```

2. **Import to Vercel**

- Go to [vercel.com/new](https://vercel.com/new)
- Import your GitHub repository
- Vercel will auto-detect Next.js settings

3. **Configure Environment Variables**

Add these in Vercel dashboard → Settings → Environment Variables:

```env
DATABASE_URL=postgresql://...
AUTH_SECRET=<generate-new-secret>
NEXTAUTH_URL=https://your-app.vercel.app
GOOGLE_CLIENT_ID=<your-id>
GOOGLE_CLIENT_SECRET=<your-secret>
```

4. **Deploy**

- Click "Deploy"
- Vercel will build and deploy automatically
- Subsequent pushes to `main` will auto-deploy

5. **Run Database Migrations**

After first deploy, run migrations from your local machine:

```bash
# Set DATABASE_URL to production database
export DATABASE_URL="postgresql://..."

# Push schema
pnpm db:push

# Seed database (if needed)
pnpm db:seed
```

---

## Database Setup

Choose one of these PostgreSQL hosting options:

### Option 1: Supabase (Recommended - Free tier available)

1. Sign up at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → Database
4. Copy the connection string (choose "Connection pooling" for Prisma)
5. Update your `DATABASE_URL`:

```env
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"
```

### Option 2: Railway (Free tier available)

1. Sign up at [railway.app](https://railway.app)
2. Create a new project
3. Add PostgreSQL database
4. Copy connection string from variables tab
5. Update your `DATABASE_URL`

### Option 3: Neon (Serverless PostgreSQL)

1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy connection string
4. Update your `DATABASE_URL`

### Option 4: Heroku Postgres

1. Create Heroku app
2. Add Heroku Postgres addon
3. Get connection string: `heroku config:get DATABASE_URL`
4. Update your `DATABASE_URL`

---

## Environment Variables

### Required Variables

```env
# Database - Connection string to PostgreSQL
DATABASE_URL="postgresql://username:password@host:5432/database"

# NextAuth - Must be different from development!
AUTH_SECRET="<generate with: openssl rand -base64 32>"
NEXTAUTH_URL="https://your-production-domain.com"
```

### Optional Variables

```env
# Google OAuth
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"

# Node environment (automatically set by most platforms)
NODE_ENV="production"
```

### Generating AUTH_SECRET

**Important:** Use a different secret for production!

```bash
openssl rand -base64 32
```

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. Enable "Google+ API"
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Add authorized redirect URI:
   - `https://your-domain.com/api/auth/callback/google`
6. Copy Client ID and Client Secret

---

## Post-Deployment

### 1. Verify Deployment

Check these pages:
- ✅ Homepage: `https://your-domain.com`
- ✅ Login: `https://your-domain.com/login`
- ✅ Signup: `https://your-domain.com/signup`
- ✅ Courses: `https://your-domain.com/courses`

### 2. Create Admin User

Option A: Via seed script (if not done already):
```bash
pnpm db:seed
```

Option B: Manually via Prisma Studio:
```bash
# Set DATABASE_URL to production
export DATABASE_URL="postgresql://..."

# Open Prisma Studio
pnpm db:studio

# Create user with role="ADMIN"
```

Option C: Sign up normally, then update role via SQL:
```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your-email@example.com';
```

### 3. Add Content

Use Prisma Studio to add courses:
```bash
export DATABASE_URL="<production-database-url>"
pnpm db:studio
```

Or use the seed script to populate with sample data.

### 4. Configure Custom Domain (Optional)

In Vercel:
1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update `NEXTAUTH_URL` to match new domain

---

## Alternative Platforms

### Netlify

1. Connect GitHub repository
2. Build settings:
   - Build command: `pnpm build`
   - Publish directory: `.next`
3. Add environment variables
4. Deploy

### Docker

Create `Dockerfile`:

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY pnpm-lock.yaml ./

RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start"]
```

Build and run:
```bash
docker build -t cpd-platform .
docker run -p 3000:3000 -e DATABASE_URL=... cpd-platform
```

### VPS (Ubuntu/Debian)

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install pnpm
npm install -g pnpm

# Clone and setup
git clone <your-repo>
cd cpd-platform
pnpm install
pnpm build

# Setup environment
cp .env.example .env
# Edit .env with production values

# Run migrations
pnpm db:push
pnpm db:seed

# Install PM2
npm install -g pm2

# Start application
pm2 start pnpm --name cpd-platform -- start

# Setup nginx reverse proxy
sudo apt install nginx
# Configure nginx to proxy to localhost:3000
```

---

## Troubleshooting

### Build Errors

**Error:** "Module not found"
- Solution: Delete `node_modules` and `.next`, then `pnpm install && pnpm build`

**Error:** "Prisma Client not generated"
- Solution: Ensure `postinstall` script runs: `pnpm prisma generate`

### Database Errors

**Error:** "Can't reach database"
- Check `DATABASE_URL` is correct
- Ensure database allows connections from your IP
- For Supabase, use connection pooling URL

**Error:** "SSL required"
- Add `?sslmode=require` to connection string

### Authentication Errors

**Error:** "NEXTAUTH_URL mismatch"
- Ensure `NEXTAUTH_URL` matches your actual domain
- Include `https://` prefix

**Error:** "Invalid callback URL"
- Update Google OAuth settings with production URL
- Add: `https://your-domain.com/api/auth/callback/google`

### Performance Issues

- Enable database connection pooling
- Use Vercel Edge Functions for API routes
- Enable caching headers
- Optimize images with Next.js Image component

---

## Monitoring & Maintenance

### Vercel Analytics

Enable in Project Settings → Analytics for:
- Page views
- Web Vitals
- User metrics

### Error Tracking

Consider adding:
- [Sentry](https://sentry.io) for error tracking
- [LogRocket](https://logrocket.com) for session replay
- [Datadog](https://www.datadoghq.com/) for APM

### Database Backups

**Supabase:** Automatic daily backups (paid plans)

**Manual backup:**
```bash
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
```

### Updates

Keep dependencies updated:
```bash
pnpm update
pnpm audit
```

---

## Security Checklist

Before going live:

- [ ] New `AUTH_SECRET` generated for production
- [ ] `NEXTAUTH_URL` matches production domain
- [ ] Google OAuth configured with production URLs
- [ ] Database uses SSL connection
- [ ] Environment variables never committed to git
- [ ] Rate limiting configured
- [ ] CORS policies reviewed
- [ ] Admin accounts secured with strong passwords
- [ ] Regular backups scheduled

---

## Support

Need help with deployment?

- Check [Vercel Documentation](https://vercel.com/docs)
- Check [Next.js Deployment](https://nextjs.org/docs/deployment)
- Open an issue on GitHub
- Contact: support@radscicpd.com
