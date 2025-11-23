import Link from "next/link"
import { prisma } from "@/lib/prisma"
import PricingCard from "./PricingCard"

export const revalidate = 3600 // Revalidate every hour

export default async function PricingPage() {
  // Fetch subscription plans from database
  const subscriptionPlans = await prisma.subscriptionPlan.findMany({
    where: { active: true },
    orderBy: { displayOrder: "asc" },
  })

  // Parse features from JSON
  const plans = subscriptionPlans.map((plan) => ({
    ...plan,
    features: JSON.parse(plan.features as string) as string[],
  }))

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
            Affordable CPD for Everyone
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-4">
            Complete your annual CPD requirements for less than R5,000/year!
          </p>
          <p className="text-lg text-blue-200 max-w-2xl mx-auto">
            🎯 Professional plan covers ALL 30 required CPD points • 💰 Much cheaper than traditional courses • 🔄 Fresh content every month
          </p>
        </div>
      </section>

      {/* Pricing Toggle */}
      <div className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-600 text-lg">
            💡 Save up to 2 months with annual billing!
          </p>
        </div>
      </div>

      {/* Pricing Cards */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <PricingCard key={plan.id} plan={plan} />
            ))}
          </div>

          {/* Pay Per Course Option */}
          <div className="mt-16 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-8">
            <div className="text-center max-w-3xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                💳 Prefer Pay-Per-Course?
              </h3>
              <p className="text-gray-700 mb-2">
                Purchase individual courses without a subscription.
              </p>
              <p className="text-lg font-semibold text-purple-700 mb-6">
                Individual courses: <span className="text-2xl">R249 - R599</span>
              </p>
              <p className="text-gray-600 mb-6">
                Perfect if you only need specific courses or want to try before subscribing!
              </p>
              <Link
                href="/courses"
                className="inline-block bg-purple-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-purple-700 transition"
              >
                Browse Individual Courses →
              </Link>
            </div>
          </div>

          {/* Monthly Bundle Option */}
          <div className="mt-8 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-8">
            <div className="text-center max-w-3xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                📦 This Month's Featured Bundle
              </h3>
              <p className="text-gray-700 mb-2">
                Curated collection of 5 courses, updated monthly!
              </p>
              <p className="text-lg font-semibold text-amber-700 mb-6">
                Monthly Bundle: <span className="text-2xl">R999</span>
              </p>
              <p className="text-gray-600 mb-6">
                Great for one-time learners who want fresh, curated content each month.
              </p>
              <Link
                href="/courses"
                className="inline-block bg-amber-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-amber-700 transition"
              >
                View This Month's Bundle →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Why Choose RadSciCPD?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl mb-4">💰</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Incredibly Affordable
              </h3>
              <p className="text-gray-600">
                Get all 30 CPD points for under R5,000/year. Traditional courses can cost R10,000+!
              </p>
            </div>

            <div className="text-center">
              <div className="text-5xl mb-4">🔄</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Always Fresh Content
              </h3>
              <p className="text-gray-600">
                New courses added every month. Stay updated with the latest in radiation sciences!
              </p>
            </div>

            <div className="text-center">
              <div className="text-5xl mb-4">📱</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Learn Anywhere
              </h3>
              <p className="text-gray-600">
                Desktop, mobile, or tablet. Study at your own pace, on your schedule.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Frequently Asked Questions
          </h2>

          <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                How many CPD points do I need per year?
              </h3>
              <p className="text-gray-700">
                Most professionals need 30 CPD points per year as required by HPCSA. Our Professional plan covers this completely!
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Can I cancel my subscription anytime?
              </h3>
              <p className="text-gray-700">
                Yes! You can cancel your subscription at any time. You'll continue to have access
                until the end of your billing period. No hidden fees or penalties.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Are the CPD certificates recognized?
              </h3>
              <p className="text-gray-700">
                Yes, our CPD certificates are recognized by HPCSA and professional bodies in South Africa
                and internationally. Each course clearly indicates the CPD hours awarded.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                What if I already bought some individual courses?
              </h3>
              <p className="text-gray-700">
                Perfect! You can upgrade to a subscription anytime and get access to ALL courses. Your individual
                course purchases remain yours forever, even if you cancel the subscription later.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                How does the monthly course rotation work?
              </h3>
              <p className="text-gray-700">
                We curate featured course collections that rotate monthly. Subscribers always have access to all courses,
                but featured courses are highlighted. New courses are added regularly to keep content fresh and relevant.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-700">
                We accept all major credit cards, debit cards, and EFT payments through our secure
                payment gateway (PayFast for South African customers, Stripe for international).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Ready to Complete Your CPD for 2025?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of healthcare professionals who trust RadSciCPD for their CPD needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition text-lg"
            >
              Get Started - From R299/month
            </Link>
            <Link
              href="/courses"
              className="bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-800 transition text-lg border-2 border-white/20"
            >
              Browse All Courses
            </Link>
          </div>
          <p className="text-sm text-blue-200 mt-6">
            No credit card required to browse • Cancel anytime • Secure payments
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
                <li>
                  <Link href="#" className="hover:text-white transition">
                    Our Mission
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition">
                    Team
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition">
                    Accreditation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-bold text-lg mb-4">Courses</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/courses" className="hover:text-white transition">
                    All Courses
                  </Link>
                </li>
                <li>
                  <Link href="/courses" className="hover:text-white transition">
                    Diagnostic Imaging
                  </Link>
                </li>
                <li>
                  <Link href="/courses" className="hover:text-white transition">
                    Radiotherapy
                  </Link>
                </li>
                <li>
                  <Link href="/courses" className="hover:text-white transition">
                    Nuclear Medicine
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-bold text-lg mb-4">Support</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="hover:text-white transition">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition">
                    FAQs
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition">
                    Technical Support
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition">
                    Feedback
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-bold text-lg mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/legal/terms" className="hover:text-white transition">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/legal/privacy" className="hover:text-white transition">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/legal/creator-agreement"
                    className="hover:text-white transition"
                  >
                    Creator Agreement
                  </Link>
                </li>
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
