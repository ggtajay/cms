import React, { useMemo, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import Sidebar from '../../components/Sidebar'
import { getBooks, getLoans, saveBooks, saveLoans } from '../../utils/libraryStore'

const LibrarianIssueBook = () => {
  const books = useMemo(() => getBooks(), [])
  const [formData, setFormData] = useState({
    bookId: '',
    borrowerName: '',
    borrowerId: '',
    dueDate: ''
  })

  const onSubmit = (e) => {
    e.preventDefault()
    const bookList = getBooks()
    const book = bookList.find((item) => item.id === formData.bookId)

    if (!book || book.availableCopies <= 0) {
      toast.error('Selected book is not available')
      return
    }

    book.availableCopies -= 1
    saveBooks(bookList)

    const loans = getLoans()
    loans.unshift({
      id: Date.now().toString(),
      ...formData,
      bookTitle: book.title,
      status: 'issued',
      issuedAt: new Date().toISOString()
    })
    saveLoans(loans)

    setFormData({ bookId: '', borrowerName: '', borrowerId: '', dueDate: '' })
    toast.success('Book issued successfully')
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />
      <Toaster position="top-right" />
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-slate-200 px-6 py-5">
          <h1 className="text-2xl font-bold text-slate-900">Issue Book</h1>
          <p className="text-sm text-slate-500 mt-1">Record a new book issue for a student or staff member.</p>
        </div>
        <div className="p-6">
          <form onSubmit={onSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 max-w-2xl space-y-4">
            <select className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white" value={formData.bookId} onChange={(e) => setFormData((prev) => ({ ...prev, bookId: e.target.value }))} required>
              <option value="">Select a book</option>
              {books.map((book) => (
                <option key={book.id} value={book.id}>
                  {book.title} ({book.availableCopies} available)
                </option>
              ))}
            </select>
            <input className="w-full px-4 py-3 rounded-xl border border-slate-300" placeholder="Borrower name" value={formData.borrowerName} onChange={(e) => setFormData((prev) => ({ ...prev, borrowerName: e.target.value }))} required />
            <input className="w-full px-4 py-3 rounded-xl border border-slate-300" placeholder="Borrower roll/employee ID" value={formData.borrowerId} onChange={(e) => setFormData((prev) => ({ ...prev, borrowerId: e.target.value }))} required />
            <input type="date" className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white" value={formData.dueDate} onChange={(e) => setFormData((prev) => ({ ...prev, dueDate: e.target.value }))} required />
            <button type="submit" className="px-5 py-3 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800">Issue Book</button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default LibrarianIssueBook
