/**
 * Auto ID Generator — collision-safe, year-aware
 *
 * Examples: STU260001, TCH260001, ADM260001, APP260001
 */

const Student = require('../models/Student')
const Faculty = require('../models/Faculty')
const User = require('../models/User')
const Application = require('../models/Application')

/**
 * Pad a number to a given length with leading zeros
 */
const pad = (n, len) => String(n).padStart(len, '0')

/**
 * Get the 2-digit current year (e.g., 2026 → '26')
 */
const getYear = () => new Date().getFullYear().toString().slice(-2)

/**
 * Generic ID generator
 */
const generateId = async (Model, fieldName, prefixStr) => {
  const year = getYear()
  const prefix = `${prefixStr}${year}`

  const latest = await Model.findOne(
    { [fieldName]: { $regex: `^${prefix}` } },
    { [fieldName]: 1 },
    { sort: { [fieldName]: -1 } }
  )

  let nextSeq = 1
  if (latest && latest[fieldName]) {
    const existing = parseInt(latest[fieldName].slice(prefix.length), 10)
    if (!isNaN(existing)) {
      nextSeq = existing + 1
    }
  }

  return `${prefix}${pad(nextSeq, 4)}`
}

const generateStudentId = () => generateId(Student, 'studentId', 'STU')
const generateFacultyId = () => generateId(Faculty, 'facultyId', 'TCH')
const generateAppId = () => generateId(Application, 'applicationId', 'APP')

const generateUserId = async (role) => {
  let prefix = 'USR'
  switch (role) {
    case 'superadmin': prefix = 'SUP'; break;
    case 'admin': prefix = 'ADM'; break;
    case 'teacher': prefix = 'TCH'; break;
    case 'student': prefix = 'STU'; break;
    case 'parent': prefix = 'PRN'; break;
    case 'accountant': prefix = 'ACT'; break;
    case 'librarian': prefix = 'LIB'; break;
  }
  return generateId(User, 'userId', prefix)
}

// Deprecated, but keeping for backward compatibility if any random controllers use it
const generateStaffId = (StaffModel) => generateId(StaffModel, 'staffId', 'EMP')

module.exports = { generateStudentId, generateFacultyId, generateAppId, generateUserId, generateId, generateStaffId }
