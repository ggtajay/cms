import React from 'react'
import Sidebar from '../../components/Sidebar'

const AccountantSalaryProcess = () => {
  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-slate-200 px-6 py-5">
          <h1 className="text-2xl font-bold text-slate-900">Salary Processing</h1>
          <p className="text-sm text-slate-500 mt-1">
            This area is reserved for payroll cycles, deductions, and salary approvals.
          </p>
        </div>
        <div className="p-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-slate-600">
            Payroll workflow is not connected yet, but this page is ready for salary setup, monthly processing,
            and payout approvals.
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccountantSalaryProcess
