import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🔄 Updating platform with subscription model...")

  // Create Subscription Plans
  console.log("Creating subscription plans...")
  const subscriptionPlans = await Promise.all([
    prisma.subscriptionPlan.upsert({
      where: { name: "Basic CPD Access" },
      update: {},
      create: {
        name: "Basic CPD Access",
        tier: "BASIC",
        description: "Perfect for individual professionals who want affordable access to quality CPD courses",
        features: JSON.stringify([
          "Access to 10 CPD points worth of courses per month",
          "New courses added monthly",
          "Digital certificates upon completion",
          "Mobile and desktop access",
          "Email support"
        ]),
        monthlyPrice: 299,      // R299/month (~R3,588/year)
        yearlyPrice: 2999,      // R2,999/year (save R589 = 2 months free!)
        cpdPointsPerYear: 15,
        courseAccessLevel: "basic",
        displayOrder: 1,
      },
    }),
    prisma.subscriptionPlan.upsert({
      where: { name: "Professional CPD Package" },
      update: {},
      create: {
        name: "Professional CPD Package",
        tier: "PROFESSIONAL",
        description: "Complete annual CPD solution - covers all 30 required points for the year!",
        features: JSON.stringify([
          "UNLIMITED access to ALL courses",
          "Covers full 30 CPD points required annually",
          "New courses every month - always fresh content",
          "Priority email support",
          "Downloadable course materials",
          "Advanced certificates",
          "Access to monthly webinars",
          "Best value for money!"
        ]),
        monthlyPrice: 499,      // R499/month (~R5,988/year)
        yearlyPrice: 4999,      // R4,999/year (save R989 = 2 months free!)
        cpdPointsPerYear: 30,   // Covers full annual requirement!
        courseAccessLevel: "all",
        displayOrder: 2,
      },
    }),
    prisma.subscriptionPlan.upsert({
      where: { name: "Premium CPD Plus" },
      update: {},
      create: {
        name: "Premium CPD Plus",
        tier: "PREMIUM",
        description: "Everything you need to excel - courses, support, and professional development",
        features: JSON.stringify([
          "UNLIMITED access to ALL courses",
          "40+ CPD points per year",
          "Monthly rotating course collections",
          "Priority 1-on-1 support",
          "Exclusive masterclass webinars",
          "Career development resources",
          "Networking opportunities",
          "Early access to new courses",
          "Premium digital certificates",
          "Downloadable course materials"
        ]),
        monthlyPrice: 699,      // R699/month (~R8,388/year)
        yearlyPrice: 6999,      // R6,999/year (save R1,389!)
        cpdPointsPerYear: 40,
        courseAccessLevel: "all",
        displayOrder: 3,
      },
    }),
  ])
  console.log(`✓ Created ${subscriptionPlans.length} subscription plans`)

  // Update course prices to be more competitive
  console.log("Updating course prices to be more competitive...")

  // High-priced courses -> R599
  const highPriceUpdated = await prisma.course.updateMany({
    where: { price: { gt: 2000 } },
    data: { price: 599 },
  })
  console.log(`✓ Updated ${highPriceUpdated.count} high-priced courses to R599`)

  // Mid-priced courses -> R399
  const midPriceUpdated = await prisma.course.updateMany({
    where: {
      price: { gt: 1000, lte: 2000 }
    },
    data: { price: 399 },
  })
  console.log(`✓ Updated ${midPriceUpdated.count} mid-priced courses to R399`)

  // Low-priced courses -> R249
  const lowPriceUpdated = await prisma.course.updateMany({
    where: {
      price: { gt: 0, lte: 1000 }
    },
    data: { price: 249 },
  })
  console.log(`✓ Updated ${lowPriceUpdated.count} low-priced courses to R249`)

  // Create current monthly bundle
  console.log("Creating monthly course bundle...")
  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  // Get first 5 published courses for the bundle
  const bundleCourses = await prisma.course.findMany({
    where: { published: true },
    take: 5,
    select: { id: true, cpdHours: true }
  })

  if (bundleCourses.length > 0) {
    const totalCpdHours = bundleCourses.reduce((sum, c) => sum + c.cpdHours, 0)

    function getMonthName(month: number): string {
      const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ]
      return months[month - 1]
    }

    await prisma.monthlyBundle.upsert({
      where: {
        year_month: {
          year: currentYear,
          month: currentMonth
        }
      },
      update: {},
      create: {
        name: `${getMonthName(currentMonth)} ${currentYear} - Featured CPD Collection`,
        description: `Carefully curated collection of ${bundleCourses.length} courses covering essential topics in radiation sciences. Complete this bundle to earn ${totalCpdHours} CPD points!`,
        month: currentMonth,
        year: currentYear,
        totalCpdHours,
        courseIds: JSON.stringify(bundleCourses.map(c => c.id)),
        activeFrom: new Date(currentYear, currentMonth - 1, 1),
        activeTo: new Date(currentYear, currentMonth, 0, 23, 59, 59),
        isCurrent: true,
        price: 999, // R999 for the bundle (cheaper than subscription, good for one-time purchase)
      },
    })
    console.log("✓ Created monthly bundle")

    // Mark some courses as featured for current month
    const featuredCourseIds = bundleCourses.map(c => c.id)
    const featuredUpdated = await prisma.course.updateMany({
      where: { id: { in: featuredCourseIds } },
      data: {
        isFeatured: true,
        rotationMonth: currentMonth,
        activeFrom: new Date(currentYear, currentMonth - 1, 1),
        activeTo: new Date(currentYear, currentMonth, 0, 23, 59, 59),
      },
    })
    console.log(`✓ Marked ${featuredUpdated.count} courses as featured for current month`)
  } else {
    console.log("⚠ No published courses found for bundle")
  }

  console.log("\n✅ Update completed successfully!")
  console.log("\n📊 Summary:")
  console.log(`- ${subscriptionPlans.length} subscription plans created`)
  console.log(`- ${highPriceUpdated.count + midPriceUpdated.count + lowPriceUpdated.count} courses repriced`)
  console.log("- 1 monthly course bundle created")
  console.log("\n💰 New Pricing Structure:")
  console.log("- Individual courses: R249-R599 (much more affordable!)")
  console.log("- Monthly bundle: R999 (great for one-time learners)")
  console.log("- Basic subscription: R299/month or R2,999/year (15 CPD points)")
  console.log("- Professional subscription: R499/month or R4,999/year (30 CPD points - FULL ANNUAL REQUIREMENT!)")
  console.log("- Premium subscription: R699/month or R6,999/year (40 CPD points + extras)")
  console.log("\n🎯 Key Features:")
  console.log("- Professional plan covers ALL required CPD points for the year")
  console.log("- Courses rotate monthly to keep content fresh")
  console.log("- Much more competitive pricing than before")
  console.log("- Udemy-style learning platform for CPD")
}

main()
  .catch((e) => {
    console.error("❌ Error updating database:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
