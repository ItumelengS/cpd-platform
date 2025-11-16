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

interface CourseRejectedEmailProps {
  courseName: string;
  rejectionReason: string;
  creatorName: string;
}

export default function CourseRejectedEmail({
  courseName = 'Your Course',
  rejectionReason = 'No reason provided',
  creatorName = 'there',
}: CourseRejectedEmailProps) {
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
  const dashboardUrl = `${baseUrl}/creator/dashboard/courses`;
  const unsubscribeUrl = `${baseUrl}/unsubscribe`;

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
            <Heading style={h1}>Course Review Update</Heading>

            <Text style={text}>
              Hi {creatorName},
            </Text>

            <Text style={text}>
              Thank you for submitting your course <strong>"{courseName}"</strong> for review.
            </Text>

            <Text style={text}>
              Unfortunately, after careful review, we're unable to approve this course at this time.
            </Text>

            <Section style={reasonBox}>
              <Text style={reasonLabel}>Reason:</Text>
              <Text style={reasonText}>{rejectionReason}</Text>
            </Section>

            <Text style={text}>
              We understand this may be disappointing, but we're here to help! You can make the necessary adjustments and resubmit your course for review.
            </Text>

            <Section style={tipsBox}>
              <Text style={tipsTitle}>Tips for resubmission:</Text>
              <Text style={tipItem}>
                • Review our content guidelines to ensure compliance
              </Text>
              <Text style={tipItem}>
                • Address all points mentioned in the rejection reason
              </Text>
              <Text style={tipItem}>
                • Ensure all sources are properly cited
              </Text>
              <Text style={tipItem}>
                • Check that content is original and educational
              </Text>
            </Section>

            <Section style={buttonContainer}>
              <Button style={button} href={dashboardUrl}>
                Edit Your Course
              </Button>
            </Section>

            <Text style={text}>
              If you have any questions about this decision or need clarification, please don't hesitate to reach out to our support team.
            </Text>

            <Text style={text}>
              We appreciate your contribution to the CPD Platform community and look forward to reviewing your updated submission.
            </Text>
          </Section>

          {/* Footer */}
          <Hr style={hr} />
          <Section style={footer}>
            <Text style={footerText}>
              You're receiving this email because you have email notifications enabled for course reviews.
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

const reasonBox = {
  backgroundColor: '#FEF2F2',
  border: '1px solid #FECACA',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const reasonLabel = {
  color: '#991B1B',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '0 0 8px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
};

const reasonText = {
  color: '#DC2626',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0',
  fontWeight: '500',
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
