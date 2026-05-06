import React from 'react'
import DocumentRequestPortal from '../../components/DocumentRequestPortal'

const AdminDocumentRequests = () => {
  return (
    <DocumentRequestPortal
      title="Document Request Management"
      subtitle="Review submitted document requests, add remarks, and keep processing statuses up to date."
      adminView
    />
  )
}

export default AdminDocumentRequests
