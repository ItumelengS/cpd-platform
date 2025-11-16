import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy | CPD Platform',
  description: 'Privacy Policy for the CPD Platform',
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-gray-600">Last Updated: November 15, 2025</p>
          <p className="text-gray-600 mt-2">
            <Link href="/" className="text-blue-600 hover:underline">
              Return to Home
            </Link>
          </p>
        </div>

        {/* GDPR Notice */}
        <div className="bg-blue-50 border-l-4 border-blue-600 p-6 mb-8 rounded-r-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Privacy Rights</h3>
          <p className="text-gray-700">
            We are committed to protecting your privacy and complying with GDPR and other data protection laws.
            You have the right to access, correct, delete, and control how your personal data is used.
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
            <div className="text-gray-700 space-y-4">
              <p>
                Welcome to CPD Platform. This Privacy Policy explains how we collect, use, disclose, and safeguard
                your information when you use our platform. Please read this privacy policy carefully.
              </p>
              <p>
                By using the Platform, you agree to the collection and use of information in accordance with this policy.
                If you do not agree with our policies and practices, do not use the Platform.
              </p>
            </div>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Information We Collect</h2>
            <div className="text-gray-700 space-y-4">
              <p className="font-semibold">1. Personal Information You Provide</p>
              <p>We collect information that you voluntarily provide when you:</p>
              <ul className="list-disc pl-8 space-y-2">
                <li>Create an account (name, email, password)</li>
                <li>Complete your profile (specialty, institution, country, bio)</li>
                <li>Apply to become a creator (CV, motivation, expertise)</li>
                <li>Make a purchase (payment information via Stripe)</li>
                <li>Contact us or submit feedback</li>
                <li>Post reviews or comments</li>
              </ul>

              <p className="font-semibold mt-6">2. Information Collected Automatically</p>
              <p>When you use the Platform, we automatically collect:</p>
              <ul className="list-disc pl-8 space-y-2">
                <li>Usage data (courses viewed, time spent, progress)</li>
                <li>Device information (browser type, operating system)</li>
                <li>IP address and location data (country/city level)</li>
                <li>Cookies and similar tracking technologies</li>
                <li>Referral source (how you found our platform)</li>
              </ul>

              <p className="font-semibold mt-6">3. Information from Third Parties</p>
              <p>We may receive information from:</p>
              <ul className="list-disc pl-8 space-y-2">
                <li>Payment processors (Stripe) for transaction processing</li>
                <li>Analytics providers (Google Analytics)</li>
                <li>Advertising partners (Google AdSense)</li>
              </ul>
            </div>
          </section>

          {/* How We Use Your Information */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Use Your Information</h2>
            <div className="text-gray-700 space-y-4">
              <p>We use the information we collect to:</p>
              <ul className="list-disc pl-8 space-y-2">
                <li>Provide, operate, and maintain the Platform</li>
                <li>Process your enrollments and track your progress</li>
                <li>Generate and deliver certificates</li>
                <li>Process payments and manage creator payouts</li>
                <li>Send you important updates and notifications</li>
                <li>Respond to your inquiries and provide customer support</li>
                <li>Improve and personalize your experience</li>
                <li>Analyze usage patterns and optimize the Platform</li>
                <li>Display relevant advertisements (with your consent)</li>
                <li>Prevent fraud and ensure security</li>
                <li>Comply with legal obligations</li>
              </ul>
            </div>
          </section>

          {/* Legal Basis for Processing */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Legal Basis for Processing (GDPR)</h2>
            <div className="text-gray-700 space-y-4">
              <p>Under GDPR, we process your personal data based on:</p>
              <ul className="list-disc pl-8 space-y-2">
                <li><strong>Contract:</strong> Processing necessary to fulfill our contract with you (providing courses, certificates)</li>
                <li><strong>Consent:</strong> Marketing communications, cookies, and personalized advertising (you can withdraw consent at any time)</li>
                <li><strong>Legitimate Interest:</strong> Platform improvements, analytics, fraud prevention</li>
                <li><strong>Legal Obligation:</strong> Compliance with tax laws, data protection regulations</li>
              </ul>
            </div>
          </section>

          {/* Data Sharing */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Share Your Information</h2>
            <div className="text-gray-700 space-y-4">
              <p>We may share your information with:</p>

              <p className="font-semibold">Service Providers</p>
              <ul className="list-disc pl-8 space-y-2">
                <li>Stripe (payment processing)</li>
                <li>Google Analytics (usage analytics)</li>
                <li>Google AdSense (advertising)</li>
                <li>Email service providers (transactional emails)</li>
                <li>Cloud hosting providers (data storage)</li>
              </ul>

              <p className="font-semibold mt-4">Publicly Visible Information</p>
              <ul className="list-disc pl-8 space-y-2">
                <li>Your profile information (if you are a creator)</li>
                <li>Course reviews and ratings you post</li>
                <li>Public comments and discussions</li>
              </ul>

              <p className="font-semibold mt-4">Legal Requirements</p>
              <p>
                We may disclose your information if required by law, court order, or to protect our rights and safety.
              </p>

              <p className="font-semibold mt-4">Business Transfers</p>
              <p>
                If we are involved in a merger, acquisition, or sale of assets, your information may be transferred.
                You will be notified of any such change.
              </p>
            </div>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookies and Tracking Technologies</h2>
            <div className="text-gray-700 space-y-4">
              <p>
                We use cookies and similar tracking technologies to improve your experience. For detailed information,
                please see our{' '}
                <Link href="/legal/cookies" className="text-blue-600 hover:underline">
                  Cookie Policy
                </Link>
                .
              </p>
              <p>You can manage your cookie preferences through:</p>
              <ul className="list-disc pl-8 space-y-2">
                <li>Our cookie consent banner (shown on first visit)</li>
                <li>Your browser settings</li>
                <li>Third-party opt-out tools (for advertising cookies)</li>
              </ul>
            </div>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Privacy Rights</h2>
            <div className="text-gray-700 space-y-4">
              <p>Under GDPR and other privacy laws, you have the following rights:</p>

              <div className="border-l-4 border-blue-600 pl-4 space-y-3">
                <div>
                  <p className="font-semibold">Right to Access</p>
                  <p className="text-sm">
                    Request a copy of all personal data we hold about you.{' '}
                    <Link href="/dashboard/settings/data" className="text-blue-600 hover:underline">
                      Download your data
                    </Link>
                  </p>
                </div>

                <div>
                  <p className="font-semibold">Right to Rectification</p>
                  <p className="text-sm">Correct any inaccurate or incomplete data through your account settings.</p>
                </div>

                <div>
                  <p className="font-semibold">Right to Erasure (Right to be Forgotten)</p>
                  <p className="text-sm">
                    Request deletion of your personal data.{' '}
                    <Link href="/dashboard/settings/account" className="text-blue-600 hover:underline">
                      Delete your account
                    </Link>
                  </p>
                </div>

                <div>
                  <p className="font-semibold">Right to Restrict Processing</p>
                  <p className="text-sm">Request that we limit how we use your data.</p>
                </div>

                <div>
                  <p className="font-semibold">Right to Data Portability</p>
                  <p className="text-sm">Receive your data in a structured, machine-readable format.</p>
                </div>

                <div>
                  <p className="font-semibold">Right to Object</p>
                  <p className="text-sm">Object to processing based on legitimate interests or for direct marketing.</p>
                </div>

                <div>
                  <p className="font-semibold">Right to Withdraw Consent</p>
                  <p className="text-sm">Withdraw your consent for marketing emails or cookies at any time.</p>
                </div>
              </div>

              <p className="mt-4">
                To exercise these rights, contact us at privacy@cpdplatform.com or use the links provided above.
              </p>
            </div>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Security</h2>
            <div className="text-gray-700 space-y-4">
              <p>We implement appropriate technical and organizational measures to protect your data, including:</p>
              <ul className="list-disc pl-8 space-y-2">
                <li>Encryption of data in transit and at rest</li>
                <li>Secure payment processing through PCI-compliant providers (Stripe)</li>
                <li>Regular security audits and updates</li>
                <li>Access controls and authentication</li>
                <li>Employee training on data protection</li>
              </ul>
              <p>
                However, no method of transmission over the internet is 100% secure. While we strive to protect
                your data, we cannot guarantee absolute security.
              </p>
            </div>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Retention</h2>
            <div className="text-gray-700 space-y-4">
              <p>We retain your personal data for as long as necessary to:</p>
              <ul className="list-disc pl-8 space-y-2">
                <li>Provide you with our services</li>
                <li>Comply with legal obligations (tax records, etc.)</li>
                <li>Resolve disputes and enforce our agreements</li>
              </ul>
              <p>
                When you delete your account, we anonymize your personal data within 90 days, though some data may
                be retained for legal compliance or legitimate business purposes.
              </p>
            </div>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Children's Privacy</h2>
            <div className="text-gray-700 space-y-4">
              <p>
                The Platform is intended for users aged 13 and older. We do not knowingly collect personal information
                from children under 13. If you believe we have collected information from a child under 13, please
                contact us immediately.
              </p>
            </div>
          </section>

          {/* International Transfers */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">International Data Transfers</h2>
            <div className="text-gray-700 space-y-4">
              <p>
                Your information may be transferred to and processed in countries other than your own. We ensure
                appropriate safeguards are in place for such transfers, including:
              </p>
              <ul className="list-disc pl-8 space-y-2">
                <li>Standard contractual clauses approved by the European Commission</li>
                <li>Adequacy decisions by regulatory authorities</li>
                <li>Privacy Shield certification (where applicable)</li>
              </ul>
            </div>
          </section>

          {/* Changes */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to This Privacy Policy</h2>
            <div className="text-gray-700 space-y-4">
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any material changes by:
              </p>
              <ul className="list-disc pl-8 space-y-2">
                <li>Posting the new policy on this page</li>
                <li>Updating the "Last Updated" date</li>
                <li>Sending you an email notification (for significant changes)</li>
              </ul>
              <p>
                Your continued use of the Platform after changes are posted constitutes your acceptance of the
                updated policy.
              </p>
            </div>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <div className="text-gray-700 space-y-4">
              <p>If you have questions about this Privacy Policy or wish to exercise your privacy rights, contact us:</p>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="font-semibold">Data Protection Officer</p>
                <p className="mt-2">CPD Platform</p>
                <p>Email: privacy@cpdplatform.com</p>
                <p>Address: [Your Business Address]</p>
              </div>
              <p className="text-sm mt-4">
                If you are in the EU and have a complaint about how we handle your data, you have the right to
                lodge a complaint with your local data protection authority.
              </p>
            </div>
          </section>
        </div>

        {/* Footer Links */}
        <div className="mt-8 text-center text-gray-600">
          <p>
            See also our{' '}
            <Link href="/legal/terms" className="text-blue-600 hover:underline">Terms of Service</Link>
            {', '}
            <Link href="/legal/cookies" className="text-blue-600 hover:underline">Cookie Policy</Link>
            {', and '}
            <Link href="/legal/dmca" className="text-blue-600 hover:underline">DMCA Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
