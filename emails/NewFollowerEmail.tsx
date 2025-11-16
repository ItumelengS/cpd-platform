import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Button,
  Img,
  Hr,
  Link,
} from '@react-email/components';

interface NewFollowerEmailProps {
  followerName: string;
  followerAvatar?: string;
  creatorName: string;
  followerProfileUrl: string;
}

export default function NewFollowerEmail({
  followerName = 'Someone',
  followerAvatar,
  creatorName = 'there',
  followerProfileUrl = '#',
}: NewFollowerEmailProps) {
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
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
            {/* Follower Avatar */}
            {followerAvatar && (
              <Section style={avatarSection}>
                <Img
                  src={followerAvatar}
                  alt={followerName}
                  style={avatar}
                />
              </Section>
            )}

            <Heading style={h1}>New Follower!</Heading>

            <Text style={text}>
              Hi {creatorName},
            </Text>

            <Text style={text}>
              <strong>{followerName}</strong> just started following you on CPD Platform.
            </Text>

            <Text style={text}>
              This means they're interested in your content and will be notified when you publish new courses or research papers.
            </Text>

            <Section style={buttonContainer}>
              <Button style={button} href={followerProfileUrl}>
                View Profile
              </Button>
            </Section>
          </Section>

          {/* Footer */}
          <Hr style={hr} />
          <Section style={footer}>
            <Text style={footerText}>
              You're receiving this email because you have email notifications enabled for new followers.
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

const avatarSection = {
  textAlign: 'center' as const,
  marginTop: '32px',
  marginBottom: '24px',
};

const avatar = {
  borderRadius: '50%',
  width: '80px',
  height: '80px',
  objectFit: 'cover' as const,
  border: '3px solid #4F46E5',
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
