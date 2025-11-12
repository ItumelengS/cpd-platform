# Database Setup Instructions

The CPD platform is fully built and ready to test, but requires PostgreSQL to be installed and configured.

## Quick Setup (Ubuntu/Debian)

### 1. Install PostgreSQL

```bash
sudo apt update
sudo apt install -y postgresql postgresql-contrib
```

### 2. Start PostgreSQL Service

```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql  # Auto-start on boot
```

### 3. Create Database and User

```bash
# Switch to postgres user
sudo -u postgres psql

# In the PostgreSQL prompt, run these commands:
CREATE DATABASE cpd_platform;
CREATE USER cpd_user WITH PASSWORD 'your_secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE cpd_platform TO cpd_user;
\q  # Exit PostgreSQL prompt
```

### 4. Update Environment Variables

Edit `/home/itumeleng/cpd-platform/.env` and update the DATABASE_URL:

```env
DATABASE_URL="postgresql://cpd_user:your_secure_password_here@localhost:5432/cpd_platform"
```

### 5. Initialize Database Schema

```bash
cd ~/cpd-platform
pnpm db:push
```

This will create all tables based on the Prisma schema.

### 6. Seed Sample Data

```bash
pnpm db:seed
```

This creates:
- 6 course categories
- 2 complete courses with content
- 2 test users (admin@example.com, user@example.com)
- All quiz questions

### 7. Access the Platform

The dev server is already running at: **http://localhost:3000**

**Test Accounts:**
- **Admin:** admin@example.com / admin123
- **User:** user@example.com / password123

---

## Alternative: Use Docker PostgreSQL (No sudo installation needed)

If you don't want to install PostgreSQL system-wide, you can use Docker:

```bash
# Start PostgreSQL in Docker
docker run -d \
  --name cpd-postgres \
  -e POSTGRES_DB=cpd_platform \
  -e POSTGRES_USER=cpd_user \
  -e POSTGRES_PASSWORD=cpd_password \
  -p 5432:5432 \
  postgres:15-alpine

# Update .env
DATABASE_URL="postgresql://cpd_user:cpd_password@localhost:5432/cpd_platform"

# Then run migrations
cd ~/cpd-platform
pnpm db:push
pnpm db:seed
```

---

## Verification

After setup, verify the database connection:

```bash
cd ~/cpd-platform
pnpm prisma db pull  # Should succeed without errors
pnpm db:studio       # Opens Prisma Studio GUI at http://localhost:5555
```

---

## Current Error

When attempting `pnpm db:push` without PostgreSQL installed, you'll see:

```
Error: P1001: Can't reach database server at `localhost:5432`
```

This is expected and will be resolved once PostgreSQL is installed and running.

---

## Testing Checklist (After Database Setup)

Follow the complete testing guide in `PROJECT_SUMMARY.md` section "Complete Test Flow" (lines 174-240).

Key test steps:
1. ✅ Visit homepage
2. ✅ Browse courses
3. ✅ Sign up new account or login
4. ✅ Enroll in course
5. ✅ Complete sections (note: 5-minute timer per section)
6. ✅ Answer quizzes
7. ✅ **SECURITY TEST:** Check DevTools Network tab - responses should only show `{isCorrect: true/false}`, NEVER the `correctAnswer`
8. ✅ Complete final quiz (70% to pass)
9. ✅ Generate certificate
10. ✅ View certificates page

---

**Need Help?**
- Check README.md for general setup
- Check DEPLOYMENT.md for production deployment
- Check SECURITY.md for security details
- Check PROJECT_SUMMARY.md for complete overview
