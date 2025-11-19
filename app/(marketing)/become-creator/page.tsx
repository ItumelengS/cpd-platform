import Link from "next/link"
import { CheckCircle, Award, DollarSign, Users, BookOpen, Shield } from "lucide-react"

export default function BecomeCreatorPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              RadSciCPD
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/courses" className="text-gray-700 hover:text-blue-600">
                Courses
              </Link>
              <Link href="/pricing" className="text-gray-700 hover:text-blue-600">
                Pricing
              </Link>
              <Link href="/login" className="text-gray-700 hover:text-blue-600">
                Login
              </Link>
              <Link
                href="/signup"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-6">
            Become a Creator
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
            Share your expertise, earn revenue, and contribute to professional development
            in radiation sciences. Join our community of expert educators.
          </p>
          <Link
            href="/signup"
            className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition text-lg"
          >
            Apply to Become a Creator
          </Link>
        </div>
      </section>

      {/* Why Become a Creator */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Why Become a Creator?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join a growing platform dedicated to radiation sciences education
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Earn Revenue</h3>
              <p className="text-gray-700 mb-4">
                Receive 70% of revenue generated from your content views. Top creators
                earn R30,000 - R1,500,000+ annually.
              </p>
              <div className="text-sm text-gray-600">
                • Monthly payouts (minimum R900)<br />
                • Transparent revenue sharing<br />
                • Performance bonuses
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Reach Thousands</h3>
              <p className="text-gray-700 mb-4">
                Share your knowledge with 3,000+ South African professionals and
                500,000+ globally.
              </p>
              <div className="text-sm text-gray-600">
                • Global audience reach<br />
                • Professional recognition<br />
                • Build your reputation
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Expert Status</h3>
              <p className="text-gray-700 mb-4">
                Establish yourself as a thought leader in your specialty and contribute
                to the profession.
              </p>
              <div className="text-sm text-gray-600">
                • Creator badge & profile<br />
                • Featured content placement<br />
                • Speaking opportunities
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Application Process */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Application & Assessment Process
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We maintain high quality standards to ensure professional, evidence-based content
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {/* Step 1 */}
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    1
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Submit Application</h3>
                  <p className="text-gray-700 mb-3">
                    Complete the creator application form with your professional background and
                    teaching interests.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="font-semibold text-gray-900 mb-2">Required Documents:</p>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li>✓ Current CV/Resume (PDF format)</li>
                      <li>✓ Proof of professional registration (HPCSA, equivalent)</li>
                      <li>✓ Academic qualifications</li>
                      <li>✓ Sample teaching content (optional but recommended)</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    2
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Initial Review (3-5 Days)</h3>
                  <p className="text-gray-700 mb-3">
                    Our academic review board evaluates your application based on:
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="font-semibold text-gray-900 mb-2">Professional Credentials:</p>
                      <ul className="space-y-1 text-sm text-gray-700">
                        <li>• Professional registration status</li>
                        <li>• Years of clinical experience</li>
                        <li>• Academic qualifications</li>
                        <li>• Specialization areas</li>
                      </ul>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="font-semibold text-gray-900 mb-2">Teaching Capability:</p>
                      <ul className="space-y-1 text-sm text-gray-700">
                        <li>• Prior teaching experience</li>
                        <li>• Communication skills</li>
                        <li>• Content creation ability</li>
                        <li>• Subject matter expertise</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    3
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Sample Content Submission</h3>
                  <p className="text-gray-700 mb-3">
                    Create and submit a sample course module (15-20 minutes of content) to demonstrate
                    your teaching style and content quality.
                  </p>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="font-semibold text-gray-900 mb-2">Quality Standards:</p>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li>✓ Evidence-based content with peer-reviewed references</li>
                      <li>✓ Clear learning objectives and outcomes</li>
                      <li>✓ Professional presentation (slides, video, or written)</li>
                      <li>✓ Appropriate for CPD certification</li>
                      <li>✓ Accurate, current, and clinically relevant</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    4
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Expert Review (5-7 Days)</h3>
                  <p className="text-gray-700 mb-3">
                    Subject matter experts evaluate your sample content for:
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700"><strong>Scientific Accuracy:</strong> Correctness of medical/technical information</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700"><strong>Educational Quality:</strong> Clarity, structure, and learning effectiveness</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700"><strong>Clinical Relevance:</strong> Practical application to professional practice</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700"><strong>Production Quality:</strong> Professional presentation standards</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 5 */}
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    5
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Approval & Onboarding</h3>
                  <p className="text-gray-700 mb-3">
                    Upon approval, you'll receive:
                  </p>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">→</span>
                      <span>Creator account activation with full platform access</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">→</span>
                      <span>Creator handbook with guidelines and best practices</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">→</span>
                      <span>Access to content creation tools and templates</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">→</span>
                      <span>Stripe Connect setup for revenue payouts</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">→</span>
                      <span>Dedicated creator support contact</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Creator Requirements
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm p-8">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-8 h-8 text-blue-600" />
                <h3 className="text-xl font-bold text-gray-900">Professional Qualifications</h3>
              </div>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-1">✓</span>
                  <span>Registered with HPCSA or equivalent professional body</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-1">✓</span>
                  <span>Minimum 3 years clinical/professional experience</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-1">✓</span>
                  <span>Relevant academic qualifications (minimum Bachelor's degree)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-1">✓</span>
                  <span>Current knowledge of specialty area</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-1">✓</span>
                  <span>Professional indemnity insurance</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-8">
              <div className="flex items-center gap-3 mb-4">
                <BookOpen className="w-8 h-8 text-blue-600" />
                <h3 className="text-xl font-bold text-gray-900">Content Standards</h3>
              </div>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-1">✓</span>
                  <span>Evidence-based, peer-reviewed content only</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-1">✓</span>
                  <span>Proper citations and references required</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-1">✓</span>
                  <span>Original content (no plagiarism or copyright violations)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-1">✓</span>
                  <span>Clear learning objectives for each course</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-1">✓</span>
                  <span>Assessment questions to validate learning</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Revenue Details */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Revenue & Earnings
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Transparent, fair revenue sharing based on your content's performance
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-200 rounded-xl p-8 mb-8">
              <div className="text-center mb-6">
                <div className="text-5xl font-bold text-green-600 mb-2">70%</div>
                <p className="text-xl text-gray-900">Revenue Share to Creators</p>
                <p className="text-gray-600 mt-2">Platform keeps 30% for operations, hosting, and support</p>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mt-8">
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900 mb-1">R900</div>
                  <p className="text-sm text-gray-600">Minimum Payout</p>
                </div>
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900 mb-1">Monthly</div>
                  <p className="text-sm text-gray-600">Payout Schedule</p>
                </div>
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900 mb-1">5th</div>
                  <p className="text-sm text-gray-600">Payment Day</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-bold text-gray-900 mb-4">How Revenue Works:</h3>
              <div className="space-y-3 text-sm text-gray-700">
                <p>
                  <strong>1. View-Based Model:</strong> Your earnings are calculated based on the proportion
                  of total platform views your content receives (similar to Spotify's model).
                </p>
                <p>
                  <strong>2. Monthly Calculation:</strong> At the end of each month, total platform revenue
                  is divided among creators based on their view share.
                </p>
                <p>
                  <strong>3. Transparent Reporting:</strong> Access real-time analytics showing your views,
                  earnings, and payout projections in your creator dashboard.
                </p>
                <p>
                  <strong>4. Automatic Payouts:</strong> Once you reach R900 in earnings, payouts are
                  automatically processed on the 5th of each month via Stripe Connect.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                How long does the approval process take?
              </h3>
              <p className="text-gray-700">
                Typically 10-14 business days from application submission to final decision. This includes
                initial review (3-5 days), sample content creation time, and expert evaluation (5-7 days).
              </p>
            </div>

            <div className="bg-white rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I create content in my spare time?
              </h3>
              <p className="text-gray-700">
                Absolutely! Many of our creators have full-time clinical positions and create content in
                their spare time. There are no minimum content creation requirements - publish at your own pace.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What if my application is rejected?
              </h3>
              <p className="text-gray-700">
                You'll receive detailed feedback on why your application wasn't approved and suggestions for
                improvement. You can reapply after 3 months with enhanced credentials or improved sample content.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Do I retain copyright of my content?
              </h3>
              <p className="text-gray-700">
                Yes! You retain all intellectual property rights to your content. You grant RadSciCPD a
                non-exclusive license to host and distribute your content on the platform.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I also be a student on the platform?
              </h3>
              <p className="text-gray-700">
                Yes! Your creator account includes all professional subscription benefits. You can take
                courses from other creators while creating your own content.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Ready to Share Your Expertise?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join our community of expert educators and start earning while teaching
          </p>
          <Link
            href="/signup"
            className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition text-lg"
          >
            Apply to Become a Creator
          </Link>
          <p className="text-sm text-blue-200 mt-6">
            Questions? Email us at creators@radsci cpd.com
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold text-lg mb-4">About</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="hover:text-white transition">Our Mission</Link></li>
                <li><Link href="#" className="hover:text-white transition">Team</Link></li>
                <li><Link href="#" className="hover:text-white transition">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold text-lg mb-4">For Learners</h3>
              <ul className="space-y-2">
                <li><Link href="/courses" className="hover:text-white transition">Browse Courses</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold text-lg mb-4">For Creators</h3>
              <ul className="space-y-2">
                <li><Link href="/become-creator" className="hover:text-white transition">Become a Creator</Link></li>
                <li><Link href="/legal/creator-agreement" className="hover:text-white transition">Creator Agreement</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><Link href="/legal/terms" className="hover:text-white transition">Terms</Link></li>
                <li><Link href="/legal/privacy" className="hover:text-white transition">Privacy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2025 RadSciCPD. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
