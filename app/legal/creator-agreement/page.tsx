import Link from 'next/link';

export const metadata = {
  title: 'Creator Agreement | CPD Platform',
  description: 'Creator Agreement and Terms for the CPD Platform',
};

export default function CreatorAgreement() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Creator Agreement</h1>
          <p className="text-gray-600">Last Updated: November 15, 2025</p>
          <p className="text-gray-600 mt-2">
            <Link href="/" className="text-blue-600 hover:underline">
              Return to Home
            </Link>
          </p>
        </div>

        {/* Introduction */}
        <div className="bg-blue-50 border-l-4 border-blue-600 p-6 mb-8 rounded-r-lg">
          <p className="text-gray-700">
            This Creator Agreement supplements our{' '}
            <Link href="/legal/terms" className="text-blue-600 hover:underline font-semibold">
              Terms of Service
            </Link>
            {' '}and applies to all users who create and publish content on the CPD Platform.
            By submitting content for publication, you agree to these additional terms.
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
          {/* 1. Content Ownership */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Content Ownership</h2>
            <div className="text-gray-700 space-y-4">
              <p className="font-semibold">1.1 Your Ownership</p>
              <p>
                You retain all ownership rights to the content you create and upload to the Platform. We do not claim
                ownership of your courses, publications, or other educational materials.
              </p>
              <p className="font-semibold">1.2 Originality and Rights</p>
              <p>
                You represent and warrant that:
              </p>
              <ul className="list-disc pl-8 space-y-2">
                <li>You own all rights to the content you upload, or have obtained all necessary licenses and permissions</li>
                <li>Your content does not infringe on any third-party intellectual property rights</li>
                <li>Your content does not violate any laws or regulations</li>
                <li>You have the authority to grant the licenses described in this Agreement</li>
              </ul>
            </div>
          </section>

          {/* 2. License to Platform */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. License to Platform</h2>
            <div className="text-gray-700 space-y-4">
              <p>
                By uploading content to the Platform, you grant CPD Platform a worldwide, non-exclusive, royalty-free,
                sublicensable, and transferable license to:
              </p>
              <ul className="list-disc pl-8 space-y-2">
                <li>Host, store, reproduce, and display your content</li>
                <li>Distribute your content to enrolled users</li>
                <li>Create thumbnails, previews, and promotional materials from your content</li>
                <li>Modify your content for technical compatibility (e.g., format conversions, compression)</li>
                <li>Use your content in marketing and promotional materials for the Platform</li>
              </ul>
              <p className="mt-4">
                This license continues until you remove your content from the Platform, except for content that has been
                shared or distributed (which may remain available to users who previously accessed it).
              </p>
            </div>
          </section>

          {/* 3. Revenue Sharing */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Revenue Sharing</h2>
            <div className="text-gray-700 space-y-4">
              <p className="font-semibold">3.1 Paid Content (70/30 Split)</p>
              <p>
                For courses you sell on the Platform:
              </p>
              <ul className="list-disc pl-8 space-y-2">
                <li>You receive 70% of the course price</li>
                <li>The Platform retains 30% as a service fee</li>
                <li>You set the price for your courses</li>
                <li>All prices are in USD</li>
              </ul>

              <p className="font-semibold mt-6">3.2 Ad-Supported Content</p>
              <p>
                For free content supported by advertising:
              </p>
              <ul className="list-disc pl-8 space-y-2">
                <li>You receive 70% of advertising revenue attributed to your content</li>
                <li>Revenue is calculated based on your share of total platform views</li>
                <li>The Platform retains 30% for platform operations and ad management</li>
              </ul>

              <p className="font-semibold mt-6">3.3 Pricing Changes</p>
              <p>
                You may change the price of your courses at any time. Price changes do not affect users who have already
                purchased the course at the previous price.
              </p>
            </div>
          </section>

          {/* 4. Payment Terms */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Payment Terms</h2>
            <div className="text-gray-700 space-y-4">
              <p className="font-semibold">4.1 Stripe Connect</p>
              <p>
                Payments are processed through Stripe Connect. You must complete the Stripe onboarding process and provide
                accurate banking information to receive payments.
              </p>

              <p className="font-semibold">4.2 Payout Schedule</p>
              <p>
                Earnings are calculated monthly and paid out according to the following schedule:
              </p>
              <ul className="list-disc pl-8 space-y-2">
                <li>Revenue is calculated at the end of each calendar month</li>
                <li>Earnings are available for payout after the 5th of the following month</li>
                <li>Payouts are processed within 7 business days of request</li>
              </ul>

              <p className="font-semibold">4.3 Minimum Payout Threshold</p>
              <p>
                The minimum payout amount is R900. Earnings below this threshold will be carried over to the next month
                until the minimum is reached.
              </p>

              <p className="font-semibold">4.4 Tax Responsibility</p>
              <p>
                You are responsible for all taxes associated with your earnings. We may be required to withhold taxes or
                issue tax forms (such as 1099 forms in the United States) depending on your location and earnings.
              </p>

              <p className="font-semibold">4.5 Payment Processing Fees</p>
              <p>
                Stripe may deduct payment processing fees from transfers to your account. These fees are separate from
                the Platform's 30% service fee.
              </p>
            </div>
          </section>

          {/* 5. Content Standards */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Content Standards</h2>
            <div className="text-gray-700 space-y-4">
              <p className="font-semibold">5.1 Quality Standards</p>
              <p>
                All content must meet the Platform's quality standards:
              </p>
              <ul className="list-disc pl-8 space-y-2">
                <li>Content must be relevant to continuing professional development</li>
                <li>Information must be accurate and up-to-date</li>
                <li>Content should be well-organized and professionally presented</li>
                <li>Video and audio quality should be clear and understandable</li>
              </ul>

              <p className="font-semibold">5.2 Content Review</p>
              <p>
                All content is subject to review before publication. We reserve the right to reject content that does not
                meet our standards or violates our policies. Reasons for rejection will be provided.
              </p>

              <p className="font-semibold">5.3 Updates and Maintenance</p>
              <p>
                You are responsible for keeping your content current and accurate. We encourage you to update courses
                periodically to reflect new developments in your field.
              </p>
            </div>
          </section>

          {/* 6. Copyright and Attribution */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Copyright and Attribution</h2>
            <div className="text-gray-700 space-y-4">
              <p className="font-semibold">6.1 Source Attribution</p>
              <p>
                When using third-party materials (with proper permission), you must provide appropriate attribution
                according to the license requirements.
              </p>

              <p className="font-semibold">6.2 Academic Integrity</p>
              <p>
                Content should follow academic integrity standards, including proper citations for research, data, and
                other source materials.
              </p>

              <p className="font-semibold">6.3 DMCA Compliance</p>
              <p>
                We comply with the Digital Millennium Copyright Act (DMCA). If we receive a valid DMCA takedown notice
                regarding your content, we will remove or disable access to the allegedly infringing material and notify you.
              </p>
            </div>
          </section>

          {/* 7. Warranties */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Creator Warranties</h2>
            <div className="text-gray-700 space-y-4">
              <p>You warrant that:</p>
              <ul className="list-disc pl-8 space-y-2">
                <li>You have the qualifications and expertise to create the content you publish</li>
                <li>Your content is accurate to the best of your knowledge</li>
                <li>You will not upload malicious code or harmful materials</li>
                <li>You will comply with all applicable laws and regulations</li>
                <li>You will not engage in deceptive or misleading practices</li>
              </ul>
            </div>
          </section>

          {/* 8. Indemnification */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Indemnification</h2>
            <div className="text-gray-700 space-y-4">
              <p>
                You agree to indemnify, defend, and hold harmless CPD Platform, its affiliates, and their respective
                officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses
                (including reasonable attorneys' fees) arising from:
              </p>
              <ul className="list-disc pl-8 space-y-2">
                <li>Your content or any breach of your warranties regarding your content</li>
                <li>Your violation of any third-party rights, including intellectual property rights</li>
                <li>Your violation of any laws or regulations</li>
                <li>Your use of the Platform</li>
              </ul>
            </div>
          </section>

          {/* 9. Termination */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Termination and Content Removal</h2>
            <div className="text-gray-700 space-y-4">
              <p className="font-semibold">9.1 Removal by You</p>
              <p>
                You may remove your content from the Platform at any time. However:
              </p>
              <ul className="list-disc pl-8 space-y-2">
                <li>Users who previously purchased your courses retain access to them</li>
                <li>You may be required to refund recent purchases (within 7 days)</li>
                <li>Outstanding earnings will still be paid according to the payment schedule</li>
              </ul>

              <p className="font-semibold">9.2 Termination by Platform</p>
              <p>
                We may remove your content or terminate your creator account if:
              </p>
              <ul className="list-disc pl-8 space-y-2">
                <li>Your content violates our terms or policies</li>
                <li>We receive valid DMCA notices or other legal complaints</li>
                <li>You fail to maintain Stripe account in good standing</li>
                <li>You engage in fraudulent or deceptive practices</li>
              </ul>

              <p className="font-semibold">9.3 Pending Payouts</p>
              <p>
                Before terminating your creator account, you must resolve all pending payouts. We may withhold final
                payment for 90 days to address any refund requests or disputes.
              </p>
            </div>
          </section>

          {/* 10. Relationship */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Independent Contractor Relationship</h2>
            <div className="text-gray-700 space-y-4">
              <p>
                You are an independent contractor, not an employee, partner, or agent of CPD Platform. This Agreement
                does not create any employment, partnership, or agency relationship.
              </p>
              <p>
                You are solely responsible for:
              </p>
              <ul className="list-disc pl-8 space-y-2">
                <li>Creating and maintaining your content</li>
                <li>Paying all applicable taxes</li>
                <li>Obtaining any necessary licenses or certifications</li>
                <li>Complying with professional standards in your field</li>
              </ul>
            </div>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Questions and Support</h2>
            <div className="text-gray-700 space-y-4">
              <p>If you have questions about this Creator Agreement, please contact us at:</p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p><strong>Creator Support</strong></p>
                <p>Email: creators@cpdplatform.com</p>
                <p>Legal: legal@cpdplatform.com</p>
              </div>
            </div>
          </section>
        </div>

        {/* Footer Links */}
        <div className="mt-8 text-center text-gray-600">
          <p>
            This agreement is subject to our{' '}
            <Link href="/legal/terms" className="text-blue-600 hover:underline">Terms of Service</Link>
            {' and '}
            <Link href="/legal/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
