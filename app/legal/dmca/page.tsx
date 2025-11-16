import Link from 'next/link';

export const metadata = {
  title: 'DMCA Policy | CPD Platform',
  description: 'Digital Millennium Copyright Act Policy for the CPD Platform',
};

export default function DMCAPolicy() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">DMCA Policy</h1>
          <p className="text-gray-600">Last Updated: November 15, 2025</p>
          <p className="text-gray-600 mt-2">
            <Link href="/" className="text-blue-600 hover:underline">
              Return to Home
            </Link>
          </p>
        </div>

        {/* Quick Action */}
        <div className="bg-red-50 border-l-4 border-red-600 p-6 mb-8 rounded-r-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Report Copyright Infringement</h3>
          <p className="text-gray-700 mb-4">
            If you believe your copyright has been infringed, you can file a DMCA takedown notice using our online form.
          </p>
          <Link
            href="/legal/dmca/report"
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            File DMCA Notice
          </Link>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
          {/* Overview */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Overview</h2>
            <div className="text-gray-700 space-y-4">
              <p>
                CPD Platform respects the intellectual property rights of others and expects our users to do the same.
                In accordance with the Digital Millennium Copyright Act (DMCA), we will respond to valid notices of
                copyright infringement and take appropriate action.
              </p>
              <p>
                This policy outlines the procedures for reporting copyright infringement and our process for handling
                such reports.
              </p>
            </div>
          </section>

          {/* Notice and Takedown */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">DMCA Notice and Takedown Procedure</h2>
            <div className="text-gray-700 space-y-4">
              <p className="font-semibold">Filing a DMCA Notice</p>
              <p>
                If you believe that content on the CPD Platform infringes your copyright, you may submit a DMCA takedown
                notice. To be valid, your notice must include all of the following information:
              </p>
              <ol className="list-decimal pl-8 space-y-3">
                <li>
                  <strong>Your Contact Information:</strong> Your full legal name, mailing address, telephone number,
                  and email address.
                </li>
                <li>
                  <strong>Copyright Owner:</strong> If you are acting on behalf of the copyright owner, provide the
                  name of the copyright owner you represent.
                </li>
                <li>
                  <strong>Description of Copyrighted Work:</strong> A detailed description of the copyrighted work
                  that you claim has been infringed, including where on the Platform the original or authorized version
                  can be found (if applicable).
                </li>
                <li>
                  <strong>Infringing Material:</strong> The URL or specific location on the Platform where the allegedly
                  infringing material appears.
                </li>
                <li>
                  <strong>Good Faith Statement:</strong> A statement that you have a good faith belief that the disputed
                  use is not authorized by the copyright owner, its agent, or the law.
                </li>
                <li>
                  <strong>Accuracy Statement:</strong> A statement, under penalty of perjury, that the information in
                  your notice is accurate and that you are the copyright owner or authorized to act on behalf of the
                  copyright owner.
                </li>
                <li>
                  <strong>Physical or Electronic Signature:</strong> Your physical or electronic signature.
                </li>
              </ol>

              <div className="bg-blue-50 p-4 rounded-lg mt-4">
                <p className="text-sm">
                  <strong>Note:</strong> Filing a false or fraudulent DMCA notice may result in legal liability.
                  Please ensure that you have the right to file a notice before submitting.
                </p>
              </div>
            </div>
          </section>

          {/* Response Process */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Response Process</h2>
            <div className="text-gray-700 space-y-4">
              <p>Upon receiving a valid DMCA notice, we will:</p>
              <ol className="list-decimal pl-8 space-y-3">
                <li>Remove or disable access to the allegedly infringing content within 7 business days</li>
                <li>Notify the content creator of the takedown and provide them with a copy of the DMCA notice</li>
                <li>Provide the content creator an opportunity to file a counter-notice if they believe the content was removed in error</li>
              </ol>
            </div>
          </section>

          {/* Counter-Notice */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Counter-Notice Procedure</h2>
            <div className="text-gray-700 space-y-4">
              <p>
                If you believe your content was removed or disabled by mistake or misidentification, you may file a
                counter-notice. A valid counter-notice must include:
              </p>
              <ol className="list-decimal pl-8 space-y-3">
                <li>Your contact information (name, address, phone number, and email)</li>
                <li>Identification of the material that was removed and where it appeared before removal</li>
                <li>
                  A statement under penalty of perjury that you have a good faith belief that the material was removed
                  or disabled as a result of mistake or misidentification
                </li>
                <li>
                  A statement that you consent to the jurisdiction of the Federal District Court for the judicial
                  district in which your address is located (or the federal courts located in [Your Jurisdiction] if
                  your address is outside the United States)
                </li>
                <li>
                  A statement that you will accept service of process from the person who provided the original DMCA
                  notice or their agent
                </li>
                <li>Your physical or electronic signature</li>
              </ol>

              <p className="mt-4">
                Upon receiving a valid counter-notice, we will forward it to the original complainant. If the
                complainant does not file a court action seeking an order to restrain you from engaging in infringing
                activity within 10-14 business days, we may restore the removed content.
              </p>
            </div>
          </section>

          {/* Repeat Infringer Policy */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Repeat Infringer Policy</h2>
            <div className="text-gray-700 space-y-4">
              <p>
                We maintain a policy of terminating, in appropriate circumstances, the accounts of users who are repeat
                infringers of copyright.
              </p>
              <p>
                A "repeat infringer" is a user who has been notified of infringing activity more than twice or has had
                content removed from the Platform more than twice.
              </p>
              <p>
                We reserve the right to terminate accounts at our sole discretion, with or without notice.
              </p>
            </div>
          </section>

          {/* DMCA Agent */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">DMCA Agent Contact Information</h2>
            <div className="text-gray-700 space-y-4">
              <p>You can submit DMCA notices and counter-notices to our designated DMCA agent:</p>

              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="font-semibold">By Online Form (Preferred):</p>
                <Link href="/legal/dmca/report" className="text-blue-600 hover:underline">
                  https://cpdplatform.com/legal/dmca/report
                </Link>

                <p className="font-semibold mt-4">By Email:</p>
                <p>dmca@cpdplatform.com</p>

                <p className="font-semibold mt-4">By Mail:</p>
                <p>
                  DMCA Agent<br />
                  CPD Platform<br />
                  [Your Business Address]
                </p>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg mt-4">
                <p className="text-sm">
                  <strong>Important:</strong> The DMCA agent is only for reporting copyright infringement.
                  For other matters, please use our general{' '}
                  <Link href="/contact" className="text-blue-600 hover:underline">contact form</Link>.
                </p>
              </div>
            </div>
          </section>

          {/* Misrepresentation */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Misrepresentation Warning</h2>
            <div className="text-gray-700 space-y-4">
              <p>
                Under Section 512(f) of the DMCA, any person who knowingly materially misrepresents that material or
                activity is infringing, or that material or activity was removed or disabled by mistake or
                misidentification, may be subject to liability.
              </p>
              <p>
                Please ensure that you have a valid copyright claim before filing a DMCA notice. If you are unsure,
                please consult with a legal professional.
              </p>
            </div>
          </section>

          {/* Additional Resources */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Additional Resources</h2>
            <div className="text-gray-700 space-y-4">
              <p>For more information about the DMCA and copyright law, please visit:</p>
              <ul className="list-disc pl-8 space-y-2">
                <li>
                  <a href="https://www.copyright.gov/legislation/dmca.pdf" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    DMCA Text (U.S. Copyright Office)
                  </a>
                </li>
                <li>
                  <a href="https://www.copyright.gov/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    U.S. Copyright Office
                  </a>
                </li>
              </ul>
            </div>
          </section>
        </div>

        {/* Footer Links */}
        <div className="mt-8 text-center text-gray-600">
          <p>
            See also our{' '}
            <Link href="/legal/terms" className="text-blue-600 hover:underline">Terms of Service</Link>
            {' and '}
            <Link href="/legal/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
