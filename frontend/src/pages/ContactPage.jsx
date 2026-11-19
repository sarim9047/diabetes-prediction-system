import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, MessageSquare, User, Tag, CheckCircle, Info, BookOpen, Activity, ExternalLink } from 'lucide-react'

// ─── data ───────────────────────────────────────────────────────────────────

const CATEGORIES = ['General', 'Bug Report', 'Feature Request', 'Academic']

const FAQ_LINKS = [
  { label: 'How does the prediction work?', href: '/#how-it-works', icon: <Activity size={15} /> },
  { label: 'What data do you use?', href: '/#features', icon: <Info size={15} /> },
  { label: 'Is this clinically validated?', href: '/about', icon: <BookOpen size={15} /> },
  { label: 'Diabetes awareness resources', href: '/awareness', icon: <Activity size={15} /> },
]

const PROJECT_INFO = [
  { label: 'Project Name', value: 'DiabetesRisk AI' },
  { label: 'Type', value: '7th Semester Major Project' },
  { label: 'Institution', value: 'University' },
  { label: 'Semester', value: 'Semester 7, 2024–25' },
  { label: 'Stack', value: 'React · Flask · scikit-learn' },
  { label: 'Dataset', value: 'PIMA Indian Diabetes Dataset' },
]

// ─── helpers ────────────────────────────────────────────────────────────────

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay },
})

function InputField({ label, icon, error, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>
        <input
          className={`w-full bg-slate-800/70 border ${
            error ? 'border-red-500' : 'border-slate-600'
          } rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/40 transition-colors text-sm`}
          {...props}
        />
      </div>
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  )
}

// ─── page ────────────────────────────────────────────────────────────────────

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', category: 'General', message: '' })
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    if (!form.email.trim()) errs.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email address'
    if (!form.message.trim()) errs.message = 'Message cannot be empty'
    else if (form.message.trim().length < 10) errs.message = 'Message must be at least 10 characters'
    return errs
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setSubmitting(true)
    // Simulated submission — no backend
    setTimeout(() => {
      setSubmitting(false)
      setSubmitted(true)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f2a4a] via-slate-900 to-slate-950 text-white">

      {/* ── Header ── */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#0f2a4a] to-[#0d2240] border-b border-slate-800">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_right,_#0d9488_0%,_transparent_60%)]" />
        <div className="relative max-w-5xl mx-auto px-6 py-16">
          <motion.div {...fadeUp()}>
            <div className="inline-flex items-center gap-2 bg-teal-500/20 border border-teal-500/40 rounded-full px-4 py-1.5 text-teal-300 text-sm mb-5">
              <MessageSquare size={15} />
              We value your feedback
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3">
              Feedback &amp; Contact
            </h1>
            <p className="text-slate-400 text-lg max-w-xl">
              Found a bug? Have a suggestion? Academic inquiry? We'd love to hear from you.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Feedback Form ── */}
          <motion.div {...fadeUp()} className="lg:col-span-2">
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Mail className="text-teal-400" size={20} />
                Send Feedback
              </h2>

              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-16"
                  >
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-500/20 border border-teal-500 rounded-full mb-4">
                      <CheckCircle size={32} className="text-teal-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Thank you for your feedback!</h3>
                    <p className="text-slate-400 mb-6 text-sm max-w-sm mx-auto">
                      Your message has been received. We appreciate you taking the time to share your thoughts.
                    </p>
                    <button
                      onClick={() => { setSubmitted(false); setForm({ name: '', email: '', category: 'General', message: '' }) }}
                      className="text-teal-400 hover:text-teal-300 text-sm underline transition-colors"
                    >
                      Send another message
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit}
                    className="space-y-5"
                    noValidate
                  >
                    {/* Name */}
                    <InputField
                      label="Your Name"
                      icon={<User size={16} />}
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="e.g. Sarim Khan"
                      error={errors.name}
                    />

                    {/* Email */}
                    <InputField
                      label="Email Address"
                      icon={<Mail size={16} />}
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      error={errors.email}
                    />

                    {/* Category */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Category</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Tag size={16} /></span>
                        <select
                          name="category"
                          value={form.category}
                          onChange={handleChange}
                          className="w-full bg-slate-800/70 border border-slate-600 rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/40 transition-colors text-sm appearance-none"
                        >
                          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Message</label>
                      <textarea
                        name="message"
                        value={form.message}
                        onChange={handleChange}
                        rows={5}
                        placeholder="Describe your feedback, bug, or inquiry in detail…"
                        className={`w-full bg-slate-800/70 border ${
                          errors.message ? 'border-red-500' : 'border-slate-600'
                        } rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/40 transition-colors text-sm resize-none`}
                      />
                      {errors.message && <p className="text-red-400 text-xs mt-1">{errors.message}</p>}
                      <p className="text-slate-500 text-xs mt-1 text-right">{form.message.length} chars</p>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-teal-600 hover:bg-teal-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Sending…
                        </>
                      ) : (
                        <>
                          <Mail size={16} />
                          Submit Feedback
                        </>
                      )}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* ── Sidebar ── */}
          <div className="space-y-5">

            {/* Project Info */}
            <motion.div {...fadeUp(0.1)} className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Info size={17} className="text-blue-400" />
                Project Information
              </h3>
              <div className="space-y-2.5">
                {PROJECT_INFO.map(item => (
                  <div key={item.label} className="flex flex-col">
                    <span className="text-xs text-slate-500 uppercase tracking-wide">{item.label}</span>
                    <span className="text-sm text-slate-200">{item.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* FAQ Quick Links */}
            <motion.div {...fadeUp(0.15)} className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <BookOpen size={17} className="text-teal-400" />
                Quick FAQ Links
              </h3>
              <div className="space-y-2">
                {FAQ_LINKS.map(link => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="flex items-center gap-2 text-sm text-slate-400 hover:text-teal-400 transition-colors group"
                  >
                    <span className="text-slate-500 group-hover:text-teal-400 transition-colors">{link.icon}</span>
                    {link.label}
                    <ExternalLink size={12} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                ))}
              </div>
            </motion.div>

            {/* Notice */}
            <motion.div {...fadeUp(0.2)} className="bg-amber-900/20 border border-amber-700/40 rounded-2xl p-4">
              <div className="flex gap-2 items-start">
                <Info size={15} className="text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-200/80 leading-relaxed">
                  This form does not send real emails. This is a static demo for academic demonstration purposes.
                </p>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  )
}
