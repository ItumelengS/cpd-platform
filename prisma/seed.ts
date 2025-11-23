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

  // Additional Courses
  console.log("Creating additional courses...")

  const additionalCourses = await Promise.all([
    // Diagnostic Imaging Courses
    prisma.course.create({
      data: {
        title: "CT Imaging Protocols and Optimization",
        slug: "ct-imaging-protocols-optimization",
        description: "Master CT imaging protocols, dose optimization techniques, and advanced reconstruction methods for superior diagnostic quality.",
        categoryId: categories[0].id,
        cpdHours: 3.0,
        difficulty: "Advanced",
        published: true,
        price: 1800,
      },
    }),
    prisma.course.create({
      data: {
        title: "MRI Physics and Safety",
        slug: "mri-physics-safety",
        description: "Comprehensive guide to MRI physics, safety protocols, and contraindications for safe and effective imaging.",
        categoryId: categories[0].id,
        cpdHours: 2.5,
        difficulty: "Intermediate",
        published: true,
        price: 1440,
      },
    }),
    prisma.course.create({
      data: {
        title: "Ultrasound Imaging Techniques",
        slug: "ultrasound-imaging-techniques",
        description: "Essential ultrasound techniques for diagnostic imaging including Doppler, musculoskeletal, and abdominal scanning.",
        categoryId: categories[0].id,
        cpdHours: 2.0,
        difficulty: "Beginner",
        published: true,
        price: 900,
      },
    }),
    prisma.course.create({
      data: {
        title: "Pediatric Imaging Best Practices",
        slug: "pediatric-imaging-best-practices",
        description: "Specialized protocols and dose reduction strategies for imaging pediatric patients across all modalities.",
        categoryId: categories[0].id,
        cpdHours: 2.5,
        difficulty: "Intermediate",
        published: true,
        price: 0,
      },
    }),
    prisma.course.create({
      data: {
        title: "Interventional Radiology Fundamentals",
        slug: "interventional-radiology-fundamentals",
        description: "Introduction to interventional radiology procedures, equipment, and patient care considerations.",
        categoryId: categories[0].id,
        cpdHours: 3.5,
        difficulty: "Advanced",
        published: true,
        price: 2160,
      },
    }),

    // Radiotherapy Courses
    prisma.course.create({
      data: {
        title: "IMRT and VMAT Planning",
        slug: "imrt-vmat-planning",
        description: "Advanced treatment planning techniques for intensity-modulated radiation therapy and volumetric arc therapy.",
        categoryId: categories[1].id,
        cpdHours: 4.0,
        difficulty: "Advanced",
        published: true,
        price: 2700,
      },
    }),
    prisma.course.create({
      data: {
        title: "Radiation Oncology for Breast Cancer",
        slug: "radiation-oncology-breast-cancer",
        description: "Evidence-based approaches to breast cancer radiotherapy including partial breast irradiation and hypofractionation.",
        categoryId: categories[1].id,
        cpdHours: 3.0,
        difficulty: "Intermediate",
        published: true,
        price: 1800,
      },
    }),
    prisma.course.create({
      data: {
        title: "Stereotactic Radiotherapy (SBRT)",
        slug: "stereotactic-radiotherapy-sbrt",
        description: "Precision radiotherapy techniques for treating small tumors with high-dose, limited-fraction treatments.",
        categoryId: categories[1].id,
        cpdHours: 3.5,
        difficulty: "Advanced",
        published: true,
        price: 2340,
      },
    }),
    prisma.course.create({
      data: {
        title: "Patient Setup and Positioning",
        slug: "patient-setup-positioning",
        description: "Accurate patient positioning techniques and immobilization devices for consistent treatment delivery.",
        categoryId: categories[1].id,
        cpdHours: 2.0,
        difficulty: "Beginner",
        published: true,
        price: 0,
      },
    }),

    // Nuclear Medicine Courses
    prisma.course.create({
      data: {
        title: "PET/CT in Oncology",
        slug: "pet-ct-oncology",
        description: "Clinical applications of PET/CT imaging in cancer diagnosis, staging, and treatment monitoring.",
        categoryId: categories[2].id,
        cpdHours: 2.5,
        difficulty: "Intermediate",
        published: true,
        price: 1620,
      },
    }),
    prisma.course.create({
      data: {
        title: "Cardiac Nuclear Medicine",
        slug: "cardiac-nuclear-medicine",
        description: "Myocardial perfusion imaging, cardiac PET, and nuclear cardiology protocols for assessing heart function.",
        categoryId: categories[2].id,
        cpdHours: 3.0,
        difficulty: "Advanced",
        published: true,
        price: 1980,
      },
    }),
    prisma.course.create({
      data: {
        title: "Radiopharmacy Fundamentals",
        slug: "radiopharmacy-fundamentals",
        description: "Preparation, quality control, and safe handling of radiopharmaceuticals in nuclear medicine.",
        categoryId: categories[2].id,
        cpdHours: 2.5,
        difficulty: "Intermediate",
        published: true,
        price: 1440,
      },
    }),
    prisma.course.create({
      data: {
        title: "Thyroid and Endocrine Nuclear Medicine",
        slug: "thyroid-endocrine-nuclear-medicine",
        description: "Nuclear medicine imaging and therapy for thyroid disorders and endocrine conditions.",
        categoryId: categories[2].id,
        cpdHours: 2.0,
        difficulty: "Beginner",
        published: true,
        price: 900,
      },
    }),

    // Radiation Protection Courses
    prisma.course.create({
      data: {
        title: "Radiation Safety in Pregnancy",
        slug: "radiation-safety-pregnancy",
        description: "Managing radiation exposure for pregnant patients and staff with evidence-based guidelines.",
        categoryId: categories[3].id,
        cpdHours: 1.5,
        difficulty: "Intermediate",
        published: true,
        price: 720,
      },
    }),
    prisma.course.create({
      data: {
        title: "Fluoroscopy Safety and Dose Management",
        slug: "fluoroscopy-safety-dose-management",
        description: "Advanced dose reduction techniques and safety protocols for fluoroscopic procedures.",
        categoryId: categories[3].id,
        cpdHours: 2.0,
        difficulty: "Intermediate",
        published: true,
        price: 0,
      },
    }),

    // Radiobiology Courses
    prisma.course.create({
      data: {
        title: "Radiobiology for Radiation Therapists",
        slug: "radiobiology-radiation-therapists",
        description: "Essential radiobiological principles for understanding radiation therapy effects and fractionation.",
        categoryId: categories[4].id,
        cpdHours: 2.5,
        difficulty: "Intermediate",
        published: true,
        price: 1260,
      },
    }),
    prisma.course.create({
      data: {
        title: "DNA Damage and Repair Mechanisms",
        slug: "dna-damage-repair-mechanisms",
        description: "Molecular basis of radiation-induced DNA damage and cellular repair pathways.",
        categoryId: categories[4].id,
        cpdHours: 3.0,
        difficulty: "Advanced",
        published: true,
        price: 1800,
      },
    }),
    prisma.course.create({
      data: {
        title: "Radiation Effects on Normal Tissues",
        slug: "radiation-effects-normal-tissues",
        description: "Understanding and managing radiation-induced toxicity in normal tissues during cancer treatment.",
        categoryId: categories[4].id,
        cpdHours: 2.0,
        difficulty: "Intermediate",
        published: true,
        price: 1080,
      },
    }),

    // Medical Physics Courses
    prisma.course.create({
      data: {
        title: "Quality Assurance in Radiotherapy",
        slug: "quality-assurance-radiotherapy",
        description: "Comprehensive QA protocols for linear accelerators, treatment planning systems, and imaging devices.",
        categoryId: categories[5].id,
        cpdHours: 3.5,
        difficulty: "Advanced",
        published: true,
        price: 2340,
      },
    }),
    prisma.course.create({
      data: {
        title: "Dosimetry and Radiation Measurements",
        slug: "dosimetry-radiation-measurements",
        description: "Principles of radiation dosimetry, measurement techniques, and calibration procedures.",
        categoryId: categories[5].id,
        cpdHours: 3.0,
        difficulty: "Advanced",
        published: true,
        price: 1980,
      },
    }),
    prisma.course.create({
      data: {
        title: "Treatment Planning Fundamentals",
        slug: "treatment-planning-fundamentals",
        description: "Introduction to radiation treatment planning including beam arrangement and dose calculation.",
        categoryId: categories[5].id,
        cpdHours: 2.5,
        difficulty: "Beginner",
        published: true,
        price: 0,
      },
    }),
    prisma.course.create({
      data: {
        title: "Monte Carlo Simulations in Medical Physics",
        slug: "monte-carlo-simulations",
        description: "Advanced computational techniques for modeling radiation transport and dose distributions.",
        categoryId: categories[5].id,
        cpdHours: 4.0,
        difficulty: "Advanced",
        published: true,
        price: 2880,
      },
    }),

    // More Diagnostic Imaging
    prisma.course.create({
      data: {
        title: "Chest Radiography: Advanced Interpretation",
        slug: "chest-radiography-advanced",
        description: "Systematic approach to chest X-ray interpretation with focus on subtle findings and patterns.",
        categoryId: categories[0].id,
        cpdHours: 2.0,
        difficulty: "Intermediate",
        published: true,
        price: 1080,
      },
    }),
    prisma.course.create({
      data: {
        title: "Musculoskeletal Imaging Essentials",
        slug: "musculoskeletal-imaging-essentials",
        description: "Imaging techniques and interpretation for bone and soft tissue disorders.",
        categoryId: categories[0].id,
        cpdHours: 2.5,
        difficulty: "Intermediate",
        published: true,
        price: 1440,
      },
    }),
    prisma.course.create({
      data: {
        title: "Contrast Media: Safety and Protocols",
        slug: "contrast-media-safety",
        description: "Evidence-based guidelines for safe contrast administration and managing adverse reactions.",
        categoryId: categories[0].id,
        cpdHours: 1.5,
        difficulty: "Beginner",
        published: true,
        price: 720,
      },
    }),
  ])
  console.log(`✓ Created ${additionalCourses.length} additional courses`)

  // Add sections to CT Imaging course
  console.log("Adding sections to CT Imaging course...")
  const ctCourse = additionalCourses.find(c => c.slug === "ct-imaging-protocols-optimization")
  if (ctCourse) {
    await Promise.all([
      prisma.section.create({
        data: {
          courseId: ctCourse.id,
          title: "CT Physics and Image Formation",
          order: 1,
          minTimeSeconds: 300,
          content: `Computed Tomography (CT) uses X-rays to create detailed cross-sectional images of the body. Understanding CT physics is essential for optimizing protocols and maintaining image quality.

Key Concepts:
• X-ray generation and attenuation
• Detector arrays and data acquisition
• Image reconstruction algorithms
• Hounsfield units and windowing

Modern multi-detector CT (MDCT) scanners can acquire multiple slices simultaneously, enabling:
- Faster scan times
- Improved spatial resolution
- Better z-axis coverage
- Reduced motion artifacts

The detector array converts X-ray photons into electrical signals, which are digitized and processed to create the final image. Iterative reconstruction algorithms have largely replaced filtered back projection, offering improved image quality at lower doses.`,
        },
      }),
      prisma.section.create({
        data: {
          courseId: ctCourse.id,
          title: "Protocol Optimization",
          order: 2,
          minTimeSeconds: 300,
          content: `Optimizing CT protocols balances image quality with radiation dose. Key parameters include:

TECHNIQUE FACTORS:
• kVp (tube voltage): Lower kVp increases contrast, higher reduces dose for large patients
• mAs (tube current-time): Directly proportional to dose and image noise
• Pitch: Higher pitch = faster scan, lower dose, but potentially more artifacts
• Rotation time: Affects temporal resolution

AUTOMATIC EXPOSURE CONTROL (AEC):
- Modulates tube current based on patient attenuation
- Maintains consistent image quality
- Reduces unnecessary radiation dose
- Should be enabled for most examinations

SCAN RANGE:
Limit to region of clinical interest - every unnecessary rotation adds dose without diagnostic benefit.`,
        },
      }),
      prisma.section.create({
        data: {
          courseId: ctCourse.id,
          title: "Advanced Reconstruction Techniques",
          order: 3,
          minTimeSeconds: 300,
          content: `Modern reconstruction methods significantly improve CT imaging:

ITERATIVE RECONSTRUCTION:
- Reduces image noise at lower doses
- Improves low-contrast detectability
- Multiple iterations refine image quality
- Examples: ASIR, SAFIRE, iDose

DUAL-ENERGY CT:
- Uses two different X-ray energies
- Material decomposition (iodine, calcium, water)
- Virtual monoenergetic images
- Applications: renal stones, gout, tumor characterization

METAL ARTIFACT REDUCTION:
- Specialized algorithms reduce streak artifacts
- Important for imaging orthopedic hardware
- Improves visualization of adjacent soft tissues`,
        },
      }),
    ])

    await prisma.question.createMany({
      data: [
        {
          courseId: ctCourse.id,
          sectionId: null,
          questionText: "What is the primary advantage of iterative reconstruction over filtered back projection?",
          optionA: "Faster reconstruction time",
          optionB: "Lower radiation dose for equivalent image quality",
          optionC: "Better visualization of bones",
          optionD: "Elimination of all artifacts",
          correctAnswer: "B",
          explanation: "Iterative reconstruction reduces image noise, allowing for lower radiation doses while maintaining diagnostic image quality.",
          order: 1,
        },
        {
          courseId: ctCourse.id,
          sectionId: null,
          questionText: "Which parameter directly controls radiation dose in CT?",
          optionA: "Reconstruction algorithm",
          optionB: "Window width",
          optionC: "mAs (milliampere-seconds)",
          optionD: "Field of view",
          correctAnswer: "C",
          explanation: "mAs is directly proportional to radiation dose - doubling mAs doubles the dose.",
          order: 2,
        },
      ],
    })
  }

  // Add sections to MRI Physics course
  console.log("Adding sections to MRI Physics course...")
  const mriCourse = additionalCourses.find(c => c.slug === "mri-physics-safety")
  if (mriCourse) {
    await Promise.all([
      prisma.section.create({
        data: {
          courseId: mriCourse.id,
          title: "MRI Principles and Safety Zones",
          order: 1,
          minTimeSeconds: 300,
          content: `MRI uses strong magnetic fields and radiofrequency pulses - no ionizing radiation.

SAFETY ZONES:
Zone I: Public area
Zone II: Interface between public and restricted
Zone III: Restricted access, screened individuals only
Zone IV: Scanner room - strictly controlled access

The static magnetic field is ALWAYS ON. Objects can become dangerous projectiles if brought into Zone IV.

Key Safety Concepts:
• Screening for implants and metallic foreign bodies
• Cardiac pacemakers - generally contraindicated
• Aneurysm clips - must verify MR compatibility
• Pregnancy - generally safe after first trimester
• Claustrophobia management`,
        },
      }),
      prisma.section.create({
        data: {
          courseId: mriCourse.id,
          title: "MRI Physics Fundamentals",
          order: 2,
          minTimeSeconds: 300,
          content: `MRI exploits nuclear magnetic resonance of hydrogen protons.

T1 RELAXATION:
- Time for protons to realign with main field
- Fat appears bright, water appears dark
- Good anatomical detail

T2 RELAXATION:
- Time for protons to dephase
- Water appears bright, fat appears dark
- Sensitive to pathology

PULSE SEQUENCES:
• Spin Echo: Standard, versatile
• Gradient Echo: Fast, used for angiography
• Inversion Recovery: STIR, FLAIR - suppress specific tissues
• Echo Planar Imaging: Very fast, used for diffusion

Weighting is controlled by TR (repetition time) and TE (echo time).`,
        },
      }),
    ])

    await prisma.question.createMany({
      data: [
        {
          courseId: mriCourse.id,
          sectionId: null,
          questionText: "In which MRI safety zone must ALL individuals be screened?",
          optionA: "Zone I",
          optionB: "Zone II",
          optionC: "Zone III",
          optionD: "Zone IV",
          correctAnswer: "C",
          explanation: "Zone III requires screening of all individuals before entry as it's within the 5 gauss line.",
          order: 1,
        },
        {
          courseId: mriCourse.id,
          sectionId: null,
          questionText: "What tissue appears bright on T1-weighted images?",
          optionA: "CSF",
          optionB: "Fat",
          optionC: "Edema",
          optionD: "Tumors",
          correctAnswer: "B",
          explanation: "Fat has short T1 relaxation time and appears bright (hyperintense) on T1-weighted images.",
          order: 2,
        },
      ],
    })
  }

  // Add sections to Pediatric Imaging course
  console.log("Adding sections to Pediatric Imaging course...")
  const pedsCourse = additionalCourses.find(c => c.slug === "pediatric-imaging-best-practices")
  if (pedsCourse) {
    await Promise.all([
      prisma.section.create({
        data: {
          courseId: pedsCourse.id,
          title: "Radiation Protection in Pediatrics",
          order: 1,
          minTimeSeconds: 300,
          content: `Children are more radiosensitive than adults and have longer life expectancy for effects to manifest.

ALARA in Pediatrics:
• Justify every examination
• Use alternative modalities when appropriate (US, MRI)
• Apply child-specific protocols
• NEVER use adult protocols on children

Dose Reduction Strategies:
- Reduce mAs and kVp appropriately
- Use AEC with pediatric settings
- Limit scan range to minimum
- Single-phase studies when possible
- Shield radiosensitive organs when feasible

Image Gently Campaign principles:
"Child-size" the radiation dose`,
        },
      }),
      prisma.section.create({
        data: {
          courseId: pedsCourse.id,
          title: "Age-Specific Protocols",
          order: 2,
          minTimeSeconds: 300,
          content: `Imaging protocols must be adjusted for patient age and size:

NEONATES (0-1 month):
- Lowest doses
- Consider US for many indications
- Minimal contrast if needed

INFANTS (1-12 months):
- Low dose protocols
- Fast sequences to minimize motion
- Sedation may be needed

CHILDREN (1-12 years):
- Weight-based protocols
- Age-appropriate communication
- Play therapy/distraction techniques

ADOLESCENTS (12-18 years):
- Approaching adult doses
- Consider gonadal shielding
- Privacy and modesty important`,
        },
      }),
    ])

    await prisma.question.createMany({
      data: [
        {
          courseId: pedsCourse.id,
          sectionId: null,
          questionText: "Why are children more radiosensitive than adults?",
          optionA: "Smaller body size",
          optionB: "Rapidly dividing cells and longer life expectancy",
          optionC: "Weaker immune system",
          optionD: "Thinner bones",
          correctAnswer: "B",
          explanation: "Rapidly dividing cells are more radiosensitive, and children have longer life expectancy for late effects to manifest.",
          order: 1,
        },
      ],
    })
  }

  // Add sections to IMRT/VMAT course
  console.log("Adding sections to IMRT/VMAT course...")
  const imrtCourse = additionalCourses.find(c => c.slug === "imrt-vmat-planning")
  if (imrtCourse) {
    await Promise.all([
      prisma.section.create({
        data: {
          courseId: imrtCourse.id,
          title: "IMRT Principles",
          order: 1,
          minTimeSeconds: 300,
          content: `Intensity-Modulated Radiation Therapy (IMRT) delivers highly conformal dose distributions.

Key Features:
• Non-uniform beam intensity
• Multiple beam angles
• Inverse planning optimization
• MLC creates complex field shapes

Benefits:
- Better target coverage
- Improved normal tissue sparing
- Dose escalation potential
- Reduced toxicity

Planning Process:
1. Define target volumes and organs at risk
2. Set dose constraints
3. Optimization algorithm finds optimal plan
4. Plan evaluation and approval
5. QA verification`,
        },
      }),
      prisma.section.create({
        data: {
          courseId: imrtCourse.id,
          title: "VMAT Technology",
          order: 2,
          minTimeSeconds: 300,
          content: `Volumetric Modulated Arc Therapy (VMAT) delivers IMRT while gantry rotates continuously.

Advantages:
• Faster treatment delivery (2-3 min vs 10-15 min)
• Better dose distribution in some cases
• Improved patient comfort
• Lower monitor units = less scatter

Technical Requirements:
- Simultaneous variation of:
  * Gantry rotation speed
  * MLC leaf positions
  * Dose rate

Quality Assurance:
- Pre-treatment verification
- Machine-specific QA
- Patient-specific QA`,
        },
      }),
    ])

    await prisma.question.createMany({
      data: [
        {
          courseId: imrtCourse.id,
          sectionId: null,
          questionText: "What is the primary advantage of VMAT over conventional IMRT?",
          optionA: "Better target coverage",
          optionB: "Faster treatment delivery",
          optionC: "No need for QA",
          optionD: "Lower equipment cost",
          correctAnswer: "B",
          explanation: "VMAT delivers treatment in 2-3 minutes versus 10-15 minutes for step-and-shoot IMRT.",
          order: 1,
        },
      ],
    })
  }

  // Add sections to PET/CT course
  console.log("Adding sections to PET/CT course...")
  const petCourse = additionalCourses.find(c => c.slug === "pet-ct-oncology")
  if (petCourse) {
    await Promise.all([
      prisma.section.create({
        data: {
          courseId: petCourse.id,
          title: "PET/CT Principles",
          order: 1,
          minTimeSeconds: 300,
          content: `PET/CT combines metabolic and anatomical imaging in one exam.

FDG (18F-Fluorodeoxyglucose):
• Glucose analog
• Accumulates in metabolically active cells
• Cancer cells typically show high uptake
• 6-hour half-life

Scan Protocol:
1. Patient fasting 4-6 hours
2. Blood glucose <200 mg/dL
3. FDG injection and uptake period (60 min)
4. CT scan for attenuation correction
5. PET acquisition
6. Image fusion and interpretation

SUV (Standardized Uptake Value):
- Semiquantitative measure of uptake
- Helps differentiate benign vs malignant
- Not diagnostic alone`,
        },
      }),
      prisma.section.create({
        data: {
          courseId: petCourse.id,
          title: "Clinical Applications",
          order: 2,
          minTimeSeconds: 300,
          content: `PET/CT has multiple oncology applications:

INITIAL STAGING:
- Detect distant metastases
- Identify occult disease
- Alter management in 20-40% of cases

TREATMENT RESPONSE:
- Early metabolic changes before anatomical
- Predict treatment outcomes
- Differentiate residual tumor from scar

RADIATION PLANNING:
- Define biological target volume
- Identify active tumor regions
- Guide dose escalation

Common False Positives:
- Inflammation
- Infection
- Brown fat
- Physiologic uptake (brain, heart, bladder)`,
        },
      }),
    ])
  }

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

  // Update some course prices to be more competitive
  console.log("Updating course prices to be more competitive...")
  await prisma.course.updateMany({
    where: { price: { gt: 2000 } },
    data: { price: 599 },
  })
  await prisma.course.updateMany({
    where: {
      price: { gt: 1000, lte: 2000 }
    },
    data: { price: 399 },
  })
  await prisma.course.updateMany({
    where: {
      price: { gt: 0, lte: 1000 }
    },
    data: { price: 249 },
  })
  console.log("✓ Updated course prices (R249-R599 range)")

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

  const totalCpdHours = bundleCourses.reduce((sum, c) => sum + c.cpdHours, 0)

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
  await prisma.course.updateMany({
    where: { id: { in: featuredCourseIds } },
    data: {
      isFeatured: true,
      rotationMonth: currentMonth,
      activeFrom: new Date(currentYear, currentMonth - 1, 1),
      activeTo: new Date(currentYear, currentMonth, 0, 23, 59, 59),
    },
  })
  console.log("✓ Marked courses as featured for current month")

  console.log("\n✅ Database seeded successfully!")
  console.log("\n📊 Summary:")
  console.log(`- ${categories.length} categories`)
  console.log("- 2 users (admin@example.com, user@example.com)")
  console.log(`- ${2 + additionalCourses.length} courses total`)
  console.log(`- ${subscriptionPlans.length} subscription plans`)
  console.log("- 1 monthly course bundle")
  console.log(`- Content added to 7+ courses with full sections and quizzes`)
  console.log("\n💰 Pricing:")
  console.log("- Individual courses: R249-R599")
  console.log("- Monthly bundle: R999")
  console.log("- Basic subscription: R299/month or R2,999/year")
  console.log("- Professional subscription: R499/month or R4,999/year (BEST VALUE - covers all 30 CPD points!)")
  console.log("- Premium subscription: R699/month or R6,999/year")
  console.log("\n🔐 Login credentials:")
  console.log("Admin: admin@example.com / admin123")
  console.log("User: user@example.com / password123")

// Helper function to get month name
function getMonthName(month: number): string {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]
  return months[month - 1]
}
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
