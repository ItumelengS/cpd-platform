# 🚀 CPD Platform - Creator Marketplace Extension (Tasks 13-25)

**Transform your CPD platform into a full creator marketplace with revenue sharing**

---

# 📚 TABLE OF CONTENTS

This guide extends the base platform (Tasks 1-12) with marketplace features.

**Prerequisites:** Complete Tasks 1-12 first!

## Marketplace Tasks:
1. [Task 13: Creator Accounts & Profiles](#task-13) (6 hours)
2. [Task 14: Content Upload System](#task-14) (8 hours)
3. [Task 15: Content Approval Workflow](#task-15) (4 hours)
4. [Task 16: Social Features (Follow System)](#task-16) (6 hours)
5. [Task 17: View Tracking & Analytics](#task-17) (5 hours)
6. [Task 18: Ad Integration](#task-18) (4 hours)
7. [Task 19: Revenue Calculation Engine](#task-19) (8 hours)
8. [Task 20: Payment Processing](#task-20) (10 hours)
9. [Task 21: Creator Dashboard](#task-21) (5 hours)
10. [Task 22: Search & Discovery](#task-22) (6 hours)
11. [Task 23: Reviews & Ratings](#task-23) (4 hours)
12. [Task 24: Email Notifications](#task-24) (3 hours)
13. [Task 25: Legal & Compliance](#task-25) (6 hours)

**Total Time:** 75 hours (10-15 weeks part-time)

---

# OVERVIEW

## 🎯 What These Tasks Add

After completing Tasks 13-25, your platform will have:

### Creator Features:
- ✅ Creator account registration & profiles
- ✅ Course/publication upload by creators
- ✅ Content approval workflow
- ✅ Creator earnings dashboard
- ✅ Follower system
- ✅ Analytics & insights

### Monetization:
- ✅ View tracking system
- ✅ Ad integration (Google AdSense)
- ✅ Revenue calculation (Spotify model)
- ✅ Payment processing (Stripe)
- ✅ Monthly payouts to creators

### Discovery & Engagement:
- ✅ Advanced search
- ✅ Creator directory
- ✅ Reviews & ratings
- ✅ Email notifications
- ✅ Content recommendations

---

# TASK 13: Creator Accounts & Profiles

**Time:** 6 hours  
**Difficulty:** ⭐⭐⭐ Moderate

## 🎯 Objective

Enable users to become creators, build profiles, and showcase their credentials.

## 📋 Database Schema Updates

First, update your Prisma schema:

```prisma
// Add to prisma/schema.prisma

// Update User model - add new fields
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  name          String?
  password      String?
  role          Role     @default(USER)
  
  // NEW CREATOR FIELDS
  isCreator     Boolean  @default(false)
  creatorStatus CreatorStatus @default(NONE)
  bio           String?  @db.Text
  avatar        String?
  specialty     String?
  institution   String?
  country       String?
  cvUrl         String?  // CV/Resume URL
  socialLinks   Json?    // {twitter, linkedin, website}
  
  // Existing relations
  enrollments   Enrollment[]
  attempts      QuizAttempt[]
  certificates  Certificate[]
  progress      Progress[]
  
  // NEW CREATOR RELATIONS
  createdCourses Course[] @relation("CreatedBy")
  publications   Publication[]
  followers      Follow[] @relation("Following")
  following      Follow[] @relation("Follower")
  applications   CreatorApplication[]
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

enum Role {
  USER
  CREATOR
  ADMIN
  INSTRUCTOR
}

enum CreatorStatus {
  NONE          // Not a creator
  PENDING       // Application submitted
  APPROVED      // Active creator
  REJECTED      // Application rejected
  SUSPENDED     // Temporarily suspended
}

// New model for creator applications
model CreatorApplication {
  id              String   @id @default(cuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Application details
  motivation      String   @db.Text  // Why they want to be a creator
  expertise       String   @db.Text  // Their expertise areas
  experience      String   @db.Text  // Teaching/content creation experience
  sampleContent   String?  // Link to sample work
  cvUrl           String   // Required CV upload
  
  // Review details
  status          CreatorStatus @default(PENDING)
  reviewedBy      String?
  reviewedAt      DateTime?
  rejectionReason String?  @db.Text
  
  createdAt       DateTime @default(now())
  
  @@index([userId])
  @@index([status])
}

// Update Course model - add creator
model Course {
  // ... existing fields ...
  
  // NEW CREATOR FIELD
  creatorId     String
  creator       User     @relation("CreatedBy", fields: [creatorId], references: [id])
  
  // ... rest of existing fields ...
}

// New model for publications (research papers)
model Publication {
  id            String   @id @default(cuid())
  title         String
  description   String   @db.Text
  creatorId     String
  creator       User     @relation(fields: [creatorId], references: [id])
  
  fileUrl       String   // PDF URL
  thumbnail     String?
  doi           String?  // Digital Object Identifier
  journal       String?
  publishedDate DateTime?
  
  // Metadata
  keywords      String[] // Array of keywords
  categoryId    String
  category      Category @relation(fields: [categoryId], references: [id])
  
  published     Boolean  @default(false)
  views         Int      @default(0)
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@index([creatorId])
}

// Add to Category model
model Category {
  // ... existing fields ...
  publications  Publication[] // Add this relation
}
```

## 🤖 Claude Code Prompt

```
Update the Prisma schema as shown above, then create creator account functionality:

1. Update prisma/schema.prisma:
   - Add isCreator, creatorStatus, bio, avatar, cvUrl, socialLinks to User model
   - Add CreatorStatus enum
   - Create CreatorApplication model
   - Create Publication model
   - Add creator relations

2. Run: npx prisma generate

3. Create app/creator/apply/page.tsx:
   - Creator application form with fields:
     * Why do you want to be a creator? (textarea)
     * What's your area of expertise? (textarea)
     * Teaching/content creation experience (textarea)
     * Link to sample work (optional, URL input)
     * Upload CV (file upload - we'll handle storage later)
   - Form validation with Zod
   - Submit to /api/creator/apply
   - Success message: "Application submitted! We'll review within 3 business days."

4. Create app/api/creator/apply/route.ts:
   - POST endpoint
   - Verify user authenticated
   - Check user is not already a creator
   - Validate form data
   - For now, save CV as data URL (we'll add proper storage in Task 14)
   - Create CreatorApplication record with status PENDING
   - Return success

5. Create app/creator/profile/[userId]/page.tsx:
   - Public creator profile page
   - Display: avatar, name, bio, specialty, institution
   - Social links (if provided)
   - Stats: total courses, total followers, total views
   - List of creator's published courses
   - "Follow" button (functionality in Task 16)
   - Link to CV (if public)

6. Create app/dashboard/creator/setup/page.tsx:
   - Creator profile setup page (for approved creators)
   - Edit: bio, avatar URL, specialty, institution, social links
   - Preview of public profile
   - Save to /api/creator/profile/update

7. Create app/api/creator/profile/update/route.ts:
   - POST endpoint
   - Verify user is approved creator
   - Update User record: bio, avatar, specialty, institution, socialLinks
   - Return updated user

8. Update app/admin/creators/page.tsx (new):
   - Admin page to review creator applications
   - Table showing: applicant name, email, applied date, status
   - Actions: View Details, Approve, Reject
   - Filter by status

9. Create app/admin/creators/[applicationId]/page.tsx:
   - View full application details
   - Show: all application fields, CV
   - Approve button → calls /api/admin/creator/approve
   - Reject button with reason → calls /api/admin/creator/reject

10. Create app/api/admin/creator/approve/route.ts:
    - POST endpoint with applicationId
    - Verify admin role
    - Update application status to APPROVED
    - Update User: isCreator = true, creatorStatus = APPROVED, role = CREATOR
    - Send email notification (placeholder for now)
    - Return success

11. Create app/api/admin/creator/reject/route.ts:
    - POST endpoint with applicationId and reason
    - Verify admin role
    - Update application status to REJECTED
    - Save rejection reason
    - Send email notification (placeholder)
    - Return success

Use Tailwind CSS for all pages.
Add proper loading states and error handling.
Include success/error toast notifications.
```

## ✅ Verification Steps

```bash
# 1. Generate Prisma client
npx prisma generate

# 2. Push schema to database
npx prisma db push

# 3. Test application flow
pnpm dev

# 4. As regular user:
# - Go to /creator/apply
# - Fill out application form
# - Submit

# 5. As admin:
# - Go to /admin/creators
# - See pending application
# - Click "View Details"
# - Approve application

# 6. As approved creator:
# - Go to /dashboard/creator/setup
# - Set up profile
# - Save

# 7. View public profile:
# - Go to /creator/profile/[userId]
# - See creator info and courses
```

## 🐛 Troubleshooting

**Issue:** Prisma generate fails
```bash
# Check schema syntax
npx prisma validate

# Force regenerate
rm -rf node_modules/.prisma
npx prisma generate
```

**Issue:** File upload not working yet
```bash
# That's expected - we'll add proper file storage in Task 14
# For now, application should save without CV or with data URL
```

**Issue:** Creator role not showing
```bash
# Check user record in Prisma Studio
npx prisma studio
# Verify: isCreator = true, creatorStatus = APPROVED
```

## 📝 Commit

```bash
git add .
git commit -m "feat: add creator accounts and application system"
```

---

# TASK 14: Content Upload System

**Time:** 8 hours  
**Difficulty:** ⭐⭐⭐⭐ High

## 🎯 Objective

Enable creators to upload courses (text, PDFs, videos) and research publications.

## 📦 New Dependencies

```bash
pnpm add @vercel/blob uploadthing @uploadthing/react
pnpm add -D @types/mime-types mime-types
```

## 📋 Database Schema Updates

```prisma
// Add to existing Course model
model Course {
  // ... existing fields ...
  
  // Update these fields for creator uploads
  creatorId     String
  creator       User     @relation("CreatedBy", fields: [creatorId], references: [id])
  
  isDraft       Boolean  @default(true)
  submittedAt   DateTime?
  publishedAt   DateTime?
  rejectedAt    DateTime?
  rejectionReason String? @db.Text
  
  // ... rest of fields ...
}

// Add to existing Section model
model Section {
  // ... existing fields ...
  
  contentType   String   @default("text") // text, video, pdf
  videoUrl      String?
  pdfUrl        String?
  duration      Int?     // video duration in seconds
  
  // ... rest of fields ...
}

// New model for file uploads
model FileUpload {
  id          String   @id @default(cuid())
  userId      String
  fileName    String
  fileUrl     String
  fileType    String   // application/pdf, video/mp4, etc.
  fileSize    Int      // bytes
  uploadedAt  DateTime @default(now())
  
  @@index([userId])
}
```

## 🤖 Claude Code Prompt

```
Set up file upload system using Vercel Blob storage:

1. Update prisma/schema.prisma as shown above, then:
   npx prisma generate
   npx prisma db push

2. Create .env additions:
   BLOB_READ_WRITE_TOKEN="your_vercel_blob_token"

3. Create app/api/upload/route.ts:
   - POST endpoint using @vercel/blob
   - Accept file upload (PDF, video, images)
   - Validate file type and size:
     * PDFs: max 50MB
     * Videos: max 500MB
     * Images: max 5MB
   - Upload to Vercel Blob
   - Create FileUpload record
   - Return URL

4. Create components/FileUploader.tsx:
   - Drag-and-drop file upload component
   - Show upload progress
   - Preview uploaded files
   - Props: acceptedTypes, maxSize, onUploadComplete
   - Use fetch to /api/upload

5. Create app/dashboard/creator/courses/new/page.tsx:
   - Multi-step course creation wizard
   
   Step 1: Basic Info
   - Title, slug (auto-generated), category dropdown
   - Description (rich text editor or textarea)
   - Difficulty dropdown, CPD hours
   - Thumbnail upload
   - "Next" button
   
   Step 2: Add Sections
   - Dynamic section list
   - For each section:
     * Title
     * Content type selector: Text / Video / PDF
     * If Text: Rich textarea
     * If Video: Upload video + thumbnail
     * If PDF: Upload PDF
     * Order (drag to reorder or number input)
     * Minimum time in minutes
   - "Add Section" button
   - "Remove Section" button for each
   - "Previous" / "Next" buttons
   
   Step 3: Add Questions
   - For each section + final quiz:
     * Add 2 questions per section minimum
     * Question text, optional context
     * 4 options (A, B, C, D)
     * Correct answer dropdown
     * Explanation (optional)
   - "Add Question" button
   - "Previous" / "Next" buttons
   
   Step 4: Preview & Submit
   - Preview entire course
   - Show all sections, questions
   - "Save as Draft" button
   - "Submit for Review" button
   - Confirmation modal

6. Create app/api/creator/courses/route.ts:
   - POST endpoint to create course
   - Verify user is approved creator
   - Validate all required fields
   - Create Course record with isDraft = true
   - Create Section records
   - Create Question records
   - Return course ID

7. Create app/api/creator/courses/submit/route.ts:
   - POST endpoint with courseId
   - Verify creator owns course
   - Validate course is complete (has sections, questions)
   - Update: isDraft = false, submittedAt = now()
   - Send notification to admin (placeholder)
   - Return success

8. Create app/dashboard/creator/courses/page.tsx:
   - List creator's courses
   - Tabs: Drafts, Under Review, Published, Rejected
   - For each course: title, status, views, earnings
   - Actions: Edit, Delete, View, Submit (if draft)
   - "Create New Course" button

9. Create app/dashboard/creator/courses/[id]/edit/page.tsx:
   - Same as creation wizard but pre-filled
   - Can edit if draft or rejected
   - Cannot edit if under review or published
   - Save changes to /api/creator/courses/[id]

10. Create app/api/creator/courses/[id]/route.ts:
    - GET: fetch course details
    - PUT: update course (if draft or rejected)
    - DELETE: delete course (if draft)

11. Create app/dashboard/creator/publications/new/page.tsx:
    - Publication upload form:
      * Title
      * Description
      * Category dropdown
      * Upload PDF
      * Optional: DOI, Journal name, Published date
      * Keywords (tag input)
    - Submit to /api/creator/publications

12. Create app/api/creator/publications/route.ts:
    - POST: create publication
    - Verify creator
    - Upload PDF
    - Create Publication record
    - Auto-submit for review

Use react-hook-form for all forms.
Use Zod for validation.
Add proper error handling and loading states.
Show upload progress for large files.
```

## ✅ Verification Steps

```bash
# 1. Get Vercel Blob token
# Go to: https://vercel.com/dashboard
# Settings → Storage → Create Blob Store
# Copy token to .env

# 2. Test file upload
pnpm dev

# 3. As creator:
# - Go to /dashboard/creator/courses/new
# - Complete all 4 steps
# - Upload a test PDF or video
# - Add sections and questions
# - Save as draft

# 4. Check database:
npx prisma studio
# Verify Course, Section, Question records created

# 5. Test editing:
# - Go to /dashboard/creator/courses
# - Click "Edit" on draft course
# - Make changes
# - Save

# 6. Test submission:
# - Submit course for review
# - Check status changes in database
```

## 🐛 Troubleshooting

**Issue:** File upload fails
```bash
# Check Vercel Blob token is set
echo $BLOB_READ_WRITE_TOKEN

# Check file size limits
# Videos should be < 500MB
# PDFs should be < 50MB
```

**Issue:** "Creator not found" error
```bash
# Verify user has creatorStatus = APPROVED
npx prisma studio
# Check User record
```

**Issue:** Video playback not working
```bash
# Vercel Blob serves files directly
# Videos should work in HTML5 <video> tag
# Check fileUrl is accessible in browser
```

## 💡 Alternative: Use UploadThing Instead

If Vercel Blob doesn't work, use UploadThing:

```bash
# 1. Sign up at uploadthing.com
# 2. Get API key
# 3. Add to .env:
UPLOADTHING_SECRET="sk_live_..."
UPLOADTHING_APP_ID="your_app_id"

# 4. Use UploadThing's Next.js integration
# Follow: https://docs.uploadthing.com/getting-started/appdir
```

## 📝 Commit

```bash
git add .
git commit -m "feat: add content upload system for creators"
```

---

# TASK 15: Content Approval Workflow

**Time:** 4 hours  
**Difficulty:** ⭐⭐⭐ Moderate

## 🎯 Objective

Create admin tools to review, approve, or reject creator-submitted content.

## 🤖 Claude Code Prompt

```
Create content moderation system for admin:

1. Create app/admin/content/page.tsx:
   - Tabs: Pending Courses, Pending Publications, All Content
   - Table showing submitted content:
     * Title, Creator name, Type (course/publication)
     * Submitted date, Category
     * Actions: Review, Quick Approve, Quick Reject
   - Filter by: Category, Date range, Status
   - Sort by: Newest first, Oldest first

2. Create app/admin/content/courses/[id]/page.tsx:
   - Full course review page
   - Display all course content:
     * Basic info
     * All sections with content
     * All quiz questions
     * Preview exactly as learners will see it
   - Quality checklist:
     [ ] Content is accurate
     [ ] No plagiarism detected
     [ ] Proper grammar and formatting
     [ ] Quizzes test learning objectives
     [ ] CPD hours appropriate for content length
   - Feedback textarea (for rejection)
   - Approve button → /api/admin/content/approve
   - Reject button → /api/admin/content/reject
   - Request changes button → returns to creator as draft

3. Create app/admin/content/publications/[id]/page.tsx:
   - Publication review page
   - Show: title, description, PDF viewer
   - Check DOI validity (if provided)
   - Quality checklist
   - Approve/reject actions

4. Create app/api/admin/content/approve/route.ts:
   - POST endpoint with contentId and contentType
   - Verify admin role
   - Update Course or Publication:
     * published = true
     * publishedAt = now()
     * isDraft = false
   - Create notification for creator (placeholder)
   - Return success

5. Create app/api/admin/content/reject/route.ts:
   - POST endpoint with contentId, contentType, reason
   - Verify admin role
   - Update record:
     * rejectedAt = now()
     * rejectionReason = reason
     * published = false
   - Send notification to creator
   - Return success

6. Update app/dashboard/creator/courses/page.tsx:
   - If course rejected, show rejection reason
   - "View Feedback" button
   - Allow editing rejected courses
   - Resubmit button after edits

7. Create components/ContentStatusBadge.tsx:
   - Visual status indicator component
   - Draft (gray), Under Review (yellow), Published (green), Rejected (red)
   - Props: status, rejectionReason (optional)

8. Add admin dashboard stats:
   - Update app/admin/page.tsx
   - Show: Pending reviews count, Total creators, Total content
   - Recent submissions list
   - Quick access to pending content

Use Tailwind CSS.
Add loading states for all actions.
Toast notifications for approve/reject.
```

## ✅ Verification Steps

```bash
pnpm dev

# 1. As creator:
# - Submit a course for review
# - Check status shows "Under Review"

# 2. As admin:
# - Go to /admin/content
# - See submitted course
# - Click "Review"
# - Review all content
# - Either approve or reject with feedback

# 3. If approved:
# - Course should appear in public course list
# - Creator should see status "Published"

# 4. If rejected:
# - Creator should see rejection reason
# - Creator can edit and resubmit

# 5. Test quick approve/reject
# - Use quick action buttons
# - Verify status updates immediately
```

## 📝 Commit

```bash
git add .
git commit -m "feat: add content approval workflow for admin"
```

---

# TASK 16: Social Features (Follow System)

**Time:** 6 hours  
**Difficulty:** ⭐⭐⭐ Moderate

## 🎯 Objective

Enable users to follow creators and get updates on new content.

## 📋 Database Schema Updates

```prisma
// Add new models to schema

model Follow {
  id         String   @id @default(cuid())
  followerId String
  follower   User     @relation("Follower", fields: [followerId], references: [id], onDelete: Cascade)
  followingId String
  following  User     @relation("Following", fields: [followingId], references: [id], onDelete: Cascade)
  createdAt  DateTime @default(now())
  
  @@unique([followerId, followingId])
  @@index([followerId])
  @@index([followingId])
}

model Notification {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  type      String   // "new_course", "new_follower", "course_published"
  title     String
  message   String   @db.Text
  link      String?
  read      Boolean  @default(false)
  
  createdAt DateTime @default(now())
  
  @@index([userId, read])
  @@index([createdAt])
}

// Add to User model
model User {
  // ... existing fields ...
  
  notifications Notification[]
  followers     Follow[] @relation("Following")
  following     Follow[] @relation("Follower")
  
  // ... rest of fields ...
}
```

## 🤖 Claude Code Prompt

```
Create social follow system:

1. Update prisma/schema.prisma with Follow and Notification models, then:
   npx prisma generate
   npx prisma db push

2. Create components/FollowButton.tsx:
   - Button component that shows:
     * "Follow" if not following
     * "Following" with checkmark if following
     * Follower count
   - Click toggles follow status
   - Calls /api/social/follow
   - Optimistic UI update
   - Props: creatorId, initialFollowing, initialFollowerCount

3. Create app/api/social/follow/route.ts:
   - POST endpoint with creatorId
   - Verify authenticated
   - Toggle follow:
     * If not following: create Follow record
     * If following: delete Follow record
   - Create notification for creator if following
   - Return new status and follower count

4. Create app/api/social/followers/[userId]/route.ts:
   - GET endpoint
   - Return list of user's followers
   - Include: follower name, avatar, specialty

5. Create app/api/social/following/[userId]/route.ts:
   - GET endpoint
   - Return list of creators user is following
   - Include: creator info, course count, latest course

6. Update app/creator/profile/[userId]/page.tsx:
   - Add FollowButton component
   - Show follower count prominently
   - Add "Followers" tab showing follower list
   - Add "Following" tab (if viewing own profile)

7. Create app/dashboard/following/page.tsx:
   - "Following" page in user dashboard
   - List of followed creators
   - Latest content from followed creators
   - "Activity Feed" showing recent uploads
   - Unfollow button for each creator

8. Create app/dashboard/notifications/page.tsx:
   - Notification center
   - List all notifications, newest first
   - Mark as read when viewed
   - Types:
     * "X started following you"
     * "X published a new course: [Title]"
     * "Your course was approved"
   - Clear all button
   - Filter: Unread / All

9. Create app/api/notifications/route.ts:
   - GET: fetch user's notifications
   - POST: mark notifications as read
   - DELETE: clear all notifications

10. Create components/NotificationBell.tsx:
    - Bell icon in navigation
    - Show unread count badge
    - Dropdown with recent 5 notifications
    - Click notification → mark as read and navigate
    - "View All" link to /dashboard/notifications

11. Update app/layout.tsx or navigation:
    - Add NotificationBell component to header
    - Position in top-right with user menu

12. Create lib/notifications.ts:
    - Helper function: createNotification(userId, type, data)
    - Types: NEW_FOLLOWER, NEW_COURSE, COURSE_APPROVED, COURSE_REJECTED
    - Formats notification title and message based on type

13. Update existing flows to create notifications:
    - In /api/admin/content/approve: notify creator
    - In /api/admin/content/reject: notify creator
    - In /api/creator/courses/submit: notify admin
    - In /api/social/follow: notify creator

Use Tailwind CSS.
Add smooth animations for follow button.
Real-time notification badge update.
```

## ✅ Verification Steps

```bash
pnpm dev

# 1. Follow a creator:
# - Go to creator profile
# - Click "Follow" button
# - Should show "Following"
# - Follower count should increase

# 2. Check notifications:
# - As creator being followed:
# - Click notification bell
# - See "X started following you"

# 3. Check following feed:
# - Go to /dashboard/following
# - See list of followed creators
# - See their recent content

# 4. Unfollow:
# - Click unfollow
# - Verify removed from following list

# 5. Test notification bell:
# - Check unread count displays
# - Click notification
# - Should navigate to relevant page
# - Mark as read

# 6. Test activity feed:
# - Follow multiple creators
# - Check feed shows recent content
# - Sorted by newest first
```

## 📝 Commit

```bash
git add .
git commit -m "feat: add follow system and notifications"
```

---

# TASK 17: View Tracking & Analytics

**Time:** 5 hours  
**Difficulty:** ⭐⭐⭐⭐ High

## 🎯 Objective

Track every view of courses and publications for revenue calculation and analytics.

## 📋 Database Schema Updates

```prisma
model View {
  id            String   @id @default(cuid())
  userId        String?  // nullable for anonymous views
  user          User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
  
  // What was viewed
  courseId      String?
  course        Course?  @relation(fields: [courseId], references: [id], onDelete: Cascade)
  publicationId String?
  publication   Publication? @relation(fields: [publicationId], references: [id], onDelete: Cascade)
  
  // Creator who gets credit
  creatorId     String
  creator       User     @relation("CreatorViews", fields: [creatorId], references: [id])
  
  // Engagement metrics
  duration      Int      @default(0) // seconds spent
  completed     Boolean  @default(false)
  
  // Tracking
  ipAddress     String?
  userAgent     String?
  referrer      String?
  
  createdAt     DateTime @default(now())
  
  @@index([creatorId, createdAt])
  @@index([courseId, createdAt])
  @@index([userId, createdAt])
}

// Add to User model
model User {
  // ... existing fields ...
  views         View[]
  creatorViews  View[] @relation("CreatorViews")
  // ... rest of fields ...
}

// Add to Course and Publication models
model Course {
  // ... existing fields ...
  views         View[]
  totalViews    Int      @default(0) // cached count
  // ... rest of fields ...
}

model Publication {
  // ... existing fields ...
  views         View[]
  totalViews    Int      @default(0)
  // ... rest of fields ...
}
```

## 🤖 Claude Code Prompt

```
Create comprehensive view tracking system:

1. Update prisma/schema.prisma with View model, then:
   npx prisma generate
   npx prisma db push

2. Create lib/analytics.ts:
   - Function: trackView(contentType, contentId, creatorId, userId?)
     * Create View record
     * Increment totalViews on content
     * Return view ID
   - Function: updateViewDuration(viewId, duration)
     * Update duration on View record
   - Function: markViewCompleted(viewId)
     * Set completed = true
   - Function: getCreatorAnalytics(creatorId, timeRange)
     * Return: total views, views by content, growth trend

3. Create app/api/analytics/track-view/route.ts:
   - POST endpoint with contentType, contentId
   - Get user ID from session (optional)
   - Get IP, user agent, referrer from headers
   - Call trackView function
   - Return viewId (client needs this to update duration)

4. Create app/api/analytics/update-duration/route.ts:
   - POST endpoint with viewId, duration
   - Update View record
   - Return success

5. Create hooks/useViewTracking.ts:
   - Custom React hook for automatic view tracking
   - Usage: const { trackView } = useViewTracking()
   - On component mount: track initial view
   - Track time spent (update every 30 seconds)
   - On unmount: send final duration
   - On scroll to bottom or video end: mark completed

6. Update app/learn/[courseSlug]/[sectionId]/page.tsx:
   - Add useViewTracking hook
   - Track view when section loads
   - Update duration periodically
   - Mark completed when section finished

7. Update app/(marketing)/courses/[slug]/page.tsx:
   - Track course page view (not section view)
   - Track time spent on course detail page

8. Create app/dashboard/creator/analytics/page.tsx:
   - Analytics dashboard for creators
   
   Overview Cards:
   - Total Views (all time)
   - Views This Month
   - Unique Viewers
   - Avg. View Duration
   
   Charts:
   - Views over time (line chart - last 30 days)
   - Views by content (bar chart)
   - View duration distribution
   
   Top Performing Content:
   - Table: Title, Views, Avg Duration, Completion Rate
   - Sort by views, duration, or completion
   
   Recent Activity:
   - Live feed of recent views
   - User (if logged in), Content, Time

9. Create app/api/analytics/creator/[creatorId]/route.ts:
   - GET endpoint
   - Verify creator owns this data or is admin
   - Query params: timeRange (7d, 30d, 90d, all)
   - Return aggregated analytics:
     * Total views by time range
     * Views per day (for chart)
     * Top content
     * Unique viewers count
     * Average duration
     * Completion rate

10. Create components/ViewChart.tsx:
    - Line chart component for views over time
    - Use recharts library
    - Props: data (array of {date, views})
    - Responsive, clean design

11. Create components/TopContentTable.tsx:
    - Table showing top performing content
    - Columns: Title, Views, Duration, Completion %
    - Sortable columns
    - Click row → navigate to content

12. Add real-time view count to course pages:
    - Show "X people viewed this course" below title
    - Update Course.totalViews periodically

Install recharts for charts:
pnpm add recharts

Use Tailwind CSS for dashboard.
Add loading skeletons for analytics.
Cache analytics data (update every 5 minutes).
```

## ✅ Verification Steps

```bash
pnpm dev

# 1. View a course:
# - Go to course page
# - Wait 30+ seconds
# - Check database:
npx prisma studio
# - Should see View record created

# 2. Check duration tracking:
# - Stay on course page for 2 minutes
# - View record duration should be ~120 seconds

# 3. Check creator analytics:
# - As creator, go to /dashboard/creator/analytics
# - Should see view count
# - Charts should display
# - Top content table should show courses

# 4. Test completion tracking:
# - Complete a course section
# - View record should have completed = true

# 5. Test anonymous views:
# - Open incognito window
# - View course without login
# - Should still track (userId = null)

# 6. Verify totalViews increments:
# - View course multiple times
# - Course.totalViews should increase
```

## 🐛 Troubleshooting

**Issue:** Views not tracking
```bash
# Check API route is being called
# Open Network tab in DevTools
# Should see POST to /api/analytics/track-view
```

**Issue:** Duration always 0
```bash
# Check useViewTracking hook is working
# Add console.log in hook to verify it's running
# Make sure component doesn't unmount too quickly
```

**Issue:** Charts not displaying
```bash
# Check recharts is installed
pnpm list recharts

# Verify data format:
# Should be: [{date: "2024-01-01", views: 10}, ...]
```

## 📝 Commit

```bash
git add .
git commit -m "feat: add view tracking and creator analytics"
```

---

# TASK 18: Ad Integration

**Time:** 4 hours  
**Difficulty:** ⭐⭐ Low-Moderate

## 🎯 Objective

Integrate Google AdSense to generate revenue that will be shared with creators.

## 🤖 Claude Code Prompt

```
Integrate Google AdSense for revenue generation:

1. Sign up for Google AdSense:
   - Go to: https://www.google.com/adsense
   - Create account and get approved
   - Get your AdSense publisher ID (ca-pub-XXXXXXXXXXXXXXXX)
   - Add site verification code

2. Add to .env:
   NEXT_PUBLIC_ADSENSE_ID="ca-pub-XXXXXXXXXXXXXXXX"

3. Create components/AdUnit.tsx:
   - Google AdSense ad component
   - Props: slot (ad unit ID), format (auto, rectangle, etc.)
   - Uses next/script to load AdSense
   - Example:
     ```tsx
     <ins className="adsbygoogle"
       style={{ display: 'block' }}
       data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_ID}
       data-ad-slot="1234567890"
       data-ad-format="auto"
       data-full-width-responsive="true" />
     ```
   - Call (window.adsbygoogle = window.adsbygoogle || []).push({})

4. Create lib/adsense.ts:
   - Helper to load AdSense script
   - Handle ad blocking detection
   - Track if ads loaded successfully

5. Add ads to strategic locations:
   
   a) app/(marketing)/courses/page.tsx:
      - Ad between every 6 courses in grid
      - Sidebar ad unit
   
   b) app/(marketing)/courses/[slug]/page.tsx:
      - Ad above course content
      - Ad in sidebar
   
   c) app/learn/[courseSlug]/[sectionId]/page.tsx:
      - Ad below section content (before quiz)
      - Small banner ad at bottom
   
   d) app/creator/profile/[userId]/page.tsx:
      - Sidebar ad
      - Ad between course listings

6. Create app/api/revenue/record/route.ts:
   - Endpoint to record estimated ad revenue
   - Called periodically (daily cron job)
   - Google AdSense provides revenue data via API
   - Store in Revenue model (we'll create this in Task 19)

7. Create components/AdBlockerDetect.tsx:
   - Detect if user has ad blocker
   - Show polite message:
     "We use ads to support our creators. Please consider disabling your ad blocker."
   - Don't be aggressive, just informative

8. Add ad revenue attribution:
   - When ad loads on creator's content page
   - Attribute that ad impression to creator
   - Store: which creator's page, timestamp, estimated value

9. Update app/layout.tsx:
   - Add AdSense script to head
   - Load only once globally
   - Add privacy policy link (required by AdSense)

10. Create app/privacy/page.tsx (if not exists):
    - Privacy policy page
    - Include section on advertising:
      * We use Google AdSense
      * Cookies and tracking
      * How data is used
      * Opt-out options
    - Required for AdSense compliance

11. Add ad density controls:
    - Don't overload with ads (bad UX)
    - Max 3 ad units per page
    - No ads on: login, signup, admin pages
    - No ads during quiz taking (distraction)

12. Create admin revenue dashboard:
    - app/admin/revenue/page.tsx
    - Show: total ad revenue, revenue by day
    - Views vs revenue correlation
    - Top revenue-generating content

Note: AdSense takes 2-4 weeks for approval.
In the meantime, use placeholder ads or test mode.

Use next/script for loading external scripts.
Follow AdSense policies carefully.
```

## ✅ Verification Steps

```bash
# 1. Add test AdSense ID (or use test mode)
NEXT_PUBLIC_ADSENSE_ID="ca-pub-0000000000000000"

pnpm dev

# 2. Check ads load:
# - Go to course page
# - Open DevTools → Network
# - Look for requests to googlesyndication.com

# 3. Check ad placement:
# - Ads should show between content
# - Not too many (max 3 per page)
# - Responsive sizing

# 4. Test ad blocker detection:
# - Enable ad blocker
# - Visit site
# - Should see message about ad blocker

# 5. Check attribution:
# - View course with ad
# - Ad should be attributed to course creator

# Note: Real ads won't show until AdSense approves site
# Use test mode or placeholders during development
```

## 🐛 Troubleshooting

**Issue:** Ads not showing
```bash
# Check AdSense ID is correct
echo $NEXT_PUBLIC_ADSENSE_ID

# AdSense needs 2-4 weeks approval
# Use test mode during development
```

**Issue:** Ad blocker detection not working
```bash
# Ad blockers block the detection script too
# Use bait element method instead
```

**Issue:** Too many ads / poor UX
```bash
# Follow AdSense policies:
# - Max 3 ad units per page
# - Don't place ads above important content
# - Maintain good user experience
```

## 📝 Important: AdSense Policies

Follow these rules or risk account suspension:
- ✅ Original content only (no plagiarism)
- ✅ Clear navigation
- ✅ Privacy policy
- ✅ Don't click own ads
- ✅ Don't ask users to click ads
- ✅ No adult content
- ✅ Mobile-friendly

## 📝 Commit

```bash
git add .
git commit -m "feat: integrate Google AdSense for revenue generation"
```

---

# TASK 19: Revenue Calculation Engine

**Time:** 8 hours  
**Difficulty:** ⭐⭐⭐⭐⭐ Very High

## 🎯 Objective

Build Spotify-style revenue sharing: creators earn based on their proportion of total views.

## 📋 Database Schema Updates

```prisma
model Revenue {
  id              String   @id @default(cuid())
  
  // Time period
  month           DateTime // First day of month
  year            Int
  
  // Platform totals
  totalRevenue    Float    // Total ad revenue for this month
  totalViews      Int      // Total views across all content
  revenuePerView  Float    // Calculated: totalRevenue / totalViews
  
  // Status
  calculated      Boolean  @default(false)
  calculatedAt    DateTime?
  
  createdAt       DateTime @default(now())
  
  creatorEarnings CreatorEarning[]
  
  @@unique([year, month])
  @@index([calculated])
}

model CreatorEarning {
  id          String   @id @default(cuid())
  
  revenueId   String
  revenue     Revenue  @relation(fields: [revenueId], references: [id], onDelete: Cascade)
  
  creatorId   String
  creator     User     @relation(fields: [creatorId], references: [id])
  
  // Creator's metrics
  views       Int      // Creator's views this month
  viewShare   Float    // Percentage of total views
  
  // Earnings
  grossEarnings Float  // Before platform fee
  platformFee   Float  // 30% goes to platform
  netEarnings   Float  // Creator receives this (70%)
  
  // Payout
  paid          Boolean  @default(false)
  paidAt        DateTime?
  payoutId      String?  // Stripe payout ID
  
  createdAt     DateTime @default(now())
  
  @@unique([revenueId, creatorId])
  @@index([creatorId, paid])
}

// Add to User model
model User {
  // ... existing fields ...
  earnings    CreatorEarning[]
  // ... rest of fields ...
}
```

## 🤖 Claude Code Prompt

```
Create revenue calculation and distribution system:

1. Update prisma/schema.prisma with Revenue and CreatorEarning models:
   npx prisma generate
   npx prisma db push

2. Create lib/revenue.ts with core calculation logic:
   
   ```typescript
   interface RevenueCalculation {
     month: Date;
     totalRevenue: number;
     totalViews: number;
     creatorEarnings: {
       creatorId: string;
       views: number;
       viewShare: number;
       grossEarnings: number;
       platformFee: number;
       netEarnings: number;
     }[];
   }
   
   async function calculateMonthlyRevenue(year: number, month: number): Promise<RevenueCalculation> {
     // 1. Get total platform revenue for month (from AdSense API or manual input)
     const totalRevenue = await getAdSenseRevenue(year, month);
     
     // 2. Get total views for month
     const totalViews = await prisma.view.count({
       where: {
         createdAt: {
           gte: new Date(year, month - 1, 1),
           lt: new Date(year, month, 1)
         }
       }
     });
     
     // 3. Get views per creator
     const creatorViews = await prisma.view.groupBy({
       by: ['creatorId'],
       where: {
         createdAt: {
           gte: new Date(year, month - 1, 1),
           lt: new Date(year, month, 1)
         }
       },
       _count: { id: true }
     });
     
     // 4. Calculate each creator's earnings
     const creatorEarnings = creatorViews.map(cv => {
       const views = cv._count.id;
       const viewShare = views / totalViews;
       const grossEarnings = totalRevenue * viewShare;
       const platformFee = grossEarnings * 0.30; // 30% platform fee
       const netEarnings = grossEarnings * 0.70; // 70% to creator
       
       return {
         creatorId: cv.creatorId,
         views,
         viewShare,
         grossEarnings,
         platformFee,
         netEarnings
       };
     });
     
     return {
       month: new Date(year, month - 1, 1),
       totalRevenue,
       totalViews,
       creatorEarnings
     };
   }
   ```

3. Create app/api/admin/revenue/calculate/route.ts:
   - POST endpoint with year, month, totalRevenue
   - Verify admin role
   - Call calculateMonthlyRevenue function
   - Create Revenue record
   - Create CreatorEarning records for each creator
   - Prevent duplicate calculations (check if already calculated)
   - Return calculation summary

4. Create app/api/admin/revenue/manual/route.ts:
   - POST endpoint for manual revenue entry
   - Use when AdSense API not available
   - Input: month, totalRevenue
   - Call calculation function
   - Return success

5. Create app/admin/revenue/page.tsx:
   - Revenue management dashboard
   
   Current Month Card:
   - Total revenue (manual input or API)
   - Total views
   - Revenue per view
   - "Calculate Earnings" button
   
   Revenue History Table:
   - Month, Total Revenue, Total Views, Creators Paid, Status
   - Actions: View Details, Recalculate (if not paid)
   
   Manual Entry Form:
   - Month picker
   - Revenue amount input (from AdSense)
   - "Calculate & Distribute" button
   
   AdSense Integration:
   - Connect AdSense API (optional)
   - Auto-import revenue data
   - Verification step before calculation

6. Create app/admin/revenue/[revenueId]/page.tsx:
   - Detailed revenue breakdown page
   - Show: total revenue, total views, calculation date
   - Table of creator earnings:
     * Creator name
     * Views count
     * View share %
     * Gross earnings
     * Platform fee
     * Net earnings
     * Payout status
   - Export as CSV button
   - "Process Payouts" button (if not paid)

7. Create app/api/creator/earnings/route.ts:
   - GET endpoint for creator to view their earnings
   - Verify creator role
   - Return list of earnings by month:
     * Month
     * Views
     * Earnings (net)
     * Payout status
     * Total lifetime earnings

8. Create app/dashboard/creator/earnings/page.tsx:
   - Creator earnings dashboard
   
   Overview Cards:
   - This Month Earnings (pending)
   - Total Lifetime Earnings
   - Available for Payout
   - Next Payout Date
   
   Earnings History:
   - Table: Month, Views, Earnings, Status
   - Filter by: Year, Status (Pending/Paid)
   
   Performance Metrics:
   - Earnings trend chart (last 6 months)
   - Views to earnings correlation
   - Best performing content by revenue

9. Create lib/revenue-scheduler.ts:
   - Cron job to auto-calculate monthly
   - Runs on 1st of each month
   - Calculates previous month's earnings
   - Sends notifications to creators
   - Use Vercel Cron or external scheduler

10. Add minimum payout threshold:
    - Creators must earn $50+ to receive payout
    - If under $50, earnings roll over to next month
    - Display pending balance clearly

11. Create earnings notification system:
    - Email creators when earnings calculated
    - Include: amount earned, views, payout date
    - Link to detailed breakdown

12. Add dispute resolution:
    - Creators can flag discrepancies
    - Admin review process
    - Recalculation if needed

Use TypeScript strict mode.
Add comprehensive error handling.
Log all calculations for audit trail.
```

## ✅ Verification Steps

```bash
pnpm dev

# 1. Simulate monthly revenue:
# As admin, go to /admin/revenue

# 2. Enter manual revenue:
# - Select month: "January 2024"
# - Enter revenue: $1000
# - Click "Calculate & Distribute"

# 3. Check calculation:
# - Should show success message
# - View details page
# - Check creator earnings table
# - Verify math:
#   * Creator views / Total views = View share %
#   * Total revenue * View share = Gross earnings
#   * Gross earnings * 0.70 = Net earnings

# 4. Test creator view:
# - As creator, go to /dashboard/creator/earnings
# - Should see calculated earnings
# - Check status shows "Pending"

# 5. Verify database:
npx prisma studio
# - Check Revenue record created
# - Check CreatorEarning records
# - Verify calculations are correct

# 6. Test recalculation:
# - Try recalculating same month
# - Should show error: "Already calculated"

# 7. Test minimum threshold:
# - Creator with < $50 earnings
# - Should show "Below minimum payout"
# - Earnings carry over to next month
```

## 🐛 Troubleshooting

**Issue:** Calculation returns $0 for all creators
```bash
# Check views exist for that month
prisma.view.count()

# Check creatorId is set on views
# Verify date ranges are correct
```

**Issue:** Math doesn't add up
```typescript
// Verify formula:
// totalRevenue = $1000
// totalViews = 100
// creatorViews = 20
// Expected: $1000 * (20/100) * 0.70 = $140
```

**Issue:** Performance slow with many creators
```bash
# Add database indexes
# Use batch processing for large calculations
# Consider running async job
```

## 💡 Formula Reference

```
Creator Net Earnings = 
  (Total Platform Revenue) × 
  (Creator Views / Total Platform Views) × 
  0.70

Example:
- Platform earned: $10,000
- Total views: 100,000
- Creator A views: 5,000
- Creator A share: 5,000 / 100,000 = 5%
- Creator A gross: $10,000 × 0.05 = $500
- Platform fee (30%): $500 × 0.30 = $150
- Creator A net: $500 × 0.70 = $350
```

## 📝 Commit

```bash
git add .
git commit -m "feat: add revenue calculation engine"
```

---

# TASK 20: Payment Processing

**Time:** 10 hours  
**Difficulty:** ⭐⭐⭐⭐⭐ Very High

## 🎯 Objective

Integrate Stripe Connect to payout earnings to creators.

## 📦 New Dependencies

```bash
pnpm add stripe @stripe/stripe-js
```

## 📋 Environment Variables

```bash
# Add to .env
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

## 📋 Database Schema Updates

```prisma
model User {
  // ... existing fields ...
  
  // Stripe Connect
  stripeAccountId    String? @unique
  stripeOnboarded    Boolean @default(false)
  stripeDetailsSubmitted Boolean @default(false)
  stripeChargesEnabled   Boolean @default(false)
  stripePayoutsEnabled   Boolean @default(false)
  
  payouts        Payout[]
  
  // ... rest of fields ...
}

model Payout {
  id              String   @id @default(cuid())
  
  creatorId       String
  creator         User     @relation(fields: [creatorId], references: [id])
  
  // Amount
  amount          Float    // Amount in dollars
  currency        String   @default("usd")
  
  // Stripe
  stripePayoutId  String?  @unique
  stripeTransferId String? @unique
  
  // Status
  status          PayoutStatus @default(PENDING)
  failureReason   String?
  
  // Earnings included
  earningIds      String[] // Array of CreatorEarning IDs
  
  // Timestamps
  initiatedAt     DateTime @default(now())
  completedAt     DateTime?
  failedAt        DateTime?
  
  @@index([creatorId, status])
  @@index([status, initiatedAt])
}

enum PayoutStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
  CANCELLED
}

// Update CreatorEarning
model CreatorEarning {
  // ... existing fields ...
  
  payoutId      String?
  payout        Payout?  @relation(fields: [payoutId], references: [id])
  
  // ... rest of fields ...
}
```

## 🤖 Claude Code Prompt

```
Integrate Stripe Connect for creator payouts:

1. Install Stripe and update schema:
   pnpm add stripe @stripe/stripe-js
   Update prisma/schema.prisma with Payout model
   npx prisma generate
   npx prisma db push

2. Create lib/stripe.ts:
   ```typescript
   import Stripe from 'stripe';
   
   export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
     apiVersion: '2023-10-16',
   });
   
   // Create Stripe Connect account for creator
   export async function createConnectAccount(userId: string, email: string) {
     const account = await stripe.accounts.create({
       type: 'express',
       email,
       capabilities: {
         transfers: { requested: true },
       },
     });
     
     return account.id;
   }
   
   // Create account link for onboarding
   export async function createAccountLink(accountId: string, refreshUrl: string, returnUrl: string) {
     const accountLink = await stripe.accountLinks.create({
       account: accountId,
       refresh_url: refreshUrl,
       return_url: returnUrl,
       type: 'account_onboarding',
     });
     
     return accountLink.url;
   }
   
   // Send payout to creator
   export async function createPayout(accountId: string, amount: number) {
     const transfer = await stripe.transfers.create({
       amount: Math.round(amount * 100), // Convert to cents
       currency: 'usd',
       destination: accountId,
     });
     
     return transfer;
   }
   ```

3. Create app/api/stripe/connect/setup/route.ts:
   - POST endpoint to start Stripe Connect onboarding
   - Verify creator role
   - Create Stripe Connect account if doesn't exist
   - Generate account link
   - Return onboarding URL

4. Create app/api/stripe/connect/refresh/route.ts:
   - GET endpoint for refreshing onboarding
   - Generate new account link
   - Return URL

5. Create app/api/stripe/connect/complete/route.ts:
   - GET endpoint (redirect destination after onboarding)
   - Verify Stripe account setup
   - Update User: stripeOnboarded = true
   - Redirect to earnings dashboard

6. Create app/dashboard/creator/payout-setup/page.tsx:
   - Payout setup page for creators
   
   If not onboarded:
   - Explanation of Stripe Connect
   - "Connect Stripe Account" button
   - Click → calls /api/stripe/connect/setup
   - Redirects to Stripe onboarding
   
   If onboarded:
   - ✓ Stripe Connected
   - Bank account info (last 4 digits)
   - "Update Payment Details" button
   - Payout schedule: Monthly on 5th

7. Create app/api/admin/payouts/process/route.ts:
   - POST endpoint with revenueId
   - Verify admin role
   - Get all creators with earnings >= $50
   - For each creator:
     * Check Stripe account valid
     * Create Payout record
     * Call stripe.transfers.create
     * Update CreatorEarning: paid = true, payoutId
     * Update Payout: status, stripePayoutId
   - Handle failures gracefully
   - Return summary (successful, failed)

8. Create app/api/admin/payouts/route.ts:
   - GET: list all payouts
   - Filter by: status, creator, date range
   - Return paginated list

9. Create app/admin/payouts/page.tsx:
   - Payout management dashboard
   
   Pending Payouts Card:
   - Creators ready for payout
   - Total amount to be paid
   - "Process All Payouts" button
   
   Payout History Table:
   - Creator, Amount, Status, Date, Stripe ID
   - Actions: View Details, Retry (if failed)
   
   Failed Payouts:
   - Highlight failures
   - Show failure reason
   - Retry button

10. Create app/api/stripe/webhook/route.ts:
    - POST endpoint for Stripe webhooks
    - Verify webhook signature
    - Handle events:
      * transfer.created
      * transfer.paid
      * transfer.failed
      * payout.paid
      * payout.failed
    - Update Payout status accordingly

11. Update app/dashboard/creator/earnings/page.tsx:
    - Add payout setup prompt if not configured
    - Show payout history:
      * Date, Amount, Status, Stripe ID
    - Show pending balance
    - Show next payout date
    - "Request Early Payout" button (if >$100)

12. Create app/api/creator/payout/request/route.ts:
    - POST endpoint for early payout request
    - Verify earnings >= $100
    - Create admin notification
    - Return request confirmation

13. Add tax handling:
    - Create app/dashboard/creator/tax-info/page.tsx
    - Collect: Country, Tax ID (if US: W-9)
    - Store securely (encrypted)
    - Generate 1099 forms at year-end (US creators)

14. Create payout notifications:
    - Email when payout initiated
    - Email when payout completed
    - Email if payout failed
    - Include amount and transaction ID

15. Add payout security:
    - Two-factor auth for payout changes
    - Email verification for new bank accounts
    - Admin approval for large payouts (>$1000)

Configure Stripe webhook:
1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: https://yourdomain.com/api/stripe/webhook
3. Select events: transfer.*, payout.*
4. Copy webhook secret to .env

Use Stripe test mode during development.
Handle all error cases (insufficient funds, invalid account, etc).
Log all payout attempts for audit trail.
```

## ✅ Verification Steps

```bash
pnpm dev

# 1. Creator onboarding:
# - As creator, go to /dashboard/creator/payout-setup
# - Click "Connect Stripe Account"
# - Complete Stripe onboarding (use test mode)
# - Should redirect back with success

# 2. Check Stripe integration:
# - Go to Stripe Dashboard
# - Check Connect → Accounts
# - Should see test connected account

# 3. Process payout (admin):
# - As admin, go to /admin/payouts
# - See creators with pending earnings
# - Click "Process All Payouts"
# - Check Stripe Dashboard → Transfers
# - Should see test transfers

# 4. Verify payout completion:
# - Wait for webhook (or trigger manually in Stripe)
# - Check Payout status updates to COMPLETED
# - Creator should see payout in earnings history

# 5. Test failure handling:
# - Use Stripe test account that fails transfers
# - Process payout
# - Should fail gracefully
# - Show error message
# - Allow retry

# 6. Test webhook:
curl -X POST http://localhost:3000/api/stripe/webhook \
  -H "Content-Type: application/json" \
  -d '{"type":"transfer.paid","data":{...}}'
```

## 🐛 Troubleshooting

**Issue:** Stripe Connect onboarding fails
```bash
# Check Stripe API keys are correct
echo $STRIPE_SECRET_KEY

# Make sure using test keys (sk_test_...)
# Live keys require verified business
```

**Issue:** Transfers fail
```bash
# Check connected account is onboarded
# In Stripe Dashboard: charges_enabled = true

# Check account has valid bank account
# Test mode: use Stripe test bank account
```

**Issue:** Webhook not receiving events
```bash
# Use Stripe CLI for local testing:
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Check webhook secret matches
echo $STRIPE_WEBHOOK_SECRET
```

**Issue:** Payout amount is wrong
```bash
# Verify calculation:
# CreatorEarning.netEarnings should match payout
# Check no duplicates (paid = false only)
```

## ⚠️ Important: Stripe Connect Requirements

For production:
1. **Business verification** - Stripe requires business details
2. **Tax information** - EIN or SSN (US)
3. **Bank account** - For receiving payouts
4. **Identity verification** - ID upload
5. **Terms acceptance** - Stripe Connect agreement

For creators:
- Must complete Stripe onboarding
- Provide bank details
- Verify identity
- Accept terms

## 💰 Fee Structure

Typical costs:
- **Stripe Connect:** 0.5% per transfer (cap at $5)
- **Transfer time:** 2-3 business days
- **Minimum payout:** $50 (recommended)
- **Platform fee:** 30% (your revenue)
- **Creator receives:** 70%

Example payout:
```
Creator earned: $200
Platform fee (30%): $60
Creator net: $140
Stripe fee (0.5%): $0.70
Creator receives: $139.30
```

## 📝 Commit

```bash
git add .
git commit -m "feat: integrate Stripe Connect for creator payouts"
```

---

# TASK 21: Creator Dashboard

**Time:** 5 hours  
**Difficulty:** ⭐⭐⭐ Moderate

## 🎯 Objective

Build comprehensive dashboard for creators to manage content, analytics, and earnings.

## 🤖 Claude Code Prompt

```
Create professional creator dashboard:

1. Create app/dashboard/creator/layout.tsx:
   - Creator-specific layout (different from regular user)
   - Sidebar navigation:
     * Overview (default)
     * My Content
     * Analytics
     * Earnings
     * Followers
     * Settings
   - Top stats bar showing:
     * Total Views
     * Total Followers
     * Monthly Earnings
     * Content Published
   - "Create New Content" button (prominent)

2. Create app/dashboard/creator/page.tsx:
   - Overview dashboard (landing page for creators)
   
   Welcome Section:
   - Personalized greeting: "Welcome back, [Name]!"
   - Quick actions: Create Course, Upload Publication, View Analytics
   
   Performance Summary (4 cards):
   - Views This Month (with trend ↑↓)
   - New Followers (with trend)
   - Earnings This Month (with trend)
   - Content in Review (count)
   
   Recent Activity Timeline:
   - Latest 10 activities:
     * New follower
     * Course published
     * New view on content
     * Earnings calculated
   - Timestamp and details for each
   
   Top Performing Content (table):
   - Title, Views, Engagement, Revenue
   - Top 5 pieces of content
   - Link to full analytics
   
   Quick Stats Chart:
   - Views over last 7 days (line chart)
   - Engagement rate trend
   
   To-Do List:
   - [ ] Complete profile (if incomplete)
   - [ ] Set up payout (if not configured)
   - [ ] Respond to comments (if any)
   - [ ] Review draft content (if any)

3. Create app/dashboard/creator/content/page.tsx:
   - Content management page
   
   Filter Tabs:
   - All, Courses, Publications, Drafts, Under Review, Published, Rejected
   
   Content Grid/List:
   - Toggle view: Grid or List
   - Each item shows:
     * Thumbnail
     * Title
     * Type (Course/Publication)
     * Status badge
     * Views count
     * Earnings (if applicable)
     * Actions: Edit, View, Delete, Analytics
   
   Bulk Actions:
   - Select multiple items
   - Bulk delete, bulk submit for review
   
   Sort & Filter:
   - Sort by: Newest, Oldest, Most Views, Highest Earning
   - Filter by: Category, Status, Date range
   
   "Create New" Button (top right)

4. Create app/dashboard/creator/followers/page.tsx:
   - Follower management page
   
   Overview Card:
   - Total Followers
   - Follower growth (last 30 days)
   - Growth chart
   
   Follower List:
   - Avatar, Name, Specialty, Followed Date
   - View profile button
   - Send message button (future feature)
   - Export CSV button
   
   Demographics:
   - Followers by country (if available)
   - Followers by specialty
   - Pie charts
   
   Engagement Metrics:
   - Average course completions from followers
   - Follower retention rate

5. Update app/dashboard/creator/analytics/page.tsx (from Task 17):
   - Enhance with more features:
   
   Date Range Selector:
   - Last 7 days, 30 days, 90 days, All time, Custom range
   
   Advanced Metrics:
   - Unique viewers vs returning viewers
   - Average time per view
   - Completion rates
   - Drop-off points (where users stop watching)
   
   Content Performance Comparison:
   - Side-by-side comparison of 2 pieces of content
   - Metric selector
   
   Export Data:
   - Export analytics as CSV or PDF
   - Include charts in PDF

6. Create app/dashboard/creator/settings/page.tsx:
   - Creator settings page
   
   Tabs:
   - Profile
   - Notifications
   - Privacy
   - Payout
   
   Profile Tab:
   - Edit: bio, avatar, specialty, social links
   - Preview public profile
   - Save changes
   
   Notifications Tab:
   - Email preferences:
     [ ] New follower
     [ ] New course view
     [ ] Earnings calculated
     [ ] Course approved/rejected
     [ ] Comments on content
   - Push notification settings (future)
   
   Privacy Tab:
   - [ ] Show email publicly
   - [ ] Allow followers to see my activity
   - [ ] Include me in creator directory
   
   Payout Tab:
   - Link to payout setup
   - Minimum payout threshold preference
   - Payout schedule preference

7. Create components/CreatorStatCard.tsx:
   - Reusable stat card component
   - Props: icon, value, label, trend, trendDirection
   - Shows trend arrow (up/down) and percentage
   - Color coding: green (up), red (down)

8. Create components/ActivityTimeline.tsx:
   - Activity feed component
   - Props: activities (array)
   - Shows icon, message, timestamp
   - Relative time (e.g., "2 hours ago")
   - Click to navigate to related item

9. Create app/api/creator/dashboard/stats/route.ts:
   - GET endpoint for dashboard stats
   - Return:
     * Monthly views (with trend)
     * New followers (with trend)
     * Monthly earnings (with trend)
     * Content counts by status
     * Recent activities
   - Cache for 5 minutes

10. Create app/api/creator/activities/route.ts:
    - GET endpoint for activity feed
    - Return recent activities:
      * Type, message, timestamp, link
    - Paginated (20 per page)

11. Add dashboard onboarding:
    - First-time creator sees onboarding overlay
    - Steps:
      1. Complete your profile
      2. Create your first course
      3. Set up payouts
      4. Share with followers
    - Dismissible
    - Progress indicator

12. Mobile responsive:
    - Sidebar collapses to hamburger on mobile
    - Stats cards stack vertically
    - Charts resize appropriately
    - Touch-friendly interactions

Use Tailwind CSS.
Add loading skeletons for all data.
Use recharts for visualizations.
Implement optimistic UI updates where possible.
```

## ✅ Verification Steps

```bash
pnpm dev

# 1. Creator overview:
# - Login as creator
# - Go to /dashboard/creator
# - Should see personalized dashboard
# - Check all stats display correctly

# 2. Content management:
# - Go to /dashboard/creator/content
# - See all your content
# - Test filters (drafts, published, etc.)
# - Test sorting

# 3. Analytics:
# - Go to /dashboard/creator/analytics
# - See charts render
# - Change date range
# - Export data

# 4. Followers:
# - Go to /dashboard/creator/followers
# - See follower list
# - Check growth chart

# 5. Earnings:
# - Go to /dashboard/creator/earnings
# - See earnings by month
# - Check payout history

# 6. Mobile:
# - Resize browser to mobile
# - Check sidebar collapses
# - All features accessible
# - Touch interactions work

# 7. Navigation:
# - Click through all sidebar links
# - All pages load correctly
# - No broken links
```

## 📝 Commit

```bash
git add .
git commit -m "feat: add comprehensive creator dashboard"
```

---

# TASK 22: Search & Discovery

**Time:** 6 hours  
**Difficulty:** ⭐⭐⭐⭐ High

## 🎯 Objective

Implement advanced search, creator directory, and content recommendation system.

## 📦 New Dependencies (Optional)

```bash
# For advanced search (optional)
pnpm add @meilisearch/instant-meilisearch instantsearch.js
# OR use Postgres full-text search (simpler)
```

## 🤖 Claude Code Prompt

```
Create comprehensive search and discovery features:

1. Create app/search/page.tsx:
   - Global search page
   - Search bar at top
   - Tabs: All, Courses, Creators, Publications
   - Filters sidebar:
     * Category
     * Difficulty
     * CPD Hours range
     * Price range (if applicable)
     * Rating
     * Language
   - Sort options:
     * Relevance (default)
     * Most popular (views)
     * Highest rated
     * Newest first
     * Price: Low to High
   - Results display:
     * Grid or list view toggle
     * Infinite scroll or pagination
     * Highlight matching terms

2. Create app/api/search/route.ts:
   - GET endpoint with query params
   - Search across:
     * Course titles and descriptions
     * Creator names and bios
     * Publication titles
   - Use Postgres full-text search:
     ```typescript
     const results = await prisma.course.findMany({
       where: {
         OR: [
           { title: { contains: query, mode: 'insensitive' } },
           { description: { contains: query, mode: 'insensitive' } },
         ],
         published: true,
       },
       include: { creator: true, category: true },
       take: 20,
       skip: (page - 1) * 20,
     });
     ```
   - Apply filters
   - Sort results
   - Return paginated data

3. Create app/creators/page.tsx:
   - Creator directory page
   - Browse all creators
   
   Featured Creators Section:
   - Top 6 creators by followers or earnings
   - Large cards with avatar, name, bio preview
   
   All Creators Grid:
   - Avatar, name, specialty, followers, courses
   - "Follow" button
   - Link to profile
   
   Filter & Sort:
   - Filter by: Specialty, Country
   - Sort by: Most Followers, Most Courses, Newest, A-Z
   
   Search Creators:
   - Search by name or specialty
   - Live results

4. Create app/api/creators/directory/route.ts:
   - GET endpoint for creator directory
   - Return creators with:
     * isCreator = true, creatorStatus = APPROVED
     * Include: follower count, course count, total views
   - Filters and sorting
   - Paginated

5. Create app/recommended/page.tsx (requires login):
   - Personalized recommendations
   - "For You" feed
   
   Based on Your Interests:
   - Recommend courses from followed creators
   - Similar to completed courses
   - Trending in your specialty
   
   Popular This Week:
   - Top viewed courses this week
   - Across all categories
   
   New Releases:
   - Recently published courses
   - From creators you follow

6. Create app/api/recommendations/route.ts:
   - GET endpoint for personalized recommendations
   - Algorithm:
     ```typescript
     // 1. Get user's interests (from enrollments)
     const userCategories = await getUserEnrollmentCategories(userId);
     
     // 2. Get followed creators' content
     const followedContent = await getFollowedCreatorsContent(userId);
     
     // 3. Get similar content
     const similarContent = await getSimilarContent(userCategories);
     
     // 4. Get trending content
     const trending = await getTrendingContent();
     
     // 5. Mix and rank
     return rankRecommendations([
       ...followedContent,
       ...similarContent,
       ...trending
     ]);
     ```
   - Return mixed recommendations

7. Update app/(marketing)/page.tsx:
   - Add "Trending Now" section
   - Show top 6 most-viewed courses this week
   - Auto-refresh weekly

8. Create components/SearchBar.tsx:
   - Reusable search component
   - Autocomplete suggestions
   - Recent searches (stored in localStorage)
   - Keyboard navigation (arrow keys)
   - "Search" button or Enter key
   - Props: onSearch, placeholder

9. Add search to navigation:
   - Search icon in header
   - Click opens search modal
   - Or inline search bar
   - Keyboard shortcut: Cmd/Ctrl + K

10. Create app/api/search/suggestions/route.ts:
    - GET endpoint for autocomplete
    - Quick search in course titles
    - Return top 5 matches
    - Fast response (<100ms)

11. Add "Related Content" section:
    - On course detail page
    - Show "Students Also Viewed"
    - Based on:
      * Same category
      * Same creator
      * Similar keywords
    - Display 4-6 related courses

12. Create trending algorithm:
    - Calculate weekly/monthly trends
    - Score based on:
      * View count (weighted by recency)
      * Enrollment count
      * Completion rate
      * Rating
    - Cache trending list
    - Update daily

13. Add search analytics:
    - Track what users search for
    - Popular search terms
    - Failed searches (no results)
    - Use data to improve content

Use Tailwind CSS.
Add loading states for search.
Debounce search input (300ms).
Cache search results (5 minutes).
```

## ✅ Verification Steps

```bash
pnpm dev

# 1. Global search:
# - Go to /search
# - Enter query: "radiology"
# - Should see matching courses, creators
# - Test filters
# - Test sorting

# 2. Autocomplete:
# - Type in search bar
# - See suggestions appear
# - Click suggestion → navigate

# 3. Creator directory:
# - Go to /creators
# - See all approved creators
# - Test filters
# - Follow a creator

# 4. Recommendations:
# - Login as user
# - Go to /recommended
# - Should see personalized content
# - Based on your interests

# 5. Related content:
# - Go to course detail page
# - Scroll to "Related Courses"
# - Should show similar content

# 6. Trending:
# - Go to homepage
# - See "Trending Now" section
# - Should show popular courses

# 7. Search performance:
# - Search should be fast (<1 second)
# - Autocomplete should be instant
# - No lag while typing
```

## 🐛 Troubleshooting

**Issue:** Search is slow
```bash
# Add database indexes
# On Course: title, description
# On User: name, bio

# Or use Meilisearch for fast search
```

**Issue:** Recommendations not working
```bash
# Check user has enrollments
# Check followed creators have content
# Verify algorithm logic
```

**Issue:** Autocomplete not showing
```bash
# Check API endpoint responds
# Verify debounce is working
# Check console for errors
```

## 💡 Advanced: Use Meilisearch

For better search performance:

```bash
# 1. Install Meilisearch
docker run -p 7700:7700 getmeili/meilisearch

# 2. Add to .env
MEILISEARCH_HOST="http://localhost:7700"
MEILISEARCH_KEY="masterKey"

# 3. Index your content
# Create script to sync Prisma data to Meilisearch

# 4. Use Meilisearch for search queries
# Much faster for large datasets
```

## 📝 Commit

```bash
git add .
git commit -m "feat: add search and discovery features"
```

---

# TASK 23: Reviews & Ratings

**Time:** 4 hours  
**Difficulty:** ⭐⭐⭐ Moderate

## 🎯 Objective

Allow users to rate and review courses, helping others make informed decisions.

## 📋 Database Schema Updates

```prisma
model Review {
  id          String   @id @default(cuid())
  
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  courseId    String
  course      Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)
  
  rating      Int      // 1-5 stars
  title       String?
  comment     String?  @db.Text
  
  // Moderation
  reported    Boolean  @default(false)
  hidden      Boolean  @default(false)
  
  // Engagement
  helpful     Int      @default(0)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  responses   ReviewResponse[]
  
  @@unique([userId, courseId]) // One review per user per course
  @@index([courseId, rating])
  @@index([createdAt])
}

model ReviewResponse {
  id        String   @id @default(cuid())
  
  reviewId  String
  review    Review   @relation(fields: [reviewId], references: [id], onDelete: Cascade)
  
  creatorId String
  creator   User     @relation(fields: [creatorId], references: [id])
  
  comment   String   @db.Text
  
  createdAt DateTime @default(now())
  
  @@index([reviewId])
}

// Add to Course model
model Course {
  // ... existing fields ...
  
  reviews       Review[]
  averageRating Float?   @default(0)
  ratingCount   Int      @default(0)
  
  // ... rest of fields ...
}

// Add to User model
model User {
  // ... existing fields ...
  
  reviews         Review[]
  reviewResponses ReviewResponse[]
  
  // ... rest of fields ...
}
```

## 🤖 Claude Code Prompt

```
Create review and rating system:

1. Update prisma/schema.prisma with Review models:
   npx prisma generate
   npx prisma db push

2. Create app/api/reviews/route.ts:
   - POST: Create review
     * Verify user completed course (Enrollment.completedAt exists)
     * Validate rating (1-5)
     * Validate comment length
     * Create Review record
     * Update Course averageRating and ratingCount
     * Send notification to creator
   - GET: Fetch reviews for course
     * Filter by: rating, helpful, recent
     * Sort options
     * Paginated

3. Create app/api/reviews/[id]/route.ts:
   - PUT: Update review (user can edit their own)
   - DELETE: Delete review (user or admin)

4. Create app/api/reviews/[id]/helpful/route.ts:
   - POST: Mark review as helpful
   - Increment helpful count
   - Track who marked it (prevent duplicates)

5. Create app/api/reviews/[id]/respond/route.ts:
   - POST: Creator responds to review
   - Verify creator owns the course
   - Create ReviewResponse record
   - Notify review author

6. Create app/api/reviews/[id]/report/route.ts:
   - POST: Report inappropriate review
   - Set reported = true
   - Send notification to admin
   - Require reason for report

7. Create components/StarRating.tsx:
   - Visual star rating component
   - Two modes: display-only, interactive
   - Props: rating, onChange (optional), size
   - Shows filled/half/empty stars
   - Accessible (keyboard navigation)

8. Create components/ReviewForm.tsx:
   - Form to write a review
   - StarRating component
   - Title input (optional)
   - Comment textarea
   - Character counter (max 1000 chars)
   - Submit button
   - Validation

9. Create components/ReviewCard.tsx:
   - Display a single review
   - Shows: user avatar, name, rating, date
   - Review title and comment
   - "Helpful" button with count
   - Creator response (if exists)
   - Report button
   - Edit/Delete (if own review)

10. Create components/ReviewList.tsx:
    - List of reviews
    - Sort dropdown: Most Helpful, Newest, Highest Rating, Lowest Rating
    - Filter by rating: All, 5★, 4★, 3★, 2★, 1★
    - Pagination
    - "Write a Review" button at top

11. Update app/(marketing)/courses/[slug]/page.tsx:
    - Add "Reviews & Ratings" section
    - Show rating summary:
      * Average rating (large, e.g., "4.7")
      * Total review count
      * Star distribution (5★: 70%, 4★: 20%, etc.)
      * Bar chart visualization
    - ReviewList component
    - "Write a Review" button (if completed course)

12. Create app/dashboard/reviews/page.tsx:
    - User's reviews page
    - List all reviews user has written
    - Edit/delete buttons
    - Course link for each review

13. Create app/dashboard/creator/reviews/page.tsx:
    - Creator's reviews dashboard
    - All reviews on creator's content
    - Filter by: Course, Rating, Reported
    - Respond to reviews
    - See reported reviews
    - Analytics: average rating trend

14. Create app/api/admin/reviews/route.ts:
    - GET: All reviews
    - Filter: Reported, Hidden
    - Admin actions: Hide, Delete

15. Create app/admin/reviews/page.tsx:
    - Admin review moderation
    - Reported reviews list
    - Actions: Hide, Delete, Dismiss Report
    - Review content policy

16. Add rating to course cards:
    - Update CourseCard component
    - Show star rating and review count
    - E.g., "★★★★☆ 4.2 (127 reviews)"

17. Calculate rating statistics:
    - Create lib/reviews.ts
    - Function: updateCourseRating(courseId)
      * Calculate average rating
      * Count total reviews
      * Update Course record
    - Call after every review submission

18. Add review incentives:
    - Badge for first review
    - Badge for 10 reviews
    - Show in user profile

Use Tailwind CSS.
Add loading states.
Implement optimistic updates for "helpful" button.
Sanitize review content (prevent XSS).
```

## ✅ Verification Steps

```bash
pnpm dev

# 1. Write a review:
# - Complete a course
# - Go to course page
# - Click "Write a Review"
# - Rate and comment
# - Submit

# 2. Check review displays:
# - Refresh course page
# - See your review
# - Rating should update

# 3. Test helpful button:
# - Click "Helpful" on a review
# - Count should increment
# - Button should disable

# 4. Creator response:
# - As creator, go to /dashboard/creator/reviews
# - See reviews on your courses
# - Click "Respond"
# - Write response
# - Should appear under review

# 5. Report review:
# - Click "Report" on a review
# - Enter reason
# - Submit
# - Admin should see in /admin/reviews

# 6. Admin moderation:
# - As admin, go to /admin/reviews
# - See reported reviews
# - Hide or delete
# - Verify removed from course page

# 7. Rating stats:
# - Check course page
# - Average rating should be accurate
# - Star distribution should match
```

## 📝 Commit

```bash
git add .
git commit -m "feat: add reviews and ratings system"
```

---

# TASK 24: Email Notifications

**Time:** 3 hours  
**Difficulty:** ⭐⭐ Low-Moderate

## 🎯 Objective

Send email notifications for important events (new follower, course published, earnings, etc.)

## 📦 New Dependencies

```bash
pnpm add resend
# OR
pnpm add @sendgrid/mail
```

## 📋 Environment Variables

```bash
# Add to .env
RESEND_API_KEY="re_..."
# OR
SENDGRID_API_KEY="SG...."

# Email config
EMAIL_FROM="notifications@yoursite.com"
```

## 🤖 Claude Code Prompt

```
Set up email notification system:

1. Choose email service (Resend recommended):
   pnpm add resend
   
2. Create lib/email.ts:
   ```typescript
   import { Resend } from 'resend';
   
   const resend = new Resend(process.env.RESEND_API_KEY);
   
   interface EmailParams {
     to: string;
     subject: string;
     html: string;
   }
   
   export async function sendEmail({ to, subject, html }: EmailParams) {
     try {
       const data = await resend.emails.send({
         from: process.env.EMAIL_FROM!,
         to,
         subject,
         html,
       });
       
       console.log('Email sent:', data);
       return { success: true, data };
     } catch (error) {
       console.error('Email failed:', error);
       return { success: false, error };
     }
   }
   
   // Template functions
   export function newFollowerEmail(followerName: string, creatorName: string) {
     return {
       subject: `${followerName} started following you!`,
       html: `
         <h2>You have a new follower!</h2>
         <p>${followerName} started following you on RadSciCPD.</p>
         <a href="${process.env.NEXT_PUBLIC_URL}/dashboard/followers">View your followers</a>
       `
     };
   }
   
   export function coursePublishedEmail(courseName: string, creatorName: string) {
     return {
       subject: `Your course "${courseName}" is now live!`,
       html: `
         <h2>Congratulations!</h2>
         <p>Your course <strong>${courseName}</strong> has been approved and is now published.</p>
         <a href="${process.env.NEXT_PUBLIC_URL}/courses/${courseSlug}">View your course</a>
       `
     };
   }
   
   export function earningsCalculatedEmail(amount: number, month: string) {
     return {
       subject: `Your earnings for ${month}: $${amount.toFixed(2)}`,
       html: `
         <h2>Earnings Update</h2>
         <p>Your earnings for ${month} have been calculated: <strong>$${amount.toFixed(2)}</strong></p>
         <p>Payout will be processed on the 5th of next month.</p>
         <a href="${process.env.NEXT_PUBLIC_URL}/dashboard/creator/earnings">View earnings</a>
       `
     };
   }
   
   // Add more email templates...
   ```

3. Create app/api/notifications/send/route.ts:
   - Internal endpoint (not public)
   - Called by other API routes
   - Parameters: userId, type, data
   - Fetch user email
   - Check user preferences
   - Generate email content
   - Send via sendEmail function

4. Create email templates in emails/ directory:
   - emails/new-follower.tsx
   - emails/course-published.tsx
   - emails/course-rejected.tsx
   - emails/earnings-calculated.tsx
   - emails/payout-completed.tsx
   - emails/new-review.tsx
   - Use React for templates (Resend supports React)

5. Example email template (emails/new-follower.tsx):
   ```tsx
   import * as React from 'react';
   
   interface NewFollowerEmailProps {
     followerName: string;
     followerAvatar: string;
     creatorName: string;
   }
   
   export const NewFollowerEmail: React.FC<NewFollowerEmailProps> = ({
     followerName,
     followerAvatar,
     creatorName,
   }) => (
     <html>
       <body style={{ fontFamily: 'Arial, sans-serif' }}>
         <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
           <h2>You have a new follower!</h2>
           <img src={followerAvatar} alt={followerName} style={{ width: '64px', borderRadius: '50%' }} />
           <p><strong>{followerName}</strong> started following you.</p>
           <a href={`${process.env.NEXT_PUBLIC_URL}/dashboard/followers`} 
              style={{ 
                display: 'inline-block', 
                padding: '10px 20px', 
                background: '#2563eb', 
                color: 'white', 
                textDecoration: 'none',
                borderRadius: '5px'
              }}>
             View Your Followers
           </a>
         </div>
       </body>
     </html>
   );
   ```

6. Update existing API routes to send emails:
   
   In /api/social/follow/route.ts:
   ```typescript
   // After creating follow
   await sendEmail({
     to: creator.email,
     ...newFollowerEmail(follower.name, creator.name)
   });
   ```
   
   In /api/admin/content/approve/route.ts:
   ```typescript
   // After approving
   await sendEmail({
     to: creator.email,
     ...coursePublishedEmail(course.title, creator.name)
   });
   ```
   
   In /api/admin/revenue/calculate/route.ts:
   ```typescript
   // For each creator
   await sendEmail({
     to: creator.email,
     ...earningsCalculatedEmail(earnings, month)
   });
   ```

7. Create app/dashboard/settings/notifications/page.tsx:
   - Email notification preferences
   - Checkboxes for each notification type:
     [ ] New followers
     [ ] New course views
     [ ] Course approved/rejected
     [ ] Earnings calculated
     [ ] Payout completed
     [ ] New reviews
     [ ] Weekly summary
   - Save to User.emailPreferences (JSON field)

8. Add email preferences to User model:
   ```prisma
   model User {
     // ... existing fields ...
     
     emailPreferences Json? @default("{ \"newFollowers\": true, \"courseApproved\": true, \"earnings\": true, \"payouts\": true, \"reviews\": true, \"weeklySummary\": true }")
     
     // ... rest of fields ...
   }
   ```

9. Create app/api/user/email-preferences/route.ts:
   - GET: Fetch preferences
   - POST: Update preferences
   - Validate structure

10. Implement weekly summary email:
    - Cron job every Monday
    - For each creator:
      * Last week's views
      * New followers
      * Earnings preview
      * Top performing content
    - Send as digest

11. Add unsubscribe functionality:
    - Include unsubscribe link in every email
    - Create app/unsubscribe/[token]/page.tsx
    - Generate secure token
    - Clicking link disables all emails
    - Option to re-subscribe

12. Create lib/email-queue.ts (optional):
    - Queue emails instead of sending immediately
    - Prevents API timeout
    - Background worker processes queue
    - Retry failed emails

13. Add email logging:
    - Log all sent emails
    - Track: recipient, type, sent time, status
    - Useful for debugging

Use React Email for templates (compatible with Resend).
Follow email best practices (plain text alternative, unsubscribe).
Test in development with Resend test mode.
```

## ✅ Verification Steps

```bash
# 1. Sign up for Resend (or SendGrid)
# Go to: https://resend.com
# Get API key
# Add to .env

pnpm dev

# 2. Test email sending:
# - Follow a creator
# - Check creator's email
# - Should receive "New follower" email

# 3. Test preferences:
# - Go to /dashboard/settings/notifications
# - Uncheck "New followers"
# - Follow another creator
# - Should NOT receive email

# 4. Test various notifications:
# - Approve a course (as admin)
# - Creator should get email
# - Calculate earnings
# - Creators should get email

# 5. Check email logs:
# - Resend dashboard shows sent emails
# - Check delivery status

# 6. Test unsubscribe:
# - Click unsubscribe link in email
# - Should disable all emails
# - Verify in database

# Note: In development, emails may go to spam
# Check spam folder if not seeing emails
```

## 🐛 Troubleshooting

**Issue:** Emails not sending
```bash
# Check API key is correct
echo $RESEND_API_KEY

# Check Resend dashboard for errors
# Verify email domain is verified
```

**Issue:** Emails going to spam
```bash
# Add SPF and DKIM records to domain DNS
# Use verified domain in "from" address
# Follow email best practices (no spam words)
```

**Issue:** Template not rendering
```bash
# Check React component syntax
# Test template separately
# Ensure all props are passed correctly
```

## 📝 Commit

```bash
git add .
git commit -m "feat: add email notification system"
```

---

# TASK 25: Legal & Compliance

**Time:** 6 hours  
**Difficulty:** ⭐⭐⭐ Moderate (mostly writing)

## 🎯 Objective

Create legal documents and compliance features required for running the platform.

## 🤖 Claude Code Prompt

```
Create legal pages and compliance features:

1. Create app/legal/terms/page.tsx:
   - Terms of Service page
   - Last updated date
   - Sections to include:
     * Acceptance of Terms
     * User Accounts
     * Creator Agreements
     * Content Rights and Licensing
     * Payment and Refunds (if applicable)
     * Platform Fees (30% to platform)
     * Prohibited Content
     * Intellectual Property
     * DMCA Policy
     * Limitation of Liability
     * Dispute Resolution
     * Termination
     * Changes to Terms
   - Professional layout
   - Table of contents with jump links

2. Create app/legal/privacy/page.tsx:
   - Privacy Policy page
   - GDPR compliant
   - Sections:
     * Information We Collect
     * How We Use Information
     * Cookies and Tracking
     * Third-Party Services (Stripe, Google AdSense)
     * Data Storage and Security
     * User Rights (access, deletion, portability)
     * Children's Privacy
     * International Users
     * Changes to Policy
     * Contact Information

3. Create app/legal/creator-agreement/page.tsx:
   - Creator Agreement / Terms
   - Additional terms specific to creators:
     * Content Ownership
     * Content License to Platform
     * Revenue Sharing (70/30 split)
     * Payment Terms
     * Payout Schedule
     * Minimum Payout Threshold
     * Content Standards
     * Copyright Compliance
     * Warranty and Representations
     * Indemnification
     * Termination

4. Create app/legal/dmca/page.tsx:
   - DMCA (Digital Millennium Copyright Act) Policy
   - Copyright infringement reporting
   - Sections:
     * Notice and Takedown Procedure
     * Counter-Notice
     * Repeat Infringer Policy
     * Contact Information for DMCA Agent
   - Include reporting form

5. Create app/legal/cookies/page.tsx:
   - Cookie Policy
   - Types of cookies used:
     * Essential (authentication, session)
     * Analytics (usage tracking)
     * Advertising (AdSense)
   - How to manage cookies
   - Third-party cookies

6. Create components/CookieConsent.tsx:
   - Cookie consent banner (GDPR requirement)
   - Appears at bottom on first visit
   - Options:
     * Accept All
     * Reject Non-Essential
     * Customize
   - Stores consent in localStorage
   - Respects user choice

7. Create app/legal/dmca/report/page.tsx:
   - DMCA takedown request form
   - Required fields:
     * Your name and contact info
     * Copyright owner (if not you)
     * Description of copyrighted work
     * URL of infringing content
     * Statement of good faith belief
     * Statement under penalty of perjury
     * Electronic signature
   - Submit to /api/legal/dmca/report

8. Create app/api/legal/dmca/report/route.ts:
   - POST endpoint for DMCA reports
   - Save report to database
   - Send email to legal team
   - Auto-notification to content creator
   - 7-day response period

9. Create model for DMCA reports:
   ```prisma
   model DMCAReport {
     id              String   @id @default(cuid())
     
     // Reporter info
     reporterName    String
     reporterEmail   String
     reporterAddress String?
     
     // Copyright owner (if different)
     copyrightOwner  String?
     
     // Infringement details
     workDescription String   @db.Text
     infringingUrl   String
     
     // Legal statements
     goodFaithStatement Boolean
     accuracyStatement  Boolean
     signature          String
     
     // Content being reported
     contentId       String
     contentType     String   // "course" or "publication"
     
     // Status
     status          DMCAStatus @default(PENDING)
     reviewedAt      DateTime?
     resolution      String?   @db.Text
     
     createdAt       DateTime @default(now())
     
     @@index([status])
   }
   
   enum DMCAStatus {
     PENDING
     UNDER_REVIEW
     CONTENT_REMOVED
     DISMISSED
     COUNTER_NOTICE_RECEIVED
   }
   ```

10. Create app/admin/legal/dmca/page.tsx:
    - DMCA reports dashboard for admin
    - List all reports
    - Filter by status
    - Actions:
      * Review report
      * Remove content
      * Dismiss report
      * Notify creator
    - Track response times

11. Create age verification:
    - Add birthdate to signup
    - Verify user is 13+ (COPPA compliance)
    - Block younger users
    - Update User model:
      ```prisma
      model User {
        birthdate     DateTime?
        ageVerified   Boolean @default(false)
      }
      ```

12. Create data export functionality:
    - GDPR "Right to Access"
    - Create app/dashboard/settings/data/page.tsx
    - "Download My Data" button
    - Exports all user data as JSON:
      * Profile info
      * Enrollments
      * Progress
      * Reviews
      * Earnings (if creator)
    - Email download link when ready

13. Create app/api/user/export-data/route.ts:
    - POST endpoint to request export
    - Generate JSON file with all user data
    - Upload to temporary storage
    - Send email with download link
    - Link expires after 7 days

14. Create account deletion:
    - GDPR "Right to be Forgotten"
    - Add to settings page
    - "Delete My Account" button
    - Confirmation modal with warnings
    - For creators: must resolve pending payouts first
    - Anonymize instead of hard delete (keep analytics)

15. Create app/api/user/delete-account/route.ts:
    - POST endpoint
    - Verify user authentication
    - Check no pending payouts (creators)
    - Soft delete:
      * Anonymize personal data
      * Keep aggregated analytics
      * Remove from public view
      * Retain for legal reasons (90 days)
    - Send confirmation email

16. Add consent checkboxes to signup:
    - [ ] I am 13 years or older
    - [ ] I agree to the Terms of Service
    - [ ] I agree to the Privacy Policy
    - [ ] I agree to receive email notifications
    - Required before account creation
    - Store consent timestamp

17. Create footer with legal links:
    - Update app/layout.tsx footer
    - Links to all legal pages:
      * Terms of Service
      * Privacy Policy
      * Cookie Policy
      * DMCA Policy
      * Creator Agreement
      * Contact Us

18. Create audit log system:
    - Track important actions:
      * Account creation
      * Content publication
      * DMCA reports
      * Payouts
      * Admin actions
    - Store logs for 1 year
    - Use for compliance audits

Use clear, simple language in legal docs.
Get legal review before going live.
Update "Last Updated" dates when changed.
Make all legal pages mobile-friendly.
```

## ✅ Verification Steps

```bash
pnpm dev

# 1. Check legal pages exist:
# - Go to /legal/terms
# - Go to /legal/privacy
# - Go to /legal/creator-agreement
# - Go to /legal/dmca
# - Go to /legal/cookies
# - All should load correctly

# 2. Test cookie consent:
# - Visit site in incognito
# - Should see cookie banner
# - Click "Accept All"
# - Refresh - banner should not appear
# - Clear cookies - banner returns

# 3. Test DMCA reporting:
# - Go to /legal/dmca/report
# - Fill out form
# - Submit
# - Check admin panel sees report

# 4. Test data export:
# - Go to /dashboard/settings/data
# - Click "Download My Data"
# - Wait for email
# - Download and verify JSON

# 5. Test account deletion:
# - Go to /dashboard/settings
# - Click "Delete Account"
# - Confirm
# - Account should be deleted/anonymized

# 6. Check signup consent:
# - Go to /signup
# - Try submitting without checking boxes
# - Should show error
# - Check all boxes
# - Should allow signup

# 7. Verify footer links:
# - Check all pages
# - Footer should have legal links
# - All links should work
```

## ⚠️ Important Legal Notes

**Before launching:**
1. **Have a lawyer review all legal docs** - Don't rely solely on templates
2. **GDPR compliance** - Required if you have EU users
3. **COPPA compliance** - If allowing users under 13 (recommend 13+ only)
4. **Tax compliance** - 1099 forms for US creators earning $600+
5. **Business structure** - LLC, Corporation, etc.
6. **Insurance** - Consider cyber liability insurance
7. **Payment processor compliance** - Stripe has requirements
8. **Content moderation** - You're responsible for user content

**DMCA Agent Registration:**
- Register with US Copyright Office
- Cost: $6 per year
- Required if hosting user content
- Provides safe harbor protections

**International Considerations:**
- Different privacy laws (GDPR, CCPA, etc.)
- Tax implications of international creators
- Currency conversion for payouts
- Jurisdictional issues

## 📝 Commit

```bash
git add .
git commit -m "feat: add legal pages and compliance features"
```

---

# 🎉 COMPLETION - All 25 Tasks Done!

Congratulations! You've built a complete creator marketplace platform!

## 📊 What You've Built

### Core Platform (Tasks 1-12):
- ✅ Next.js 14 foundation
- ✅ Database with Prisma
- ✅ Authentication system
- ✅ Course delivery
- ✅ Secure quiz system
- ✅ Certificates
- ✅ Admin panel

### Marketplace Features (Tasks 13-25):
- ✅ Creator accounts
- ✅ Content upload system
- ✅ Content approval workflow
- ✅ Social features (follow system)
- ✅ View tracking & analytics
- ✅ Ad integration
- ✅ Revenue calculation engine
- ✅ Payment processing (Stripe)
- ✅ Creator dashboard
- ✅ Search & discovery
- ✅ Reviews & ratings
- ✅ Email notifications
- ✅ Legal & compliance

## 🚀 Launch Checklist

Before going live:

### Technical:
- [ ] All tests pass
- [ ] Security audit complete
- [ ] Performance optimized
- [ ] Database backed up
- [ ] Monitoring setup (Sentry, etc.)
- [ ] SSL certificate installed
- [ ] Domain configured
- [ ] CDN setup (if needed)

### Legal:
- [ ] Lawyer reviewed legal docs
- [ ] DMCA agent registered
- [ ] Business entity formed
- [ ] Insurance obtained
- [ ] Privacy policy published
- [ ] Terms of service published

### Financial:
- [ ] Stripe account verified (live mode)
- [ ] Bank account connected
- [ ] Tax ID obtained
- [ ] Accounting system setup
- [ ] Payment flow tested

### Marketing:
- [ ] Landing page optimized
- [ ] SEO configured
- [ ] Social media accounts
- [ ] Launch announcement ready
- [ ] Initial creators recruited
- [ ] Beta users invited

## 📈 Next Steps

### Phase 1 (Weeks 1-2):
1. Recruit 10-20 beta creators
2. Have them upload 2-3 courses each
3. Invite 100 beta users
4. Gather feedback

### Phase 2 (Weeks 3-4):
1. Fix critical bugs
2. Improve UX based on feedback
3. Add most-requested features
4. Prepare for public launch

### Phase 3 (Week 5+):
1. Public launch
2. Marketing push
3. Creator recruitment
4. Scale infrastructure
5. Monitor metrics

## 💡 Future Enhancements

Consider adding:
- Mobile apps (React Native)
- Live streaming courses
- Course bundles/subscriptions
- Affiliate program
- Creator collaboration features
- Advanced analytics dashboard
- AI-powered recommendations
- Multi-language support
- White-label option
- API for third-party integrations

## 📊 Key Metrics to Track

### Platform Health:
- Daily Active Users (DAU)
- Monthly Active Users (MAU)
- Course completion rate
- User retention (Day 1, 7, 30)

### Creator Success:
- Active creators
- Average earnings per creator
- Content upload rate
- Creator retention

### Revenue:
- Total platform revenue
- Revenue per user
- Ad revenue
- Platform fee revenue
- Growth rate

### Engagement:
- Views per user
- Time on platform
- Course enrollments
- Review rate
- Follow rate

## 🎯 Monetization Options

Your platform can make money through:

1. **Platform Fee (30%)** - From creator earnings ✅ Already implemented
2. **Subscription Tier** - Premium features for $9.99/month
3. **Featured Listings** - Creators pay to be featured
4. **Certification Programs** - Paid certification exams
5. **Enterprise Plans** - For institutions
6. **Advertising** - Google AdSense ✅ Already implemented
7. **Course Bundles** - Platform-curated course packs
8. **Affiliate Partnerships** - Equipment, books, etc.

## 🔧 Maintenance Schedule

### Daily:
- Monitor error logs
- Check payment processing
- Review reported content

### Weekly:
- Process payouts
- Calculate earnings
- Review analytics
- Backup database

### Monthly:
- Security audit
- Performance review
- Feature prioritization
- Creator surveys

## 📞 Support Resources

- **Stripe Docs**: https://stripe.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **Vercel Docs**: https://vercel.com/docs
- **GDPR Guide**: https://gdpr.eu/
- **COPPA Guide**: https://www.ftc.gov/coppa

## 🎉 You Did It!

You now have a complete, production-ready creator marketplace platform. This is a significant achievement!

**Total Development Time:** ~75-80 hours  
**Lines of Code:** ~15,000+  
**Database Models:** 20+  
**API Endpoints:** 50+  
**Pages:** 40+  
**Components:** 60+

---

**Ready to launch? Let's go! 🚀**

Need help with deployment? Check back to Task 11 for detailed deployment instructions.

Good luck with your platform! 💪
