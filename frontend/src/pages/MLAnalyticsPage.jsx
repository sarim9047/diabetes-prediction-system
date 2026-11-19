import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain, ChevronDown, ChevronUp, Award, BarChart2,
  Database, BookOpen, AlertTriangle, TrendingUp, Layers
} from 'lucide-react'
import { mlApi } from '../services/api'

// ─── helpers ────────────────────────────────────────────────────────────────

const getAuthToken = () => localStorage.getItem('token') || ''

async function fetchImageAsBlob(url) {
  const token = getAuthToken()
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (!res.ok) throw new Error(`Failed to fetch image: ${res.status}`)
  const blob = await res.blob()
  return URL.createObjectURL(blob)
}

// ─── static data ────────────────────────────────────────────────────────────

const VIVA_TOPICS = [
  {
    id: 1,
    icon: <Layers size={20} />,
    title: 'What is SVM (Support Vector Machine)?',
    content: (
      <div className="space-y-3 text-slate-300">
        <p>
          A <strong className="text-teal-400">Support Vector Machine</strong> finds the optimal
          <em> hyperplane</em> that maximally separates classes in feature space. The margin between
          the nearest data points (support vectors) and the hyperplane is maximised.
        </p>
        <p>
          The <strong className="text-teal-400">kernel trick</strong> allows SVM to operate in
          high-dimensional spaces without explicitly computing coordinates. In our implementation
          we use a <code className="bg-slate-700 px-1 rounded">linear</code> kernel, which
          works directly on the 8 scaled features.
        </p>
        <p className="text-sm text-slate-400">
          ✦ Why chosen: Effective in high-dimensional spaces, robust to outliers, and performs
          well on small-to-medium sized medical datasets where the decision boundary may be
          approximately linear after feature scaling.
        </p>
      </div>
    ),
  },
  {
    id: 2,
    icon: <TrendingUp size={20} />,
    title: 'What is StandardScaler?',
    content: (
      <div className="space-y-3 text-slate-300">
        <p>
          <strong className="text-teal-400">StandardScaler</strong> transforms each feature to
          have <strong>mean = 0</strong> and <strong>standard deviation = 1</strong>:
        </p>
        <div className="bg-slate-900 rounded-lg p-3 font-mono text-center text-teal-300 text-lg tracking-wide">
          z = (x − μ) / σ
        </div>
        <p>
          SVM and other distance-based algorithms (k-NN, Logistic Regression with L2) are
          sensitive to the scale of features. Without scaling, a feature with a large range
          (e.g. plasma glucose 0–199) will dominate features with a small range (e.g. diabetes
          pedigree 0.078–2.42).
        </p>
        <p className="text-sm text-slate-400">
          ✦ The scaler is fitted <em>only</em> on the training set and then applied to both
          train and test sets to prevent data leakage.
        </p>
      </div>
    ),
  },
  {
    id: 3,
    icon: <Database size={20} />,
    title: 'What is Train-Test Split?',
    content: (
      <div className="space-y-3 text-slate-300">
        <p>
          The dataset is divided into a <strong className="text-teal-400">training set</strong>{' '}
          (used to fit the model) and a <strong className="text-teal-400">test set</strong>{' '}
          (held out to evaluate generalisation).
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>Split ratio: <strong>80 / 20</strong></li>
          <li><strong>Stratified</strong> split — preserves the 65 / 35 class balance in both sets</li>
          <li>Our split: <strong>614</strong> training samples · <strong>154</strong> test samples</li>
          <li><code className="bg-slate-700 px-1 rounded">random_state=2</code> for reproducibility</li>
        </ul>
        <p className="text-sm text-slate-400">
          ✦ Evaluating on the same data used for training (data leakage) inflates accuracy and
          gives a falsely optimistic view of model performance.
        </p>
      </div>
    ),
  },
  {
    id: 4,
    icon: <BarChart2 size={20} />,
    title: 'What is a Confusion Matrix?',
    content: (
      <div className="space-y-3 text-slate-300">
        <div className="grid grid-cols-2 gap-2 text-center text-sm">
          {[
            { label: 'True Positive (TP)', color: 'bg-teal-900/60 border-teal-500', desc: 'Predicted diabetic · Actually diabetic' },
            { label: 'False Positive (FP)', color: 'bg-blue-900/60 border-blue-500', desc: 'Predicted diabetic · Actually healthy' },
            { label: 'False Negative (FN)', color: 'bg-red-900/60 border-red-500', desc: 'Predicted healthy · Actually diabetic ⚠️' },
            { label: 'True Negative (TN)', color: 'bg-slate-700/60 border-slate-500', desc: 'Predicted healthy · Actually healthy' },
          ].map(c => (
            <div key={c.label} className={`${c.color} border rounded-lg p-2`}>
              <div className="font-semibold text-white">{c.label}</div>
              <div className="text-xs text-slate-300 mt-1">{c.desc}</div>
            </div>
          ))}
        </div>
        <p className="text-sm text-slate-400">
          ✦ <strong className="text-red-400">False Negatives are most dangerous</strong> in medical
          screening — a missed diagnosis means the patient receives no treatment. False Positives
          cause unnecessary worry but lead to further (beneficial) investigation.
        </p>
      </div>
    ),
  },
  {
    id: 5,
    icon: <Award size={20} />,
    title: 'What are Precision and Recall?',
    content: (
      <div className="space-y-3 text-slate-300">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-slate-900 rounded-lg p-3">
            <div className="text-teal-400 font-semibold mb-1">Precision</div>
            <div className="font-mono text-center text-white mb-2">TP / (TP + FP)</div>
            <div className="text-sm text-slate-400">Of all patients the model flagged as diabetic, what fraction actually are?</div>
          </div>
          <div className="bg-slate-900 rounded-lg p-3">
            <div className="text-blue-400 font-semibold mb-1">Recall (Sensitivity)</div>
            <div className="font-mono text-center text-white mb-2">TP / (TP + FN)</div>
            <div className="text-sm text-slate-400">Of all patients who truly have diabetes, what fraction did the model catch?</div>
          </div>
        </div>
        <p className="text-sm text-slate-400">
          ✦ For <strong>medical screening</strong>, <strong className="text-blue-400">Recall</strong>{' '}
          is prioritised — missing a positive case is far more harmful than a false alarm. The
          F1-Score (harmonic mean of precision and recall) balances both.
        </p>
      </div>
    ),
  },
  {
    id: 6,
    icon: <TrendingUp size={20} />,
    title: 'What is ROC-AUC?',
    content: (
      <div className="space-y-3 text-slate-300">
        <p>
          The <strong className="text-teal-400">Receiver Operating Characteristic (ROC)</strong>{' '}
          curve plots the <em>True Positive Rate</em> (Recall) against the{' '}
          <em>False Positive Rate</em> at every classification threshold.
        </p>
        <p>
          The <strong className="text-teal-400">Area Under the Curve (AUC)</strong> summarises
          the entire curve in a single number:
        </p>
        <div className="flex gap-4 text-center text-sm">
          <div className="flex-1 bg-red-900/40 border border-red-700 rounded-lg p-2">
            <div className="text-xl font-bold text-red-400">0.5</div>
            <div className="text-slate-400">Random classifier</div>
          </div>
          <div className="flex-1 bg-yellow-900/40 border border-yellow-700 rounded-lg p-2">
            <div className="text-xl font-bold text-yellow-400">0.82</div>
            <div className="text-slate-400">Our best (SVM)</div>
          </div>
          <div className="flex-1 bg-teal-900/40 border border-teal-700 rounded-lg p-2">
            <div className="text-xl font-bold text-teal-400">1.0</div>
            <div className="text-slate-400">Perfect classifier</div>
          </div>
        </div>
        <p className="text-sm text-slate-400">
          ✦ AUC is threshold-independent and handles class imbalance better than raw accuracy.
        </p>
      </div>
    ),
  },
  {
    id: 7,
    icon: <AlertTriangle size={20} />,
    title: 'What is Overfitting?',
    content: (
      <div className="space-y-3 text-slate-300">
        <p>
          A model <strong className="text-teal-400">overfits</strong> when it memorises the
          training data instead of learning generalisable patterns — it performs well on training
          data but poorly on unseen test data.
        </p>
        <div className="bg-slate-900 rounded-lg p-3">
          <div className="text-sm font-semibold text-slate-400 mb-1">Signs of Overfitting:</div>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Training accuracy ≫ Test accuracy</li>
            <li>Very complex models relative to dataset size</li>
            <li>High variance across different data splits</li>
          </ul>
        </div>
        <p>
          <strong>Prevention strategies used in our project:</strong>
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm text-slate-400">
          <li>Stratified <strong className="text-white">train-test split</strong> (held-out evaluation)</li>
          <li><strong className="text-white">Pruning</strong> for Decision Tree (max_depth parameter)</li>
          <li><strong className="text-white">Regularisation</strong> (C parameter in SVM &amp; Logistic Regression)</li>
          <li><strong className="text-white">Random Forest</strong> ensembling reduces variance by averaging trees</li>
        </ul>
      </div>
    ),
  },
]

// ─── sub-components ─────────────────────────────────────────────────────────

function MetricBadge({ label, value, color = 'teal' }) {
  const colors = {
    teal: 'bg-teal-900/50 text-teal-300 border-teal-700',
    blue: 'bg-blue-900/50 text-blue-300 border-blue-700',
    slate: 'bg-slate-700/50 text-slate-300 border-slate-600',
  }
  return (
    <div className={`border rounded-lg p-2 text-center ${colors[color]}`}>
      <div className="text-xs opacity-70 mb-0.5">{label}</div>
      <div className="text-sm font-bold">{value}</div>
    </div>
  )
}

function ModelCard({ model, isSelected }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl p-4 border-2 transition-all ${
        isSelected
          ? 'border-teal-500 bg-teal-950/40 shadow-teal-900/30 shadow-lg'
          : 'border-slate-700 bg-slate-800/60'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="font-semibold text-white text-sm">{model.name}</span>
        {isSelected && (
          <span className="text-xs bg-teal-500 text-white px-2 py-0.5 rounded-full font-medium">
            Selected
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <MetricBadge label="Accuracy" value={`${(model.accuracy * 100).toFixed(2)}%`} color={isSelected ? 'teal' : 'slate'} />
        <MetricBadge label="Recall" value={`${(model.recall * 100).toFixed(2)}%`} color={isSelected ? 'teal' : 'slate'} />
        <MetricBadge label="F1-Score" value={`${(model.f1 * 100).toFixed(2)}%`} color={isSelected ? 'teal' : 'slate'} />
        <MetricBadge label="ROC-AUC" value={model.roc_auc?.toFixed(4) ?? '—'} color={isSelected ? 'teal' : 'slate'} />
      </div>
    </motion.div>
  )
}

function VisualizationImage({ src, alt, loading }) {
  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-xl overflow-hidden">
      <div className="p-3 border-b border-slate-700 text-sm font-medium text-slate-300">{alt}</div>
      <div className="flex items-center justify-center min-h-[220px] p-4">
        {loading ? (
          <div className="animate-pulse text-slate-500 flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs">Loading…</span>
          </div>
        ) : src ? (
          <img src={src} alt={alt} className="max-w-full rounded-lg" />
        ) : (
          <span className="text-slate-500 text-sm">Failed to load image</span>
        )}
      </div>
    </div>
  )
}

function AccordionItem({ topic, isOpen, onToggle }) {
  return (
    <div className="border border-slate-700 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 bg-slate-800/60 hover:bg-slate-700/60 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-teal-400">{topic.icon}</span>
          <span className="font-medium text-white">{topic.title}</span>
        </div>
        {isOpen ? <ChevronUp size={18} className="text-teal-400 flex-shrink-0" /> : <ChevronDown size={18} className="text-slate-400 flex-shrink-0" />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-slate-900/40 border-t border-slate-700">
              {topic.content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── default fallback metrics in case API is down ──────────────────────────

const FALLBACK_METRICS = {
  selected_model: 'Decision Tree',
  models: [
    { name: 'Linear SVM (Baseline)', accuracy: 0.7727, recall: 0.6716, f1: 0.7212, roc_auc: 0.82 },
    { name: 'Logistic Regression', accuracy: 0.7403, recall: 0.6418, f1: 0.6866, roc_auc: 0.79 },
    { name: 'Random Forest', accuracy: 0.7727, recall: 0.6418, f1: 0.7021, roc_auc: 0.81 },
    { name: 'Decision Tree', accuracy: 0.7857, recall: 0.7164, f1: 0.7407, roc_auc: 0.78 },
  ],
}

// ─── main page ──────────────────────────────────────────────────────────────

export default function MLAnalyticsPage() {
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [openAccordion, setOpenAccordion] = useState(null)
  const [images, setImages] = useState({ confusion_matrix: null, roc_curves: null, model_comparison: null })
  const [imgLoading, setImgLoading] = useState({ confusion_matrix: true, roc_curves: true, model_comparison: true })

  // fetch metrics
  useEffect(() => {
    mlApi.getMetrics()
      .then(data => {
        // Map backend metrics structure to frontend expectations
        const meta = data.metrics_summary || {};
        const selectedModel = data.selected_model || 'Decision Tree';
        const models = Object.entries(meta).map(([name, metrics]) => ({
          name,
          accuracy: metrics.test_accuracy || metrics.accuracy || 0,
          recall: metrics.recall || 0,
          f1: metrics.f1_score || metrics.f1 || 0,
          roc_auc: metrics.roc_auc || 0,
        }));
        setMetrics({
          selected_model: selectedModel,
          models,
        });
      })
      .catch(() => setMetrics(FALLBACK_METRICS))
      .finally(() => setLoading(false))
  }, [])

  // direct image URLs from FastAPI static endpoint
  const fetchViz = useCallback((name) => {
    const filename = name.endsWith('.png') ? name : `${name}.png`;
    setImages(prev => ({ ...prev, [name]: `/api/model/visualizations/${filename}` }));
    setImgLoading(prev => ({ ...prev, [name]: false }));
  }, [])

  useEffect(() => {
    fetchViz('confusion_matrix')
    fetchViz('roc_curves')
    fetchViz('model_comparison')
  }, [fetchViz])

  const toggleAccordion = (id) => setOpenAccordion(prev => (prev === id ? null : id))

  const selectedModelName = metrics?.selected_model ?? FALLBACK_METRICS.selected_model
  const models = metrics?.models ?? FALLBACK_METRICS.models

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f2a4a] via-slate-900 to-slate-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-12">

        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-teal-500/20 rounded-lg">
              <Brain className="text-teal-400" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">ML Analytics</h1>
              <p className="text-slate-400 text-sm">Model performance, visualisations &amp; viva guide</p>
            </div>
          </div>
        </motion.div>

        {/* ── SECTION 1: Model Selection ── */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Award className="text-teal-400" size={20} />
            <h2 className="text-xl font-semibold text-white">Model Selection Summary</h2>
          </div>

          {/* Selected model banner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 bg-teal-900/30 border border-teal-500 rounded-xl flex items-center gap-3"
          >
            <Award className="text-teal-400 flex-shrink-0" size={24} />
            <div>
              <span className="text-slate-400 text-sm">Selected Model</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xl font-bold text-white">{selectedModelName}</span>
                <span className="text-xs bg-teal-500 text-white px-2 py-0.5 rounded-full">Best Accuracy</span>
              </div>
            </div>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-44 rounded-xl bg-slate-800/50 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {models.map((m, i) => (
                <motion.div key={m.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                  <ModelCard model={m} isSelected={m.name === selectedModelName} />
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* ── SECTION 2: Visualisations ── */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <BarChart2 className="text-blue-400" size={20} />
            <h2 className="text-xl font-semibold text-white">Model Visualisations</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <VisualizationImage src={images.confusion_matrix} alt="Confusion Matrix" loading={imgLoading.confusion_matrix} />
            <VisualizationImage src={images.roc_curves} alt="ROC Curves" loading={imgLoading.roc_curves} />
          </div>
          <VisualizationImage src={images.model_comparison} alt="Model Comparison Chart" loading={imgLoading.model_comparison} />
        </section>

        {/* ── SECTION 3: Viva Guide ── */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <BookOpen className="text-purple-400" size={20} />
            <h2 className="text-xl font-semibold text-white">Educational Viva Guide</h2>
            <span className="text-xs text-slate-400 ml-1">(click to expand)</span>
          </div>

          <div className="space-y-3">
            {VIVA_TOPICS.map(topic => (
              <AccordionItem
                key={topic.id}
                topic={topic}
                isOpen={openAccordion === topic.id}
                onToggle={() => toggleAccordion(topic.id)}
              />
            ))}
          </div>
        </section>

        {/* ── SECTION 4: Dataset Statistics ── */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Database className="text-orange-400" size={20} />
            <h2 className="text-xl font-semibold text-white">Dataset Statistics</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Total Samples', value: '768', sub: 'PIMA Indian Diabetes Dataset' },
              { label: 'Features', value: '8', sub: 'Biomarker inputs' },
              { label: 'Task', value: 'Binary', sub: 'Classification' },
            ].map(s => (
              <div key={s.label} className="bg-slate-800/60 border border-slate-700 rounded-xl p-5 text-center">
                <div className="text-3xl font-bold text-teal-400">{s.value}</div>
                <div className="text-white font-medium mt-1">{s.label}</div>
                <div className="text-slate-400 text-sm mt-0.5">{s.sub}</div>
              </div>
            ))}
          </div>

          <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-5">
            <h3 className="font-semibold text-white mb-4">Class Distribution</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-300">Non-Diabetic (Negative)</span>
                  <span className="text-teal-400 font-medium">500 samples (65.1%)</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-3">
                  <div className="bg-teal-500 h-3 rounded-full" style={{ width: '65.1%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-300">Diabetic (Positive)</span>
                  <span className="text-blue-400 font-medium">268 samples (34.9%)</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-3">
                  <div className="bg-blue-500 h-3 rounded-full" style={{ width: '34.9%' }} />
                </div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-amber-900/30 border border-amber-700/50 rounded-lg text-sm text-amber-200">
              <strong>⚠ Zero imputation note:</strong> Several features (Glucose, BloodPressure, SkinThickness, Insulin, BMI)
              contained physiologically impossible zero values. These were replaced with the feature mean before training
              to avoid biasing the model.
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}
