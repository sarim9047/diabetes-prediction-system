import React, { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Activity, RotateCcw, AlertCircle, CheckCircle2, Info,
  Droplets, Heart, Ruler, Zap, Scale, Users, Calendar, Baby
} from 'lucide-react'
import { predictionApi } from '../services/api'

const FIELDS = [
  {
    key: 'pregnancies',
    label: 'Number of Pregnancies',
    description: 'Total number of times pregnant (enter 0 if never)',
    icon: Baby,
    unit: null,
    type: 'number',
    min: 0,
    max: 20,
    step: 1,
    placeholder: '0–20',
  },
  {
    key: 'glucose',
    label: 'Plasma Glucose Level',
    description: 'Blood glucose concentration after 2-hour oral glucose tolerance test',
    icon: Droplets,
    unit: 'mg/dL',
    type: 'number',
    min: 1,
    max: 400,
    step: 1,
    placeholder: '1–400',
  },
  {
    key: 'blood_pressure',
    label: 'Diastolic Blood Pressure',
    description: 'Lower number in blood pressure reading (diastolic)',
    icon: Heart,
    unit: 'mmHg',
    type: 'number',
    min: 30,
    max: 250,
    step: 1,
    placeholder: '1–200',
  },
  {
    key: 'skin_thickness',
    label: 'Triceps Skin Fold Thickness',
    description: 'Skin fold thickness measured at triceps, used to estimate body fat',
    icon: Ruler,
    unit: 'mm',
    type: 'number',
    min: 0,
    max: 100,
    step: 1,
    placeholder: '0–100',
  },
  {
    key: 'insulin',
    label: '2-Hour Serum Insulin',
    description: 'Serum insulin level 2 hours after glucose administration',
    icon: Zap,
    unit: 'μU/mL',
    type: 'number',
    min: 0,
    max: 900,
    step: 1,
    placeholder: '0–900',
  },
  {
    key: 'bmi',
    label: 'Body Mass Index',
    description: 'Weight in kg divided by height in meters squared',
    icon: Scale,
    unit: 'kg/m²',
    type: 'number',
    min: 10,
    max: 80,
    step: 0.1,
    placeholder: '1–80',
  },
  {
    key: 'diabetes_pedigree_function',
    label: 'Diabetes Pedigree Function',
    description: 'Family history score — likelihood of diabetes based on genetic heritage',
    icon: Users,
    unit: null,
    tooltip: 'Family history score',
    type: 'number',
    min: 0.01,
    max: 3.0,
    step: 0.001,
    placeholder: '0.001–3.000',
  },
  {
    key: 'age',
    label: 'Age',
    description: 'Patient age in complete years',
    icon: Calendar,
    unit: 'years',
    type: 'number',
    min: 1,
    max: 120,
    step: 1,
    placeholder: '1–120',
  },
]

function validateField(field, value) {
  if (value === '' || value === null || value === undefined) return 'This field is required'
  const num = parseFloat(value)
  if (isNaN(num)) return 'Must be a valid number'
  if (num < field.min) return `Minimum value is ${field.min}`
  if (num > field.max) return `Maximum value is ${field.max}`
  return null
}

export default function PredictionFormPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState(
    Object.fromEntries(FIELDS.map(f => [f.key, '']))
  )
  const [touched, setTouched] = useState(
    Object.fromEntries(FIELDS.map(f => [f.key, false]))
  )
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState(null)

  const handleChange = useCallback((key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }))
    if (touched[key]) {
      const field = FIELDS.find(f => f.key === key)
      const err = validateField(field, value)
      setErrors(prev => ({ ...prev, [key]: err }))
    }
  }, [touched])

  const handleBlur = useCallback((key) => {
    setTouched(prev => ({ ...prev, [key]: true }))
    const field = FIELDS.find(f => f.key === key)
    const err = validateField(field, formData[key])
    setErrors(prev => ({ ...prev, [key]: err }))
  }, [formData])

  const handleReset = () => {
    setFormData(Object.fromEntries(FIELDS.map(f => [f.key, ''])))
    setTouched(Object.fromEntries(FIELDS.map(f => [f.key, false])))
    setErrors({})
    setApiError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    // Validate all fields
    const allTouched = Object.fromEntries(FIELDS.map(f => [f.key, true]))
    setTouched(allTouched)
    const newErrors = {}
    FIELDS.forEach(field => {
      const err = validateField(field, formData[field.key])
      if (err) newErrors[field.key] = err
    })
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    setLoading(true)
    setApiError(null)
    try {
      const payload = {}
      FIELDS.forEach(f => {
        payload[f.key] = parseFloat(formData[f.key])
      })
      const response = await predictionApi.predict(payload)
      const predId = response?.data?.id ?? response?.id
      if (predId) {
        navigate(`/result/${predId}`)
      } else {
        throw new Error('Prediction was analyzed, but could not retrieve ID.')
      }
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.response?.data?.message || err?.message || 'Prediction failed. Please try again.'
      setApiError(typeof msg === 'string' ? msg : JSON.stringify(msg))
    } finally {
      setLoading(false)
    }
  }

  const fillSampleHighRisk = () => {
    setFormData({
      pregnancies: '6',
      glucose: '168',
      blood_pressure: '85',
      skin_thickness: '38',
      insulin: '240',
      bmi: '38.5',
      diabetes_pedigree_function: '0.85',
      age: '54'
    })
    setErrors({})
    setApiError(null)
  }

  const fillSampleLowRisk = () => {
    setFormData({
      pregnancies: '0',
      glucose: '85',
      blood_pressure: '70',
      skin_thickness: '20',
      insulin: '75',
      bmi: '22.0',
      diabetes_pedigree_function: '0.18',
      age: '23'
    })
    setErrors({})
    setApiError(null)
  }

  const getFieldState = (key) => {
    if (!touched[key]) return 'default'
    if (errors[key]) return 'error'
    if (formData[key] !== '') return 'valid'
    return 'default'
  }

  const inputClass = (key) => {
    const state = getFieldState(key)
    const base = 'w-full pl-10 pr-4 py-3 rounded-xl border-2 bg-white/5 text-white placeholder-white/30 outline-none transition-all duration-200 text-sm'
    if (state === 'error') return `${base} border-red-400 focus:border-red-400 bg-red-500/5`
    if (state === 'valid') return `${base} border-teal-400 focus:border-teal-400 bg-teal-500/5`
    return `${base} border-white/20 focus:border-blue-400 hover:border-white/40`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f2a4a] via-[#0f2a4a]/90 to-slate-900 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-teal-500 mb-4 shadow-lg shadow-blue-500/30">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Diabetes Risk Analysis</h1>
          <p className="text-white/60 text-sm max-w-xl mx-auto">
            Enter your clinical parameters below. All values are used by the AI model to screen for diabetes risk.
          </p>
        </motion.div>

        {/* API Error */}
        <AnimatePresence>
          {apiError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-400/30 text-red-300"
            >
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <span className="text-sm">{apiError}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Sample Presets */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
          <span className="text-white/60 text-xs font-semibold uppercase tracking-wider">Quick Test:</span>
          <button
            type="button"
            onClick={fillSampleHighRisk}
            className="px-3.5 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-400/40 text-red-200 text-xs font-semibold transition-all"
          >
            ⚠️ Fill High-Risk Case
          </button>
          <button
            type="button"
            onClick={fillSampleLowRisk}
            className="px-3.5 py-1.5 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 border border-teal-400/40 text-teal-200 text-xs font-semibold transition-all"
          >
            ✅ Fill Low-Risk Case
          </button>
        </div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl"
        >
          <form onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {FIELDS.map((field, idx) => {
                const Icon = field.icon
                const state = getFieldState(field.key)
                return (
                  <motion.div
                    key={field.key}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 + 0.15 }}
                    className="flex flex-col gap-1.5"
                  >
                    {/* Label Row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <label className="text-sm font-semibold text-white/90" htmlFor={field.key}>
                          {field.label}
                        </label>
                        {field.tooltip && (
                          <div className="relative group">
                            <Info className="w-3.5 h-3.5 text-white/40 cursor-help" />
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-slate-800 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 border border-white/10">
                              {field.tooltip}
                            </div>
                          </div>
                        )}
                      </div>
                      {field.unit && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/20">
                          {field.unit}
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-xs text-white/40">{field.description}</p>

                    {/* Input */}
                    <div className="relative">
                      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                      <input
                        id={field.key}
                        type={field.type}
                        min={field.min}
                        max={field.max}
                        step={field.step}
                        placeholder={field.placeholder}
                        value={formData[field.key]}
                        onChange={e => handleChange(field.key, e.target.value)}
                        onBlur={() => handleBlur(field.key)}
                        className={inputClass(field.key)}
                        disabled={loading}
                      />
                      {/* Valid icon */}
                      {state === 'valid' && (
                        <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-400" />
                      )}
                      {state === 'error' && (
                        <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-400" />
                      )}
                    </div>

                    {/* Error message */}
                    <AnimatePresence>
                      {errors[field.key] && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-xs text-red-400 flex items-center gap-1 overflow-hidden"
                        >
                          <AlertCircle className="w-3 h-3 flex-shrink-0" />
                          {errors[field.key]}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })}
            </div>

            {/* Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-[#0f2a4a] via-[#2563eb] to-[#0d9488] hover:opacity-90 transition-all duration-200 shadow-lg shadow-blue-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Analyzing your data...
                  </>
                ) : (
                  <>
                    <Activity className="w-5 h-5" />
                    Analyze Risk
                  </>
                )}
              </motion.button>

              <motion.button
                type="button"
                onClick={handleReset}
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-semibold text-white/70 border border-white/20 hover:bg-white/5 hover:text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <RotateCcw className="w-4 h-4" />
                Reset Form
              </motion.button>
            </div>
          </form>
        </motion.div>

        {/* Medical Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-400/20 flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-amber-300 mb-1">Medical Disclaimer</p>
            <p className="text-xs text-amber-200/70">
              This tool is for <strong>educational screening purposes only</strong> and does not constitute a medical diagnosis.
              Results should not replace professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
