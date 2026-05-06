/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AcademicCapIcon, ComputerDesktopIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

export default function ApplyLanding() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-950 dark:to-slate-900 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl tracking-tight">
          Welcome to <span className="text-blue-600 dark:text-blue-400">CMS Portal</span>
        </h1>
        <p className="mt-4 text-xl text-gray-600 dark:text-slate-400 max-w-2xl mx-auto">
          Start your journey with us. Choose your preferred application mode or track an existing application.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
        {/* Online Courses */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-transparent dark:border-slate-800"
        >
          <div className="p-8">
            <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center mb-6">
              <ComputerDesktopIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Online Courses</h3>
            <p className="text-gray-500 dark:text-slate-400 mb-8 h-20">
              Instant enrollment with automatic account creation. Perfect for certification and short-term programs.
            </p>
            <Link
              to="/apply/online"
              className="inline-flex w-full justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg"
            >
              Enroll Now
            </Link>
          </div>
        </motion.div>

        {/* Regular Admission */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 relative border border-transparent dark:border-slate-800"
        >
          <div className="p-8 relative">
            <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-6">
              <AcademicCapIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Regular Admission</h3>
            <p className="text-gray-500 dark:text-slate-400 mb-8 h-20">
              Apply for full-time degree programs. Requires document submission and administrative review.
            </p>
            <Link
              to="/apply/regular"
              className="inline-flex w-full justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
            >
              Start Application
            </Link>
          </div>
        </motion.div>

        {/* Track Application */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-transparent dark:border-slate-800"
        >
          <div className="p-8">
            <div className="w-14 h-14 bg-teal-100 dark:bg-teal-900/30 rounded-xl flex items-center justify-center mb-6">
              <MagnifyingGlassIcon className="h-8 w-8 text-teal-600 dark:text-teal-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Track Status</h3>
            <p className="text-gray-500 dark:text-slate-400 mb-8 h-20">
              Already applied? Check the real-time status of your regular admission application here.
            </p>
            <Link
              to="/apply/track"
              className="inline-flex w-full justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-teal-600 hover:bg-teal-700 transition-colors shadow-md hover:shadow-lg"
            >
              Track Application
            </Link>
          </div>
        </motion.div>
      </div>

      <div className="mt-12 text-center">
        <p className="text-gray-500 dark:text-slate-400">
          Already a student or staff member?{' '}
          <Link to="/login" className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 underline underline-offset-4">
            Go to Login
          </Link>
        </p>
      </div>
    </div>
  )
}
