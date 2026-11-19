import { motion } from 'framer-motion'
import { BookOpen, Code, Database, Server, Brain, CheckCircle, ArrowRight, AlertTriangle } from 'lucide-react'

// ─── data ───────────────────────────────────────────────────────────────────

const OBJECTIVES = [
  'Build a machine learning pipeline for binary classification of Type 2 diabetes risk using the PIMA Indian Diabetes Dataset.',
  'Compare four classification algorithms — SVM, Logistic Regression, Random Forest, and Decision Tree — using consistent evaluation metrics.',
  'Implement and justify data preprocessing steps: zero-value imputation, feature scaling with StandardScaler, and stratified train-test split.',
  'Develop a full-stack web application providing an authenticated, user-friendly interface for real-time risk predictions.',
  'Visualise model performance through confusion matrices, ROC curves, and cross-model comparison charts.',
  'Persist user predictions in a database to enable personal history tracking and pattern review.',
  'Implement role-based access control (user / admin) to demonstrate real-world system security concepts.',
  'Produce educational content explaining ML concepts to support viva examination and public health awareness.',
]

const TECH_STACK = [
  {
    section: 'Frontend',
    color: 'border-blue-500 bg-blue-950/30',
    icon: <Code size={20} className="text-blue-400" />,
    items: [
      { name: 'React 18', detail: 'Component-based UI with hooks' },
      { name: 'Vite', detail: 'Fast build tooling & HMR' },
      { name: 'Tailwind CSS', detail: 'Utility-first styling' },
      { name: 'Framer Motion', detail: 'Declarative animations' },
      { name: 'Recharts', detail: 'Data visualisation' },
      { name: 'React Router v6', detail: 'Client-side routing' },
    ],
  },
  {
    section: 'Backend',
    color: 'border-teal-500 bg-teal-950/30',
    icon: <Server size={20} className="text-teal-400" />,
    items: [
      { name: 'Flask', detail: 'Python micro-framework REST API' },
      { name: 'Flask-JWT-Extended', detail: 'Token-based authentication' },
      { name: 'Flask-SQLAlchemy', detail: 'ORM for database models' },
      { name: 'Flask-Bcrypt', detail: 'Password hashing' },
      { name: 'Marshmallow', detail: 'Request/response serialisation' },
    ],
  },
  {
    section: 'Machine Learning',
    color: 'border-purple-500 bg-purple-950/30',
    icon: <Brain size={20} className="text-purple-400" />,
    items: [
      { name: 'scikit-learn', detail: 'ML models & preprocessing' },
      { name: 'pandas / NumPy', detail: 'Data manipulation' },
      { name: 'Matplotlib / Seaborn', detail: 'Plot generation' },
      { name: 'joblib', detail: 'Model serialisation (.pkl)' },
    ],
  },
  {
    section: 'Database',
    color: 'border-orange-500 bg-orange-950/30',
    icon: <Database size={20} className="text-orange-400" />,
    items: [
      { name: 'SQLite', detail: 'Lightweight embedded database' },
      { name: 'SQLAlchemy ORM', detail: 'Model-to-table mapping' },
      { name: 'Alembic', detail: 'Database migrations' },
    ],
  },
]

const MODELS = [
  {
    name: 'Linear SVM',
    accuracy: 0.7727,
    recall: 0.6716,
    f1: 0.7212,
    roc_auc: 0.82,
    selected: false,
    note: 'Baseline with best AUC',
  },
  {
    name: 'Logistic Regression',
    accuracy: 0.7403,
    recall: 0.6418,
    f1: 0.6866,
    roc_auc: 0.79,
    selected: false,
    note: 'Interpretable coefficients',
  },
  {
    name: 'Random Forest',
    accuracy: 0.7727,
    recall: 0.6418,
    f1: 0.7021,
    roc_auc: 0.81,
    selected: false,
    note: 'Ensemble, reduced variance',
  },
  {
    name: 'Decision Tree',
    accuracy: 0.7857,
    recall: 0.7164,
    f1: 0.7407,
    roc_auc: 0.78,
    selected: true,
    note: '✦ Selected — highest accuracy & F1',
  },
]

const METHODOLOGY_STEPS = [
  {
    num: '01',
    title: 'Data Collection & EDA',
    desc: 'Loaded the PIMA Indian Diabetes Dataset (768 records, 8 features). Performed exploratory data analysis: distribution plots, correlation heatmap, and identification of zero values in physiologically invalid fields.',
  },
  {
    num: '02',
    title: 'Preprocessing',
    desc: 'Replaced zero values in Glucose, BloodPressure, SkinThickness, Insulin, and BMI with column means. Applied stratified 80/20 train-test split (random_state=2). Scaled all features with StandardScaler fitted on training data only.',
  },
  {
    num: '03',
    title: 'Model Training & Evaluation',
    desc: 'Trained four models: Linear SVM, Logistic Regression, Random Forest, and Decision Tree. Evaluated on the held-out test set using Accuracy, Recall, F1-Score, and ROC-AUC. Decision Tree selected based on highest accuracy and recall balance.',
  },
  {
    num: '04',
    title: 'Deployment & Integration',
    desc: 'Serialised the selected model and scaler with joblib. Wrapped in a Flask REST API with JWT authentication. Frontend built in React consumes the API for real-time predictions, history tracking, and admin analytics.',
  },
]

// ─── helpers ────────────────────────────────────────────────────────────────

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, delay },
})

function pct(val) {
  return `${(val * 100).toFixed(2)}%`
}

// ─── page ────────────────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f2a4a] via-slate-900 to-slate-950 text-white">

      {/* ── Hero ── */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#0f2a4a] to-[#0d2240] border-b border-slate-800">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_left,_#2563eb_0%,_transparent_60%)]" />
        <div className="relative max-w-5xl mx-auto px-6 py-20">
          <motion.div {...fadeUp()}>
            <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-500/40 rounded-full px-4 py-1.5 text-blue-300 text-sm mb-5">
              <BookOpen size={15} />
              7th Semester Major Project
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3">
              DiabetesRisk <span className="text-blue-400">AI</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl">
              A full-stack diabetes risk prediction system integrating machine learning,
              REST API backend, and an interactive React frontend.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-14 space-y-16">

        {/* ── Abstract ── */}
        <motion.section {...fadeUp()}>
          <h2 className="text-2xl font-bold text-white mb-5 flex items-center gap-2">
            <Brain className="text-blue-400" size={22} />
            Abstract
          </h2>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 space-y-4 text-slate-300 leading-relaxed">
            <p>
              This project presents <strong className="text-white">DiabetesRisk AI</strong>, a full-stack web application
              designed to assist in the early detection of Type 2 diabetes risk using supervised machine learning. The system
              trains and benchmarks four classification algorithms — Linear SVM, Logistic Regression, Random Forest, and
              Decision Tree — on the PIMA Indian Diabetes Dataset (768 samples, 8 biomarkers). After rigorous preprocessing
              (zero-value imputation, feature scaling, stratified splitting), the Decision Tree classifier was selected as the
              production model, achieving a test accuracy of 78.57% and an F1-Score of 74.07%.
            </p>
            <p>
              The backend is a Python Flask REST API with JWT-based authentication and a SQLite database for persisting user
              predictions. The frontend, built with React 18 and Tailwind CSS, provides an intuitive interface for real-time
              risk assessments, prediction history, model performance analytics, and educational diabetes awareness content.
              The system is designed as a learning and screening aid — not a clinical diagnostic tool — with the goal of
              bridging academic machine learning with practical full-stack engineering.
            </p>
          </div>
        </motion.section>

        {/* ── Objectives ── */}
        <motion.section {...fadeUp()}>
          <h2 className="text-2xl font-bold text-white mb-5 flex items-center gap-2">
            <CheckCircle className="text-teal-400" size={22} />
            Project Objectives
          </h2>
          <div className="space-y-3">
            {OBJECTIVES.map((obj, i) => (
              <motion.div key={i} {...fadeUp(i * 0.06)} className="flex gap-4 bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                <span className="flex-shrink-0 w-8 h-8 bg-teal-500/20 border border-teal-600 rounded-lg flex items-center justify-center text-teal-400 text-sm font-bold">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className="text-slate-300 text-sm leading-relaxed mt-1">{obj}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ── Tech Stack ── */}
        <motion.section {...fadeUp()}>
          <h2 className="text-2xl font-bold text-white mb-5 flex items-center gap-2">
            <Code className="text-purple-400" size={22} />
            Technology Stack
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {TECH_STACK.map((s, si) => (
              <motion.div key={s.section} {...fadeUp(si * 0.1)} className={`border-2 ${s.color} rounded-xl p-5`}>
                <div className="flex items-center gap-2 mb-4">
                  {s.icon}
                  <span className="font-bold text-white">{s.section}</span>
                </div>
                <div className="space-y-2">
                  {s.items.map(item => (
                    <div key={item.name} className="flex items-center gap-2">
                      <CheckCircle size={14} className="text-teal-400 flex-shrink-0" />
                      <span className="text-white text-sm font-medium">{item.name}</span>
                      <span className="text-slate-400 text-xs">— {item.detail}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ── Methodology ── */}
        <motion.section {...fadeUp()}>
          <h2 className="text-2xl font-bold text-white mb-5 flex items-center gap-2">
            <ArrowRight className="text-orange-400" size={22} />
            Methodology
          </h2>
          <div className="space-y-4">
            {METHODOLOGY_STEPS.map((step, i) => (
              <motion.div key={step.num} {...fadeUp(i * 0.1)} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {step.num}
                  </div>
                  {i < METHODOLOGY_STEPS.length - 1 && (
                    <div className="flex-1 w-0.5 bg-slate-700 my-1" />
                  )}
                </div>
                <div className="pb-4">
                  <div className="font-semibold text-white mb-1">{step.title}</div>
                  <div className="text-slate-400 text-sm leading-relaxed">{step.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ── Model Results Table ── */}
        <motion.section {...fadeUp()}>
          <h2 className="text-2xl font-bold text-white mb-5 flex items-center gap-2">
            <Brain className="text-teal-400" size={22} />
            ML Model Comparison Results
          </h2>
          <div className="overflow-x-auto rounded-xl border border-slate-700">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-800 border-b border-slate-700">
                  <th className="text-left px-4 py-3 text-slate-400 font-medium">Model</th>
                  <th className="text-center px-4 py-3 text-slate-400 font-medium">Test Accuracy</th>
                  <th className="text-center px-4 py-3 text-slate-400 font-medium">Recall</th>
                  <th className="text-center px-4 py-3 text-slate-400 font-medium">F1-Score</th>
                  <th className="text-center px-4 py-3 text-slate-400 font-medium">ROC-AUC</th>
                  <th className="text-left px-4 py-3 text-slate-400 font-medium">Notes</th>
                </tr>
              </thead>
              <tbody>
                {MODELS.map((m, i) => (
                  <tr
                    key={m.name}
                    className={`border-b border-slate-700/50 ${
                      m.selected ? 'bg-teal-950/40' : i % 2 === 0 ? 'bg-slate-900/30' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${m.selected ? 'text-teal-300' : 'text-white'}`}>{m.name}</span>
                        {m.selected && (
                          <span className="text-xs bg-teal-500 text-white px-1.5 py-0.5 rounded-full">Selected</span>
                        )}
                      </div>
                    </td>
                    <td className={`px-4 py-3 text-center font-mono ${m.selected ? 'text-teal-400 font-bold' : 'text-slate-300'}`}>
                      {pct(m.accuracy)}
                    </td>
                    <td className="px-4 py-3 text-center font-mono text-slate-300">{pct(m.recall)}</td>
                    <td className="px-4 py-3 text-center font-mono text-slate-300">{pct(m.f1)}</td>
                    <td className="px-4 py-3 text-center font-mono text-slate-300">{m.roc_auc.toFixed(2)}</td>
                    <td className="px-4 py-3 text-xs text-slate-400">{m.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-500 mt-2">Dataset: PIMA Indian Diabetes Dataset · 768 records · Source: Kaggle / UCI ML Repository · Test set: 154 samples (20%)</p>
        </motion.section>

        {/* ── Dataset ── */}
        <motion.section {...fadeUp()}>
          <h2 className="text-2xl font-bold text-white mb-5 flex items-center gap-2">
            <Database className="text-orange-400" size={22} />
            Dataset
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Dataset Name', value: 'PIMA Indian Diabetes Dataset', sub: 'Kaggle / UCI ML Repository' },
              { label: 'Total Records', value: '768', sub: '500 negative · 268 positive' },
              { label: 'Features', value: '8 biomarkers', sub: 'Glucose, BMI, Age, Insulin…' },
            ].map(item => (
              <div key={item.label} className="bg-slate-800/60 border border-slate-700 rounded-xl p-5 text-center">
                <div className="text-teal-400 text-2xl font-bold">{item.value}</div>
                <div className="text-white font-medium mt-1 text-sm">{item.label}</div>
                <div className="text-slate-500 text-xs mt-0.5">{item.sub}</div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ── Disclaimer ── */}
        <motion.div {...fadeUp()} className="flex gap-3 items-start p-5 bg-amber-900/20 border border-amber-700/50 rounded-xl">
          <AlertTriangle size={20} className="text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-amber-300 mb-1">Academic Disclaimer</div>
            <p className="text-amber-200/80 text-sm leading-relaxed">
              This project is developed for <strong>educational purposes only</strong> as part of a 7th Semester major project.
              It is <strong>not a clinical diagnostic tool</strong> and must not be used as a substitute for professional medical advice,
              diagnosis, or treatment. The predictions generated are statistical estimates based on training data and carry inherent uncertainty.
              Always consult a qualified healthcare professional for medical decisions.
            </p>
          </div>
        </motion.div>

      </div>
    </div>
  )
}
