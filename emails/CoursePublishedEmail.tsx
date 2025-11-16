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

interface CoursePublishedEmailProps {
  courseName: string;
  courseSlug: string;
  creatorName: string;
}

export default function CoursePublishedEmail({
  courseName = 'Your Course',
  courseSlug = '',
  creatorName = 'there',
}: CoursePublishedEmailProps) {
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
  const courseUrl = `${baseUrl}/courses/${courseSlug}`;
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
            {/* Success Icon */}
            <Section style={iconSection}>
              <Text style={successIcon}>✓</Text>
            </Section>

            <Heading style={h1}>Congratulations!</Heading>
            <Heading style={h2}>Your course is now live</Heading>

            <Text style={text}>
              Hi {creatorName},
            </Text>

            <Text style={text}>
              Great news! Your course <strong>"{courseName}"</strong> has been approved and is now published on CPD Platform.
            </Text>

            <Text style={text}>
              Your course is now visible to all users and ready to help healthcare professionals advance their education.
            </Text>

            <Section style={highlightBox}>
              <Text style={highlightText}>
                What happens next?
              </Text>
              <Text style={highlightListItem}>
                • Your course is discoverable in search and categories
              </Text>
              <Text style={highlightListItem}>
                • Your followers will be notified about your new content
              </Text>
              <Text style={highlightListItem}>
                • You'll start earning when users view your course
              </Text>
              <Text style={highlightListItem}>
                • Track performance in your creator dashboard
              </Text>
            </Section>

            <Section style={buttonContainer}>
              <Button style={button} href={courseUrl}>
                View Your Course
              </Button>
            </Section>

            <Text style={text}>
              Thank you for contributing to our community of healthcare professionals!
            </Text>
          </Section>

          {/* Footer */}
          <Hr style={hr} />
          <Section style={footer}>
            <Text style={footerText}>
              You're receiving this email because you have email notifications enabled for course approvals.
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

const iconSection = {
  textAlign: 'center' as const,
  marginTop: '32px',
  marginBottom: '16px',
};

const successIcon = {
  fontSize: '64px',
  color: '#10B981',
  margin: '0',
  lineHeight: '1',
};

const h1 = {
  color: '#1a1a1a',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '16px 0 8px',
  padding: '0',
  textAlign: 'center' as const,
};

const h2 = {
  color: '#10B981',
  fontSize: '20px',
  fontWeight: '600',
  margin: '0 0 24px',
  padding: '0',
  textAlign: 'center' as const,
};

const text = {
  color: '#525252',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
};

const highlightBox = {
  backgroundColor: '#F0FDF4',
  border: '1px solid #BBF7D0',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const highlightText = {
  color: '#166534',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 12px',
};

const highlightListItem = {
  color: '#166534',
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
