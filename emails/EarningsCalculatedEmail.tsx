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

interface EarningsCalculatedEmailProps {
  amount: number;
  month: number;
  year: number;
  creatorName: string;
  detailsUrl: string;
}

export default function EarningsCalculatedEmail({
  amount = 0,
  month = 1,
  year = new Date().getFullYear(),
  creatorName = 'there',
  detailsUrl = '#',
}: EarningsCalculatedEmailProps) {
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
  const unsubscribeUrl = `${baseUrl}/unsubscribe`;

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthName = monthNames[month - 1] || 'Unknown';

  // Payout date is 5th of next month
  const payoutDate = new Date(year, month, 5);
  const payoutDateStr = payoutDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

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
            <Heading style={h1}>Your Earnings Are Ready!</Heading>

            <Text style={text}>
              Hi {creatorName},
            </Text>

            <Text style={text}>
              Your earnings for <strong>{monthName} {year}</strong> have been calculated.
            </Text>

            {/* Earnings Amount */}
            <Section style={earningsBox}>
              <Text style={earningsLabel}>Total Earnings</Text>
              <Text style={earningsAmount}>${amount.toFixed(2)}</Text>
              <Text style={earningsPeriod}>{monthName} {year}</Text>
            </Section>

            {amount >= 50 ? (
              <>
                <Section style={infoBox}>
                  <Text style={infoTitle}>Payout Information</Text>
                  <Text style={infoText}>
                    <strong>Payout Date:</strong> {payoutDateStr}
                  </Text>
                  <Text style={infoText}>
                    Your earnings will be automatically transferred to your connected Stripe account on the 5th of next month.
                  </Text>
                </Section>
              </>
            ) : (
              <>
                <Section style={warningBox}>
                  <Text style={warningTitle}>Minimum Payout Not Met</Text>
                  <Text style={warningText}>
                    You need to earn at least <strong>$50.00</strong> to receive a payout. Your current earnings of <strong>${amount.toFixed(2)}</strong> will roll over to next month.
                  </Text>
                  <Text style={warningText}>
                    Keep creating great content to reach the minimum threshold!
                  </Text>
                </Section>
              </>
            )}

            <Section style={statsBox}>
              <Text style={statsTitle}>What this means:</Text>
              <Text style={statsItem}>
                • These earnings are from views on your content during {monthName}
              </Text>
              <Text style={statsItem}>
                • After platform fees (30%), you keep 70% of generated revenue
              </Text>
              {amount >= 50 && (
                <Text style={statsItem}>
                  • Automatic payout on {payoutDateStr} (5th of next month)
                </Text>
              )}
              <Text style={statsItem}>
                • View detailed analytics in your creator dashboard
              </Text>
            </Section>

            <Section style={buttonContainer}>
              <Button style={button} href={detailsUrl}>
                View Detailed Analytics
              </Button>
            </Section>

            <Text style={text}>
              Thank you for contributing valuable content to the CPD Platform community!
            </Text>
          </Section>

          {/* Footer */}
          <Hr style={hr} />
          <Section style={footer}>
            <Text style={footerText}>
              You're receiving this email because you have email notifications enabled for earnings updates.
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

const earningsBox = {
  backgroundColor: '#F0FDF4',
  border: '2px solid #10B981',
  borderRadius: '12px',
  padding: '32px 20px',
  margin: '32px 0',
  textAlign: 'center' as const,
};

const earningsLabel = {
  color: '#166534',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
};

const earningsAmount = {
  color: '#10B981',
  fontSize: '48px',
  fontWeight: 'bold',
  margin: '8px 0',
  lineHeight: '1',
};

const earningsPeriod = {
  color: '#166534',
  fontSize: '16px',
  margin: '8px 0 0',
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

const warningBox = {
  backgroundColor: '#FFFBEB',
  border: '1px solid #FDE68A',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const warningTitle = {
  color: '#92400E',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 12px',
};

const warningText = {
  color: '#B45309',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '8px 0',
};

const statsBox = {
  backgroundColor: '#F9FAFB',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const statsTitle = {
  color: '#1F2937',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 12px',
};

const statsItem = {
  color: '#4B5563',
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
