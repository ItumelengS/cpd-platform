# RadSciCPD Platform

A professional Continuing Professional Development (CPD) platform for radiation sciences professionals, including radiographers, radiotherapists, nuclear medicine professionals, and medical physicists.

## Features

- 🎓 **Evidence-Based Courses** - Peer-reviewed content with CPD accreditation
- 🔐 **Secure Authentication** - NextAuth v5 with OAuth and credentials support
- 📊 **Progress Tracking** - Real-time monitoring of learning progress
- ✅ **Interactive Quizzes** - Secure server-side validation, no answer exposure
- 🎯 **Certificates** - Generate professional CPD certificates
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- ⏱️ **Time Tracking** - Minimum time requirements for course completion
- 🛡️ **Anti-Cheating** - Rate limiting and suspicious activity detection

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** NextAuth.js v5
- **Forms:** React Hook Form + Zod validation
- **Deployment:** Vercel (recommended)

## Prerequisites

- Node.js 20+ and pnpm
- PostgreSQL 14+ database
- Google OAuth credentials (optional, for social login)

## Getting Started

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd cpd-platform
pnpm install
```

### 2. Environment Setup

Copy the example environment file:

```bash
cp .env.example .env
```

Update `.env` with your values:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/cpd_platform"

# NextAuth
AUTH_SECRET="<generate with: openssl rand -base64 32>"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (optional)
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
```

### 3. Database Setup

```bash
# Push schema to database
pnpm db:push

# Seed with sample data
pnpm db:seed
```

This creates:
- 6 course categories
- 2 complete courses with sections and quizzes
- 2 test users (see below)

### 4. Run Development Server

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Test Accounts

After seeding, use these accounts:

**Admin User:**
- Email: `admin@example.com`
- Password: `admin123`
- Access: Full admin panel access

**Regular User:**
- Email: `user@example.com`
- Password: `password123`
- Access: Student features only

## Sample Courses

The seed includes two complete courses:

1. **AI in Diagnostic Radiology** (2.0 CPD Hours)
   - 5 sections with comprehensive content
   - Section quizzes (2 questions each)
   - Final quiz (10 questions, 70% pass required)

2. **Radiation Protection Principles** (1.5 CPD Hours)
   - 4 sections covering safety fundamentals
   - Section quizzes (2 questions each)
   - Final quiz (10 questions, 70% pass required)

## Project Structure

```
cpd-platform/
├── app/
│   ├── (auth)/              # Authentication pages
│   │   ├── login/
│   │   └── signup/
│   ├── (marketing)/         # Public marketing pages
│   │   ├── page.tsx         # Homepage
│   │   └── courses/         # Course listing & details
│   ├── dashboard/           # User dashboard
│   │   ├── page.tsx         # Main dashboard
│   │   └── certificates/    # Certificates pages
│   ├── learn/               # Course learning interface
│   │   └── [courseSlug]/
│   │       ├── [sectionId]/ # Section content
│   │       └── quiz/        # Final quiz
│   ├── api/                 # API routes
│   │   ├── auth/            # NextAuth endpoints
│   │   ├── quiz/            # Quiz validation
│   │   ├── progress/        # Progress tracking
│   │   └── certificates/    # Certificate generation
│   └── admin/               # Admin interface (future)
├── components/              # Reusable components
├── lib/                     # Utilities and configs
│   ├── auth.ts              # NextAuth configuration
│   ├── prisma.ts            # Prisma client
│   └── actions/             # Server actions
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── seed.ts              # Database seeding
└── middleware.ts            # Route protection
```

## Available Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm db:push      # Push Prisma schema to database
pnpm db:studio    # Open Prisma Studio
pnpm db:seed      # Seed database with sample data
```

## Security Features

### Quiz System
- ✅ **Server-side validation only** - Correct answers never sent to client
- ✅ **Rate limiting** - 30 submissions per hour per user
- ✅ **Attempt logging** - All quiz attempts recorded
- ✅ **Suspicious activity detection** - Flags unusual patterns
- ✅ **Time enforcement** - Minimum time requirements per section

### Authentication
- ✅ **Password hashing** - bcrypt with 12 rounds
- ✅ **JWT sessions** - Secure session management
- ✅ **Route protection** - Middleware guards protected routes
- ✅ **Role-based access** - Admin vs. user permissions

### Data Protection
- ✅ **Input validation** - Zod schemas for all forms
- ✅ **SQL injection prevention** - Prisma parameterized queries
- ✅ **XSS protection** - React automatic escaping

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions for:
- Vercel (recommended)
- Other platforms
- Database setup (Supabase, Railway, etc.)

## Course Management

Currently, courses are managed through:
1. Direct database access via Prisma Studio: `pnpm db:studio`
2. SQL queries
3. Admin interface (future development)

## License

MIT License - See LICENSE file for details

## Support

For issues and questions:
- GitHub Issues: [Your repo URL]
- Email: support@radscicpd.com
- Documentation: [Your docs URL]

## Contributing

Contributions welcome! Please read CONTRIBUTING.md for guidelines.

---

Built with ❤️ for radiation sciences professionals
