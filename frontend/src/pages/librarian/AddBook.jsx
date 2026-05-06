import React, { useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import Sidebar from '../../components/Sidebar'
import { getBooks, saveBooks } from '../../utils/libraryStore'

const initialForm = {
  title: '',
  author: '',
  category: '',
  totalCopies: 1
}

const LibrarianAddBook = () => {
  const [formData, setFormData] = useState(initialForm)

  const onSubmit = (e) => {
    e.preventDefault()
    const books = getBooks()
    books.unshift({
      id: Date.now().toString(),
      ...formData,
      totalCopies: Number(formData.totalCopies),
      availableCopies: Number(formData.totalCopies)
    })
    saveBooks(books)
    setFormData(initialForm)
    toast.success('Book added successfully')
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />
      <Toaster position="top-right" />
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-slate-200 px-6 py-5">
          <h1 className="text-2xl font-bold text-slate-900">Add Book</h1>
          <p className="text-sm text-slate-500 mt-1">Create a new inventory entry for the library.</p>
        </div>
        <div className="p-6">
          <form onSubmit={onSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 max-w-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input className="px-4 py-3 rounded-xl border border-slate-300" placeholder="Book title" value={formData.title} onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))} required />
              <input className="px-4 py-3 rounded-xl border border-slate-300" placeholder="Author" value={formData.author} onChange={(e) => setFormData((prev) => ({ ...prev, author: e.target.value }))} required />
              <input className="px-4 py-3 rounded-xl border border-slate-300" placeholder="Category" value={formData.category} onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))} required />
              <input type="number" min="1" className="px-4 py-3 rounded-xl border border-slate-300" placeholder="Total copies" value={formData.totalCopies} onChange={(e) => setFormData((prev) => ({ ...prev, totalCopies: e.target.value }))} required />
            </div>
            <button type="submit" className="mt-5 px-5 py-3 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800">Add Book</button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default LibrarianAddBook
