import React from 'react'
import { MdCheckCircle, MdWarning } from 'react-icons/md'

const ProfileCompletion = ({ completionPercentage, role }) => {
  const isComplete = completionPercentage === 100

  // Calculate color based on percentage
  let barColor = 'bg-red-500'
  if (completionPercentage > 40) barColor = 'bg-orange-500'
  if (completionPercentage > 70) barColor = 'bg-yellow-500'
  if (completionPercentage === 100) barColor = 'bg-green-500'

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            Profile Completion
            {isComplete ? (
              <MdCheckCircle className="text-green-500" size={20} />
            ) : (
              <MdWarning className="text-orange-500" size={20} />
            )}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {isComplete 
              ? 'Your profile is fully complete!' 
              : 'Complete your profile to unlock all features.'}
          </p>
        </div>
        <div className="text-right">
          <span className={`text-3xl font-black ${isComplete ? 'text-green-600' : 'text-blue-600'}`}>
            {completionPercentage}%
          </span>
        </div>
      </div>

      <div className="w-full bg-gray-100 rounded-full h-3 mb-2 overflow-hidden">
        <div 
          className={`h-3 rounded-full ${barColor} transition-all duration-1000 ease-out`}
          style={{ width: `${completionPercentage || 0}%` }}
        ></div>
      </div>

      {!isComplete && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Action Required:</strong> Please upload missing documents and fill out any pending personal details below.
          </p>
        </div>
      )}
    </div>
  )
}

export default ProfileCompletion
