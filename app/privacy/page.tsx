import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy | CPD Platform',
  description: 'Learn how we collect, use, and protect your personal information on the CPD Platform.'
};

export default function PrivacyPolicyPage() {
  const lastUpdated = '2025-11-15';

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-gray-600">
            Last updated: <time dateTime={lastUpdated}>{lastUpdated}</time>
          </p>
        </div>

        {/* Table of Contents */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Table of Contents</h2>
          <nav className="space-y-2">
            <a href="#information-collection" className="block text-blue-600 hover:text-blue-800 hover:underline">
              1. Information We Collect
            </a>
            <a href="#information-use" className="block text-blue-600 hover:text-blue-800 hover:underline">
              2. How We Use Your Information
            </a>
            <a href="#cookies-tracking" className="block text-blue-600 hover:text-blue-800 hover:underline">
              3. Cookies & Tracking Technologies
            </a>
            <a href="#third-party" className="block text-blue-600 hover:text-blue-800 hover:underline">
              4. Third-Party Services
            </a>
            <a href="#data-storage" className="block text-blue-600 hover:text-blue-800 hover:underline">
              5. Data Storage & Security
            </a>
            <a href="#user-rights" className="block text-blue-600 hover:text-blue-800 hover:underline">
              6. Your Rights (GDPR)
            </a>
            <a href="#children" className="block text-blue-600 hover:text-blue-800 hover:underline">
              7. Children's Privacy
            </a>
            <a href="#international" className="block text-blue-600 hover:text-blue-800 hover:underline">
              8. International Users
            </a>
            <a href="#changes" className="block text-blue-600 hover:text-blue-800 hover:underline">
              9. Changes to This Policy
            </a>
            <a href="#contact" className="block text-blue-600 hover:text-blue-800 hover:underline">
              10. Contact Information
            </a>
          </nav>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
          {/* Introduction */}
          <section>
            <p className="text-gray-700 leading-relaxed">
              CPD Platform ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy
              explains how we collect, use, disclose, and safeguard your information when you visit our website
              and use our services. Please read this privacy policy carefully. If you do not agree with the
              terms of this privacy policy, please do not access the site.
            </p>
          </section>

          {/* Section 1 */}
          <section id="information-collection">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Information We Collect</h2>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-4">Personal Information</h3>
            <p className="text-gray-700 mb-3">
              We collect information that you provide directly to us, including:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Name and email address (when you create an account)</li>
              <li>Profile information (bio, avatar, professional credentials)</li>
              <li>Payment information (processed securely through Stripe)</li>
              <li>Course enrollment and progress data</li>
              <li>Communications with us (support tickets, feedback)</li>
              <li>Content you create (if you're a course creator)</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-4">Automatically Collected Information</h3>
            <p className="text-gray-700 mb-3">
              When you access our platform, we automatically collect certain information:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Device information (browser type, operating system, device identifiers)</li>
              <li>Usage data (pages viewed, time spent, clicks, interactions)</li>
              <li>IP address and approximate geographic location</li>
              <li>Referral source and search terms</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section id="information-use">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. How We Use Your Information</h2>
            <p className="text-gray-700 mb-3">We use the information we collect to:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Provide, maintain, and improve our services</li>
              <li>Process transactions and send related information</li>
              <li>Send you technical notices, updates, and security alerts</li>
              <li>Respond to your comments, questions, and customer service requests</li>
              <li>Communicate about courses, features, surveys, news, and events</li>
              <li>Monitor and analyze trends, usage, and activities</li>
              <li>Detect, prevent, and address technical issues and fraudulent activity</li>
              <li>Personalize your learning experience and content recommendations</li>
              <li>Facilitate revenue sharing with course creators</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section id="cookies-tracking">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Cookies & Tracking Technologies</h2>
            <p className="text-gray-700 mb-3">
              We use cookies and similar tracking technologies to track activity on our platform and hold
              certain information. Cookies are files with a small amount of data that are stored on your
              device.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-4">Types of Cookies We Use:</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Essential Cookies:</strong> Required for authentication and core functionality</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our site</li>
              <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
              <li><strong>Advertising Cookies:</strong> Used by Google AdSense to deliver relevant ads</li>
            </ul>

            <p className="text-gray-700 mt-4">
              You can instruct your browser to refuse all cookies or indicate when a cookie is being sent.
              However, if you do not accept cookies, you may not be able to use some portions of our service.
            </p>
          </section>

          {/* Section 4 */}
          <section id="third-party">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Third-Party Services</h2>
            <p className="text-gray-700 mb-3">We use the following third-party services:</p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-4">Stripe (Payment Processing)</h3>
            <p className="text-gray-700 mb-3">
              We use Stripe to process payments securely. When you make a purchase, your payment information
              is transmitted directly to Stripe and is not stored on our servers. Stripe's use of your
              personal information is governed by their privacy policy at{' '}
              <a
                href="https://stripe.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                stripe.com/privacy
              </a>.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-4">Google AdSense (Advertising)</h3>
            <p className="text-gray-700 mb-3">
              We use Google AdSense to display advertisements. Google uses cookies to serve ads based on your
              prior visits to our website or other websites. Google's use of advertising cookies enables it
              and its partners to serve ads based on your visit to our site and/or other sites on the Internet.
            </p>
            <p className="text-gray-700 mb-3">
              You may opt out of personalized advertising by visiting{' '}
              <a
                href="https://www.google.com/settings/ads"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Google Ads Settings
              </a>{' '}
              or{' '}
              <a
                href="http://www.aboutads.info/choices"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                aboutads.info
              </a>.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-4">NextAuth.js (Authentication)</h3>
            <p className="text-gray-700">
              We use NextAuth.js for authentication services. Your authentication data is encrypted and
              stored securely in our database.
            </p>
          </section>

          {/* Section 5 */}
          <section id="data-storage">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Storage & Security</h2>
            <p className="text-gray-700 mb-3">
              We implement appropriate technical and organizational security measures to protect your personal
              information against unauthorized access, alteration, disclosure, or destruction. These measures
              include:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Encryption of data in transit using SSL/TLS</li>
              <li>Encryption of sensitive data at rest</li>
              <li>Regular security assessments and updates</li>
              <li>Access controls and authentication</li>
              <li>Secure database hosting with Prisma ORM</li>
            </ul>
            <p className="text-gray-700 mt-4">
              However, no method of transmission over the Internet or electronic storage is 100% secure.
              While we strive to use commercially acceptable means to protect your personal information,
              we cannot guarantee absolute security.
            </p>
          </section>

          {/* Section 6 */}
          <section id="user-rights">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Your Rights (GDPR)</h2>
            <p className="text-gray-700 mb-3">
              If you are a resident of the European Economic Area (EEA), you have certain data protection
              rights under the General Data Protection Regulation (GDPR):
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Right to Access:</strong> You can request copies of your personal data</li>
              <li><strong>Right to Rectification:</strong> You can request correction of inaccurate data</li>
              <li><strong>Right to Erasure:</strong> You can request deletion of your personal data</li>
              <li><strong>Right to Restrict Processing:</strong> You can request limited processing of your data</li>
              <li><strong>Right to Data Portability:</strong> You can request transfer of your data</li>
              <li><strong>Right to Object:</strong> You can object to processing of your personal data</li>
              <li><strong>Right to Withdraw Consent:</strong> You can withdraw consent at any time</li>
            </ul>
            <p className="text-gray-700 mt-4">
              To exercise these rights, please contact us using the information in the Contact section below.
            </p>
          </section>

          {/* Section 7 */}
          <section id="children">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Children's Privacy</h2>
            <p className="text-gray-700">
              Our service is not directed to individuals under the age of 13. We do not knowingly collect
              personal information from children under 13. If you are a parent or guardian and believe your
              child has provided us with personal information, please contact us. If we discover that a child
              under 13 has provided us with personal information, we will delete such information from our
              servers immediately.
            </p>
          </section>

          {/* Section 8 */}
          <section id="international">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. International Users</h2>
            <p className="text-gray-700">
              Your information may be transferred to and maintained on computers located outside of your
              state, province, country, or other governmental jurisdiction where data protection laws may
              differ. By using our service, you consent to the transfer of your information to our facilities
              and those third parties with whom we share it as described in this privacy policy.
            </p>
          </section>

          {/* Section 9 */}
          <section id="changes">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Changes to This Policy</h2>
            <p className="text-gray-700">
              We may update our Privacy Policy from time to time. We will notify you of any changes by
              posting the new Privacy Policy on this page and updating the "Last updated" date. You are
              advised to review this Privacy Policy periodically for any changes. Changes to this Privacy
              Policy are effective when they are posted on this page.
            </p>
          </section>

          {/* Section 10 */}
          <section id="contact">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Contact Information</h2>
            <p className="text-gray-700 mb-3">
              If you have any questions about this Privacy Policy, please contact us:
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-gray-700"><strong>Email:</strong> privacy@cpdplatform.com</p>
              <p className="text-gray-700"><strong>Address:</strong> CPD Platform Legal Team</p>
              <p className="text-gray-700 mt-2">
                For GDPR-related requests, please include "GDPR Request" in your email subject line.
              </p>
            </div>
          </section>
        </div>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 hover:underline"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
