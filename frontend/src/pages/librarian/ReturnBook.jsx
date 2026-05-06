import React, { useMemo } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import Sidebar from '../../components/Sidebar'
import { getBooks, getLoans, saveBooks, saveLoans, getFines, saveFines } from '../../utils/libraryStore'

const LibrarianReturnBook = () => {
  const loans = useMemo(() => getLoans().filter((loan) => loan.status === 'issued'), [])

  const returnBook = (loanId) => {
    const loansData = getLoans()
    const books = getBooks()
    const loan = loansData.find((item) => item.id === loanId)
    const book = books.find((item) => item.id === loan.bookId)

    loan.status = 'returned'
    loan.returnedAt = new Date().toISOString()

    if (book) {
      book.availableCopies += 1
    }

    const dueDate = new Date(loan.dueDate)
    const returnedAt = new Date(loan.returnedAt)

    if (returnedAt > dueDate) {
      const fines = getFines()
      fines.unshift({
        id: `${loan.id}-fine`,
        borrowerName: loan.borrowerName,
        borrowerId: loan.borrowerId,
        bookTitle: loan.bookTitle,
        amount: 100,
        status: 'pending'
      })
      saveFines(fines)
    }

    saveBooks(books)
    saveLoans(loansData)
    toast.success('Book returned successfully')
    window.location.reload()
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />
      <Toaster position="top-right" />
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-slate-200 px-6 py-5">
          <h1 className="text-2xl font-bold text-slate-900">Return Book</h1>
          <p className="text-sm text-slate-500 mt-1">Close active issues and generate fines for overdue returns.</p>
        </div>
        <div className="p-6 space-y-4">
          {loans.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-slate-500">No active book issues found.</div>
          ) : loans.map((loan) => (
            <div key={loan.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="font-semibold text-slate-900">{loan.bookTitle}</h3>
                <p className="text-sm text-slate-500 mt-1">{loan.borrowerName} • {loan.borrowerId}</p>
                <p className="text-sm text-slate-500">Due on {loan.dueDate}</p>
              </div>
              <button onClick={() => returnBook(loan.id)} className="px-5 py-3 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800">
                Mark as Returned
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default LibrarianReturnBook
