import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service | CPD Platform',
  description: 'Terms of Service for the CPD Platform',
};

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-gray-600">Last Updated: November 15, 2025</p>
          <p className="text-gray-600 mt-2">
            <Link href="/" className="text-blue-600 hover:underline">
              Return to Home
            </Link>
          </p>
        </div>

        {/* Table of Contents */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Table of Contents</h2>
          <nav className="space-y-2">
            <a href="#acceptance" className="block text-blue-600 hover:underline">1. Acceptance of Terms</a>
            <a href="#accounts" className="block text-blue-600 hover:underline">2. User Accounts</a>
            <a href="#creator-agreements" className="block text-blue-600 hover:underline">3. Creator Agreements</a>
            <a href="#content-rights" className="block text-blue-600 hover:underline">4. Content Rights and Licenses</a>
            <a href="#payment" className="block text-blue-600 hover:underline">5. Payment and Refunds</a>
            <a href="#fees" className="block text-blue-600 hover:underline">6. Platform Fees</a>
            <a href="#prohibited" className="block text-blue-600 hover:underline">7. Prohibited Content and Conduct</a>
            <a href="#intellectual-property" className="block text-blue-600 hover:underline">8. Intellectual Property</a>
            <a href="#dmca" className="block text-blue-600 hover:underline">9. DMCA Policy</a>
            <a href="#liability" className="block text-blue-600 hover:underline">10. Limitation of Liability</a>
            <a href="#disputes" className="block text-blue-600 hover:underline">11. Dispute Resolution</a>
            <a href="#termination" className="block text-blue-600 hover:underline">12. Termination</a>
            <a href="#changes" className="block text-blue-600 hover:underline">13. Changes to Terms</a>
            <a href="#contact" className="block text-blue-600 hover:underline">14. Contact Information</a>
          </nav>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
          {/* 1. Acceptance */}
          <section id="acceptance">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <div className="text-gray-700 space-y-4">
              <p>
                By accessing or using the CPD Platform ("Platform"), you agree to be bound by these Terms of Service ("Terms").
                If you do not agree to these Terms, you may not access or use the Platform.
              </p>
              <p>
                These Terms constitute a legally binding agreement between you and CPD Platform. By creating an account,
                you represent that you are at least 13 years of age and have the legal capacity to enter into these Terms.
              </p>
            </div>
          </section>

          {/* 2. User Accounts */}
          <section id="accounts">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. User Accounts</h2>
            <div className="text-gray-700 space-y-4">
              <p className="font-semibold">2.1 Account Registration</p>
              <p>
                To access certain features of the Platform, you must create an account. You agree to provide accurate,
                current, and complete information during registration and to update such information to keep it accurate.
              </p>
              <p className="font-semibold">2.2 Account Security</p>
              <p>
                You are responsible for maintaining the confidentiality of your account credentials and for all activities
                that occur under your account. You must notify us immediately of any unauthorized use of your account.
              </p>
              <p className="font-semibold">2.3 Age Requirement</p>
              <p>
                You must be at least 13 years old to use the Platform. Users under 18 should have parental consent.
              </p>
            </div>
          </section>

          {/* 3. Creator Agreements */}
          <section id="creator-agreements">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Creator Agreements</h2>
            <div className="text-gray-700 space-y-4">
              <p>
                Creators who publish content on the Platform are subject to additional terms as outlined in our{' '}
                <Link href="/legal/creator-agreement" className="text-blue-600 hover:underline">
                  Creator Agreement
                </Link>
                . By submitting content for publication, you agree to be bound by those terms.
              </p>
            </div>
          </section>

          {/* 4. Content Rights */}
          <section id="content-rights">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Content Rights and Licenses</h2>
            <div className="text-gray-700 space-y-4">
              <p className="font-semibold">4.1 User Content</p>
              <p>
                You retain ownership of any content you submit to the Platform. However, by submitting content, you grant
                CPD Platform a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, distribute, and
                display your content in connection with operating and promoting the Platform.
              </p>
              <p className="font-semibold">4.2 Platform Content</p>
              <p>
                All courses, publications, and educational materials on the Platform are protected by copyright and other
                intellectual property laws. You may not copy, distribute, or create derivative works from Platform content
                without permission.
              </p>
              <p className="font-semibold">4.3 License to Use Course Content</p>
              <p>
                When you enroll in a course, you receive a limited, non-exclusive, non-transferable license to access and
                view the course content for your personal, non-commercial use only.
              </p>
            </div>
          </section>

          {/* 5. Payment and Refunds */}
          <section id="payment">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Payment and Refunds</h2>
            <div className="text-gray-700 space-y-4">
              <p className="font-semibold">5.1 Pricing</p>
              <p>
                Course prices are set by creators and displayed in USD. Prices are subject to change at the creator's discretion,
                but changes do not affect courses already purchased.
              </p>
              <p className="font-semibold">5.2 Payment Processing</p>
              <p>
                Payments are processed securely through Stripe. By making a purchase, you agree to provide valid payment
                information and authorize us to charge the stated amount.
              </p>
              <p className="font-semibold">5.3 Refund Policy</p>
              <p>
                Refunds are handled on a case-by-case basis. Generally, refunds are not provided after you have accessed
                course content. Contact support within 7 days of purchase to request a refund.
              </p>
            </div>
          </section>

          {/* 6. Platform Fees */}
          <section id="fees">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Platform Fees</h2>
            <div className="text-gray-700 space-y-4">
              <p>
                The Platform operates on a revenue-sharing model. For paid courses, the Platform retains 30% of the course
                price as a platform fee, and the creator receives 70% of the revenue.
              </p>
              <p>
                For ad-supported free content, the Platform shares 70% of advertising revenue with creators based on their
                share of total platform views.
              </p>
            </div>
          </section>

          {/* 7. Prohibited Content */}
          <section id="prohibited">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Prohibited Content and Conduct</h2>
            <div className="text-gray-700 space-y-4">
              <p>You agree not to upload, post, or transmit any content that:</p>
              <ul className="list-disc pl-8 space-y-2">
                <li>Infringes on any intellectual property rights</li>
                <li>Contains hate speech, harassment, or threats</li>
                <li>Is sexually explicit or pornographic</li>
                <li>Promotes violence or illegal activities</li>
                <li>Contains malware or harmful code</li>
                <li>Is spam or misleading</li>
                <li>Violates any applicable laws or regulations</li>
              </ul>
              <p className="mt-4">
                We reserve the right to remove any content that violates these Terms and to suspend or terminate accounts
                that repeatedly violate our policies.
              </p>
            </div>
          </section>

          {/* 8. Intellectual Property */}
          <section id="intellectual-property">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Intellectual Property</h2>
            <div className="text-gray-700 space-y-4">
              <p>
                The Platform, including its design, features, and functionality, is owned by CPD Platform and is protected
                by copyright, trademark, and other intellectual property laws.
              </p>
              <p>
                The CPD Platform name, logo, and all related names, logos, product and service names, designs, and slogans
                are trademarks of CPD Platform. You may not use such marks without our prior written permission.
              </p>
            </div>
          </section>

          {/* 9. DMCA */}
          <section id="dmca">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. DMCA Policy</h2>
            <div className="text-gray-700 space-y-4">
              <p>
                We respect the intellectual property rights of others. If you believe that content on the Platform infringes
                your copyright, please submit a DMCA notice as outlined in our{' '}
                <Link href="/legal/dmca" className="text-blue-600 hover:underline">
                  DMCA Policy
                </Link>
                .
              </p>
              <p>
                We will respond to valid DMCA notices by removing or disabling access to allegedly infringing material.
                Repeat infringers will have their accounts terminated.
              </p>
            </div>
          </section>

          {/* 10. Liability */}
          <section id="liability">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Limitation of Liability</h2>
            <div className="text-gray-700 space-y-4">
              <p className="font-semibold">10.1 Disclaimer of Warranties</p>
              <p>
                THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED.
                WE DO NOT WARRANT THAT THE PLATFORM WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF VIRUSES.
              </p>
              <p className="font-semibold">10.2 Limitation of Liability</p>
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, CPD PLATFORM SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
                SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF OR RELATED TO YOUR USE OF THE PLATFORM.
              </p>
              <p className="font-semibold">10.3 Educational Content</p>
              <p>
                The Platform provides educational content for informational purposes only. We do not guarantee the accuracy,
                completeness, or applicability of any content. Users are responsible for verifying information and seeking
                professional advice when necessary.
              </p>
            </div>
          </section>

          {/* 11. Disputes */}
          <section id="disputes">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Dispute Resolution</h2>
            <div className="text-gray-700 space-y-4">
              <p className="font-semibold">11.1 Governing Law</p>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction],
                without regard to its conflict of law provisions.
              </p>
              <p className="font-semibold">11.2 Arbitration</p>
              <p>
                Any disputes arising out of or relating to these Terms or the Platform shall be resolved through binding
                arbitration in accordance with the rules of the American Arbitration Association.
              </p>
              <p className="font-semibold">11.3 Class Action Waiver</p>
              <p>
                You agree that any proceedings to resolve disputes will be conducted only on an individual basis and not
                in a class, consolidated, or representative action.
              </p>
            </div>
          </section>

          {/* 12. Termination */}
          <section id="termination">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Termination</h2>
            <div className="text-gray-700 space-y-4">
              <p className="font-semibold">12.1 Termination by You</p>
              <p>
                You may terminate your account at any time through your account settings. Upon termination, you will lose
                access to any purchased content and any outstanding creator earnings may be forfeited.
              </p>
              <p className="font-semibold">12.2 Termination by Us</p>
              <p>
                We reserve the right to suspend or terminate your account at any time for violations of these Terms or for
                any other reason at our sole discretion. We will provide notice when reasonably possible.
              </p>
              <p className="font-semibold">12.3 Effect of Termination</p>
              <p>
                Upon termination, your right to use the Platform will immediately cease. Provisions of these Terms that by
                their nature should survive termination shall survive, including ownership provisions, warranty disclaimers,
                and limitations of liability.
              </p>
            </div>
          </section>

          {/* 13. Changes */}
          <section id="changes">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Changes to Terms</h2>
            <div className="text-gray-700 space-y-4">
              <p>
                We reserve the right to modify these Terms at any time. We will notify users of material changes via email
                or through the Platform. Your continued use of the Platform after such modifications constitutes your
                acceptance of the updated Terms.
              </p>
              <p>
                We encourage you to review these Terms periodically to stay informed of any changes.
              </p>
            </div>
          </section>

          {/* 14. Contact */}
          <section id="contact">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Contact Information</h2>
            <div className="text-gray-700 space-y-4">
              <p>If you have any questions about these Terms, please contact us at:</p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p><strong>CPD Platform</strong></p>
                <p>Email: legal@cpdplatform.com</p>
                <p>Address: [Your Business Address]</p>
              </div>
            </div>
          </section>
        </div>

        {/* Footer Links */}
        <div className="mt-8 text-center text-gray-600">
          <p>
            Also see our{' '}
            <Link href="/legal/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
            {', '}
            <Link href="/legal/cookies" className="text-blue-600 hover:underline">Cookie Policy</Link>
            {', and '}
            <Link href="/legal/creator-agreement" className="text-blue-600 hover:underline">Creator Agreement</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
