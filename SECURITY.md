# Security Documentation

This document outlines the security measures implemented in the RadSciCPD platform.

## Table of Contents

- [Quiz Answer Security](#quiz-answer-security)
- [Authentication & Authorization](#authentication--authorization)
- [Anti-Cheating Measures](#anti-cheating-measures)
- [Data Protection](#data-protection)
- [API Security](#api-security)
- [Security Checklist](#security-checklist)
- [Reporting Vulnerabilities](#reporting-vulnerabilities)

---

## Quiz Answer Security

### Critical Implementation

**The #1 security requirement: Quiz answers MUST NEVER be sent to the client.**

### How It Works

1. **Client Side (components/QuizQuestion.tsx)**
   - Only receives: question text, options A-D
   - Does NOT receive: correct answer, explanation (until submitted)
   - Sends user's answer to API for validation

2. **Server Side (app/api/quiz/check-answer/route.ts)**
   - Fetches question from database including `correctAnswer`
   - Compares user answer to correct answer
   - Returns ONLY: `{ isCorrect: boolean, explanation?: string }`
   - Correct answer NEVER leaves the server

3. **Database (prisma/schema.prisma)**
   - `Question.correctAnswer` field has security comment
   - Field is NEVER selected in client-side queries
   - Only fetched in secure API routes

### Verification

To verify quiz security:

```bash
# 1. Search client-side code for "correctAnswer"
grep -r "correctAnswer" app/\(marketing\)/ app/learn/ components/

# Result should be: NO MATCHES

# 2. Check API routes
grep -r "correctAnswer" app/api/quiz/

# Result: Only in server-side validation

# 3. Inspect network traffic
# Open DevTools → Network
# Submit a quiz answer
# Response should only contain: isCorrect (true/false)
```

---

## Authentication & Authorization

### NextAuth.js v5 Implementation

**Password Security**
- Passwords hashed with bcrypt (12 rounds)
- Never stored in plaintext
- Never logged or exposed in errors

**Session Management**
- JWT strategy with secure tokens
- Session includes: user ID, email, role
- Tokens signed with `AUTH_SECRET`
- Automatic rotation on sensitive changes

**Route Protection (middleware.ts)**

Protected routes:
- `/dashboard/*` - Requires authentication
- `/learn/*` - Requires authentication
- `/admin/*` - Requires authentication AND role === ADMIN

Public routes:
- `/` - Homepage
- `/courses/*` - Course browsing
- `/login`, `/signup` - Authentication pages
- `/api/auth/*` - NextAuth endpoints

### Role-Based Access Control

```typescript
// User roles defined in Prisma schema
enum Role {
  USER      // Standard user access
  ADMIN     // Full admin access
  INSTRUCTOR // Future: course creation
}
```

**Access Checks:**
- Middleware enforces route-level permissions
- API routes verify user authentication
- Server actions check resource ownership
- Admin routes double-check ADMIN role

---

## Anti-Cheating Measures

### Rate Limiting

**Quiz Submissions**
- 30 submissions per hour per user
- Tracks: `userId:quiz` combination
- Returns 429 status if exceeded

**Implementation:**
```typescript
// app/api/quiz/check-answer/route.ts
const rateLimitKey = `${session.user.id}:quiz`
if (attemptCount > 30) {
  return 429 Too Many Requests
}
```

### Suspicious Activity Detection

Flags raised for:
1. **Perfect Score Pattern**
   - 20+ attempts with 100% accuracy
   - Indicates possible answer database access

2. **Speed Pattern**
   - Average < 1 second per question
   - Indicates automated submission

3. **High Velocity**
   - 20+ attempts in 5 minutes
   - Indicates brute force attempts

**Actions:**
- Logged to console (production: send to monitoring)
- User account flagged for review
- Can trigger manual review or account suspension

### Time Enforcement

**Section Minimum Time**
- Each section has `minTimeSeconds` requirement
- Client tracks time spent
- Server validates time before marking complete
- Prevents rapid course completion without reading

**Implementation:**
```typescript
// Client: Track start time
const startTime = Date.now()

// Server: Validate minimum time met
if (timeSpent < section.minTimeSeconds) {
  return 400 Bad Request
}
```

### Attempt Logging

All quiz attempts are logged:
- Question ID
- User answer
- Correct/incorrect
- Time spent
- Timestamp
- Attempt number

This creates an audit trail for:
- Detecting cheating patterns
- Understanding user behavior
- Course improvement insights

---

## Data Protection

### Input Validation

**All forms use Zod schemas:**
```typescript
const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  ...
})
```

Benefits:
- Type-safe validation
- Prevents invalid data entry
- Clear error messages
- XSS prevention through sanitization

### SQL Injection Prevention

**Prisma ORM provides:**
- Parameterized queries automatically
- No raw SQL concatenation
- Type-safe database access
- Prevents SQL injection attacks

### XSS Protection

**Multiple layers:**
1. React automatically escapes content
2. Input validation with Zod
3. Content Security Policy headers
4. No `dangerouslySetInnerHTML` usage

### CSRF Protection

NextAuth.js provides:
- CSRF tokens in forms
- State parameter in OAuth
- Secure session cookies

### Environment Variables

**Sensitive data in .env:**
- `DATABASE_URL` - Never commit to git
- `AUTH_SECRET` - Unique per environment
- OAuth credentials - Keep private

**.gitignore includes:**
```
.env*
!.env.example
```

---

## API Security

### Authentication Check Pattern

All protected API routes follow this pattern:

```typescript
export async function POST(request: Request) {
  // 1. Verify authentication
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  // 2. Validate input
  const body = await request.json()
  // ... Zod validation

  // 3. Check permissions
  // ... Resource ownership or role check

  // 4. Process request
  // ...
}
```

### Input Validation

Every API route validates:
- Request body structure
- Data types
- Value ranges
- Required fields
- Format (email, dates, etc.)

### Error Handling

**Security-conscious error messages:**
```typescript
// ❌ BAD: Reveals internal details
return { error: "User not found in database table users" }

// ✅ GOOD: Generic message
return { error: "Invalid credentials" }
```

Never expose:
- Database schema details
- Internal paths or structure
- Stack traces in production
- Sensitive user data

### HTTPS Only

**Production requirements:**
- All traffic over HTTPS
- HSTS headers enabled
- Secure cookies only
- Mixed content blocked

---

## Security Checklist

### Deployment Checklist

Before deploying to production:

- [ ] New `AUTH_SECRET` generated (different from dev)
- [ ] `NEXTAUTH_URL` matches production domain
- [ ] Database uses SSL connection
- [ ] Environment variables secured
- [ ] Google OAuth configured with production URLs
- [ ] HTTPS enabled and enforced
- [ ] Admin accounts use strong passwords
- [ ] Rate limiting tested and working
- [ ] Error messages don't leak sensitive info
- [ ] Backup strategy in place
- [ ] Monitoring/alerting configured

### Code Review Checklist

When adding features:

- [ ] Authentication required for protected resources?
- [ ] Input validation with Zod schemas?
- [ ] Prisma queries parameterized (no raw SQL)?
- [ ] User permissions checked?
- [ ] Quiz answers stay server-side?
- [ ] Rate limiting on submission endpoints?
- [ ] Error messages appropriate for production?
- [ ] Sensitive data not logged?
- [ ] CSRF protection for state-changing operations?
- [ ] Tests include security scenarios?

### Regular Maintenance

Monthly:
- [ ] Review access logs for suspicious activity
- [ ] Update dependencies (`pnpm update`)
- [ ] Run security audit (`pnpm audit`)
- [ ] Review and rotate credentials
- [ ] Test backup restoration

Quarterly:
- [ ] Penetration testing
- [ ] Security training for team
- [ ] Review and update this document
- [ ] Audit user permissions

---

## Reporting Vulnerabilities

### Responsible Disclosure

If you discover a security vulnerability:

1. **DO NOT** open a public GitHub issue
2. **DO NOT** discuss publicly until fixed
3. **DO** email: security@radscicpd.com
4. Include:
   - Description of vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (optional)

### Response Timeline

- **24 hours:** Acknowledgment of report
- **7 days:** Initial assessment and response
- **30 days:** Fix deployed (for critical issues)
- **60 days:** Public disclosure (if appropriate)

### Bug Bounty

Currently: No formal bug bounty program

However, we appreciate security researchers and may provide:
- Public acknowledgment
- Hall of fame listing
- Reference/recommendation
- Swag and merchandise

---

## Security Best Practices

### For Developers

1. **Never trust client input**
   - Always validate server-side
   - Use Zod schemas
   - Sanitize user content

2. **Least privilege principle**
   - Users can only access their own data
   - Admin checks for admin routes
   - Database users have minimum required permissions

3. **Defense in depth**
   - Multiple security layers
   - Fail securely (deny by default)
   - Log security-relevant events

4. **Keep dependencies updated**
   - Regular `pnpm update`
   - Monitor vulnerability alerts
   - Review changelogs for security fixes

### For Administrators

1. **Strong credentials**
   - Use password manager
   - Enable 2FA where available
   - Rotate credentials regularly

2. **Monitor and alert**
   - Set up error tracking (Sentry, etc.)
   - Alert on unusual patterns
   - Review logs regularly

3. **Backup and recovery**
   - Automated daily backups
   - Test restoration procedures
   - Keep backups encrypted

4. **Incident response plan**
   - Document procedures
   - Know who to contact
   - Practice response drills

---

## Compliance

### Data Protection

**GDPR Considerations:**
- User consent for data processing
- Right to access personal data
- Right to deletion (account deletion)
- Data export functionality
- Privacy policy required

**HIPAA Note:**
This platform is NOT currently HIPAA compliant. Do not store:
- Protected Health Information (PHI)
- Patient medical records
- Clinical data tied to individuals

### Educational Records

**FERPA (if applicable):**
- Secure student education records
- Control access to grades/progress
- Allow students to access their own records

---

## Resources

### Security Tools

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Snyk](https://snyk.io/) - Vulnerability scanning
- [npm audit](https://docs.npmjs.com/cli/v8/commands/npm-audit)
- [SonarQube](https://www.sonarqube.org/) - Code quality and security

### Learning Resources

- [OWASP Web Security Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Next.js Security Headers](https://nextjs.org/docs/advanced-features/security-headers)

---

**Last Updated:** 2025-11-12

For questions about this document: security@radscicpd.com
