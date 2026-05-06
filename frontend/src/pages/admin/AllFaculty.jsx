import React, { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import Topbar from '../../components/Topbar'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import { MdSchool, MdSearch, MdEdit, MdDelete, MdVisibility, MdPersonAdd, MdFilterList } from 'react-icons/md'
import { useNavigate } from 'react-router-dom'

const AllFaculty = () => {
  const [faculty,    setFaculty]    = useState([])
  const [filtered,   setFiltered]   = useState([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [deptFilter, setDeptFilter] = useState('all')
  const token    = localStorage.getItem('token')
  const navigate = useNavigate()
  const config   = { headers: { Authorization: `Bearer ${token}` } }

  const fetchFaculty = async () => {
    try {
      const res = await axios.get('/api/faculty', config)
      setFaculty(res.data)
      setFiltered(res.data)
    } catch {
      toast.error('Failed to fetch faculty')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchFaculty() }, []) // eslint-disable-line

  useEffect(() => {
    let result = faculty
    if (search) {
      result = result.filter(f =>
        f.name?.toLowerCase().includes(search.toLowerCase()) ||
        f.email?.toLowerCase().includes(search.toLowerCase()) ||
        f.employeeId?.toLowerCase().includes(search.toLowerCase())
      )
    }
    if (deptFilter !== 'all') result = result.filter(f => f.department === deptFilter)
    setFiltered(result)
  }, [search, deptFilter, faculty])

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete ${name}?`)) return
    try {
      await axios.delete(`/api/faculty/${id}`, config)
      toast.success('Faculty deleted')
      fetchFaculty()
    } catch {
      toast.error('Failed to delete faculty')
    }
  }

  const departments = ['all', ...new Set(faculty.map(f => f.department).filter(Boolean))]

  const statusBadge = (status) => {
    if (status === 'active')  return <span className="cms-badge-green"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />{status}</span>
    if (status === 'retired') return <span className="cms-badge-blue"><span className="w-1.5 h-1.5 rounded-full bg-blue-500" />{status}</span>
    return <span className="cms-badge-red"><span className="w-1.5 h-1.5 rounded-full bg-red-500" />{status || 'unknown'}</span>
  }

  return (
    <div className="cms-layout">
      <Sidebar />
      <Toaster position="top-right" toastOptions={{ className: 'font-sans text-sm' }} />

      <div className="cms-main">
        <Topbar
          title="All Faculty"
          subtitle={`${filtered.length} faculty members`}
          actions={
            <button onClick={() => navigate('/admin/faculty/add')} className="cms-btn-primary">
              <MdPersonAdd size={17} /> Add Faculty
            </button>
          }
        />

        <main className="cms-content">

          {/* Search & Filter */}
          <div className="cms-card p-4 animate-fade-in">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 flex items-center gap-2.5 bg-[#fafbff] border border-[#e8edf5] rounded-xl px-4 py-2.5 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                <MdSearch size={18} className="text-slate-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search by name, email or employee ID…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="flex-1 text-sm outline-none bg-transparent text-slate-700 placeholder-slate-400"
                />
              </div>
              <div className="flex items-center gap-2 bg-[#fafbff] border border-[#e8edf5] rounded-xl px-3 py-2.5">
                <MdFilterList size={17} className="text-slate-400" />
                <select
                  value={deptFilter}
                  onChange={e => setDeptFilter(e.target.value)}
                  className="text-sm outline-none bg-transparent text-slate-600"
                >
                  {departments.map(d => (
                    <option key={d} value={d}>{d === 'all' ? 'All Departments' : d}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Faculty Table */}
          <div className="cms-card overflow-hidden animate-fade-in">
            <div className="px-5 py-4 border-b border-[#e8edf5] flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                <MdSchool size={18} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Faculty Members</p>
                <p className="text-xs text-slate-400">{filtered.length} records</p>
              </div>
            </div>

            {loading ? (
              <div className="p-8 space-y-4">
                {Array(5).fill(0).map((_, i) => <div key={i} className="skeleton h-12 rounded-xl" />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4">
                  <MdSchool size={32} className="text-emerald-300" />
                </div>
                <p className="text-slate-500 font-medium">No faculty found</p>
                <button onClick={() => navigate('/admin/faculty/add')} className="cms-btn-primary mt-4">
                  <MdPersonAdd size={16} /> Add Faculty
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="cms-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Faculty</th>
                      <th>Employee ID</th>
                      <th>Designation</th>
                      <th>Department</th>
                      <th>Experience</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((member, index) => (
                      <tr key={member._id}>
                        <td className="text-slate-400 text-xs font-medium">{index + 1}</td>
                        <td>
                          <div className="flex items-center gap-3">
                            {member.profileImage ? (
                              <img src={member.profileImage} alt={member.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0 ring-2 ring-emerald-100" />
                            ) : (
                              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                                style={{ background: 'linear-gradient(135deg,#059669,#10b981)' }}>
                                {member.name?.charAt(0)}
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-slate-800 text-sm">{member.name}</p>
                              <p className="text-xs text-slate-400">{member.email}</p>
                            </div>
                          </div>
                        </td>
                        <td><span className="font-mono text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg">{member.employeeId}</span></td>
                        <td className="text-slate-600">{member.designation}</td>
                        <td className="text-slate-600">{member.department}</td>
                        <td><span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg">{member.experience} yrs</span></td>
                        <td>{statusBadge(member.employmentStatus)}</td>
                        <td>
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => navigate(`/admin/faculty/view/${member._id}`)} title="View"
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-brand-600 hover:bg-brand-50 transition-colors">
                              <MdVisibility size={17} />
                            </button>
                            <button onClick={() => navigate(`/admin/faculty/edit/${member._id}`)} title="Edit"
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-emerald-600 hover:bg-emerald-50 transition-colors">
                              <MdEdit size={17} />
                            </button>
                            <button onClick={() => handleDelete(member._id, member.name)} title="Delete"
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors">
                              <MdDelete size={17} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default AllFaculty