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

interface PayoutCompletedEmailProps {
  amount: number;
  stripePayoutId: string;
  creatorName: string;
  date: string;
}

export default function PayoutCompletedEmail({
  amount = 0,
  stripePayoutId = 'N/A',
  creatorName = 'there',
  date = new Date().toLocaleDateString(),
}: PayoutCompletedEmailProps) {
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
  const earningsUrl = `${baseUrl}/creator/dashboard/earnings`;
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
              <Text style={successIcon}>💰</Text>
            </Section>

            <Heading style={h1}>Payment Sent!</Heading>

            <Text style={text}>
              Hi {creatorName},
            </Text>

            <Text style={text}>
              Great news! Your payout has been successfully processed and sent to your connected bank account.
            </Text>

            {/* Payment Details */}
            <Section style={paymentBox}>
              <Text style={paymentLabel}>Payment Amount</Text>
              <Text style={paymentAmount}>${amount.toFixed(2)}</Text>
            </Section>

            <Section style={detailsBox}>
              <Text style={detailsTitle}>Transaction Details</Text>
              <Section style={detailRow}>
                <Text style={detailLabel}>Date:</Text>
                <Text style={detailValue}>{date}</Text>
              </Section>
              <Section style={detailRow}>
                <Text style={detailLabel}>Transaction ID:</Text>
                <Text style={detailValue}>{stripePayoutId}</Text>
              </Section>
              <Section style={detailRow}>
                <Text style={detailLabel}>Status:</Text>
                <Text style={statusBadge}>Completed</Text>
              </Section>
            </Section>

            <Section style={infoBox}>
              <Text style={infoTitle}>When will I receive the funds?</Text>
              <Text style={infoText}>
                Funds typically arrive in your bank account within 2-5 business days, depending on your bank's processing time.
              </Text>
              <Text style={infoText}>
                You can track the status of this payout in your Stripe dashboard or by checking your bank account.
              </Text>
            </Section>

            <Section style={buttonContainer}>
              <Button style={button} href={earningsUrl}>
                View Earnings Dashboard
              </Button>
            </Section>

            <Text style={text}>
              Thank you for being a valued creator on CPD Platform. Keep up the great work!
            </Text>

            <Text style={footNote}>
              If you have any questions about this payment, please contact our support team.
            </Text>
          </Section>

          {/* Footer */}
          <Hr style={hr} />
          <Section style={footer}>
            <Text style={footerText}>
              You're receiving this email because you have email notifications enabled for payout updates.
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
  margin: '0',
  lineHeight: '1',
};

const h1 = {
  color: '#1a1a1a',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '16px 0 24px',
  padding: '0',
  textAlign: 'center' as const,
};

const text = {
  color: '#525252',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
};

const paymentBox = {
  backgroundColor: '#10B981',
  borderRadius: '12px',
  padding: '32px 20px',
  margin: '32px 0',
  textAlign: 'center' as const,
};

const paymentLabel = {
  color: '#ECFDF5',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
};

const paymentAmount = {
  color: '#ffffff',
  fontSize: '48px',
  fontWeight: 'bold',
  margin: '8px 0',
  lineHeight: '1',
};

const detailsBox = {
  backgroundColor: '#F9FAFB',
  border: '1px solid #E5E7EB',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const detailsTitle = {
  color: '#1F2937',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 16px',
};

const detailRow = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '12px',
};

const detailLabel = {
  color: '#6B7280',
  fontSize: '14px',
  margin: '0',
  fontWeight: '500',
};

const detailValue = {
  color: '#1F2937',
  fontSize: '14px',
  margin: '0',
  fontWeight: '600',
  wordBreak: 'break-all' as const,
};

const statusBadge = {
  backgroundColor: '#D1FAE5',
  color: '#065F46',
  fontSize: '12px',
  fontWeight: 'bold',
  padding: '4px 12px',
  borderRadius: '12px',
  margin: '0',
  display: 'inline-block',
};

const infoBox = {
  backgroundColor: '#F0F9FF',
  border: '1px solid #BAE6FD',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const infoTitle = {
  color: '#075985',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 12px',
};

const infoText = {
  color: '#0C4A6E',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '8px 0',
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

const footNote = {
  color: '#737373',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '24px 0 0',
  fontStyle: 'italic',
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
