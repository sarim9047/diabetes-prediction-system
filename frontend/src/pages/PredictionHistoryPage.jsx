import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  History, Search, ChevronLeft, ChevronRight, Eye, Download,
  Trash2, AlertCircle, PlusCircle, Filter, ArrowUpDown,
  CheckCircle2, XCircle, Loader2, Calendar, Droplets, Scale, Heart
} from 'lucide-react'
import { predictionApi, reportApi } from '../services/api'

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

function ResultBadge({ result }) {
  if (result === 1) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/20 border border-red-400/30 text-red-300 text-xs font-semibold">
        <XCircle className="w-3 h-3" /> Positive
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-semibold">
      <CheckCircle2 className="w-3 h-3" /> Negative
    </span>
  )
}

// Skeleton row
function SkeletonRow() {
  return (
    <tr>
      {[...Array(9)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 rounded bg-white/10 animate-pulse" style={{ width: `${[30, 60, 40, 40, 40, 40, 50, 60, 70][i]}%` }} />
        </td>
      ))}
    </tr>
  )
}

// Mobile card skeleton
function SkeletonCard() {
  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/10 animate-pulse space-y-2">
      <div className="h-4 bg-white/10 rounded w-1/2" />
      <div className="h-3 bg-white/10 rounded w-3/4" />
      <div className="h-3 bg-white/10 rounded w-1/3" />
    </div>
  )
}

export default function PredictionHistoryPage() {
  const navigate = useNavigate()
  const [predictions, setPredictions] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [resultFilter, setResultFilter] = useState('all')
  const [sort, setSort] = useState('newest')
  const [downloading, setDownloading] = useState(null) // prediction id being downloaded
  const [deleting, setDeleting] = useState(null)

  const totalPages = Math.max(1, Math.ceil(total / limit))

  const fetchPredictions = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit, sort }
      if (search.trim()) params.search = search.trim()
      if (resultFilter !== 'all') params.result_filter = resultFilter
      const response = await predictionApi.getPredictions(params)
      const data = response.data || response
      // Support both {items, total} and plain array responses
      if (Array.isArray(data)) {
        setPredictions(data)
        setTotal(data.length)
      } else {
        setPredictions(data.items || data.predictions || [])
        setTotal(data.total ?? (data.items || []).length)
      }
    } catch {
      setPredictions([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [page, limit, search, resultFilter, sort])

  useEffect(() => {
    fetchPredictions()
  }, [fetchPredictions])

  // Reset to page 1 on filter changes
  const applyFilter = (fn) => { setPage(1); fn() }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this prediction? This action cannot be undone.')) return
    setDeleting(id)
    try {
      await predictionApi.deletePrediction(id)
      await fetchPredictions()
    } catch {
      alert('Failed to delete prediction.')
    } finally {
      setDeleting(null)
    }
  }

  const handleDownload = async (id) => {
    setDownloading(id)
    try {
      const blob = await reportApi.downloadPdf(id)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `diabetes-report-${id}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch {
      alert('Failed to download PDF.')
    } finally {
      setDownloading(null)
    }
  }

  const handleView = (id) => navigate(`/result/${id}`)

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f2a4a] via-[#0f2a4a]/90 to-slate-900 py-10 px-4">
      <div className="max-w-7xl mx-auto">

        {/* ── Header ───────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8 flex-wrap gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-600 to-teal-600 shadow-lg shadow-blue-500/20">
              <History className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Prediction History</h1>
              <p className="text-white/50 text-sm">All your past screening results</p>
            </div>
            {!loading && (
              <span className="ml-2 px-2.5 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold">
                {total} total
              </span>
            )}
          </div>
          <button
            onClick={() => navigate('/predict')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-teal-600 text-white text-sm font-semibold hover:opacity-90 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            New Prediction
          </button>
        </motion.div>

        {/* ── Filter Bar ───────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-4 mb-6 flex flex-wrap gap-3 items-end"
        >
          {/* Search */}
          <div className="flex-1 min-w-[180px]">
            <label className="text-xs text-white/50 mb-1 block">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text"
                placeholder="Search by date or result…"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1) }}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-sm placeholder-white/30 outline-none focus:border-blue-400 transition-colors"
              />
            </div>
          </div>

          {/* Result Filter */}
          <div className="min-w-[130px]">
            <label className="text-xs text-white/50 mb-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Result
            </label>
            <select
              value={resultFilter}
              onChange={e => applyFilter(() => setResultFilter(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-sm outline-none focus:border-blue-400 transition-colors appearance-none cursor-pointer"
            >
              <option value="all">All Results</option>
              <option value="positive">Positive</option>
              <option value="negative">Negative</option>
            </select>
          </div>

          {/* Sort */}
          <div className="min-w-[130px]">
            <label className="text-xs text-white/50 mb-1 flex items-center gap-1">
              <ArrowUpDown className="w-3 h-3" /> Sort
            </label>
            <select
              value={sort}
              onChange={e => applyFilter(() => setSort(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-sm outline-none focus:border-blue-400 transition-colors appearance-none cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>

          {/* Page size */}
          <div className="min-w-[100px]">
            <label className="text-xs text-white/50 mb-1 block">Per page</label>
            <select
              value={limit}
              onChange={e => applyFilter(() => setLimit(Number(e.target.value)))}
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-sm outline-none focus:border-blue-400 transition-colors appearance-none cursor-pointer"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </motion.div>

        {/* ── Desktop Table ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="hidden md:block bg-white/5 backdrop-blur border border-white/10 rounded-2xl overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-4 py-3 text-left text-white/50 font-semibold text-xs uppercase tracking-wider">#</th>
                  <th className="px-4 py-3 text-left text-white/50 font-semibold text-xs uppercase tracking-wider">
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Date &amp; Time</span>
                  </th>
                  <th className="px-4 py-3 text-left text-white/50 font-semibold text-xs uppercase tracking-wider">
                    <span className="flex items-center gap-1"><Droplets className="w-3.5 h-3.5" /> Glucose</span>
                  </th>
                  <th className="px-4 py-3 text-left text-white/50 font-semibold text-xs uppercase tracking-wider">
                    <span className="flex items-center gap-1"><Scale className="w-3.5 h-3.5" /> BMI</span>
                  </th>
                  <th className="px-4 py-3 text-left text-white/50 font-semibold text-xs uppercase tracking-wider">Age</th>
                  <th className="px-4 py-3 text-left text-white/50 font-semibold text-xs uppercase tracking-wider">
                    <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" /> BP</span>
                  </th>
                  <th className="px-4 py-3 text-left text-white/50 font-semibold text-xs uppercase tracking-wider">Result</th>
                  <th className="px-4 py-3 text-left text-white/50 font-semibold text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
                ) : predictions.length === 0 ? (
                  <tr>
                    <td colSpan={8}>
                      <EmptyState onNew={() => navigate('/predict')} />
                    </td>
                  </tr>
                ) : (
                  predictions.map((pred, idx) => {
                    const data = pred.input_data || pred
                    const rowNum = (page - 1) * limit + idx + 1
                    return (
                      <motion.tr
                        key={pred.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.03 }}
                        className="hover:bg-white/5 transition-colors group"
                      >
                        <td className="px-4 py-3 text-white/40 text-xs">{rowNum}</td>
                        <td className="px-4 py-3 text-white/70 whitespace-nowrap text-xs">{formatDate(pred.created_at)}</td>
                        <td className="px-4 py-3 text-white/80 text-xs">{data.glucose ?? '—'} <span className="text-white/30">mg/dL</span></td>
                        <td className="px-4 py-3 text-white/80 text-xs">{data.bmi ?? '—'}</td>
                        <td className="px-4 py-3 text-white/80 text-xs">{data.age ?? '—'}</td>
                        <td className="px-4 py-3 text-white/80 text-xs">{data.blood_pressure ?? '—'} <span className="text-white/30">mmHg</span></td>
                        <td className="px-4 py-3"><ResultBadge result={pred.result} /></td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <ActionBtn icon={Eye} label="View" color="blue" onClick={() => handleView(pred.id)} />
                            <ActionBtn
                              icon={downloading === pred.id ? Loader2 : Download}
                              label="PDF"
                              color="teal"
                              onClick={() => handleDownload(pred.id)}
                              spinning={downloading === pred.id}
                              disabled={downloading === pred.id}
                            />
                            <ActionBtn
                              icon={deleting === pred.id ? Loader2 : Trash2}
                              label="Delete"
                              color="red"
                              onClick={() => handleDelete(pred.id)}
                              spinning={deleting === pred.id}
                              disabled={deleting === pred.id}
                            />
                          </div>
                        </td>
                      </motion.tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* ── Mobile Card View ──────────────────────────────────────────── */}
        <div className="md:hidden space-y-3">
          {loading ? (
            [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
          ) : predictions.length === 0 ? (
            <EmptyState onNew={() => navigate('/predict')} />
          ) : (
            predictions.map((pred, idx) => {
              const data = pred.input_data || pred
              return (
                <motion.div
                  key={pred.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white/50 text-xs">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(pred.created_at)}
                    </div>
                    <ResultBadge result={pred.result} />
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-white/5 rounded-lg p-2 text-center">
                      <p className="text-white/40 mb-0.5">Glucose</p>
                      <p className="text-white font-semibold">{data.glucose ?? '—'}</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2 text-center">
                      <p className="text-white/40 mb-0.5">BMI</p>
                      <p className="text-white font-semibold">{data.bmi ?? '—'}</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2 text-center">
                      <p className="text-white/40 mb-0.5">Age</p>
                      <p className="text-white font-semibold">{data.age ?? '—'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => handleView(pred.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-blue-500/20 border border-blue-400/20 text-blue-300 text-xs font-medium hover:bg-blue-500/30 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" /> View
                    </button>
                    <button
                      onClick={() => handleDownload(pred.id)}
                      disabled={downloading === pred.id}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-teal-500/20 border border-teal-400/20 text-teal-300 text-xs font-medium hover:bg-teal-500/30 transition-colors disabled:opacity-50"
                    >
                      {downloading === pred.id
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : <Download className="w-3.5 h-3.5" />}
                      PDF
                    </button>
                    <button
                      onClick={() => handleDelete(pred.id)}
                      disabled={deleting === pred.id}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/20 border border-red-400/20 text-red-300 text-xs font-medium hover:bg-red-500/30 transition-colors disabled:opacity-50"
                    >
                      {deleting === pred.id
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </motion.div>
              )
            })
          )}
        </div>

        {/* ── Pagination ────────────────────────────────────────────────── */}
        {!loading && predictions.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-6 flex items-center justify-between flex-wrap gap-3"
          >
            <p className="text-white/40 text-xs">
              Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total} predictions
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed text-xs font-medium"
              >
                <ChevronLeft className="w-4 h-4" /> Prev
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let p
                  if (totalPages <= 5) {
                    p = i + 1
                  } else if (page <= 3) {
                    p = i + 1
                  } else if (page >= totalPages - 2) {
                    p = totalPages - 4 + i
                  } else {
                    p = page - 2 + i
                  }
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                        p === page
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                          : 'bg-white/5 border border-white/10 text-white/50 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {p}
                    </button>
                  )
                })}
              </div>

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed text-xs font-medium"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  )
}

// ── Helper Components ─────────────────────────────────────────────────────

function ActionBtn({ icon: Icon, label, color, onClick, spinning = false, disabled = false }) {
  const colorMap = {
    blue: 'bg-blue-500/20 border-blue-400/20 text-blue-300 hover:bg-blue-500/30',
    teal: 'bg-teal-500/20 border-teal-400/20 text-teal-300 hover:bg-teal-500/30',
    red:  'bg-red-500/20  border-red-400/20  text-red-300  hover:bg-red-500/30',
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={`p-1.5 rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${colorMap[color]}`}
    >
      <Icon className={`w-3.5 h-3.5 ${spinning ? 'animate-spin' : ''}`} />
    </button>
  )
}

function EmptyState({ onNew }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-20 px-6 text-center"
    >
      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 mb-4">
        <History className="w-10 h-10 text-white/20" />
      </div>
      <h3 className="text-white font-semibold mb-2">No predictions yet</h3>
      <p className="text-white/40 text-sm mb-6 max-w-xs">
        You haven't run any diabetes screenings. Start your first prediction to see results here.
      </p>
      <button
        onClick={onNew}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-teal-600 text-white text-sm font-semibold hover:opacity-90 transition-all"
      >
        <PlusCircle className="w-4 h-4" />
        New Prediction
      </button>
    </motion.div>
  )
}
