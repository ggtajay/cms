import React from 'react'
import HelpdeskPortal from '../../components/HelpdeskPortal'

const AdminHelpdesk = () => {
  return (
    <HelpdeskPortal
      title="Helpdesk Management"
      subtitle="Review incoming issues, prioritize them, and keep request handling organized."
      adminView
    />
  )
}

export default AdminHelpdesk
