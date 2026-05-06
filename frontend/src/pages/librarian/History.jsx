import React, { useMemo } from 'react'
import Sidebar from '../../components/Sidebar'
import { getLoans } from '../../utils/libraryStore'

const LibrarianHistory = () => {
  const loans = useMemo(() => getLoans(), [])

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-slate-200 px-6 py-5">
          <h1 className="text-2xl font-bold text-slate-900">Issue & Return History</h1>
          <p className="text-sm text-slate-500 mt-1">Review previous circulation records.</p>
        </div>
        <div className="p-6 space-y-4">
          {loans.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-slate-500">No history recorded yet.</div>
          ) : loans.map((loan) => (
            <div key={loan.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <h3 className="font-semibold text-slate-900">{loan.bookTitle}</h3>
              <p className="text-sm text-slate-500 mt-1">{loan.borrowerName} • {loan.borrowerId}</p>
              <p className="text-sm text-slate-600 mt-2">Status: {loan.status}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default LibrarianHistory
