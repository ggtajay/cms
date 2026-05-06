import React, { useMemo } from 'react'
import Sidebar from '../../components/Sidebar'
import { getFines } from '../../utils/libraryStore'

const LibrarianPendingFines = () => {
  const fines = useMemo(() => getFines().filter((fine) => fine.status === 'pending'), [])

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-slate-200 px-6 py-5">
          <h1 className="text-2xl font-bold text-slate-900">Pending Fines</h1>
          <p className="text-sm text-slate-500 mt-1">Track overdue penalties waiting for collection.</p>
        </div>
        <div className="p-6 space-y-4">
          {fines.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-slate-500">No pending fines.</div>
          ) : fines.map((fine) => (
            <div key={fine.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <h3 className="font-semibold text-slate-900">{fine.borrowerName}</h3>
              <p className="text-sm text-slate-500 mt-1">{fine.bookTitle}</p>
              <p className="text-sm text-slate-600 mt-2">Amount: Rs. {fine.amount}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default LibrarianPendingFines
