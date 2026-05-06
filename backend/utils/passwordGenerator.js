/**
 * Secure random password generator
 * Generates a 10-character password with uppercase, lowercase, digits, and special chars
 */

const crypto = require('crypto')

const UPPERCASE = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
const LOWERCASE = 'abcdefghjkmnpqrstuvwxyz'
const DIGITS    = '23456789'
const SPECIAL   = '@#$!&*'
const ALL       = UPPERCASE + LOWERCASE + DIGITS + SPECIAL

/**
 * Pick a random char from a string using crypto for true randomness
 */
const pick = (str) => str[crypto.randomInt(str.length)]

/**
 * Generate a secure 10-character password
 * Guarantees at least 1 uppercase, 1 lowercase, 1 digit, 1 special
 */
const generatePassword = () => {
  const mandatory = [
    pick(UPPERCASE),
    pick(UPPERCASE),
    pick(LOWERCASE),
    pick(LOWERCASE),
    pick(DIGITS),
    pick(DIGITS),
    pick(SPECIAL),
  ]

  // Fill remaining 3 characters from all chars
  while (mandatory.length < 10) {
    mandatory.push(pick(ALL))
  }

  // Fisher-Yates shuffle to randomize position of mandatory chars
  for (let i = mandatory.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1)
    ;[mandatory[i], mandatory[j]] = [mandatory[j], mandatory[i]]
  }

  return mandatory.join('')
}

module.exports = { generatePassword }
