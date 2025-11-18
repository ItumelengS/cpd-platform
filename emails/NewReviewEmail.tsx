import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Button,
  Hr,
  Link,
} from '@react-email/components';

interface NewReviewEmailProps {
  reviewerName: string;
  rating: number;
  comment?: string;
  courseName: string;
  courseSlug: string;
  reviewUrl: string;
}

export default function NewReviewEmail({
  reviewerName = 'A user',
  rating = 5,
  comment = '',
  courseName = 'Your Course',
  courseSlug = '',
  reviewUrl = '#',
}: NewReviewEmailProps) {
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
  const unsubscribeUrl = `${baseUrl}/unsubscribe`;

  // Generate star rating visual
  const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);

  // Truncate comment if too long
  const displayComment = comment && comment.length > 150
    ? comment.substring(0, 150) + '...'
    : comment;

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          {/* Header with Logo */}
          <Section style={header}>
            <Heading style={logo}>CPD Platform</Heading>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Heading style={h1}>New Review Received!</Heading>

            <Text style={text}>
              Great news! Someone just reviewed your course.
            </Text>

            {/* Course Info */}
            <Section style={courseBox}>
              <Text style={courseLabel}>Course</Text>
              <Text style={courseNameStyle}>{courseName}</Text>
            </Section>

            {/* Rating */}
            <Section style={ratingBox}>
              <Text style={ratingStars}>{stars}</Text>
              <Text style={ratingText}>{rating} out of 5 stars</Text>
              <Text style={reviewerText}>by {reviewerName}</Text>
            </Section>

            {/* Review Comment */}
            {displayComment && (
              <Section style={commentBox}>
                <Text style={commentLabel}>Review:</Text>
                <Text style={commentText}>"{displayComment}"</Text>
              </Section>
            )}

            <Section style={tipsBox}>
              <Text style={tipsTitle}>Engage with your reviewer:</Text>
              <Text style={tipItem}>
                • Thank them for their feedback
              </Text>
              <Text style={tipItem}>
                • Respond to their review to show you value their input
              </Text>
              <Text style={tipItem}>
                • Use constructive feedback to improve your content
              </Text>
              <Text style={tipItem}>
                • Positive reviews help boost your course visibility
              </Text>
            </Section>

            <Section style={buttonContainer}>
              <Button style={button} href={reviewUrl}>
                View Full Review
              </Button>
            </Section>

            <Text style={text}>
              Reviews help build trust with potential students. Keep creating great content!
            </Text>
          </Section>

          {/* Footer */}
          <Hr style={hr} />
          <Section style={footer}>
            <Text style={footerText}>
              You're receiving this email because you have email notifications enabled for new reviews.
            </Text>
            <Text style={footerText}>
              <Link href={`${baseUrl}/dashboard/settings/notifications`} style={link}>
                Manage email preferences
              </Link>
              {' | '}
              <Link href={unsubscribeUrl} style={link}>
                Unsubscribe
              </Link>
            </Text>
            <Text style={footerCopyright}>
              © {new Date().getFullYear()} CPD Platform. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const header = {
  padding: '32px 20px',
  textAlign: 'center' as const,
  backgroundColor: '#4F46E5',
};

const logo = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0',
};

const content = {
  padding: '0 48px',
};

const h1 = {
  color: '#1a1a1a',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '24px 0',
  padding: '0',
  textAlign: 'center' as const,
};

const text = {
  color: '#525252',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
};

const courseBox = {
  backgroundColor: '#F9FAFB',
  borderRadius: '8px',
  padding: '16px 20px',
  margin: '24px 0 16px',
  textAlign: 'center' as const,
};

const courseLabel = {
  color: '#6B7280',
  fontSize: '12px',
  fontWeight: '600',
  margin: '0',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
};

const courseNameStyle = {
  color: '#1F2937',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '8px 0 0',
};

const ratingBox = {
  backgroundColor: '#FEF3C7',
  border: '2px solid #F59E0B',
  borderRadius: '12px',
  padding: '24px 20px',
  margin: '16px 0 24px',
  textAlign: 'center' as const,
};

const ratingStars = {
  color: '#F59E0B',
  fontSize: '36px',
  margin: '0',
  lineHeight: '1',
  letterSpacing: '4px',
};

const ratingText = {
  color: '#92400E',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '12px 0 4px',
};

const reviewerText = {
  color: '#78350F',
  fontSize: '14px',
  margin: '4px 0 0',
};

const commentBox = {
  backgroundColor: '#F9FAFB',
  border: '1px solid #E5E7EB',
  borderLeft: '4px solid #4F46E5',
  borderRadius: '4px',
  padding: '20px',
  margin: '24px 0',
};

const commentLabel = {
  color: '#6B7280',
  fontSize: '12px',
  fontWeight: '600',
  margin: '0 0 8px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
};

const commentText = {
  color: '#1F2937',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0',
  fontStyle: 'italic',
};

const tipsBox = {
  backgroundColor: '#F0F9FF',
  border: '1px solid #BAE6FD',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const tipsTitle = {
  color: '#075985',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 12px',
};

const tipItem = {
  color: '#0C4A6E',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '4px 0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  marginTop: '32px',
  marginBottom: '32px',
};

const button = {
  backgroundColor: '#4F46E5',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px',
};

const hr = {
  borderColor: '#e6e6e6',
  margin: '32px 0',
};

const footer = {
  padding: '0 48px',
};

const footerText = {
  color: '#737373',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '8px 0',
  textAlign: 'center' as const,
};

const link = {
  color: '#4F46E5',
  textDecoration: 'underline',
};

const footerCopyright = {
  color: '#a3a3a3',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '16px 0 0',
  textAlign: 'center' as const,
};
