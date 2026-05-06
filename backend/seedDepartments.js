/**
 * CPUH Departments Seeder
 * Seeds the 5 school/department records that correspond to the CPUH courses seeded earlier.
 * Run with: node seedDepartments.js
 */

require('dotenv').config()
const mongoose = require('mongoose')
const Department = require('./models/Department')

const departments = [
  {
    name: 'School of Engineering & Technology',
    code: 'SET',
    description: 'Offering B.Tech, M.Tech, BCA, MCA and diploma programs in Computer Science, Civil, Mechanical, Electrical, Data Science and AI.',
    isActive: true,
  },
  {
    name: 'School of Management & Liberal Arts',
    code: 'SMLA',
    description: 'Offering BBA, MBA, B.Com, BA, Hotel Management and integrated programs in business and humanities.',
    isActive: true,
  },
  {
    name: 'School of Basic & Applied Sciences',
    code: 'SBAS',
    description: 'Offering B.Sc and M.Sc programs in Physics, Chemistry, Mathematics, Botany, Zoology, Microbiology and Forensic Science.',
    isActive: true,
  },
  {
    name: 'School of Pharmaceutical Sciences',
    code: 'SPS',
    description: 'Offering B.Pharm, M.Pharm, D.Pharm and M.Sc programs in Pharmaceutical Chemistry, Yoga and Ayurveda.',
    isActive: true,
  },
  {
    name: 'School of Legal Studies & Governance',
    code: 'SLSG',
    description: 'Offering BA LLB (Integrated), LLB and LLM programs in legal studies and governance.',
    isActive: true,
  },
]

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('✅ Connected to MongoDB')

    const deleted = await Department.deleteMany({})
    console.log(`🗑️  Cleared ${deleted.deletedCount} existing departments`)

    const inserted = await Department.insertMany(departments)
    console.log(`🏫 Successfully seeded ${inserted.length} departments:\n`)
    inserted.forEach(d => console.log(`  [${d.code}] ${d.name}`))

    console.log('\n✨ Department seeding complete!')
    process.exit(0)
  } catch (err) {
    console.error('❌ Seeding failed:', err.message)
    process.exit(1)
  }
}

seed()
