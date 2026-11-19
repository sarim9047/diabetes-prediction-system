import React from 'react'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'

export default function AppLayout({ children }) {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-900">
        <Navbar />
        <main className="flex-1 overflow-y-auto min-h-screen">
          {children}
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
      <Sidebar />
      <main className="flex-1 overflow-y-auto min-h-screen p-6">
        {children}
      </main>
    </div>
  )
}
