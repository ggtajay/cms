import React, { useMemo } from 'react'
import Sidebar from '../../components/Sidebar'
import { getBooks } from '../../utils/libraryStore'

const LibrarianAllBooks = () => {
  const books = useMemo(() => getBooks(), [])

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-slate-200 px-6 py-5">
          <h1 className="text-2xl font-bold text-slate-900">All Books</h1>
          <p className="text-sm text-slate-500 mt-1">Current library inventory and availability status.</p>
        </div>
        <div className="p-6 space-y-4">
          {books.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-slate-500">
              No books added yet.
            </div>
          ) : (
            books.map((book) => (
              <div key={book.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <h3 className="font-bold text-slate-900">{book.title}</h3>
                <p className="text-sm text-slate-500 mt-1">{book.author} • {book.category}</p>
                <p className="text-sm text-slate-600 mt-2">
                  Available: {book.availableCopies} / {book.totalCopies}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default LibrarianAllBooks
