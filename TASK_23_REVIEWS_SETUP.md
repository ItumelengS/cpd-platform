# Task 23 - Reviews & Ratings Setup Instructions

## Files Created

All files for the Reviews & Ratings feature have been created:

### Library Files
- `lib/reviews.ts` - Helper functions for review management

### API Routes
- `app/api/reviews/route.ts` - POST (create review), GET (fetch reviews)
- `app/api/reviews/[id]/route.ts` - PUT (update review), DELETE (delete review)
- `app/api/reviews/[id]/helpful/route.ts` - POST (mark review as helpful)
- `app/api/reviews/[id]/respond/route.ts` - POST (creator responds to review)
- `app/api/reviews/[id]/report/route.ts` - POST (report inappropriate review)
- `app/api/admin/reviews/route.ts` - GET (admin fetch reviews)
- `app/api/admin/reviews/[id]/route.ts` - PATCH (admin update review)

### Components
- `components/StarRating.tsx` - Visual star rating component
- `components/ReviewForm.tsx` - Form to write a review
- `components/ReviewCard.tsx` - Display a single review
- `components/ReviewList.tsx` - List of reviews with sorting and filtering

### Pages
- `app/(marketing)/courses/[slug]/page.tsx` - UPDATED with reviews section
- `app/dashboard/reviews/page.tsx` - User's reviews page
- `app/dashboard/reviews/DeleteReviewButton.tsx` - Client component for delete
- `app/dashboard/creator/reviews/page.tsx` - Creator's reviews dashboard
- `app/dashboard/creator/reviews/RespondToReviewButton.tsx` - Client component for responses
- `app/admin/reviews/page.tsx` - Admin review moderation
- `app/admin/reviews/AdminReviewActions.tsx` - Client component for admin actions

### Database Schema
- Updated `prisma/schema.prisma` to add `data` field to Notification model

### Dependencies
- Updated `lib/notifications.ts` to add review notification types

## Database Migration Required

After all files are created, you need to run the database migration:

```bash
npx prisma db push
```

Or if you prefer migrations:

```bash
npx prisma migrate dev --name add_notification_data_field
```

This will add the `data` field to the Notification model.

## Dependencies Installed

The following packages have been installed:
- `date-fns` - For date formatting
- `isomorphic-dompurify` - For sanitizing user input to prevent XSS

## Features Implemented

### 1. Review Submission
- Users can only review courses they've completed
- One review per user per course
- Rating required (1-5 stars)
- Optional title (max 100 chars)
- Optional comment (max 1000 chars)
- XSS protection via DOMPurify
- Automatic course rating calculation
- Notification sent to creator

### 2. Review Management
- Users can edit their own reviews
- Users can delete their own reviews
- Admins can delete any review
- Course ratings automatically recalculate on changes

### 3. Review Display
- Star rating visualization
- Rating summary with average and distribution
- Sort by: Most Helpful, Newest, Highest Rating, Lowest Rating
- Filter by rating (1-5 stars)
- Pagination (20 reviews per page)
- Empty states for no reviews

### 4. Creator Features
- View all reviews on their courses
- Filter by course, rating, or reported status
- Respond to reviews
- Dashboard with statistics

### 5. Helpful Marking
- Users can mark reviews as helpful
- Prevents duplicates via localStorage
- Count displayed on reviews

### 6. Review Responses
- Creators can respond to reviews on their courses
- Only one response per review
- Notification sent to review author

### 7. Review Reporting
- Users can report inappropriate reviews
- Requires reason (max 500 chars)
- Notifications sent to all admins
- Flagged in admin dashboard

### 8. Admin Moderation
- View all reviews
- Filter by reported/hidden status
- Hide/show reviews
- Delete reviews
- Dismiss reports
- Statistics dashboard

## Testing Checklist

1. **Review Creation**
   - [ ] User must complete course to review
   - [ ] User can only review once per course
   - [ ] Rating validation (1-5)
   - [ ] Character limits enforced
   - [ ] Creator receives notification

2. **Review Display**
   - [ ] Reviews show correctly on course page
   - [ ] Star ratings display properly
   - [ ] Sorting works (helpful, recent, highest, lowest)
   - [ ] Filtering works (by star rating)
   - [ ] Pagination works

3. **Review Management**
   - [ ] Users can edit their reviews
   - [ ] Users can delete their reviews
   - [ ] Course ratings update automatically

4. **Creator Dashboard**
   - [ ] All reviews on creator's courses visible
   - [ ] Filtering works
   - [ ] Can respond to reviews
   - [ ] Notifications work

5. **Admin Moderation**
   - [ ] Can view all reviews
   - [ ] Can hide/show reviews
   - [ ] Can delete reviews
   - [ ] Can dismiss reports

## Notes

- The course page has been updated to include a reviews section with rating summary and distribution
- All review content is sanitized to prevent XSS attacks
- The helpful feature uses localStorage to prevent duplicate votes (consider server-side tracking for production)
- Review responses are limited to one per review by creators
- Hidden reviews are not counted in course rating calculations

## Future Enhancements

Consider implementing:
- Server-side helpful tracking (requires new table)
- Image uploads in reviews
- Review editing history
- Review quality scoring
- Verified purchase badges
- Review replies (nested comments)
