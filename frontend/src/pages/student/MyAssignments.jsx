import React, { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import { MdAssignment, MdCheckCircle, MdWarning, MdSend } from 'react-icons/md'

const MyAssignments = () => {
    const [assignments, setAssignments] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [selectedAssignment, setSelectedAssignment] = useState(null)
    const [content, setContent] = useState('')
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const token = localStorage.getItem('token')
    const user = JSON.parse(localStorage.getItem('user'))

    const config = {
        headers: { Authorization: `Bearer ${token}` }
    }

    const fetchAssignments = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/assignments/my-assignments', config)
            setAssignments(res.data)
        } catch (error) {
            toast.error('Failed to fetch assignments')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAssignments()
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        try {
            await axios.post(
                `http://localhost:5000/api/assignments/${selectedAssignment._id}/submit`,
                { content },
                config
            )
            toast.success('Assignment submitted successfully!')
            setShowModal(false)
            setContent('')
            fetchAssignments()
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit assignment')
        } finally {
            setSubmitting(false)
        }
    }

    const pendingCount = assignments.filter(a => !a.isSubmitted).length
    const submittedCount = assignments.filter(a => a.isSubmitted).length

    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar />
            <Toaster position="top-right" />

            <div className="flex-1 flex flex-col">
                <div className="bg-white shadow px-6 py-4 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-gray-800">My Assignments</h1>
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
                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-100 p-3 rounded-xl">
                                    <MdAssignment className="text-blue-600" size={24} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Total</p>
                                    <p className="text-3xl font-bold text-blue-600">{assignments.length}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="bg-orange-100 p-3 rounded-xl">
                                    <MdWarning className="text-orange-600" size={24} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Pending</p>
                                    <p className="text-3xl font-bold text-orange-600">{pendingCount}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="bg-green-100 p-3 rounded-xl">
                                    <MdCheckCircle className="text-green-600" size={24} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Submitted</p>
                                    <p className="text-3xl font-bold text-green-600">{submittedCount}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Assignments */}
                    {loading ? (
                        <div className="text-center py-12 text-gray-400">Loading assignments...</div>
                    ) : assignments.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                            <MdAssignment size={64} className="mx-auto mb-4 text-gray-300" />
                            <p className="text-gray-400">No assignments yet</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {assignments.map((assignment) => {
                                const isOverdue = new Date(assignment.dueDate) < new Date()
                                const mySubmission = assignment.mySubmission

                                return (
                                    <div key={assignment._id} className="bg-white rounded-xl shadow-sm p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h3 className="text-lg font-bold text-gray-800">{assignment.title}</h3>
                                                    {assignment.isSubmitted && (
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${mySubmission.status === 'graded'
                                                                ? 'bg-green-100 text-green-700'
                                                                : mySubmission.status === 'late'
                                                                    ? 'bg-orange-100 text-orange-700'
                                                                    : 'bg-blue-100 text-blue-700'
                                                            }`}>
                                                            {mySubmission.status}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600 mb-3">{assignment.description}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                            <div>
                                                <p className="text-xs text-gray-500">Subject</p>
                                                <p className="font-medium text-gray-800">{assignment.subject}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Due Date</p>
                                                <p className={`font-medium ${isOverdue ? 'text-red-600' : 'text-gray-800'}`}>
                                                    {new Date(assignment.dueDate).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Total Marks</p>
                                                <p className="font-medium text-gray-800">{assignment.totalMarks}</p>
                                            </div>
                                            {mySubmission && mySubmission.marksObtained !== null && (
                                                <div>
                                                    <p className="text-xs text-gray-500">Marks Obtained</p>
                                                    <p className="font-medium text-green-600">
                                                        {mySubmission.marksObtained}/{assignment.totalMarks}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {mySubmission ? (
                                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                                <p className="text-sm font-medium text-green-800 mb-2">
                                                    ✓ Submitted on {new Date(mySubmission.submittedAt).toLocaleString()}
                                                </p>
                                                {mySubmission.feedback && (
                                                    <div className="mt-2">
                                                        <p className="text-xs text-gray-500">Feedback:</p>
                                                        <p className="text-sm text-gray-700">{mySubmission.feedback}</p>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    setSelectedAssignment(assignment)
                                                    setShowModal(true)
                                                }}
                                                disabled={isOverdue}
                                                className={`w-full py-2 rounded-lg font-medium transition flex items-center justify-center gap-2 ${isOverdue
                                                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                                    }`}
                                            >
                                                <MdSend size={18} />
                                                {isOverdue ? 'Overdue' : 'Submit Assignment'}
                                            </button>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Submit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full">
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">
                                Submit: {selectedAssignment?.title}
                            </h3>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Your Answer *
                                    </label>
                                    <textarea
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        required
                                        rows="10"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Write your answer here..."
                                    />
                                </div>
                                <div className="flex gap-4">
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                                    >
                                        {submitting ? 'Submitting...' : 'Submit'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
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

export default MyAssignments