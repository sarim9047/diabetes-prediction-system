import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  AlertTriangle, CheckCircle2, Download, PlusCircle, History,
  LayoutDashboard, AlertCircle, Baby, Droplets, Heart, Ruler,
  Zap, Scale, Users, Calendar, Clock, Cpu, Leaf, Apple,
  Dumbbell, Moon, Stethoscope
} from 'lucide-react'
import { predictionApi, reportApi } from '../services/api'

const PARAM_META = [
  { key: 'pregnancies',               label: 'Pregnancies',           icon: Baby    },
  { key: 'glucose',                   label: 'Glucose',               icon: Droplets, unit: 'mg/dL'  },
  { key: 'blood_pressure',            label: 'Blood Pressure',        icon: Heart,    unit: 'mmHg'   },
  { key: 'skin_thickness',            label: 'Skin Thickness',        icon: Ruler,    unit: 'mm'     },
  { key: 'insulin',                   label: 'Insulin',               icon: Zap,      unit: 'μU/mL'  },
  { key: 'bmi',                       label: 'BMI',                   icon: Scale,    unit: 'kg/m²'  },
  { key: 'diabetes_pedigree_function',label: 'Pedigree Function',     icon: Users               },
  { key: 'age',                       label: 'Age',                   icon: Calendar, unit: 'yrs'    },
]

const HEALTH_TIPS = [
  { icon: Apple,     title: 'Balanced Diet',     text: 'Prioritize vegetables, whole grains, lean proteins, and limit refined sugars and saturated fats.' },
  { icon: Dumbbell,  title: 'Regular Exercise',  text: 'Aim for at least 150 minutes of moderate aerobic activity per week, such as brisk walking or cycling.' },
  { icon: Moon,      title: 'Quality Sleep',     text: 'Maintain 7–9 hours of sleep nightly. Poor sleep can disrupt insulin sensitivity and metabolic function.' },
  { icon: Stethoscope, title: 'Routine Checkups', text: 'Schedule annual blood glucose tests and metabolic panels, especially if you have risk factors for diabetes.' },
]

function formatDate(dateStr) {
  if (!dateStr) return 'N/A'
  return new Date(dateStr).toLocaleString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

export default function PredictionResultPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [prediction, setPrediction] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    if (!id || id === 'undefined') {
      setError('Invalid prediction ID.')
      setLoading(false)
      return
    }
    setLoading(true)
    predictionApi.getPredictionById(id)
      .then(response => {
        setPrediction(response.data || response)
        setLoading(false)
      })
      .catch(err => {
        setError(err?.response?.data?.detail || 'Failed to load prediction result.')
        setLoading(false)
      })
  }, [id])

  const handleDownloadPdf = async () => {
    if (!prediction) return
    setDownloading(true)
    try {
      const res = await reportApi.downloadPdf(prediction.id)
      const blob = res.data instanceof Blob ? res.data : new Blob([res.data], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `diabetes-report-${prediction.id}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch {
      alert('Failed to download PDF. Please try again.')
    } finally {
      setDownloading(false)
    }
  }

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f2a4a] via-[#0f2a4a]/90 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <svg className="w-12 h-12 animate-spin text-blue-400 mx-auto mb-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          <p className="text-white/60 text-sm">Loading your result…</p>
        </div>
      </div>
    )
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f2a4a] via-[#0f2a4a]/90 to-slate-900 flex items-center justify-center px-4">
        <div className="bg-red-500/10 border border-red-400/30 rounded-2xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-300 font-semibold mb-2">Could not load result</p>
          <p className="text-red-200/60 text-sm mb-6">{error}</p>
          <button
            onClick={() => navigate('/predict')}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
          >
            New Prediction
          </button>
        </div>
      </div>
    )
  }

  const isPositive = prediction?.prediction_result === 1 || prediction?.result === 1

  // ── Result Card config ───────────────────────────────────────────────────
  const cardConfig = isPositive
    ? {
        gradient: 'from-orange-600 via-red-600 to-rose-700',
        badge: 'bg-orange-100 text-orange-800',
        badgeText: 'POSITIVE',
        Icon: AlertTriangle,
        iconBg: 'bg-orange-500/20',
        iconColor: 'text-orange-200',
        title: 'Elevated Risk Indicator',
        body: 'The model indicates a POSITIVE classification for diabetes risk. This is a screening result only — not a medical diagnosis.',
        note: 'Consult a qualified healthcare professional for proper medical evaluation.',
        noteClass: 'bg-red-500/20 border-red-400/40 text-red-200',
      }
    : {
        gradient: 'from-teal-600 via-green-600 to-emerald-700',
        badge: 'bg-green-100 text-green-800',
        badgeText: 'NEGATIVE',
        Icon: CheckCircle2,
        iconBg: 'bg-teal-500/20',
        iconColor: 'text-teal-200',
        title: 'Lower Risk Indicator',
        body: 'The model indicates a NEGATIVE classification. This is a screening result only — not a medical diagnosis.',
        note: 'Maintain healthy lifestyle habits. Regular medical checkups are recommended.',
        noteClass: 'bg-teal-500/20 border-teal-400/40 text-teal-200',
      }

  const { Icon } = cardConfig

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f2a4a] via-[#0f2a4a]/90 to-slate-900 py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* ── Main Result Card ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl overflow-hidden shadow-2xl"
        >
          {/* Gradient Header */}
          <div className={`bg-gradient-to-r ${cardConfig.gradient} p-8`}>
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-2xl ${cardConfig.iconBg} flex-shrink-0`}>
                <Icon className={`w-8 h-8 ${cardConfig.iconColor}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h1 className="text-2xl font-bold text-white">{cardConfig.title}</h1>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${cardConfig.badge}`}>
                    {cardConfig.badgeText}
                  </span>
                </div>
                <p className="text-white/80 text-sm leading-relaxed">{cardConfig.body}</p>
              </div>
            </div>
            {/* Prominent note */}
            <div className={`mt-4 p-3 rounded-xl border ${cardConfig.noteClass} text-xs font-medium flex items-start gap-2`}>
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              {cardConfig.note}
            </div>
          </div>

          {/* Meta info row */}
          <div className="bg-white/5 backdrop-blur border-t border-white/10 px-6 py-4 flex flex-wrap gap-6">
            <div className="flex items-center gap-2 text-white/60 text-sm">
              <Clock className="w-4 h-4" />
              <span>Analyzed: <span className="text-white/80">{formatDate(prediction?.created_at)}</span></span>
            </div>
            <div className="flex items-center gap-2 text-white/60 text-sm">
              <Cpu className="w-4 h-4" />
              <span>Model: <span className="text-white/80">{prediction?.model_name || 'AI Model'}</span></span>
            </div>
          </div>
        </motion.div>

        {/* ── Input Summary ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6"
        >
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
            <Leaf className="w-4 h-4 text-teal-400" />
            Input Summary
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {PARAM_META.map(({ key, label, icon: ParamIcon, unit }) => {
              const val = prediction?.input_data?.[key] ?? prediction?.[key] ?? '—'
              return (
                <div key={key} className="bg-white/5 rounded-xl p-3 flex flex-col gap-1 border border-white/10">
                  <div className="flex items-center gap-1.5 text-white/50">
                    <ParamIcon className="w-3.5 h-3.5" />
                    <span className="text-xs">{label}</span>
                  </div>
                  <p className="text-white font-semibold text-lg leading-tight">
                    {val !== '—' ? Number(val).toLocaleString() : '—'}
                    {unit && val !== '—' && <span className="text-white/40 text-xs ml-1">{unit}</span>}
                  </p>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* ── Health Guidance ───────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6"
        >
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
            <Heart className="w-4 h-4 text-teal-400" />
            General Health Guidance
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {HEALTH_TIPS.map(({ icon: TipIcon, title, text }) => (
              <div key={title} className="flex gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="p-2 rounded-lg bg-teal-500/20 flex-shrink-0 h-fit">
                  <TipIcon className="w-4 h-4 text-teal-400" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold mb-1">{title}</p>
                  <p className="text-white/55 text-xs leading-relaxed">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Medical Disclaimer ────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="p-4 rounded-xl bg-amber-500/10 border border-amber-400/20 flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-amber-300 mb-1">Medical Disclaimer</p>
            <p className="text-xs text-amber-200/70 leading-relaxed">
              This AI screening tool is for <strong>educational purposes only</strong>. It does not provide medical advice,
              diagnosis, or treatment. The result is based on statistical patterns and should <strong>not</strong> be used
              as a substitute for professional medical evaluation. Always consult a qualified physician.
            </p>
          </div>
        </motion.div>

        {/* ── Action Buttons ────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        >
          <button
            onClick={handleDownloadPdf}
            disabled={downloading}
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-blue-600/20 border border-blue-400/30 text-blue-300 hover:bg-blue-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium"
          >
            {downloading ? (
              <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            ) : (
              <Download className="w-5 h-5" />
            )}
            Download PDF
          </button>

          <Link
            to="/predict"
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-teal-600/20 border border-teal-400/30 text-teal-300 hover:bg-teal-600/30 transition-all text-xs font-medium"
          >
            <PlusCircle className="w-5 h-5" />
            New Prediction
          </Link>

          <Link
            to="/history"
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white transition-all text-xs font-medium"
          >
            <History className="w-5 h-5" />
            View History
          </Link>

          <Link
            to="/dashboard"
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white transition-all text-xs font-medium"
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </Link>
        </motion.div>

      </div>
    </div>
  )
}
