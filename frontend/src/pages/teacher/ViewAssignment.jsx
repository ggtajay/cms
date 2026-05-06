import React, { useState, useEffect, useCallback } from 'react'
import Sidebar from '../../components/Sidebar'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import { useParams, useNavigate } from 'react-router-dom'
import {
  MdArrowBack,
  MdCheckCircle,
  MdPending,
  MdClose,
  MdGrade,
  MdRefresh,
  MdAssignment,
} from 'react-icons/md'

const statusStyles = {
  graded: 'bg-emerald-100 text-emerald-700',
  submitted: 'bg-blue-100 text-blue-700',
  late: 'bg-red-100 text-red-700',
}

const ViewAssignment = () => {
  const [assignment, setAssignment] = useState(null)
  const [showGradeModal, setShowGradeModal] = useState(false)
  const [selectedSubmission, setSelectedSubmission] = useState(null)
  const [gradeData, setGradeData] = useState({ marksObtained: '', feedback: '' })
  const [grading, setGrading] = useState(false)
  const [loading, setLoading] = useState(true)
  const { id } = useParams()
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user'))

  const fetchAssignment = useCallback(async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } }
      const res = await axios.get(`/api/assignments/${id}`, config)
      setAssignment(res.data)
    } catch {
      toast.error('Failed to fetch assignment details')
    } finally {
      setLoading(false)
    }
  }, [id, token])

  useEffect(() => { fetchAssignment() }, [fetchAssignment])

  const openGradeModal = (submission) => {
    setSelectedSubmission(submission)
    setGradeData({ marksObtained: '', feedback: '' })
    setShowGradeModal(true)
  }

  const handleGrade = async (e) => {
    e.preventDefault()
    const marks = parseFloat(gradeData.marksObtained)
    if (isNaN(marks) || marks < 0 || marks > assignment.totalMarks) {
      toast.error(`Marks must be between 0 and ${assignment.totalMarks}`)
      return
    }
    setGrading(true)
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } }
      await axios.put(
        `/api/assignments/${id}/grade/${selectedSubmission._id}`,
        gradeData,
        config
      )
      toast.success('Graded successfully!')
      setShowGradeModal(false)
      fetchAssignment()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to grade submission')
    } finally {
      setGrading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <div className="flex-1 p-6 space-y-4">
          <div className="h-8 w-64 bg-slate-200 rounded-xl animate-pulse" />
          <div className="h-40 bg-white rounded-2xl animate-pulse border border-slate-100" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-white rounded-2xl animate-pulse border border-slate-100" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!assignment) return null

  const totalSubmissions = assignment.submissions?.length || 0
  const gradedSubmissions = assignment.submissions?.filter((s) => s.status === 'graded').length || 0
  const lateSubmissions = assignment.submissions?.filter((s) => s.status === 'late').length || 0
  const pendingSubmissions = totalSubmissions - gradedSubmissions
  const gradedPct = totalSubmissions > 0 ? Math.round((gradedSubmissions / totalSubmissions) * 100) : 0
  const isOverdue = new Date(assignment.dueDate) < new Date()

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <Toaster position="top-right" />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/teacher/assignments')}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
            >
              <MdArrowBack size={20} />
            </button>
            <div>
              <h1 className="text-lg font-bold text-slate-800">Assignment Submissions</h1>
              <p className="text-xs text-slate-400 mt-0.5">{assignment.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">{user?.name?.charAt(0)}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 space-y-6">

          {/* Assignment Brief */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MdAssignment size={20} className="text-violet-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">{assignment.title}</h2>
                  <p className="text-sm text-slate-500 mt-0.5">{assignment.subject} · {assignment.course} Sem {assignment.semester}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold flex-shrink-0 ${isOverdue ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                {isOverdue ? 'Deadline Passed' : 'Active'}
              </span>
            </div>

            <p className="text-sm text-slate-600 mb-5 leading-relaxed">{assignment.description}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
              {[
                { label: 'Due Date', value: new Date(assignment.dueDate).toLocaleString() },
                { label: 'Max Marks', value: assignment.totalMarks },
                { label: 'Section', value: assignment.section || '—' },
                { label: 'Created', value: assignment.createdAt ? new Date(assignment.createdAt).toLocaleDateString() : '—' },
              ].map((m) => (
                <div key={m.label}>
                  <p className="text-xs text-slate-400">{m.label}</p>
                  <p className="text-sm font-semibold text-slate-700 mt-0.5">{m.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Submissions', value: totalSubmissions, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Graded', value: gradedSubmissions, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'Pending', value: pendingSubmissions, color: 'text-amber-600', bg: 'bg-amber-50' },
              { label: 'Late', value: lateSubmissions, color: 'text-red-600', bg: 'bg-red-50' },
            ].map((s) => (
              <div key={s.label} className={`${s.bg} rounded-2xl border border-slate-100 p-5 shadow-sm`}>
                <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-slate-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Grading Progress */}
          {totalSubmissions > 0 && (
            <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
              <div className="flex justify-between text-xs text-slate-500 mb-2">
                <span className="font-semibold">Grading Progress</span>
                <span>{gradedPct}% complete</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-700"
                  style={{ width: `${gradedPct}%` }}
                />
              </div>
            </div>
          )}

          {/* Submissions Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">Student Submissions</h3>
            </div>

            {totalSubmissions === 0 ? (
              <div className="p-16 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MdPending size={28} className="text-slate-300" />
                </div>
                <p className="text-slate-600 font-medium">No submissions yet</p>
                <p className="text-sm text-slate-400 mt-1">Students haven't submitted this assignment</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {assignment.submissions.map((submission) => (
                  <div key={submission._id} className="px-6 py-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-violet-400 flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-sm font-bold">
                            {submission.student?.name?.charAt(0)}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-bold text-slate-800 text-sm">{submission.student?.name}</p>
                            <span className="font-mono text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                              {submission.student?.rollNumber}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${statusStyles[submission.status] || 'bg-slate-100 text-slate-600'}`}>
                              {submission.status}
                            </span>
                          </div>
                          {submission.content && (
                            <p className="text-xs text-slate-500 mt-1 line-clamp-2">{submission.content}</p>
                          )}
                          <p className="text-xs text-slate-400 mt-1">
                            Submitted: {new Date(submission.submittedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex-shrink-0 text-right">
                        {submission.status === 'graded' ? (
                          <div>
                            <p className="text-lg font-bold text-emerald-600">
                              {submission.marksObtained}
                              <span className="text-sm text-slate-400 font-normal">/{assignment.totalMarks}</span>
                            </p>
                            {submission.feedback && (
                              <p className="text-xs text-slate-500 mt-0.5 max-w-[200px] text-right line-clamp-2">
                                {submission.feedback}
                              </p>
                            )}
                            <div className="flex items-center gap-1 justify-end mt-1">
                              <MdCheckCircle size={14} className="text-emerald-500" />
                              <span className="text-xs text-emerald-600 font-medium">Graded</span>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => openGradeModal(submission)}
                            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
                          >
                            <MdGrade size={16} /> Grade
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Grade Modal */}
      {showGradeModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Grade Submission</h3>
                <p className="text-sm text-slate-500 mt-0.5">
                  {selectedSubmission?.student?.name}
                </p>
              </div>
              <button
                onClick={() => setShowGradeModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                <MdClose size={20} />
              </button>
            </div>

            <form onSubmit={handleGrade} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                  Marks Obtained (out of {assignment.totalMarks}) *
                </label>
                <input
                  type="number"
                  value={gradeData.marksObtained}
                  onChange={(e) => setGradeData({ ...gradeData, marksObtained: e.target.value })}
                  required
                  min={0}
                  max={assignment.totalMarks}
                  placeholder={`0 – ${assignment.totalMarks}`}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                  Feedback (optional)
                </label>
                <textarea
                  value={gradeData.feedback}
                  onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })}
                  rows={3}
                  placeholder="Add comments or feedback for the student…"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={grading}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl transition-colors"
                >
                  {grading ? (
                    <><MdRefresh size={16} className="animate-spin" /> Saving…</>
                  ) : (
                    <><MdGrade size={16} /> Submit Grade</>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowGradeModal(false)}
                  className="px-5 py-2.5 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ViewAssignment