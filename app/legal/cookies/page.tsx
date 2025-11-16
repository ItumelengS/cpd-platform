import Link from 'next/link';

export const metadata = {
  title: 'Cookie Policy | CPD Platform',
  description: 'Cookie Policy for the CPD Platform',
};

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Cookie Policy</h1>
          <p className="text-gray-600">Last Updated: November 15, 2025</p>
          <p className="text-gray-600 mt-2">
            <Link href="/" className="text-blue-600 hover:underline">
              Return to Home
            </Link>
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
          {/* What Are Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What Are Cookies?</h2>
            <div className="text-gray-700 space-y-4">
              <p>
                Cookies are small text files that are placed on your device (computer, smartphone, or tablet) when you
                visit a website. They are widely used to make websites work more efficiently and provide information to
                the website owners.
              </p>
              <p>
                Cookies help us understand how visitors use our platform, remember your preferences, and improve your
                experience.
              </p>
            </div>
          </section>

          {/* Types of Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Types of Cookies We Use</h2>
            <div className="text-gray-700 space-y-6">
              {/* Essential Cookies */}
              <div className="border-l-4 border-blue-600 pl-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">1. Essential Cookies</h3>
                <p className="mb-2">
                  <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                    Always Active
                  </span>
                </p>
                <p>
                  These cookies are necessary for the website to function properly. They enable core functionality such
                  as security, network management, and accessibility.
                </p>
                <div className="mt-3">
                  <p className="font-semibold text-sm mb-1">Examples:</p>
                  <ul className="list-disc pl-8 space-y-1 text-sm">
                    <li>Authentication cookies (keep you logged in)</li>
                    <li>Session cookies (maintain your browsing session)</li>
                    <li>Security cookies (prevent fraudulent activity)</li>
                    <li>Cookie consent preferences</li>
                  </ul>
                </div>
                <p className="mt-2 text-sm italic">
                  You cannot opt-out of essential cookies as they are required for the platform to function.
                </p>
              </div>

              {/* Analytics Cookies */}
              <div className="border-l-4 border-green-600 pl-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">2. Analytics Cookies</h3>
                <p className="mb-2">
                  <span className="inline-block px-2 py-1 bg-green-100 text-green-600 text-xs font-medium rounded">
                    Optional
                  </span>
                </p>
                <p>
                  These cookies help us understand how visitors interact with our platform by collecting and reporting
                  information anonymously. This helps us improve the platform and user experience.
                </p>
                <div className="mt-3">
                  <p className="font-semibold text-sm mb-1">Services we use:</p>
                  <ul className="list-disc pl-8 space-y-1 text-sm">
                    <li>Google Analytics - tracks page views, user behavior, and demographics</li>
                    <li>Internal analytics - measures course completion rates and engagement</li>
                  </ul>
                </div>
                <div className="mt-3">
                  <p className="font-semibold text-sm mb-1">Information collected:</p>
                  <ul className="list-disc pl-8 space-y-1 text-sm">
                    <li>Pages visited and time spent on each page</li>
                    <li>Browser type and version</li>
                    <li>Device type and screen resolution</li>
                    <li>Geographic location (country/city level)</li>
                    <li>Referral source (how you found our platform)</li>
                  </ul>
                </div>
              </div>

              {/* Advertising Cookies */}
              <div className="border-l-4 border-purple-600 pl-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">3. Advertising Cookies</h3>
                <p className="mb-2">
                  <span className="inline-block px-2 py-1 bg-purple-100 text-purple-600 text-xs font-medium rounded">
                    Optional
                  </span>
                </p>
                <p>
                  These cookies are used to deliver advertisements that are relevant to you and your interests. They
                  also help limit the number of times you see an advertisement and measure the effectiveness of
                  advertising campaigns.
                </p>
                <div className="mt-3">
                  <p className="font-semibold text-sm mb-1">Services we use:</p>
                  <ul className="list-disc pl-8 space-y-1 text-sm">
                    <li>Google AdSense - displays targeted advertisements based on your interests</li>
                    <li>Google DoubleClick - tracks ad performance and conversions</li>
                  </ul>
                </div>
                <div className="mt-3">
                  <p className="font-semibold text-sm mb-1">What they do:</p>
                  <ul className="list-disc pl-8 space-y-1 text-sm">
                    <li>Show you relevant ads based on your browsing history</li>
                    <li>Limit how many times you see the same ad</li>
                    <li>Measure ad effectiveness</li>
                    <li>Build a profile of your interests for ad targeting</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Third-Party Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Third-Party Cookies</h2>
            <div className="text-gray-700 space-y-4">
              <p>
                Some cookies are placed by third-party services that appear on our pages. We do not control these
                cookies, and they are subject to the third party's privacy policies.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-semibold mb-2">Third-party services we use:</p>
                <ul className="space-y-2 text-sm">
                  <li>
                    <strong>Google Analytics:</strong>{' '}
                    <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <strong>Google AdSense:</strong>{' '}
                    <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <strong>Stripe (Payment Processing):</strong>{' '}
                    <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      Privacy Policy
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* How to Manage Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Manage Cookies</h2>
            <div className="text-gray-700 space-y-4">
              <p className="font-semibold">On Our Platform</p>
              <p>
                When you first visit our platform, you will see a cookie consent banner. You can:
              </p>
              <ul className="list-disc pl-8 space-y-2">
                <li>Accept all cookies</li>
                <li>Reject non-essential cookies (only essential cookies will be used)</li>
                <li>Customize your preferences to choose which types of cookies you want to allow</li>
              </ul>
              <p>
                You can change your cookie preferences at any time by clearing your browser cookies and revisiting the
                platform, or by using the cookie preferences link in our footer.
              </p>

              <p className="font-semibold mt-6">In Your Browser</p>
              <p>
                Most web browsers allow you to control cookies through their settings. You can typically:
              </p>
              <ul className="list-disc pl-8 space-y-2">
                <li>View and delete existing cookies</li>
                <li>Block all cookies</li>
                <li>Block third-party cookies</li>
                <li>Clear cookies when you close your browser</li>
                <li>Set exceptions for specific websites</li>
              </ul>

              <div className="bg-gray-50 p-4 rounded-lg mt-4">
                <p className="font-semibold mb-2">Browser-specific instructions:</p>
                <ul className="space-y-1 text-sm">
                  <li>
                    <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      Google Chrome
                    </a>
                  </li>
                  <li>
                    <a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      Mozilla Firefox
                    </a>
                  </li>
                  <li>
                    <a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      Safari
                    </a>
                  </li>
                  <li>
                    <a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      Microsoft Edge
                    </a>
                  </li>
                </ul>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-600 p-4 rounded-r-lg mt-4">
                <p className="text-sm">
                  <strong>Note:</strong> Blocking or deleting cookies may affect your user experience and prevent you
                  from using certain features of the platform, such as staying logged in.
                </p>
              </div>
            </div>
          </section>

          {/* Opt-Out Options */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Advertising Opt-Out Options</h2>
            <div className="text-gray-700 space-y-4">
              <p>
                If you want to opt out of personalized advertising, you can use these tools:
              </p>
              <ul className="list-disc pl-8 space-y-2">
                <li>
                  <a href="https://adssettings.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    Google Ads Settings
                  </a>
                  {' '}– Manage your Google ad preferences
                </li>
                <li>
                  <a href="https://optout.networkadvertising.org/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    Network Advertising Initiative Opt-Out
                  </a>
                </li>
                <li>
                  <a href="https://optout.aboutads.info/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    Digital Advertising Alliance Opt-Out
                  </a>
                </li>
              </ul>
              <p className="text-sm italic mt-2">
                Note: Opting out of personalized ads does not mean you will stop seeing ads; you will still see
                non-personalized advertisements.
              </p>
            </div>
          </section>

          {/* Do Not Track */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Do Not Track Signals</h2>
            <div className="text-gray-700 space-y-4">
              <p>
                Some browsers have a "Do Not Track" feature that signals to websites that you do not want to be tracked.
                Currently, there is no industry standard for responding to Do Not Track signals, so we do not respond
                to them at this time.
              </p>
            </div>
          </section>

          {/* Updates */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Updates to This Policy</h2>
            <div className="text-gray-700 space-y-4">
              <p>
                We may update this Cookie Policy from time to time to reflect changes in our practices or for other
                operational, legal, or regulatory reasons. We will notify you of any material changes by posting the
                new policy on this page and updating the "Last Updated" date.
              </p>
            </div>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <div className="text-gray-700 space-y-4">
              <p>If you have any questions about our use of cookies, please contact us at:</p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p><strong>CPD Platform</strong></p>
                <p>Email: privacy@cpdplatform.com</p>
              </div>
            </div>
          </section>
        </div>

        {/* Footer Links */}
        <div className="mt-8 text-center text-gray-600">
          <p>
            See also our{' '}
            <Link href="/legal/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
            {' and '}
            <Link href="/legal/terms" className="text-blue-600 hover:underline">Terms of Service</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
