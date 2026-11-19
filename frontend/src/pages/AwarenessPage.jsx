import { motion } from 'framer-motion'
import {
  Heart, Activity, AlertCircle, Info, CheckCircle,
  Droplets, Zap, Scale, Eye, Stethoscope, Clock, Shield
} from 'lucide-react'

// ─── data ───────────────────────────────────────────────────────────────────

const DIABETES_TYPES = [
  {
    type: 'Type 1',
    color: 'border-blue-500',
    badge: 'bg-blue-500',
    icon: <Zap size={20} />,
    desc: 'An autoimmune condition where the immune system destroys insulin-producing beta cells in the pancreas. The body produces little to no insulin. Requires daily insulin therapy.',
    facts: ['Typically diagnosed in children/young adults', 'Not preventable with lifestyle changes', 'Accounts for ~5–10% of all diabetes cases'],
  },
  {
    type: 'Type 2',
    color: 'border-teal-500',
    badge: 'bg-teal-500',
    icon: <Activity size={20} />,
    desc: 'The body becomes resistant to insulin or does not produce enough. Often linked to lifestyle factors. The most common form, accounting for 90–95% of cases.',
    facts: ['Can often be managed with diet, exercise & medication', 'Risk increases with age and BMI', 'This model predicts Type 2 diabetes risk'],
  },
  {
    type: 'Gestational',
    color: 'border-purple-500',
    badge: 'bg-purple-500',
    icon: <Heart size={20} />,
    desc: 'Develops during pregnancy in women who did not have diabetes before. Usually resolves after birth but increases the risk of Type 2 diabetes later in life.',
    facts: ['Affects 2–10% of pregnancies', 'Requires blood sugar monitoring during pregnancy', 'Healthy pregnancy management reduces risks'],
  },
]

const RISK_FACTORS = [
  { icon: <Clock size={18} />, label: 'Age', desc: 'Risk increases significantly after age 45' },
  { icon: <Scale size={18} />, label: 'BMI & Obesity', desc: 'Excess body fat, especially abdominal fat, increases insulin resistance' },
  { icon: <Heart size={18} />, label: 'Family History', desc: 'Having a parent or sibling with Type 2 diabetes raises your risk' },
  { icon: <Droplets size={18} />, label: 'Blood Glucose', desc: 'Pre-diabetes (high fasting glucose) is a strong predictor' },
  { icon: <Activity size={18} />, label: 'Physical Inactivity', desc: 'Sedentary lifestyle contributes to weight gain and insulin resistance' },
  { icon: <Stethoscope size={18} />, label: 'Blood Pressure', desc: 'Hypertension is closely associated with diabetes' },
  { icon: <Eye size={18} />, label: 'Ethnicity', desc: 'South Asian, African, Hispanic populations are at higher risk' },
  { icon: <Zap size={18} />, label: 'Diet & Lifestyle', desc: 'High sugar intake, smoking, and alcohol elevate risk' },
]

const BIOMARKERS = [
  {
    name: 'Pregnancies',
    icon: '🤰',
    normal: '0 – 17 (dataset range)',
    desc: 'Number of times pregnant. Gestational diabetes in prior pregnancies raises lifetime risk.',
  },
  {
    name: 'Plasma Glucose',
    icon: '🩸',
    normal: '70 – 99 mg/dL (fasting normal)',
    desc: '2-hour plasma glucose in an oral glucose tolerance test. Values ≥ 126 mg/dL indicate diabetes; 100–125 mg/dL indicate pre-diabetes.',
  },
  {
    name: 'Blood Pressure',
    icon: '💓',
    normal: '< 80 mmHg (diastolic normal)',
    desc: 'Diastolic blood pressure (mm Hg). Hypertension is closely associated with Type 2 diabetes and metabolic syndrome.',
  },
  {
    name: 'Skin Thickness',
    icon: '📏',
    normal: '10 – 50 mm (normal range)',
    desc: 'Triceps skin fold thickness (mm). Used as a proxy for body fat percentage; higher values correlate with insulin resistance.',
  },
  {
    name: 'Insulin',
    icon: '💉',
    normal: '16 – 166 µIU/mL (2-hr serum)',
    desc: '2-hour serum insulin (µU/ml). Elevated fasting insulin can signal insulin resistance — a precursor to Type 2 diabetes.',
  },
  {
    name: 'BMI',
    icon: '⚖️',
    normal: '18.5 – 24.9 kg/m² (healthy)',
    desc: 'Body Mass Index (weight in kg / height in m²). Obesity (BMI ≥ 30) is one of the strongest modifiable risk factors.',
  },
  {
    name: 'Diabetes Pedigree Function',
    icon: '🧬',
    normal: '0.078 – 2.42 (dataset range)',
    desc: 'A function that scores the genetic/familial risk based on family history of diabetes. Higher values indicate greater hereditary predisposition.',
  },
  {
    name: 'Age',
    icon: '🎂',
    normal: '21 – 81 years (dataset range)',
    desc: 'Age in years. Diabetes risk increases significantly with age, particularly after 45, as insulin sensitivity declines.',
  },
]

const PREVENTION_TIPS = [
  { icon: <Activity size={18} />, tip: 'Exercise regularly', detail: 'Aim for 150+ minutes of moderate aerobic activity per week (brisk walking, cycling, swimming).' },
  { icon: <Scale size={18} />, tip: 'Maintain a healthy weight', detail: 'Even a 5–7% reduction in body weight can reduce Type 2 diabetes risk by up to 58%.' },
  { icon: <Droplets size={18} />, tip: 'Eat a balanced diet', detail: 'Limit refined carbohydrates and sugar. Choose whole grains, vegetables, legumes, and lean protein.' },
  { icon: <Heart size={18} />, tip: 'Monitor blood sugar', detail: 'If at risk, get regular HbA1c and fasting glucose tests. Know your numbers.' },
  { icon: <Shield size={18} />, tip: 'Avoid smoking & limit alcohol', detail: 'Smokers have a 30–40% higher risk of developing Type 2 diabetes than non-smokers.' },
  { icon: <Clock size={18} />, tip: 'Get enough sleep', detail: 'Poor sleep disrupts insulin regulation. Aim for 7–9 hours per night.' },
]

const DOCTOR_SIGNS = [
  'Frequent urination, especially at night',
  'Excessive thirst or hunger',
  'Unexplained weight loss',
  'Blurred vision or slow-healing sores',
  'Fatigue and lack of energy',
  'Numbness or tingling in hands/feet',
  'If you are 45+ or have multiple risk factors — routine screening recommended',
]

// ─── helpers ────────────────────────────────────────────────────────────────

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, delay },
})

function SectionHeading({ icon, title, subtitle, iconColor = 'text-teal-400' }) {
  return (
    <div className="flex items-start gap-3 mb-6">
      <div className={`mt-1 ${iconColor}`}>{icon}</div>
      <div>
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        {subtitle && <p className="text-slate-400 text-sm mt-0.5">{subtitle}</p>}
      </div>
    </div>
  )
}

// ─── page ────────────────────────────────────────────────────────────────────

export default function AwarenessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f2a4a] via-slate-900 to-slate-950 text-white">

      {/* ── Hero ── */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#0f2a4a] to-[#0d2240] border-b border-slate-800">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_#0d9488_0%,_transparent_70%)]" />
        <div className="relative max-w-5xl mx-auto px-6 py-20 text-center">
          <motion.div {...fadeUp()}>
            <div className="inline-flex items-center gap-2 bg-teal-500/20 border border-teal-500/40 rounded-full px-4 py-1.5 text-teal-300 text-sm mb-6">
              <Heart size={16} />
              Health Education Resource
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
              Understanding Diabetes
            </h1>
            <p className="text-slate-300 max-w-2xl mx-auto text-lg">
              Evidence-based information about diabetes — what it is, how to recognise it,
              and how to reduce your risk. <span className="text-teal-400 font-medium">Not a substitute for medical advice.</span>
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-14 space-y-20">

        {/* ── What is Diabetes? ── */}
        <motion.section {...fadeUp()}>
          <SectionHeading icon={<Info size={22} />} title="What is Diabetes?" subtitle="Three main forms, one common thread — elevated blood glucose." />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {DIABETES_TYPES.map((t, i) => (
              <motion.div key={t.type} {...fadeUp(i * 0.1)} className={`border-2 ${t.color} rounded-xl p-5 bg-slate-800/50`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`${t.badge} text-white p-1.5 rounded-lg`}>{t.icon}</span>
                  <span className="font-bold text-white text-lg">{t.type} Diabetes</span>
                </div>
                <p className="text-slate-300 text-sm mb-4">{t.desc}</p>
                <ul className="space-y-1">
                  {t.facts.map(f => (
                    <li key={f} className="flex items-start gap-2 text-xs text-slate-400">
                      <CheckCircle size={12} className="text-teal-400 mt-0.5 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ── Risk Factors ── */}
        <motion.section {...fadeUp()}>
          <SectionHeading icon={<AlertCircle size={22} />} title="Risk Factors" subtitle="Understanding your risk is the first step in prevention." iconColor="text-orange-400" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {RISK_FACTORS.map((r, i) => (
              <motion.div key={r.label} {...fadeUp(i * 0.07)} className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
                <div className="flex items-center gap-2 text-orange-400 mb-2">
                  {r.icon}
                  <span className="font-semibold text-white text-sm">{r.label}</span>
                </div>
                <p className="text-slate-400 text-xs">{r.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ── The 8 Biomarkers ── */}
        <motion.section {...fadeUp()}>
          <SectionHeading
            icon={<Activity size={22} />}
            title="Understanding the 8 Biomarkers"
            subtitle="These are the exact features used by our prediction model — with normal reference ranges."
            iconColor="text-blue-400"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {BIOMARKERS.map((b, i) => (
              <motion.div key={b.name} {...fadeUp(i * 0.07)} className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 flex gap-3">
                <span className="text-2xl flex-shrink-0">{b.icon}</span>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-semibold text-white">{b.name}</span>
                    <span className="text-xs bg-blue-900/50 border border-blue-700 text-blue-300 px-2 py-0.5 rounded-full">{b.normal}</span>
                  </div>
                  <p className="text-slate-400 text-sm">{b.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ── Prevention Tips ── */}
        <motion.section {...fadeUp()}>
          <SectionHeading icon={<Shield size={22} />} title="Prevention &amp; Lifestyle Tips" subtitle="Small changes have an outsized impact on long-term health." iconColor="text-teal-400" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PREVENTION_TIPS.map((p, i) => (
              <motion.div key={p.tip} {...fadeUp(i * 0.09)} className="flex gap-3 bg-teal-950/30 border border-teal-800/50 rounded-xl p-4">
                <span className="text-teal-400 flex-shrink-0 mt-0.5">{p.icon}</span>
                <div>
                  <div className="font-semibold text-white mb-0.5">{p.tip}</div>
                  <div className="text-slate-400 text-sm">{p.detail}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ── When to See a Doctor ── */}
        <motion.section {...fadeUp()}>
          <SectionHeading icon={<Stethoscope size={22} />} title="When to See a Doctor" subtitle="Don't wait for symptoms — early detection saves lives." iconColor="text-red-400" />
          <div className="bg-red-950/30 border border-red-800/50 rounded-xl p-6">
            <p className="text-slate-300 mb-4 text-sm">
              Diabetes often develops silently. Consult a healthcare professional if you experience any of the following:
            </p>
            <ul className="space-y-2">
              {DOCTOR_SIGNS.map(s => (
                <li key={s} className="flex items-start gap-2 text-sm text-slate-200">
                  <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </motion.section>

        {/* ── Disclaimer ── */}
        <motion.div {...fadeUp()} className="text-center p-6 bg-slate-800/40 border border-slate-700 rounded-xl">
          <Info size={20} className="text-slate-400 mx-auto mb-2" />
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            This page is for <strong className="text-white">educational purposes only</strong> and does not constitute
            medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional for personal medical decisions.
          </p>
        </motion.div>

      </div>
    </div>
  )
}
