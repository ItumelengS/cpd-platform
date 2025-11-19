import Link from "next/link"

export default function PricingPage() {
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
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Choose the plan that works best for you. All prices in South African Rand (ZAR).
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Free Plan */}
            <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-gray-200">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
                <div className="text-4xl font-bold text-gray-900 mb-2">R0</div>
                <p className="text-gray-600">Perfect to get started</p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="text-gray-700">Access to free courses</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="text-gray-700">CPD certificates</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="text-gray-700">Basic course materials</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-gray-400 mt-1">✗</span>
                  <span className="text-gray-400">Premium courses</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-gray-400 mt-1">✗</span>
                  <span className="text-gray-400">Priority support</span>
                </li>
              </ul>

              <Link
                href="/signup"
                className="block w-full text-center bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                Get Started
              </Link>
            </div>

            {/* Professional Plan - Most Popular */}
            <div className="bg-white rounded-xl shadow-2xl p-8 border-4 border-blue-600 relative transform scale-105">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </span>
              </div>

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Professional</h3>
                <div className="text-4xl font-bold text-blue-600 mb-2">R360</div>
                <p className="text-gray-600">per month</p>
                <p className="text-sm text-gray-500 mt-2">or R3,600/year (save 17%)</p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="text-gray-700">All free plan features</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="text-gray-700">Unlimited premium courses</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="text-gray-700">30 CPD hours/year content</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="text-gray-700">Priority email support</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="text-gray-700">Mobile app access</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="text-gray-700">Offline viewing</span>
                </li>
              </ul>

              <Link
                href="/signup"
                className="block w-full text-center bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Start Free Trial
              </Link>
              <p className="text-center text-sm text-gray-500 mt-3">14-day free trial, cancel anytime</p>
            </div>

            {/* Institution Plan */}
            <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-gray-200">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Institution</h3>
                <div className="text-4xl font-bold text-gray-900 mb-2">R1,800</div>
                <p className="text-gray-600">per month</p>
                <p className="text-sm text-gray-500 mt-2">or R18,000/year (save 17%)</p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="text-gray-700">All professional features</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="text-gray-700">Up to 50 team members</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="text-gray-700">Custom content requests</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="text-gray-700">Team progress tracking</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="text-gray-700">Dedicated account manager</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="text-gray-700">Priority phone support</span>
                </li>
              </ul>

              <Link
                href="/contact"
                className="block w-full text-center bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition"
              >
                Contact Sales
              </Link>
            </div>
          </div>

          {/* Pay Per Course Option */}
          <div className="mt-16 bg-blue-50 border-2 border-blue-200 rounded-xl p-8">
            <div className="text-center max-w-3xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Prefer Pay-Per-Course?
              </h3>
              <p className="text-gray-700 mb-6">
                Purchase individual courses without a subscription. Courses range from R540 to R18,000
                depending on content depth and CPD hours. Perfect if you only need specific courses.
              </p>
              <Link
                href="/courses"
                className="inline-block bg-blue-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Browse Courses
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Frequently Asked Questions
          </h2>

          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Can I cancel my subscription anytime?
              </h3>
              <p className="text-gray-700">
                Yes! You can cancel your subscription at any time. You'll continue to have access
                until the end of your billing period.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Are the CPD certificates recognized?
              </h3>
              <p className="text-gray-700">
                Yes, our CPD certificates are recognized by HPCSA and professional bodies in South Africa
                and internationally. Each course clearly indicates the CPD hours awarded.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-700">
                We accept all major credit cards, debit cards, and EFT payments through our secure
                payment gateway (PayFast for South African customers, Stripe for international).
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Do you offer student discounts?
              </h3>
              <p className="text-gray-700">
                Yes! Students and trainees can get 50% off the Professional plan. Contact us with
                proof of enrollment for the discount code.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Can I switch between plans?
              </h3>
              <p className="text-gray-700">
                Absolutely! You can upgrade or downgrade your plan at any time. Changes take effect
                at the start of your next billing cycle.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                What if I'm outside South Africa?
              </h3>
              <p className="text-gray-700">
                We serve professionals globally! International pricing is available in USD. The platform
                works seamlessly from anywhere in the world.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Ready to Advance Your Career?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join 2,000+ healthcare professionals advancing their careers with RadSciCPD
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition text-lg"
            >
              Start 14-Day Free Trial
            </Link>
            <Link
              href="/courses"
              className="bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-800 transition text-lg border-2 border-white/20"
            >
              Browse Free Courses
            </Link>
          </div>
          <p className="text-sm text-blue-200 mt-6">
            No credit card required • Cancel anytime • 14-day money-back guarantee
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
                <li><Link href="#" className="hover:text-white transition">Accreditation</Link></li>
                <li><Link href="#" className="hover:text-white transition">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-bold text-lg mb-4">Courses</h3>
              <ul className="space-y-2">
                <li><Link href="/courses" className="hover:text-white transition">All Courses</Link></li>
                <li><Link href="/courses" className="hover:text-white transition">Diagnostic Imaging</Link></li>
                <li><Link href="/courses" className="hover:text-white transition">Radiotherapy</Link></li>
                <li><Link href="/courses" className="hover:text-white transition">Nuclear Medicine</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-bold text-lg mb-4">Support</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="hover:text-white transition">Help Center</Link></li>
                <li><Link href="#" className="hover:text-white transition">FAQs</Link></li>
                <li><Link href="#" className="hover:text-white transition">Technical Support</Link></li>
                <li><Link href="#" className="hover:text-white transition">Feedback</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-bold text-lg mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><Link href="/legal/terms" className="hover:text-white transition">Terms of Service</Link></li>
                <li><Link href="/legal/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
                <li><Link href="/legal/creator-agreement" className="hover:text-white transition">Creator Agreement</Link></li>
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
