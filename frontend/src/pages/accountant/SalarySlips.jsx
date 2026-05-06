import React from 'react'
import Sidebar from '../../components/Sidebar'

const AccountantSalarySlips = () => {
  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-slate-200 px-6 py-5">
          <h1 className="text-2xl font-bold text-slate-900">Salary Slips</h1>
          <p className="text-sm text-slate-500 mt-1">
            Generate and review employee salary slips from the payroll system.
          </p>
        </div>
        <div className="p-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-slate-600">
            Salary slip generation will plug into the payroll workflow when that module is added.
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccountantSalarySlips
