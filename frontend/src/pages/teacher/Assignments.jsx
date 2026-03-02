import React, { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import { MdAssignment, MdAdd, MdDelete, MdVisibility } from 'react-icons/md'
import { useNavigate } from 'react-router-dom'

const Assignments = () => {
    const [assignments, setAssignments] = useState([])
    const [loading, setLoading] = useState(true)
    const token = localStorage.getItem('token')
    const user = JSON.parse(localStorage.getItem('user'))
    const navigate = useNavigate()

    const config = {
        headers: { Authorization: `Bearer ${token}` }
    }

    const fetchAssignments = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/assignments', config)
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

    const handleDelete = async (id, title) => {
        if (window.confirm(`Delete assignment "${title}"?`)) {
            try {
                await axios.delete(`http://localhost:5000/api/assignments/${id}`, config)
                toast.success('Assignment deleted successfully')
                fetchAssignments()
            } catch (error) {
                toast.error('Failed to delete assignment')
            }
        }
    }

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
                    <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex justify-between items-center">
                        <h3 className="font-bold text-gray-800">Assignments ({assignments.length})</h3>
                        <button
                            onClick={() => navigate('/teacher/assignments/create')}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2"
                        >
                            <MdAdd size={20} />
                            Create Assignment
                        </button>
                    </div>

                    {loading ? (
                        <div className="text-center py-12 text-gray-400">Loading assignments...</div>
                    ) : assignments.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                            <MdAssignment size={64} className="mx-auto mb-4 text-gray-300" />
                            <p className="text-gray-400">No assignments created yet</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {assignments.map((assignment) => {
                                const totalSubmissions = assignment.submissions?.length || 0
                                const gradedSubmissions = assignment.submissions?.filter(s => s.status === 'graded').length || 0
                                const isOverdue = new Date(assignment.dueDate) < new Date()

                                return (
                                    <div key={assignment._id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="bg-blue-100 p-2 rounded-lg">
                                                <MdAssignment className="text-blue-600" size={24} />
                                            </div>
                                            <button
                                                onClick={() => handleDelete(assignment._id, assignment.title)}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                <MdDelete size={20} />
                                            </button>
                                        </div>

                                        <h3 className="font-bold text-gray-800 mb-2 line-clamp-2">{assignment.title}</h3>
                                        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{assignment.description}</p>

                                        <div className="space-y-2 mb-4">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Subject:</span>
                                                <span className="font-medium text-gray-800">{assignment.subject}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Class:</span>
                                                <span className="font-medium text-gray-800">
                                                    {assignment.course} - Sem {assignment.semester}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Due Date:</span>
                                                <span className={`font-medium ${isOverdue ? 'text-red-600' : 'text-gray-800'}`}>
                                                    {new Date(assignment.dueDate).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Total Marks:</span>
                                                <span className="font-medium text-gray-800">{assignment.totalMarks}</span>
                                            </div>
                                        </div>

                                        <div className="pt-3 border-t">
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="text-gray-500">Submissions:</span>
                                                <span className="font-bold text-blue-600">{totalSubmissions}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Graded:</span>
                                                <span className="font-bold text-green-600">{gradedSubmissions}</span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => navigate(`/teacher/assignments/view/${assignment._id}`)}
                                            className="w-full mt-4 bg-blue-50 text-blue-600 py-2 rounded-lg font-medium hover:bg-blue-100 transition flex items-center justify-center gap-2"
                                        >
                                            <MdVisibility size={18} />
                                            View Submissions
                                        </button>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Assignments