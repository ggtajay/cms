import React from 'react'
import FeedbackPortal from '../../components/FeedbackPortal'

const CATEGORIES = [
  'Classroom & Infrastructure',
  'IT Support & Portal',
  'Administration & HR',
  'Student Behavior',
  'Curriculum Development',
  'Other'
]

export default function TeacherFeedback() {
  return <FeedbackPortal role="teacher" categories={CATEGORIES} title="Faculty Feedback" />
}
