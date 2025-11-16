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

interface WeekStats {
  views: number;
  followers: number;
  earnings: number;
  topCourse?: {
    name: string;
    views: number;
    slug: string;
  };
}

interface WeeklySummaryEmailProps {
  creatorName: string;
  weekStats: WeekStats;
}

export default function WeeklySummaryEmail({
  creatorName = 'there',
  weekStats = {
    views: 0,
    followers: 0,
    earnings: 0,
  },
}: WeeklySummaryEmailProps) {
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
  const dashboardUrl = `${baseUrl}/creator/dashboard`;
  const unsubscribeUrl = `${baseUrl}/unsubscribe`;

  // Calculate week range
  const today = new Date();
  const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const weekRange = `${lastWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

  // Determine performance message
  const getPerformanceMessage = () => {
    if (weekStats.views > 100) return 'Outstanding week! 🎉';
    if (weekStats.views > 50) return 'Great progress! 📈';
    if (weekStats.views > 0) return 'Keep it up! 💪';
    return 'Time to create more content! 🚀';
  };

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
            <Heading style={h1}>Your Week at a Glance</Heading>
            <Text style={subtitle}>{weekRange}</Text>

            <Text style={text}>
              Hi {creatorName},
            </Text>

            <Text style={text}>
              Here's a summary of your performance on CPD Platform this week. {getPerformanceMessage()}
            </Text>

            {/* Stats Grid */}
            <Section style={statsGrid}>
              {/* Views */}
              <Section style={statCard}>
                <Text style={statIcon}>👀</Text>
                <Text style={statNumber}>{weekStats.views.toLocaleString()}</Text>
                <Text style={statLabel}>Total Views</Text>
              </Section>

              {/* New Followers */}
              <Section style={statCard}>
                <Text style={statIcon}>👥</Text>
                <Text style={statNumber}>+{weekStats.followers}</Text>
                <Text style={statLabel}>New Followers</Text>
              </Section>

              {/* Earnings */}
              <Section style={statCard}>
                <Text style={statIcon}>💰</Text>
                <Text style={statNumber}>${weekStats.earnings.toFixed(2)}</Text>
                <Text style={statLabel}>Earned This Week</Text>
              </Section>
            </Section>

            {/* Top Performing Content */}
            {weekStats.topCourse && (
              <Section style={topCourseBox}>
                <Text style={topCourseLabel}>🏆 Top Performing Course</Text>
                <Text style={topCourseName}>{weekStats.topCourse.name}</Text>
                <Text style={topCourseViews}>
                  {weekStats.topCourse.views} views this week
                </Text>
              </Section>
            )}

            {/* Insights */}
            <Section style={insightsBox}>
              <Text style={insightsTitle}>Weekly Insights</Text>

              {weekStats.views === 0 ? (
                <>
                  <Text style={insightItem}>
                    • No views this week - consider publishing new content
                  </Text>
                  <Text style={insightItem}>
                    • Promote your courses on social media
                  </Text>
                  <Text style={insightItem}>
                    • Engage with your followers to boost visibility
                  </Text>
                </>
              ) : (
                <>
                  {weekStats.views > 0 && (
                    <Text style={insightItem}>
                      • Your content reached {weekStats.views} {weekStats.views === 1 ? 'person' : 'people'} this week
                    </Text>
                  )}
                  {weekStats.followers > 0 && (
                    <Text style={insightItem}>
                      • {weekStats.followers} new {weekStats.followers === 1 ? 'follower' : 'followers'} joined your community
                    </Text>
                  )}
                  {weekStats.earnings > 0 && (
                    <Text style={insightItem}>
                      • You earned ${weekStats.earnings.toFixed(2)} from content views
                    </Text>
                  )}
                  {weekStats.topCourse && (
                    <Text style={insightItem}>
                      • "{weekStats.topCourse.name}" was your most popular course
                    </Text>
                  )}
                </>
              )}
            </Section>

            {/* Tips */}
            <Section style={tipsBox}>
              <Text style={tipsTitle}>Tips to Grow Your Audience</Text>
              <Text style={tipItem}>
                📝 Publish consistently - aim for at least 1 new course per month
              </Text>
              <Text style={tipItem}>
                🎯 Use relevant keywords in your course titles and descriptions
              </Text>
              <Text style={tipItem}>
                💬 Respond to reviews to build engagement
              </Text>
              <Text style={tipItem}>
                📊 Check your analytics to understand what content performs best
              </Text>
            </Section>

            <Section style={buttonContainer}>
              <Button style={button} href={dashboardUrl}>
                View Full Dashboard
              </Button>
            </Section>

            <Text style={text}>
              Keep creating valuable content, and thank you for being part of CPD Platform!
            </Text>
          </Section>

          {/* Footer */}
          <Hr style={hr} />
          <Section style={footer}>
            <Text style={footerText}>
              You're receiving this weekly summary because you have email notifications enabled.
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
  margin: '24px 0 8px',
  padding: '0',
  textAlign: 'center' as const,
};

const subtitle = {
  color: '#737373',
  fontSize: '14px',
  margin: '0 0 24px',
  textAlign: 'center' as const,
};

const text = {
  color: '#525252',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
};

const statsGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '16px',
  margin: '32px 0',
};

const statCard = {
  backgroundColor: '#F9FAFB',
  border: '1px solid #E5E7EB',
  borderRadius: '8px',
  padding: '20px 12px',
  textAlign: 'center' as const,
};

const statIcon = {
  fontSize: '32px',
  margin: '0 0 8px',
};

const statNumber = {
  color: '#4F46E5',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '8px 0',
  lineHeight: '1',
};

const statLabel = {
  color: '#6B7280',
  fontSize: '12px',
  margin: '8px 0 0',
  fontWeight: '500',
};

const topCourseBox = {
  backgroundColor: '#FEF3C7',
  border: '2px solid #F59E0B',
  borderRadius: '12px',
  padding: '24px',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const topCourseLabel = {
  color: '#92400E',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '0 0 12px',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
};

const topCourseName = {
  color: '#78350F',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '12px 0 8px',
};

const topCourseViews = {
  color: '#92400E',
  fontSize: '14px',
  margin: '8px 0 0',
};

const insightsBox = {
  backgroundColor: '#F0FDF4',
  border: '1px solid #BBF7D0',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const insightsTitle = {
  color: '#166534',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 12px',
};

const insightItem = {
  color: '#166534',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '4px 0',
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
