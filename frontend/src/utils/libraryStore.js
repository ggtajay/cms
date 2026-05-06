const BOOKS_KEY = 'cms_library_books'
const LOANS_KEY = 'cms_library_loans'
const FINES_KEY = 'cms_library_fines'

const read = (key, fallback = []) => {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback))
  } catch (error) {
    return fallback
  }
}

const write = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value))
}

export const getBooks = () => read(BOOKS_KEY)
export const saveBooks = (books) => write(BOOKS_KEY, books)

export const getLoans = () => read(LOANS_KEY)
export const saveLoans = (loans) => write(LOANS_KEY, loans)

export const getFines = () => read(FINES_KEY)
export const saveFines = (fines) => write(FINES_KEY, fines)
