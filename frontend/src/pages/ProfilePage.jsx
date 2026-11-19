import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  User,
  Mail,
  Shield,
  Calendar,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Activity,
  BarChart2,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { authApi } from '../services/api'

function getInitials(name) {
  if (!name) return '?'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function formatDate(dateStr) {
  if (!dateStr) return 'N/A'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function ProfilePage() {
  const { user } = useAuth()

  const [pwForm, setPwForm] = useState({
    current_password: '',
    new_password: '',
    confirm_new_password: '',
  })
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [pwLoading, setPwLoading] = useState(false)
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState('')

  const handlePwChange = (e) => {
    const { name, value } = e.target
    setPwForm((prev) => ({ ...prev, [name]: value }))
    if (pwError) setPwError('')
    if (pwSuccess) setPwSuccess('')
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setPwError('')
    setPwSuccess('')

    if (!pwForm.current_password || !pwForm.new_password || !pwForm.confirm_new_password) {
      setPwError('All password fields are required.')
      return
    }
    if (pwForm.new_password.length < 6) {
      setPwError('New password must be at least 6 characters.')
      return
    }
    if (pwForm.new_password !== pwForm.confirm_new_password) {
      setPwError('New passwords do not match.')
      return
    }

    setPwLoading(true)
    try {
      await authApi.changePassword({
        current_password: pwForm.current_password,
        new_password: pwForm.new_password,
        confirm_new_password: pwForm.confirm_new_password,
      })
      setPwSuccess('Password changed successfully!')
      setPwForm({ current_password: '', new_password: '', confirm_new_password: '' })
    } catch (err) {
      const status = err?.response?.status
      const detail = err?.response?.data?.detail || err?.response?.data?.message || err?.message
      if (status === 400 || status === 422) {
        setPwError(typeof detail === 'string' ? detail : 'Invalid request. Please check your input.')
      } else {
        setPwError('Failed to change password. Please try again.')
      }
    } finally {
      setPwLoading(false)
    }
  }

  const roleBadge =
    user?.role === 'admin'
      ? { label: 'Administrator', cls: 'bg-blue-500/20 text-blue-300 border-blue-400/30' }
      : { label: 'User', cls: 'bg-teal-500/20 text-teal-300 border-teal-400/30' }

  const cardCls =
    'bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden'

  const inputCls =
    'w-full border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 rounded-xl pl-10 pr-11 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition'

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Page heading */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">My Profile</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
          Manage your account information and security settings
        </p>
      </motion.div>

      {/* Profile header card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className={cardCls}
      >
        {/* Navy header stripe */}
        <div className="bg-[#0f2a4a] px-6 py-5 flex items-center gap-5">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-2xl bg-teal-500 flex items-center justify-center text-white text-xl font-bold shadow-lg flex-shrink-0">
            {getInitials(user?.full_name)}
          </div>
          <div className="min-w-0">
            <h2 className="text-white text-xl font-semibold truncate">
              {user?.full_name || 'Unknown User'}
            </h2>
            <p className="text-slate-400 text-sm truncate">{user?.email || '—'}</p>
            <div className="mt-1.5">
              <span
                className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full border ${roleBadge.cls}`}
              >
                <Shield className="w-3 h-3" />
                {roleBadge.label}
              </span>
            </div>
          </div>
        </div>

        {/* Info rows */}
        <div className="px-6 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
              <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Email</p>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">
                {user?.email || '—'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Member Since</p>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                {formatDate(user?.created_at)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center">
              <User className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Full Name</p>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                {user?.full_name || '—'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
              <Shield className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Role</p>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100 capitalize">
                {user?.role || 'user'}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats row */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-2 gap-4"
      >
        <div className={`${cardCls} px-5 py-4 flex items-center gap-4`}>
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
            <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">
              {user?.total_predictions ?? 0}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Total Predictions</p>
          </div>
        </div>
        <div className={`${cardCls} px-5 py-4 flex items-center gap-4`}>
          <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center">
            <BarChart2 className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-white">
              {formatDate(user?.created_at)}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Joined Date</p>
          </div>
        </div>
      </motion.div>

      {/* Change Password card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className={cardCls}
      >
        {/* Navy header */}
        <div className="bg-[#0f2a4a] px-6 py-4 flex items-center gap-2">
          <Lock className="w-4 h-4 text-teal-400" />
          <h3 className="text-white font-semibold text-sm">Change Password</h3>
        </div>

        <form onSubmit={handlePasswordSubmit} className="px-6 py-5 space-y-4" noValidate>
          {/* Success */}
          {pwSuccess && (
            <div className="flex items-center gap-2 bg-teal-50 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-700 text-teal-700 dark:text-teal-300 rounded-xl px-4 py-3 text-sm">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              {pwSuccess}
            </div>
          )}

          {/* Error */}
          {pwError && (
            <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-300 rounded-xl px-4 py-3 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              {pwError}
            </div>
          )}

          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Current Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showCurrent ? 'text' : 'password'}
                name="current_password"
                value={pwForm.current_password}
                onChange={handlePwChange}
                autoComplete="current-password"
                placeholder="Enter current password"
                className={inputCls}
              />
              <button
                type="button"
                onClick={() => setShowCurrent((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                tabIndex={-1}
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showNew ? 'text' : 'password'}
                name="new_password"
                value={pwForm.new_password}
                onChange={handlePwChange}
                autoComplete="new-password"
                placeholder="Enter new password"
                className={inputCls}
              />
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                tabIndex={-1}
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showConfirm ? 'text' : 'password'}
                name="confirm_new_password"
                value={pwForm.confirm_new_password}
                onChange={handlePwChange}
                autoComplete="new-password"
                placeholder="Confirm new password"
                className={inputCls}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {pwForm.confirm_new_password && pwForm.new_password === pwForm.confirm_new_password && (
              <p className="text-teal-500 text-xs mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Passwords match
              </p>
            )}
          </div>

          <div className="pt-1">
            <button
              type="submit"
              disabled={pwLoading}
              className="flex items-center gap-2 bg-[#0f2a4a] hover:bg-blue-900 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl px-6 py-2.5 text-sm transition-colors shadow"
            >
              {pwLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating…
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Update Password
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>

      {/* Account Notice */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="text-center text-xs text-slate-400 dark:text-slate-500 pb-4"
      >
        Name and email are managed by your account administrator. Contact support to request changes.
      </motion.div>
    </div>
  )
}
