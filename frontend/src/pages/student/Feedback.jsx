import React from 'react'
import FeedbackPortal from '../../components/FeedbackPortal'

const CATEGORIES = [
  'Course Content & Curriculum',
  'Teaching Quality',
  'Library & Resources',
  'Hostel & Food',
  'Campus Facilities',
  'IT & Portal Issues',
  'Other'
]

export default function StudentFeedback() {
  return <FeedbackPortal role="student" categories={CATEGORIES} title="Student Feedback" />
}
