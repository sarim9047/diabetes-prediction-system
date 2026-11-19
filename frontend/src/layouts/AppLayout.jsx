import React from 'react'
import Sidebar from '../components/Sidebar'

export default function AppLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar — fixed width */}
      <Sidebar />

      {/* Main content area */}
      <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900 min-h-screen">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
