import Link from "next/link"
import { prisma } from "@/lib/prisma"
import Image from "next/image"
import SearchBar from "@/components/SearchBar"

export default async function HomePage() {
  // Fetch trending courses (most viewed this week)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const trendingCourses = await prisma.course.findMany({
    where: {
      published: true,
      updatedAt: {
        gte: sevenDaysAgo,
      },
    },
    include: {
      creator: {
        select: {
          name: true,
          avatar: true,
        },
      },
      category: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      totalViews: 'desc',
    },
    take: 6,
  });

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              RadSciCPD
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/courses" className="text-gray-700 hover:text-blue-600 transition">
                Courses
              </Link>
              <Link href="/creators" className="text-gray-700 hover:text-blue-600 transition">
                Creators
              </Link>
              <Link href="#how-it-works" className="text-gray-700 hover:text-blue-600 transition">
                How It Works
              </Link>
              <Link href="#pricing" className="text-gray-700 hover:text-blue-600 transition">
                Pricing
              </Link>
              <Link href="#about" className="text-gray-700 hover:text-blue-600 transition">
                About
              </Link>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <Link
                href="/login"
                className="text-gray-700 hover:text-blue-600 transition"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Start Free Trial
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button className="md:hidden text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              Professional CPD for Radiation Sciences
            </h1>
            <p className="text-xl lg:text-2xl mb-8 text-blue-100">
              Evidence-based continuing education for radiographers, radiotherapists, nuclear medicine professionals, and medical physicists. Flexible, affordable, and accredited.
            </p>

            {/* Global Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <form action="/search" method="get">
                <div className="relative">
                  <input
                    type="text"
                    name="q"
                    placeholder="Search courses, creators, publications..."
                    className="w-full px-6 py-4 pr-12 rounded-lg text-gray-900 text-lg focus:ring-2 focus:ring-white focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </div>
              </form>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                href="/signup"
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition text-lg"
              >
                Start Free Trial
              </Link>
              <Link
                href="/courses"
                className="bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-800 transition text-lg border-2 border-white/20"
              >
                Browse Courses
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="grid md:grid-cols-3 gap-6 mt-16">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <div className="text-3xl mb-2">✓</div>
                <h3 className="font-semibold text-lg mb-2">Accredited CPD</h3>
                <p className="text-blue-100 text-sm">Professional credits recognized</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <div className="text-3xl mb-2">📚</div>
                <h3 className="font-semibold text-lg mb-2">Evidence-Based</h3>
                <p className="text-blue-100 text-sm">Peer-reviewed research</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <div className="text-3xl mb-2">⏰</div>
                <h3 className="font-semibold text-lg mb-2">Learn at Your Pace</h3>
                <p className="text-blue-100 text-sm">24/7 access, mobile-friendly</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">50+</div>
              <div className="text-gray-600">Courses Available</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">2,000+</div>
              <div className="text-gray-600">Healthcare Professionals Trained</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">100+</div>
              <div className="text-gray-600">CPD Hours of Content</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">4.8/5</div>
              <div className="text-gray-600">Average Course Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Now Section */}
      {trendingCourses.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                  Trending Now
                </h2>
                <p className="text-xl text-gray-600">
                  Most popular courses this week
                </p>
              </div>
              <Link href="/courses" className="text-blue-600 hover:text-blue-700 font-medium">
                View All →
              </Link>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingCourses.map((course) => (
                <Link
                  key={course.id}
                  href={`/courses/${course.slug}`}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {course.thumbnail ? (
                    <div className="relative w-full h-48 bg-gray-200">
                      <Image
                        src={course.thumbnail}
                        alt={course.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center">
                      <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                  )}
                  <div className="p-6">
                    {course.creator && (
                      <div className="flex items-center gap-2 mb-3">
                        {course.creator.avatar ? (
                          <div className="relative w-6 h-6 rounded-full overflow-hidden">
                            <Image
                              src={course.creator.avatar}
                              alt={course.creator.name || 'Creator'}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-medium">
                            {course.creator.name?.charAt(0) || 'C'}
                          </div>
                        )}
                        <span className="text-sm text-gray-600">{course.creator.name}</span>
                      </div>
                    )}
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {course.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="px-2 py-1 bg-gray-100 rounded">{course.category.name}</span>
                        <span>{course.cpdHours} hrs</span>
                      </div>
                      <div className="text-lg font-bold text-gray-900">
                        {course.price === 0 ? 'Free' : `R${course.price}`}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Course Categories */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Explore Course Categories
            </h2>
            <p className="text-xl text-gray-600">
              Specialized CPD for every radiation sciences discipline
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: "📊", title: "Diagnostic Imaging", courses: 15, desc: "X-ray, CT, MRI, and ultrasound techniques" },
              { icon: "⚡", title: "Radiotherapy", courses: 12, desc: "Treatment planning and delivery methods" },
              { icon: "☢️", title: "Nuclear Medicine", courses: 8, desc: "PET, SPECT, and radiopharmaceuticals" },
              { icon: "🛡️", title: "Radiation Protection", courses: 10, desc: "Safety, dosimetry, and regulations" },
              { icon: "🔬", title: "Radiobiology", courses: 7, desc: "Biological effects of ionizing radiation" },
              { icon: "🔧", title: "Medical Physics", courses: 8, desc: "Quality assurance and equipment" },
            ].map((category) => (
              <Link
                key={category.title}
                href="/courses"
                className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-blue-500 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1"
              >
                <div className="text-4xl mb-4">{category.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{category.title}</h3>
                <p className="text-gray-600 text-sm mb-3">{category.desc}</p>
                <div className="text-blue-600 font-semibold">{category.courses} courses</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Why Choose RadSciCPD?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: "🎓", title: "Accredited CPD Credits", desc: "Earn recognized professional development hours" },
              { icon: "📱", title: "Learn Anywhere, Anytime", desc: "Access courses on any device, at your convenience" },
              { icon: "✅", title: "Interactive Assessments", desc: "Test your knowledge with quizzes and practical exercises" },
              { icon: "📚", title: "Evidence-Based Content", desc: "Courses based on latest peer-reviewed research" },
              { icon: "💰", title: "Affordable Pricing", desc: "Quality CPD that fits your budget" },
              { icon: "🔒", title: "Secure & Compliant", desc: "Your data protected with industry-standard security" },
            ].map((feature) => (
              <div key={feature.title} className="text-center">
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Start earning CPD credits in four simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { num: 1, title: "Create Account", desc: "Sign up for free and complete your profile" },
              { num: 2, title: "Choose Courses", desc: "Browse our catalog and select courses that match your needs" },
              { num: 3, title: "Learn & Complete", desc: "Work through course material and pass assessments" },
              { num: 4, title: "Get Certified", desc: "Earn your CPD certificate and professional credits" },
            ].map((step) => (
              <div key={step.num} className="text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {step.num}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              What Our Users Say
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                role: "Senior Radiographer, NHS",
                text: "The courses are excellent quality and the CPD credits are recognized by my professional body. Highly recommended!",
                initials: "SJ"
              },
              {
                name: "Dr. Michael Chen",
                role: "Medical Physicist",
                text: "Finally, a platform that understands the specific needs of radiation science professionals. The content is evidence-based and practical.",
                initials: "MC"
              },
              {
                name: "Emma Williams",
                role: "Radiotherapy Technologist",
                text: "I love being able to learn at my own pace. The interactive quizzes really help reinforce the material.",
                initials: "EW"
              },
            ].map((testimonial) => (
              <div key={testimonial.name} className="bg-white rounded-lg p-6 shadow-lg">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">"{testimonial.text}"</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4">
                    {testimonial.initials}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-5xl font-bold mb-6">
            Start Your Professional Development Journey Today
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join 2,000+ healthcare professionals advancing their careers with RadSciCPD
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <Link
              href="/signup"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition text-lg"
            >
              Start 14-Day Free Trial
            </Link>
            <Link
              href="#contact"
              className="bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-800 transition text-lg border-2 border-white/20"
            >
              Request Demo
            </Link>
          </div>
          <p className="text-sm text-blue-200">
            No credit card required • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* About */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4">About</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="hover:text-white transition">Our Mission</Link></li>
                <li><Link href="#" className="hover:text-white transition">Team</Link></li>
                <li><Link href="#" className="hover:text-white transition">Accreditation</Link></li>
                <li><Link href="#" className="hover:text-white transition">Contact</Link></li>
              </ul>
            </div>

            {/* Courses */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Courses</h3>
              <ul className="space-y-2">
                <li><Link href="/courses" className="hover:text-white transition">Diagnostic Imaging</Link></li>
                <li><Link href="/courses" className="hover:text-white transition">Radiotherapy</Link></li>
                <li><Link href="/courses" className="hover:text-white transition">Nuclear Medicine</Link></li>
                <li><Link href="/courses" className="hover:text-white transition">Radiation Protection</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="hover:text-white transition">Blog</Link></li>
                <li><Link href="#" className="hover:text-white transition">Careers</Link></li>
                <li><Link href="#" className="hover:text-white transition">Partners</Link></li>
                <li><Link href="#" className="hover:text-white transition">Privacy Policy</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Support</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="hover:text-white transition">Help Center</Link></li>
                <li><Link href="#" className="hover:text-white transition">FAQs</Link></li>
                <li><Link href="#" className="hover:text-white transition">Technical Support</Link></li>
                <li><Link href="#" className="hover:text-white transition">Feedback</Link></li>
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
