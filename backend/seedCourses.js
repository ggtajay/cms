/**
 * CPUH Course Seeder
 * Seeds the database with all courses from Career Point University Hamirpur (CPUH)
 * Run with: node seedCourses.js
 */

require('dotenv').config()
const mongoose = require('mongoose')
const Course = require('./models/Course')

const MONGO_URI = process.env.MONGO_URI

const courses = [
  // ── School of Engineering & Technology ──────────────────────────────────────
  {
    name: 'Computer Science & Engineering',
    code: 'BTECH-CSE',
    type: 'UG',
    duration: 4,
    totalSemesters: 8,
    description: 'B.Tech in Computer Science & Engineering covering algorithms, software development, AI and systems design.',
    departments: ['School of Engineering & Technology'],
    deliveryMode: 'REGULAR',
  },
  {
    name: 'Civil Engineering',
    code: 'BTECH-CE',
    type: 'UG',
    duration: 4,
    totalSemesters: 8,
    description: 'B.Tech in Civil Engineering covering structural design, construction, and infrastructure development.',
    departments: ['School of Engineering & Technology'],
    deliveryMode: 'REGULAR',
  },
  {
    name: 'Mechanical Engineering',
    code: 'BTECH-ME',
    type: 'UG',
    duration: 4,
    totalSemesters: 8,
    description: 'B.Tech in Mechanical Engineering covering thermodynamics, manufacturing, and machine design.',
    departments: ['School of Engineering & Technology'],
    deliveryMode: 'REGULAR',
  },
  {
    name: 'Electrical Engineering',
    code: 'BTECH-EE',
    type: 'UG',
    duration: 4,
    totalSemesters: 8,
    description: 'B.Tech in Electrical Engineering covering power systems, electronics and control systems.',
    departments: ['School of Engineering & Technology'],
    deliveryMode: 'REGULAR',
  },
  {
    name: 'Data Science',
    code: 'BTECH-DS',
    type: 'UG',
    duration: 4,
    totalSemesters: 8,
    description: 'B.Tech in Data Science focusing on machine learning, big data analytics and statistical modelling.',
    departments: ['School of Engineering & Technology'],
    deliveryMode: 'REGULAR',
  },
  {
    name: 'Artificial Intelligence',
    code: 'BTECH-AI',
    type: 'UG',
    duration: 4,
    totalSemesters: 8,
    description: 'B.Tech in Artificial Intelligence covering deep learning, neural networks and intelligent systems.',
    departments: ['School of Engineering & Technology'],
    deliveryMode: 'REGULAR',
  },
  {
    name: 'Bachelor of Computer Applications',
    code: 'BCA',
    type: 'UG',
    duration: 3,
    totalSemesters: 6,
    description: 'BCA program covering programming, databases, networking and software engineering fundamentals.',
    departments: ['School of Engineering & Technology'],
    deliveryMode: 'REGULAR',
  },
  {
    name: 'Bachelor of Science - Information Technology',
    code: 'BSCIT',
    type: 'UG',
    duration: 3,
    totalSemesters: 6,
    description: 'B.Sc IT covering web technologies, databases, operating systems and network administration.',
    departments: ['School of Engineering & Technology'],
    deliveryMode: 'REGULAR',
  },
  {
    name: 'Master of Technology - Computer Science & Engineering',
    code: 'MTECH-CSE',
    type: 'PG',
    duration: 2,
    totalSemesters: 4,
    description: 'M.Tech CSE focusing on advanced algorithms, distributed computing and research methodologies.',
    departments: ['School of Engineering & Technology'],
    deliveryMode: 'REGULAR',
  },
  {
    name: 'Master of Computer Applications',
    code: 'MCA',
    type: 'PG',
    duration: 2,
    totalSemesters: 4,
    description: 'MCA program with advanced software development, database management and enterprise computing.',
    departments: ['School of Engineering & Technology'],
    deliveryMode: 'REGULAR',
  },
  {
    name: 'Master of Computer Applications - AI & Data Science',
    code: 'MCA-AIDS',
    type: 'PG',
    duration: 2,
    totalSemesters: 4,
    description: 'Specialised MCA in Artificial Intelligence and Data Science with industry-relevant curriculum.',
    departments: ['School of Engineering & Technology'],
    deliveryMode: 'REGULAR',
  },
  {
    name: 'Master of Science - Information Technology',
    code: 'MSCIT',
    type: 'PG',
    duration: 2,
    totalSemesters: 4,
    description: 'M.Sc IT focusing on advanced IT infrastructure, cloud computing and information security.',
    departments: ['School of Engineering & Technology'],
    deliveryMode: 'REGULAR',
  },
  {
    name: 'BCA + MCA (Integrated)',
    code: 'BCA-MCA-INT',
    type: 'UG',
    duration: 5,
    totalSemesters: 10,
    description: 'Integrated 5-year BCA + MCA program for comprehensive computer applications education.',
    departments: ['School of Engineering & Technology'],
    deliveryMode: 'REGULAR',
  },
  {
    name: 'Diploma in Computer Applications',
    code: 'DCA',
    type: 'Diploma',
    duration: 1,
    totalSemesters: 2,
    description: 'Diploma in Computer Applications covering office automation, internet and basic programming.',
    departments: ['School of Engineering & Technology'],
    deliveryMode: 'REGULAR',
  },
  {
    name: 'Post Graduate Diploma in Computer Applications',
    code: 'PGDCA',
    type: 'Diploma',
    duration: 1,
    totalSemesters: 2,
    description: 'PG Diploma in Computer Applications for graduates seeking IT skills and software development.',
    departments: ['School of Engineering & Technology'],
    deliveryMode: 'REGULAR',
  },
  {
    name: 'PG Diploma in Artificial Intelligence',
    code: 'PGDAI',
    type: 'Diploma',
    duration: 1,
    totalSemesters: 2,
    description: 'Post Graduate Diploma focused on applied Artificial Intelligence and machine learning tools.',
    departments: ['School of Engineering & Technology'],
    deliveryMode: 'REGULAR',
  },

  // ── School of Management & Liberal Arts ─────────────────────────────────────
  {
    name: 'Bachelor of Business Administration',
    code: 'BBA',
    type: 'UG',
    duration: 3,
    totalSemesters: 6,
    description: 'BBA program covering management principles, marketing, finance and entrepreneurship.',
    departments: ['School of Management & Liberal Arts'],
    deliveryMode: 'REGULAR',
  },
  {
    name: 'Bachelor of Commerce (Honours)',
    code: 'BCOM-H',
    type: 'UG',
    duration: 3,
    totalSemesters: 6,
    description: 'B.Com Hons covering accounting, taxation, business law and financial management.',
    departments: ['School of Management & Liberal Arts'],
    deliveryMode: 'REGULAR',
  },
  {
    name: 'Bachelor of Hotel Management & Catering Technology',
    code: 'BHMCT',
    type: 'UG',
    duration: 4,
    totalSemesters: 8,
    description: 'BHMCT covering hospitality operations, food & beverage management and hotel administration.',
    departments: ['School of Management & Liberal Arts'],
    deliveryMode: 'REGULAR',
  },
  {
    name: 'Bachelor of Science - Culinary Arts',
    code: 'BSC-CA',
    type: 'UG',
    duration: 3,
    totalSemesters: 6,
    description: 'B.Sc Culinary Arts covering professional cooking, baking, patisserie and kitchen management.',
    departments: ['School of Management & Liberal Arts'],
    deliveryMode: 'REGULAR',
  },
  {
    name: 'Bachelor of Arts (Honours)',
    code: 'BA-H',
    type: 'UG',
    duration: 3,
    totalSemesters: 6,
    description: 'B.A Hons in English, Hindi, History or Political Science for humanities and social sciences.',
    departments: ['School of Management & Liberal Arts'],
    deliveryMode: 'REGULAR',
  },
  {
    name: 'Master of Business Administration',
    code: 'MBA',
    type: 'PG',
    duration: 2,
    totalSemesters: 4,
    description: 'MBA program covering strategic management, HR, marketing, finance and business analytics.',
    departments: ['School of Management & Liberal Arts'],
    deliveryMode: 'REGULAR',
  },
  {
    name: 'Master of Commerce',
    code: 'MCOM',
    type: 'PG',
    duration: 2,
    totalSemesters: 4,
    description: 'M.Com covering advanced accounting, corporate finance, taxation and commerce research.',
    departments: ['School of Management & Liberal Arts'],
    deliveryMode: 'REGULAR',
  },
  {
    name: 'Master of Arts',
    code: 'MA',
    type: 'PG',
    duration: 2,
    totalSemesters: 4,
    description: 'M.A in English, Hindi, History, Geography, Sociology or Political Science.',
    departments: ['School of Management & Liberal Arts'],
    deliveryMode: 'REGULAR',
  },
  {
    name: 'Master of Science - Hotel Management',
    code: 'MSC-HM',
    type: 'PG',
    duration: 2,
    totalSemesters: 4,
    description: 'Advanced study in hospitality management, revenue management and hotel operations.',
    departments: ['School of Management & Liberal Arts'],
    deliveryMode: 'REGULAR',
  },
  {
    name: 'BBA + MBA (Integrated)',
    code: 'BBA-MBA-INT',
    type: 'UG',
    duration: 5,
    totalSemesters: 10,
    description: 'Integrated 5-year BBA + MBA for a complete business management education pathway.',
    departments: ['School of Management & Liberal Arts'],
    deliveryMode: 'REGULAR',
  },
  {
    name: 'Diploma in Food Production',
    code: 'DIP-FP',
    type: 'Diploma',
    duration: 1,
    totalSemesters: 2,
    description: 'Diploma in Food Production and Bakery covering professional kitchen and pastry skills.',
    departments: ['School of Management & Liberal Arts'],
    deliveryMode: 'REGULAR',
  },

  // ── School of Basic & Applied Sciences ──────────────────────────────────────
  {
    name: 'Bachelor of Science (Honours) - Pure Sciences',
    code: 'BSC-PS',
    type: 'UG',
    duration: 3,
    totalSemesters: 6,
    description: 'B.Sc Hons in Physics, Chemistry or Mathematics with strong theoretical and lab foundations.',
    departments: ['School of Basic & Applied Sciences'],
    deliveryMode: 'REGULAR',
  },
  {
    name: 'Bachelor of Science (Honours) - Life Sciences',
    code: 'BSC-LS',
    type: 'UG',
    duration: 3,
    totalSemesters: 6,
    description: 'B.Sc Hons in Botany, Zoology or Microbiology with practical lab and research components.',
    departments: ['School of Basic & Applied Sciences'],
    deliveryMode: 'REGULAR',
  },
  {
    name: 'Bachelor of Science - Forensic Science',
    code: 'BSC-FS',
    type: 'UG',
    duration: 3,
    totalSemesters: 6,
    description: 'B.Sc Forensic Science covering criminology, toxicology, DNA analysis and evidence processing.',
    departments: ['School of Basic & Applied Sciences'],
    deliveryMode: 'REGULAR',
  },
  {
    name: 'Master of Science - Pure Sciences',
    code: 'MSC-PS',
    type: 'PG',
    duration: 2,
    totalSemesters: 4,
    description: 'M.Sc in Chemistry, Physics or Mathematics with research projects and advanced coursework.',
    departments: ['School of Basic & Applied Sciences'],
    deliveryMode: 'REGULAR',
  },
  {
    name: 'Master of Science - Life Sciences',
    code: 'MSC-LS',
    type: 'PG',
    duration: 2,
    totalSemesters: 4,
    description: 'M.Sc in Botany, Zoology or Microbiology with specialisations in molecular biology.',
    departments: ['School of Basic & Applied Sciences'],
    deliveryMode: 'REGULAR',
  },
  {
    name: 'Master of Science - Mathematics & Computing',
    code: 'MSC-MC',
    type: 'PG',
    duration: 2,
    totalSemesters: 4,
    description: 'M.Sc Mathematics & Computing bridging applied mathematics and computational methods.',
    departments: ['School of Basic & Applied Sciences'],
    deliveryMode: 'REGULAR',
  },
  {
    name: 'Master of Science - Medical Laboratory Sciences',
    code: 'MSC-MLS',
    type: 'PG',
    duration: 2,
    totalSemesters: 4,
    description: 'M.Sc Medical Microbiology and Lab Sciences for diagnostic and clinical research careers.',
    departments: ['School of Basic & Applied Sciences'],
    deliveryMode: 'REGULAR',
  },

  // ── School of Pharmaceutical Sciences ───────────────────────────────────────
  {
    name: 'Bachelor of Pharmacy',
    code: 'BPHARM',
    type: 'UG',
    duration: 4,
    totalSemesters: 8,
    description: 'B.Pharm covering pharmaceutical chemistry, pharmacology, clinical pharmacy and drug regulatory affairs.',
    departments: ['School of Pharmaceutical Sciences'],
    deliveryMode: 'REGULAR',
  },
  {
    name: 'Diploma in Pharmacy - Allopathy',
    code: 'DPHARM-A',
    type: 'Diploma',
    duration: 2,
    totalSemesters: 4,
    description: 'D.Pharm (Allopathy) for pharmacy technicians in hospitals, retail pharmacies and dispensaries.',
    departments: ['School of Pharmaceutical Sciences'],
    deliveryMode: 'REGULAR',
  },
  {
    name: 'Diploma in Pharmacy - Ayurveda',
    code: 'DPHARM-AY',
    type: 'Diploma',
    duration: 2,
    totalSemesters: 4,
    description: 'D.Pharm (Ayurveda) covering traditional herbal medicine, Ayurvedic formulations and dispensing.',
    departments: ['School of Pharmaceutical Sciences'],
    deliveryMode: 'REGULAR',
  },
  {
    name: 'Master of Pharmacy - Pharmaceutics',
    code: 'MPHARM-PH',
    type: 'PG',
    duration: 2,
    totalSemesters: 4,
    description: 'M.Pharm Pharmaceutics covering drug delivery systems, formulation development and bioavailability.',
    departments: ['School of Pharmaceutical Sciences'],
    deliveryMode: 'REGULAR',
  },
  {
    name: 'Master of Pharmacy - Pharmacognosy',
    code: 'MPHARM-PG',
    type: 'PG',
    duration: 2,
    totalSemesters: 4,
    description: 'M.Pharm Pharmacognosy focusing on natural products, herbal drugs and phytochemistry.',
    departments: ['School of Pharmaceutical Sciences'],
    deliveryMode: 'REGULAR',
  },
  {
    name: 'Master of Pharmacy - Ayurveda',
    code: 'MPHARM-AY',
    type: 'PG',
    duration: 2,
    totalSemesters: 4,
    description: 'M.Pharm Ayurveda with focus on classical Ayurvedic formulations and modern herbal medicine.',
    departments: ['School of Pharmaceutical Sciences'],
    deliveryMode: 'REGULAR',
  },
  {
    name: 'Master of Science - Yoga Science',
    code: 'MSC-YOGA',
    type: 'PG',
    duration: 2,
    totalSemesters: 4,
    description: 'M.Sc Yoga Science covering advanced yoga therapy, anatomy, physiology and wellness management.',
    departments: ['School of Pharmaceutical Sciences'],
    deliveryMode: 'REGULAR',
  },
  {
    name: 'Master of Science - Pharmaceutical Chemistry',
    code: 'MSC-PCHEM',
    type: 'PG',
    duration: 2,
    totalSemesters: 4,
    description: 'M.Sc Pharmaceutical Chemistry covering drug synthesis, medicinal chemistry and analytical techniques.',
    departments: ['School of Pharmaceutical Sciences'],
    deliveryMode: 'REGULAR',
  },
  {
    name: 'Diploma in Yoga',
    code: 'DIP-YOGA',
    type: 'Diploma',
    duration: 1,
    totalSemesters: 2,
    description: 'Diploma in Yoga covering asanas, pranayama, meditation and yoga philosophy.',
    departments: ['School of Pharmaceutical Sciences'],
    deliveryMode: 'REGULAR',
  },

  // ── School of Legal Studies & Governance ────────────────────────────────────
  {
    name: 'BA LLB (Integrated)',
    code: 'BA-LLB',
    type: 'UG',
    duration: 5,
    totalSemesters: 10,
    description: 'Integrated BA LLB covering constitutional law, civil procedure, criminal law and legal research.',
    departments: ['School of Legal Studies & Governance'],
    deliveryMode: 'REGULAR',
  },
  {
    name: 'Bachelor of Laws',
    code: 'LLB',
    type: 'UG',
    duration: 3,
    totalSemesters: 6,
    description: 'LLB program for graduates covering substantive and procedural law, jurisprudence and legal practice.',
    departments: ['School of Legal Studies & Governance'],
    deliveryMode: 'REGULAR',
  },
  {
    name: 'Master of Laws',
    code: 'LLM',
    type: 'PG',
    duration: 2,
    totalSemesters: 4,
    description: 'LLM for legal professionals with specialisations in corporate law, human rights and constitutional law.',
    departments: ['School of Legal Studies & Governance'],
    deliveryMode: 'REGULAR',
  },

  // ── Doctoral Programs ────────────────────────────────────────────────────────
  {
    name: 'Doctor of Philosophy',
    code: 'PHD',
    type: 'PhD',
    duration: 3,
    totalSemesters: 6,
    description: 'PhD research program available across Engineering, Management, Sciences, Pharmacy and Law.',
    departments: [
      'School of Engineering & Technology',
      'School of Management & Liberal Arts',
      'School of Basic & Applied Sciences',
      'School of Pharmaceutical Sciences',
      'School of Legal Studies & Governance',
    ],
    deliveryMode: 'REGULAR',
  },
]

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI)
    console.log('✅ Connected to MongoDB')

    // Delete existing courses
    const deleted = await Course.deleteMany({})
    console.log(`🗑️  Cleared ${deleted.deletedCount} existing courses`)

    // Insert all CPUH courses
    const inserted = await Course.insertMany(courses)
    console.log(`🎓 Successfully seeded ${inserted.length} CPUH courses!\n`)

    // Print summary by school
    const schools = {}
    courses.forEach(c => {
      const school = c.departments[0]
      if (!schools[school]) schools[school] = []
      schools[school].push(`  [${c.code}] ${c.name} (${c.type}, ${c.duration} yr)`)
    })

    Object.entries(schools).forEach(([school, list]) => {
      console.log(`\n📚 ${school} (${list.length} programs)`)
      list.forEach(l => console.log(l))
    })

    console.log('\n✨ Seeding complete!')
    process.exit(0)
  } catch (err) {
    console.error('❌ Seeding failed:', err.message)
    process.exit(1)
  }
}

seed()
