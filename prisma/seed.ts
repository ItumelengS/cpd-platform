import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Starting database seed...")

  // 1. Create Categories
  console.log("Creating categories...")
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "diagnostic-imaging" },
      update: {},
      create: {
        name: "Diagnostic Imaging",
        slug: "diagnostic-imaging",
        description: "X-ray, CT, MRI, and ultrasound techniques",
        icon: "📊",
        order: 1,
      },
    }),
    prisma.category.upsert({
      where: { slug: "radiotherapy" },
      update: {},
      create: {
        name: "Radiotherapy",
        slug: "radiotherapy",
        description: "Treatment planning and delivery methods",
        icon: "⚡",
        order: 2,
      },
    }),
    prisma.category.upsert({
      where: { slug: "nuclear-medicine" },
      update: {},
      create: {
        name: "Nuclear Medicine",
        slug: "nuclear-medicine",
        description: "PET, SPECT, and radiopharmaceuticals",
        icon: "☢️",
        order: 3,
      },
    }),
    prisma.category.upsert({
      where: { slug: "radiation-protection" },
      update: {},
      create: {
        name: "Radiation Protection",
        slug: "radiation-protection",
        description: "Safety, dosimetry, and regulations",
        icon: "🛡️",
        order: 4,
      },
    }),
    prisma.category.upsert({
      where: { slug: "radiobiology" },
      update: {},
      create: {
        name: "Radiobiology",
        slug: "radiobiology",
        description: "Biological effects of ionizing radiation",
        icon: "🔬",
        order: 5,
      },
    }),
    prisma.category.upsert({
      where: { slug: "medical-physics" },
      update: {},
      create: {
        name: "Medical Physics",
        slug: "medical-physics",
        description: "Quality assurance and equipment",
        icon: "🔧",
        order: 6,
      },
    }),
  ])
  console.log(`✓ Created ${categories.length} categories`)

  // 2. Create Users
  console.log("Creating users...")
  const adminPassword = await bcrypt.hash("admin123", 12)
  const userPassword = await bcrypt.hash("password123", 12)

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      name: "Admin User",
      password: adminPassword,
      role: "ADMIN",
      specialty: "Radiation Sciences",
      institution: "RadSciCPD",
      country: "United Kingdom",
    },
  })

  const user = await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: {
      email: "user@example.com",
      name: "Test User",
      password: userPassword,
      role: "USER",
      specialty: "Diagnostic Radiography",
      institution: "NHS Trust",
      country: "United Kingdom",
    },
  })
  console.log("✓ Created 2 users (admin@example.com / user@example.com)")

  // 3. Course 1: AI in Diagnostic Radiology
  console.log("Creating Course 1: AI in Diagnostic Radiology...")
  const course1 = await prisma.course.upsert({
    where: { slug: "ai-in-diagnostic-radiology" },
    update: {},
    create: {
      title: "AI in Diagnostic Radiology",
      slug: "ai-in-diagnostic-radiology",
      description:
        "Explore the transformative role of artificial intelligence in diagnostic radiology. Learn about AI applications in image analysis, workflow optimization, and clinical decision support.",
      categoryId: categories[0].id, // Diagnostic Imaging
      cpdHours: 2.0,
      difficulty: "Intermediate",
      sourceArticle: "Bhandari et al. (Cureus, 2024, CC BY 4.0)",
      published: true,
      price: 0,
    },
  })

  // Course 1 Sections
  const course1Sections = await Promise.all([
    prisma.section.create({
      data: {
        courseId: course1.id,
        title: "Introduction to AI in Radiology",
        order: 1,
        minTimeSeconds: 300,
        content: `Artificial Intelligence (AI) is revolutionizing the field of diagnostic radiology. Machine learning algorithms and deep neural networks are being developed to assist radiologists in image interpretation, workflow optimization, and clinical decision-making.

AI applications in radiology include:
• Computer-aided detection (CAD) systems for identifying abnormalities
• Automated image segmentation and quantification
• Natural language processing for report generation
• Predictive analytics for patient outcomes

The integration of AI into radiology practice promises to improve diagnostic accuracy, reduce interpretation time, and enhance patient care. However, it also raises important questions about validation, regulation, and the changing role of radiologists.

Key concepts:
- Machine learning: Algorithms that learn patterns from data
- Deep learning: Neural networks with multiple layers
- Training data: Large datasets used to teach AI systems
- Validation: Testing AI performance on new, unseen data

Current applications are most successful in well-defined tasks with large training datasets, such as detecting lung nodules on chest CT or identifying diabetic retinopathy on fundus photography.`,
      },
    }),
    prisma.section.create({
      data: {
        courseId: course1.id,
        title: "AI for Image Analysis",
        order: 2,
        minTimeSeconds: 300,
        content: `AI excels at analyzing medical images through pattern recognition and feature extraction. Convolutional neural networks (CNNs) have demonstrated human-level performance in many image classification tasks.

Deep learning models can:
1. Detect subtle abnormalities that may be missed by human observers
2. Quantify disease progression through automated measurements
3. Prioritize urgent cases in radiology worklists
4. Reduce false positives in screening programs

Case Study: Mammography Screening
AI algorithms have shown promise in breast cancer detection, with some studies demonstrating equivalent or superior performance compared to single radiologist interpretation. These systems can serve as a "second reader" to improve detection rates.

Challenges:
• Generalizability across different scanners and protocols
• Handling rare or unusual presentations
• Integration with existing PACS systems
• Explaining AI decisions to clinicians

Best practices for implementing AI tools:
- Validate on local patient population
- Monitor performance continuously
- Maintain human oversight
- Document AI use in radiology reports`,
      },
    }),
    prisma.section.create({
      data: {
        courseId: course1.id,
        title: "Clinical Workflow Integration",
        order: 3,
        minTimeSeconds: 300,
        content: `Successful AI implementation requires thoughtful integration into clinical workflows. AI tools should enhance rather than disrupt radiologist efficiency and decision-making.

Workflow considerations:
• Seamless integration with PACS and RIS
• Real-time processing without delaying reports
• Clear presentation of AI findings
• Easy acceptance or rejection of AI suggestions

Implementation strategies:
1. Start with high-volume, repetitive tasks
2. Provide training for all users
3. Establish quality assurance processes
4. Create feedback mechanisms for continuous improvement

Case prioritization is an emerging application where AI analyzes incoming studies and flags urgent findings, allowing radiologists to review critical cases first. This can improve patient safety and satisfaction.

Change management is crucial:
- Engage radiologists in selection and testing
- Address concerns about job displacement
- Emphasize AI as an assistive tool
- Celebrate successes and learn from failures`,
      },
    }),
    prisma.section.create({
      data: {
        courseId: course1.id,
        title: "Regulatory and Ethical Considerations",
        order: 4,
        minTimeSeconds: 300,
        content: `AI in healthcare is subject to regulatory oversight and raises important ethical questions about patient safety, privacy, and the role of human judgment.

Regulatory frameworks:
• FDA (US): Software as a Medical Device (SaMD)
• CE marking (Europe): Medical Device Regulation (MDR)
• UK: MHRA guidance on AI as a medical device

Key regulatory requirements:
- Clinical validation studies
- Risk management documentation
- Post-market surveillance
- Cybersecurity measures

Ethical considerations:
• Algorithmic bias and health equity
• Patient consent for AI use
• Transparency and explainability
• Liability when AI makes errors

Data privacy is paramount. AI systems must comply with regulations like GDPR and HIPAA. De-identification of training data and secure model deployment are essential.

Professional responsibilities:
- Radiologists remain ultimately responsible for diagnoses
- Clear documentation of AI assistance
- Understanding AI limitations
- Advocacy for patient-centered AI development`,
      },
    }),
    prisma.section.create({
      data: {
        courseId: course1.id,
        title: "Future Directions and Skills",
        order: 5,
        minTimeSeconds: 300,
        content: `The future of radiology will involve close collaboration between radiologists and AI systems. Preparing for this future requires developing new skills and adapting to evolving technology.

Emerging applications:
• Radiogenomics: Linking imaging features to genetic data
• Multimodal AI: Combining images with clinical data
• Federated learning: Training on distributed datasets
• Real-time imaging guidance during procedures

Skills for the AI era:
1. Data literacy and statistics
2. Understanding AI capabilities and limitations
3. Critical evaluation of AI outputs
4. Collaboration with data scientists and engineers

The role of radiologists is evolving from pure image interpretation to:
- Clinical consultation and correlation
- Quality assurance of AI systems
- Complex case problem-solving
- Patient communication about findings

Education and training must adapt:
- Incorporate AI into radiology residency curricula
- Provide continuing education on AI developments
- Foster interdisciplinary collaboration
- Promote research on AI validation and implementation

Radiologists who embrace AI as a tool will be best positioned to deliver high-quality, efficient patient care in the future.`,
      },
    }),
  ])
  console.log(`✓ Created ${course1Sections.length} sections for Course 1`)

  // Course 1 Section Questions
  console.log("Creating section questions for Course 1...")
  await prisma.question.createMany({
    data: [
      // Section 1 Questions
      {
        courseId: course1.id,
        sectionId: course1Sections[0].id,
        questionText: "What is the primary advantage of deep learning over traditional machine learning in medical imaging?",
        optionA: "It requires less training data",
        optionB: "It can automatically learn features from raw images",
        optionC: "It is faster to execute",
        optionD: "It requires less computational power",
        correctAnswer: "B",
        explanation: "Deep learning, particularly convolutional neural networks, can automatically learn relevant features directly from raw images without manual feature engineering, which is a key advantage.",
        order: 1,
      },
      {
        courseId: course1.id,
        sectionId: course1Sections[0].id,
        questionText: "Which of the following is NOT a current application of AI in radiology?",
        optionA: "Computer-aided detection systems",
        optionB: "Automated image segmentation",
        optionC: "Complete replacement of radiologists",
        optionD: "Natural language processing for reports",
        correctAnswer: "C",
        explanation: "AI currently assists radiologists but does not completely replace them. Human oversight and clinical judgment remain essential.",
        order: 2,
      },
      // Section 2 Questions
      {
        courseId: course1.id,
        sectionId: course1Sections[1].id,
        questionText: "In mammography screening, how have AI algorithms been utilized most effectively?",
        optionA: "As a replacement for all radiologist readers",
        optionB: "As a second reader to improve detection rates",
        optionC: "To reduce the need for imaging altogether",
        optionD: "To replace biopsy procedures",
        correctAnswer: "B",
        explanation: "AI algorithms in mammography screening work most effectively as a 'second reader,' complementing radiologist interpretation to improve cancer detection rates.",
        order: 1,
      },
      {
        courseId: course1.id,
        sectionId: course1Sections[1].id,
        questionText: "What is a major challenge in implementing AI for medical image analysis?",
        optionA: "Images are too simple for AI to analyze",
        optionB: "Generalizability across different scanners and protocols",
        optionC: "AI is always 100% accurate",
        optionD: "There is too much training data available",
        correctAnswer: "B",
        explanation: "A major challenge is ensuring AI models generalize well across different imaging equipment, protocols, and patient populations, as they may be trained on specific datasets.",
        order: 2,
      },
    ],
  })

  // Course 1 Final Quiz Questions
  console.log("Creating final quiz for Course 1...")
  await prisma.question.createMany({
    data: [
      {
        courseId: course1.id,
        sectionId: null, // Final quiz
        questionText: "What is the main regulatory body overseeing AI medical devices in the United States?",
        optionA: "CDC",
        optionB: "FDA",
        optionC: "NIH",
        optionD: "WHO",
        correctAnswer: "B",
        explanation: "The FDA (Food and Drug Administration) regulates AI as Software as a Medical Device (SaMD) in the United States.",
        order: 1,
      },
      {
        courseId: course1.id,
        sectionId: null,
        questionText: "Which skill is becoming increasingly important for radiologists in the AI era?",
        optionA: "Programming in Python",
        optionB: "Data literacy and understanding AI limitations",
        optionC: "Manual film processing",
        optionD: "Ignoring AI outputs completely",
        correctAnswer: "B",
        explanation: "Data literacy and understanding AI capabilities and limitations are crucial skills for radiologists to effectively use AI tools and maintain quality patient care.",
        order: 2,
      },
      {
        courseId: course1.id,
        sectionId: null,
        questionText: "What is federated learning in the context of AI?",
        optionA: "Training on centralized government databases",
        optionB: "Training on distributed datasets without sharing raw data",
        optionC: "Learning only from federal regulations",
        optionD: "Collaborating with federal agencies",
        correctAnswer: "B",
        explanation: "Federated learning allows AI models to be trained on distributed datasets across multiple institutions without sharing sensitive patient data, preserving privacy.",
        order: 3,
      },
      {
        courseId: course1.id,
        sectionId: null,
        questionText: "Who remains ultimately responsible for diagnostic decisions when AI is used?",
        optionA: "The AI software company",
        optionB: "The hospital administrator",
        optionC: "The radiologist",
        optionD: "The referring physician",
        correctAnswer: "C",
        explanation: "The radiologist remains ultimately responsible for diagnostic decisions and patient care, even when AI tools are used to assist in interpretation.",
        order: 4,
      },
      {
        courseId: course1.id,
        sectionId: null,
        questionText: "What is an example of case prioritization using AI?",
        optionA: "Deleting low-quality images",
        optionB: "Flagging urgent findings to expedite review",
        optionC: "Automatically discharging patients",
        optionD: "Canceling unnecessary studies",
        correctAnswer: "B",
        explanation: "AI case prioritization analyzes incoming studies and flags those with potential urgent findings, allowing radiologists to review critical cases first and improve patient safety.",
        order: 5,
      },
      {
        courseId: course1.id,
        sectionId: null,
        questionText: "Which is a key ethical consideration for AI in radiology?",
        optionA: "AI should make all decisions independently",
        optionB: "Algorithmic bias and health equity",
        optionC: "Reducing radiologist salaries",
        optionD: "Eliminating patient consent",
        correctAnswer: "B",
        explanation: "Algorithmic bias and health equity are critical ethical considerations, as AI systems trained on non-representative data may perform poorly for underrepresented populations.",
        order: 6,
      },
      {
        courseId: course1.id,
        sectionId: null,
        questionText: "What does PACS stand for in radiology?",
        optionA: "Picture Archiving and Communication System",
        optionB: "Patient Assessment and Care System",
        optionC: "Physician Automated Consultation Service",
        optionD: "Portable AI Computing System",
        correctAnswer: "A",
        explanation: "PACS stands for Picture Archiving and Communication System, the technology used to store and distribute medical images in healthcare facilities.",
        order: 7,
      },
      {
        courseId: course1.id,
        sectionId: null,
        questionText: "What is the role of explainability in medical AI?",
        optionA: "It is not important for clinical use",
        optionB: "Helping clinicians understand how AI reaches its conclusions",
        optionC: "Making AI slower to execute",
        optionD: "Preventing AI from being used",
        correctAnswer: "B",
        explanation: "Explainability helps clinicians understand how AI reaches its conclusions, building trust and enabling better clinical decision-making and quality assurance.",
        order: 8,
      },
      {
        courseId: course1.id,
        sectionId: null,
        questionText: "Which area is radiogenomics focused on?",
        optionA: "Linking imaging features to genetic data",
        optionB: "Improving X-ray tube technology",
        optionC: "Developing new contrast agents",
        optionD: "Training more radiologists",
        correctAnswer: "A",
        explanation: "Radiogenomics links imaging features to genetic and molecular data, potentially enabling non-invasive assessment of tumor characteristics and personalized treatment selection.",
        order: 9,
      },
      {
        courseId: course1.id,
        sectionId: null,
        questionText: "What is post-market surveillance for AI medical devices?",
        optionA: "Marketing the device after approval",
        optionB: "Monitoring device performance after deployment",
        optionC: "Selling devices in supermarkets",
        optionD: "Preventing competitors from entering the market",
        correctAnswer: "B",
        explanation: "Post-market surveillance involves ongoing monitoring of AI medical device performance and safety after deployment to detect any issues and ensure continued effectiveness.",
        order: 10,
      },
    ],
  })
  console.log("✓ Created section questions and final quiz for Course 1")

  // 4. Course 2: Radiation Protection Principles
  console.log("Creating Course 2: Radiation Protection Principles...")
  const course2 = await prisma.course.upsert({
    where: { slug: "radiation-protection-principles" },
    update: {},
    create: {
      title: "Radiation Protection Principles",
      slug: "radiation-protection-principles",
      description:
        "Essential principles of radiation protection for healthcare professionals. Learn about dose optimization, safety measures, and regulatory compliance in medical imaging.",
      categoryId: categories[3].id, // Radiation Protection
      cpdHours: 1.5,
      difficulty: "Beginner",
      published: true,
      price: 0,
    },
  })

  // Course 2 Sections
  const course2Sections = await Promise.all([
    prisma.section.create({
      data: {
        courseId: course2.id,
        title: "Fundamentals of Radiation Protection",
        order: 1,
        minTimeSeconds: 300,
        content: `Radiation protection is based on three fundamental principles established by the International Commission on Radiological Protection (ICRP):

1. JUSTIFICATION
Every exposure to ionizing radiation must be justified. The expected benefits must outweigh the potential risks. This applies to medical imaging procedures, where clinical benefit must justify radiation dose.

2. OPTIMIZATION (ALARA)
Radiation doses should be As Low As Reasonably Achievable (ALARA), taking economic and social factors into account. This means using the minimum dose necessary to achieve the clinical objective.

3. DOSE LIMITATION
Individual doses should not exceed specified limits set by regulatory bodies. These limits apply to occupational exposure and public exposure, but not to medical exposure of patients (where justification and optimization apply instead).

Key concepts:
• Deterministic effects: Occur above threshold doses (e.g., skin burns, cataracts)
• Stochastic effects: Probability increases with dose, no threshold (e.g., cancer, hereditary effects)
• Effective dose: Accounts for different organ sensitivities (measured in Sieverts)
• Equivalent dose: Accounts for radiation type (measured in Sieverts)

Understanding these principles is essential for all radiation workers to protect patients, staff, and the public.`,
      },
    }),
    prisma.section.create({
      data: {
        courseId: course2.id,
        title: "Dose Optimization Techniques",
        order: 2,
        minTimeSeconds: 300,
        content: `Practical strategies for optimizing radiation doses in medical imaging:

COMPUTED TOMOGRAPHY (CT)
• Use automatic exposure control (AEC)
• Adjust kV based on patient size
• Limit scan range to area of interest
• Use iterative reconstruction algorithms
• Avoid unnecessary multiphase studies

FLUOROSCOPY
• Keep exposure time as short as possible
• Use pulsed fluoroscopy
• Maintain maximum distance from X-ray source
• Use last-image-hold feature
• Collimate to reduce field size

RADIOGRAPHY
• Proper patient positioning to avoid repeats
• Use appropriate collimation
• Optimize kV and mAs
• Employ digital radiography with wide exposure latitude
• Regular equipment quality assurance

Patient-specific considerations:
- Pediatric patients require significant dose reduction
- Pregnant patients need special protocols
- Obese patients may require increased technique

Communication is key:
• Explain procedure to patients
• Document exposure parameters
• Report doses in radiology reports
• Participate in dose audits`,
      },
    }),
    prisma.section.create({
      data: {
        courseId: course2.id,
        title: "Personal Protection and Monitoring",
        order: 3,
        minTimeSeconds: 300,
        content: `Protecting healthcare workers from occupational radiation exposure:

SHIELDING
• Lead aprons (minimum 0.5 mm Pb equivalent)
• Thyroid shields
• Lead glasses for eye protection
• Mobile barriers for fluoroscopy
• Fixed room shielding (walls, glass)

TIME, DISTANCE, SHIELDING
The three principles of radiation protection:
1. Minimize time in radiation areas
2. Maximize distance from source (inverse square law)
3. Use appropriate shielding

PERSONAL DOSIMETRY
• Whole-body dosimeter (worn at collar level)
• Ring badge for extremity dose
• Monthly or quarterly reporting
• Investigation of high readings
• Lifetime dose tracking

Dose limits for workers:
- Effective dose: 20 mSv per year (averaged over 5 years)
- Equivalent dose: 500 mSv per year (hands, feet)
- Equivalent dose: 150 mSv per year (lens of eye)
- For pregnant workers: 1 mSv to fetus during pregnancy

Good practices:
• Stand behind protective barriers during fluoroscopy
• Step out of room during mobile radiography when possible
• Never hold patients or cassettes during exposure
• Ensure dosimeters are worn and processed regularly`,
      },
    }),
    prisma.section.create({
      data: {
        courseId: course2.id,
        title: "Regulatory Compliance and Quality Assurance",
        order: 4,
        minTimeSeconds: 300,
        content: `Maintaining compliance with radiation safety regulations:

REGULATORY BODIES
• IAEA: International Atomic Energy Agency
• National regulators (e.g., NRC in US, PHE in UK)
• Professional bodies (ICRP, NCRP)
• Accreditation organizations

KEY REGULATIONS
• Equipment registration and inspection
• Radiation worker training and authorization
• Dose monitoring and record keeping
• Incident reporting
• Room surveys and shielding verification

QUALITY ASSURANCE PROGRAM
Daily checks:
- Visual inspection of equipment
- Image quality verification

Monthly/Quarterly tests:
- Output constancy
- Beam quality assessment
- AEC performance

Annual tests:
- Full equipment evaluation
- Shielding integrity
- Comprehensive image quality assessment

DOCUMENTATION
• Equipment maintenance logs
• QA test results
• Staff training records
• Incident reports
• Dose audit data

Continuous improvement:
- Regular review of protocols
- Benchmarking against standards
- Staff education and training
- Learning from incidents and near-misses
- Staying current with technology and regulations`,
      },
    }),
  ])
  console.log(`✓ Created ${course2Sections.length} sections for Course 2`)

  // Course 2 Section Questions
  console.log("Creating section questions for Course 2...")
  await prisma.question.createMany({
    data: [
      {
        courseId: course2.id,
        sectionId: course2Sections[0].id,
        questionText: "What does ALARA stand for in radiation protection?",
        optionA: "All Levels Are Reasonable Assessment",
        optionB: "As Low As Reasonably Achievable",
        optionC: "Avoid Long And Repeated Actions",
        optionD: "Always Limit And Reduce Activity",
        correctAnswer: "B",
        explanation: "ALARA stands for As Low As Reasonably Achievable, one of the fundamental principles of radiation protection.",
        order: 1,
      },
      {
        courseId: course2.id,
        sectionId: course2Sections[0].id,
        questionText: "Which type of radiation effect has NO threshold dose?",
        optionA: "Deterministic effects",
        optionB: "Stochastic effects",
        optionC: "Acute effects",
        optionD: "Immediate effects",
        correctAnswer: "B",
        explanation: "Stochastic effects (like cancer and hereditary effects) have no threshold dose - the probability increases with dose but can occur at any dose level.",
        order: 2,
      },
      {
        courseId: course2.id,
        sectionId: course2Sections[1].id,
        questionText: "In CT imaging, which technique helps reduce patient dose?",
        optionA: "Always using maximum kV",
        optionB: "Scanning entire body in every exam",
        optionC: "Using iterative reconstruction algorithms",
        optionD: "Avoiding automatic exposure control",
        correctAnswer: "C",
        explanation: "Iterative reconstruction algorithms can maintain image quality while reducing radiation dose compared to traditional filtered back projection.",
        order: 1,
      },
      {
        courseId: course2.id,
        sectionId: course2Sections[1].id,
        questionText: "What is the recommended approach for pediatric imaging?",
        optionA: "Use adult protocols without modification",
        optionB: "Significant dose reduction is required",
        optionC: "Always double the dose for clarity",
        optionD: "Avoid imaging children completely",
        correctAnswer: "B",
        explanation: "Pediatric patients are more radiosensitive and have longer life expectancy, requiring significant dose reduction through child-specific protocols.",
        order: 2,
      },
    ],
  })

  // Course 2 Final Quiz
  console.log("Creating final quiz for Course 2...")
  await prisma.question.createMany({
    data: [
      {
        courseId: course2.id,
        sectionId: null,
        questionText: "What are the three fundamental principles of radiation protection?",
        optionA: "Speed, accuracy, quality",
        optionB: "Time, distance, shielding",
        optionC: "Justification, optimization, dose limitation",
        optionD: "Training, monitoring, reporting",
        correctAnswer: "C",
        explanation: "The three fundamental principles established by ICRP are justification, optimization (ALARA), and dose limitation.",
        order: 1,
      },
      {
        courseId: course2.id,
        sectionId: null,
        questionText: "What is the minimum lead equivalence for protective aprons?",
        optionA: "0.25 mm Pb",
        optionB: "0.5 mm Pb",
        optionC: "1.0 mm Pb",
        optionD: "2.0 mm Pb",
        correctAnswer: "B",
        explanation: "The minimum lead equivalence for protective aprons is typically 0.5 mm Pb, though specific requirements may vary by regulation.",
        order: 2,
      },
      {
        courseId: course2.id,
        sectionId: null,
        questionText: "Where should a whole-body dosimeter be worn?",
        optionA: "On the wrist",
        optionB: "At collar level",
        optionC: "On the belt",
        optionD: "In the pocket",
        correctAnswer: "B",
        explanation: "Whole-body dosimeters should be worn at collar level outside protective aprons to measure effective dose to the body.",
        order: 3,
      },
      {
        courseId: course2.id,
        sectionId: null,
        questionText: "What is the annual effective dose limit for radiation workers?",
        optionA: "5 mSv",
        optionB: "10 mSv",
        optionC: "20 mSv",
        optionD: "50 mSv",
        correctAnswer: "C",
        explanation: "The effective dose limit for radiation workers is 20 mSv per year, averaged over 5 years, with no single year exceeding 50 mSv.",
        order: 4,
      },
      {
        courseId: course2.id,
        sectionId: null,
        questionText: "Which fluoroscopy technique reduces patient dose?",
        optionA: "Continuous fluoroscopy at maximum dose rate",
        optionB: "Pulsed fluoroscopy",
        optionC: "Never using collimation",
        optionD: "Increasing frame rate to maximum",
        correctAnswer: "B",
        explanation: "Pulsed fluoroscopy delivers X-rays in short pulses rather than continuously, significantly reducing patient and staff dose while maintaining adequate image quality.",
        order: 5,
      },
      {
        courseId: course2.id,
        sectionId: null,
        questionText: "How does distance affect radiation exposure according to the inverse square law?",
        optionA: "Dose increases with distance",
        optionB: "Dose decreases with square of distance",
        optionC: "Distance has no effect",
        optionD: "Dose increases exponentially",
        correctAnswer: "B",
        explanation: "According to the inverse square law, radiation intensity decreases proportionally to the square of the distance from the source. Doubling distance reduces dose to one-quarter.",
        order: 6,
      },
      {
        courseId: course2.id,
        sectionId: null,
        questionText: "What is the dose limit to the fetus of a pregnant radiation worker?",
        optionA: "0.5 mSv",
        optionB: "1 mSv",
        optionC: "5 mSv",
        optionD: "10 mSv",
        correctAnswer: "B",
        explanation: "The dose limit to the fetus of a declared pregnant worker is 1 mSv for the duration of the pregnancy.",
        order: 7,
      },
      {
        courseId: course2.id,
        sectionId: null,
        questionText: "Which organization establishes international radiation protection standards?",
        optionA: "WHO",
        optionB: "ICRP",
        optionC: "FDA",
        optionD: "CDC",
        correctAnswer: "B",
        explanation: "The International Commission on Radiological Protection (ICRP) establishes international standards and recommendations for radiation protection.",
        order: 8,
      },
      {
        courseId: course2.id,
        sectionId: null,
        questionText: "What is the purpose of collimation in radiography?",
        optionA: "Increase image brightness",
        optionB: "Reduce field size and patient dose",
        optionC: "Speed up exposure time",
        optionD: "Improve equipment lifespan",
        correctAnswer: "B",
        explanation: "Collimation restricts the X-ray beam to the area of interest, reducing patient dose and improving image quality by reducing scatter radiation.",
        order: 9,
      },
      {
        courseId: course2.id,
        sectionId: null,
        questionText: "How often should comprehensive quality assurance tests be performed on radiographic equipment?",
        optionA: "Daily",
        optionB: "Weekly",
        optionC: "Monthly",
        optionD: "Annually",
        correctAnswer: "D",
        explanation: "Comprehensive quality assurance tests, including full equipment evaluation and calibration, should be performed annually, while simpler tests are done more frequently.",
        order: 10,
      },
    ],
  })
  console.log("✓ Created section questions and final quiz for Course 2")

  console.log("✅ Database seeded successfully!")
  console.log("\n📊 Summary:")
  console.log(`- ${categories.length} categories`)
  console.log("- 2 users (admin@example.com, user@example.com)")
  console.log("- 2 complete courses with sections and quizzes")
  console.log("\n🔐 Login credentials:")
  console.log("Admin: admin@example.com / admin123")
  console.log("User: user@example.com / password123")
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
