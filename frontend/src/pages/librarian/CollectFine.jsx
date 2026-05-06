import React, { useMemo } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import Sidebar from '../../components/Sidebar'
import { getFines, saveFines } from '../../utils/libraryStore'

const LibrarianCollectFine = () => {
  const fines = useMemo(() => getFines().filter((fine) => fine.status === 'pending'), [])

  const collectFine = (fineId) => {
    const finesData = getFines()
    const fine = finesData.find((item) => item.id === fineId)
    fine.status = 'paid'
    fine.paidAt = new Date().toISOString()
    saveFines(finesData)
    toast.success('Fine collected successfully')
    window.location.reload()
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />
      <Toaster position="top-right" />
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-slate-200 px-6 py-5">
          <h1 className="text-2xl font-bold text-slate-900">Collect Fine</h1>
          <p className="text-sm text-slate-500 mt-1">Settle overdue library penalties.</p>
        </div>
        <div className="p-6 space-y-4">
          {fines.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-slate-500">No fines pending collection.</div>
          ) : fines.map((fine) => (
            <div key={fine.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="font-semibold text-slate-900">{fine.borrowerName}</h3>
                <p className="text-sm text-slate-500 mt-1">{fine.bookTitle}</p>
                <p className="text-sm text-slate-600 mt-2">Amount: Rs. {fine.amount}</p>
              </div>
              <button onClick={() => collectFine(fine.id)} className="px-5 py-3 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800">
                Collect Fine
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default LibrarianCollectFine
