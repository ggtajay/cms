import React, { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import { useParams, useNavigate } from 'react-router-dom'
import { MdArrowBack, MdCheckCircle, MdPending } from 'react-icons/md'

const ViewAssignment = () => {
    const [assignment, setAssignment] = useState(null)
    const [showGradeModal, setShowGradeModal] = useState(false)
    const [selectedSubmission, setSelectedSubmission] = useState(null)
    const [gradeData, setGradeData] = useState({ marksObtained: '', feedback: '' })
    const [loading, setLoading] = useState(true)
    const { id } = useParams()
    const navigate = useNavigate()
    const token = localStorage.getItem('token')
    const user = JSON.parse(localStorage.getItem('user'))

    const config = {
        headers: { Authorization: `Bearer ${token}` }
    }

    const fetchAssignment = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/assignments/${id}`, config)
            setAssignment(res.data)
        } catch (error) {
            toast.error('Failed to fetch assignment')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAssignment()
    }, [])

    const handleGrade = async (e) => {
        e.preventDefault()
        try {
            await axios.put(
                `http://localhost:5000/api/assignments/${id}/grade/${selectedSubmission._id}`,
                gradeData,
                config
            )
            toast.success('Graded successfully!')
            setShowGradeModal(false)
            setGradeData({ marksObtained: '', feedback: '' })
            fetchAssignment()
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to grade submission')
        }
    }

    if (loading) {
        return (
            <div className="flex min-h-screen bg-gray-100">
                <Sidebar />
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-gray-400">Loading...</p>
                </div>
            </div>
        )
    }

    if (!assignment) return null

    const totalSubmissions = assignment.submissions?.length || 0
    const gradedSubmissions = assignment.submissions?.filter(s => s.status === 'graded').length || 0

    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar />
            <Toaster position="top-right" />

            <div className="flex-1 flex flex-col">
                <div className="bg-white shadow px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate('/teacher/assignments')} className="text-gray-600 hover:text-gray-800">
                            <MdArrowBack size={24} />
                        </button>
                        <h1 className="text-xl font-bold text-gray-800">Assignment Submissions</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 w-9 h-9 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold">{user?.name?.charAt(0)}</span>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-800">{user?.name}</p>
                            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    {/* Assignment Header */}
                    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">{assignment.title}</h2>
                        <p className="text-gray-600 mb-4">{assignment.description}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <p className="text-xs text-gray-500">Subject</p>
                                <p className="font-medium">{assignment.subject}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Class</p>
                                <p className="font-medium">{assignment.course} - Sem {assignment.semester}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Due Date</p>
                                <p className="font-medium">{new Date(assignment.dueDate).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Total Marks</p>
                                <p className="font-medium">{assignment.totalMarks}</p>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                            <p className="text-sm text-gray-500">Total Submissions</p>
                            <p className="text-3xl font-bold text-blue-600">{totalSubmissions}</p>
                        </div>
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                            <p className="text-sm text-gray-500">Graded</p>
                            <p className="text-3xl font-bold text-green-600">{gradedSubmissions}</p>
                        </div>
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                            <p className="text-sm text-gray-500">Pending</p>
                            <p className="text-3xl font-bold text-orange-600">{totalSubmissions - gradedSubmissions}</p>
                        </div>
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                            <p className="text-sm text-gray-500">Late Submissions</p>
                            <p className="text-3xl font-bold text-red-600">
                                {assignment.submissions?.filter(s => s.status === 'late').length || 0}
                            </p>
                        </div>
                    </div>

                    {/* Submissions */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Student Submissions</h3>
                        {totalSubmissions === 0 ? (
                            <p className="text-center text-gray-400 py-8">No submissions yet</p>
                        ) : (
                            <div className="space-y-4">
                                {assignment.submissions.map((submission) => (
                                    <div key={submission._id} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h4 className="font-bold text-gray-800">{submission.student?.name}</h4>
                                                <p className="text-sm text-gray-500">{submission.student?.rollNumber}</p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${submission.status === 'graded'
                                                    ? 'bg-green-100 text-green-700'
                                                    : submission.status === 'late'
                                                        ? 'bg-red-100 text-red-700'
                                                        : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                {submission.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-3">{submission.content}</p>
                                        <div className="flex justify-between items-center text-sm">
                                            <p className="text-gray-500">
                                                Submitted: {new Date(submission.submittedAt).toLocaleString()}
                                            </p>
                                            {submission.status === 'graded' ? (
                                                <div className="text-right">
                                                    <p className="font-bold text-green-600">
                                                        {submission.marksObtained}/{assignment.totalMarks}
                                                    </p>
                                                    {submission.feedback && (
                                                        <p className="text-xs text-gray-500">Feedback: {submission.feedback}</p>
                                                    )}
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => {
                                                        setSelectedSubmission(submission)
                                                        setGradeData({ marksObtained: '', feedback: '' })
                                                        setShowGradeModal(true)
                                                    }}
                                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
                                                >
                                                    Grade
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Grade Modal */}
            {showGradeModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">
                                Grade Submission
                            </h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Student: <strong>{selectedSubmission?.student?.name}</strong>
                            </p>
                            <form onSubmit={handleGrade}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Marks Obtained (out of {assignment.totalMarks}) *
                                    </label>
                                    <input
                                        type="number"
                                        value={gradeData.marksObtained}
                                        onChange={(e) => setGradeData({ ...gradeData, marksObtained: e.target.value })}
                                        required
                                        min="0"
                                        max={assignment.totalMarks}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Feedback (optional)
                                    </label>
                                    <textarea
                                        value={gradeData.feedback}
                                        onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })}
                                        rows="3"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Add comments for the student..."
                                    />
                                </div>
                                <div className="flex gap-4">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                                    >
                                        Submit Grade
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowGradeModal(false)}
                                        className="px-6 py-2 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ViewAssignment