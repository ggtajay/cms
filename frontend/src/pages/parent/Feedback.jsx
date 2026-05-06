import React from 'react'
import FeedbackPortal from '../../components/FeedbackPortal'

const CATEGORIES = [
  'Academics & Teaching',
  'Hostel & Security',
  'Administration & Fees',
  'Communication from College',
  'Student Welfare',
  'Other'
]

export default function ParentFeedback() {
  return <FeedbackPortal role="parent" categories={CATEGORIES} title="Parent Feedback" />
}
