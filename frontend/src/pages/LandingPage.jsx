import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Activity,
  ArrowRight,
  ShieldCheck,
  BrainCircuit,
  FileText,
  BarChart3,
  HeartPulse,
  Database,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  Sparkles,
  Stethoscope,
  Lock,
} from 'lucide-react';

const LandingPage = () => {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: 'What is the purpose of this Diabetes Prediction System?',
      a: 'This system is an academic research platform built for a 7th-semester major project. It leverages machine learning algorithms trained on the validated PIMA Indian Diabetes dataset to evaluate statistical health risk based on eight physiological biomarkers.'
    },
    {
      q: 'Does this platform replace clinical lab blood tests?',
      a: 'No. This platform is strictly an automated academic screening model, not a medical diagnostic device. It does not replace Fasting Plasma Glucose, Oral Glucose Tolerance Tests (OGTT), or HbA1c tests performed by certified medical laboratories.'
    },
    {
      q: 'Which machine learning algorithms are utilized?',
      a: 'The system preserves a Linear Support Vector Machine (SVM) as its original research baseline and compares it against Logistic Regression, Random Forest, and Decision Tree classifiers using Scikit-Learn Pipelines with median imputation for physiologically missing zeros.'
    },
    {
      q: 'How are missing zero values in Glucose, Blood Pressure, and Insulin handled?',
      a: 'Physiologically impossible zeros in Glucose, Blood Pressure, Skin Thickness, Insulin, and BMI are treated as missing values (NaN) and imputed using training-set median values. Legitimate zero values in Pregnancies are preserved to avoid distortion.'
    },
    {
      q: 'Can I download an official PDF report of my assessment?',
      a: 'Yes. After submitting your eight biomarker parameters, the FastAPI backend uses ReportLab to dynamically generate a downloadable PDF report containing your parameters, the classification, and clinical advisories.'
    }
  ];

  return (
    <div className="space-y-24 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 md:pt-20">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(14,165,233,0.15),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(14,165,233,0.1),rgba(15,23,42,0))]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Heading and CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7 space-y-6 text-center lg:text-left"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-medical-50 dark:bg-medical-950/70 border border-medical-200 dark:border-medical-800 text-medical-700 dark:text-medical-300 text-xs font-semibold">
                <Sparkles className="w-4 h-4 text-medical-600 dark:text-medical-400" />
                <span>7th Semester Major Project • Academic ML Platform</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.15]">
                Understand Your Diabetes Risk.{' '}
                <span className="bg-gradient-to-r from-medical-600 via-tealAccent-500 to-tealAccent-600 bg-clip-text text-transparent">
                  Take Control of Your Health.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                An intelligent healthcare analytics platform combining Scikit-Learn machine learning pipelines, verified clinical biomarker analysis, real-time risk stratification, and instant PDF report generation.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/predict"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-medical-600 hover:bg-medical-700 text-white font-semibold text-base shadow-lg shadow-medical-600/25 hover:shadow-medical-600/35 transition-all hover:-translate-y-0.5"
                >
                  <span>Check Your Risk</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>

                <Link
                  to="/analytics"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold text-base shadow-sm transition-all"
                >
                  <BrainCircuit className="w-5 h-5 text-tealAccent-500" />
                  <span>Explore ML Models</span>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Validated PIMA Dataset</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-medical-500" />
                  <span>Secure JWT & SQLite DB</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-tealAccent-500" />
                  <span>Instant ReportLab PDF</span>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Interactive Clinical Preview Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="lg:col-span-5"
            >
              <div className="relative mx-auto max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200/80 dark:border-slate-800">
                {/* Header of preview card */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-medical-50 dark:bg-medical-950 text-medical-600 flex items-center justify-center">
                      <Stethoscope className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Patient Risk Index</h4>
                      <p className="text-[11px] text-slate-400">Automated Screening Preview</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400">
                    Live Pipeline
                  </span>
                </div>

                {/* Biomarker dials */}
                <div className="grid grid-cols-2 gap-3 py-4">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-medium text-slate-400 uppercase">Glucose</span>
                    <p className="text-lg font-extrabold text-slate-800 dark:text-slate-100">118 mg/dL</p>
                    <span className="text-[10px] text-emerald-600 font-semibold">Normal Fasting</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-medium text-slate-400 uppercase">BMI Index</span>
                    <p className="text-lg font-extrabold text-slate-800 dark:text-slate-100">26.4 kg/m²</p>
                    <span className="text-[10px] text-amber-600 font-semibold">Overweight Threshold</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-medium text-slate-400 uppercase">Blood Pressure</span>
                    <p className="text-lg font-extrabold text-slate-800 dark:text-slate-100">74 mmHg</p>
                    <span className="text-[10px] text-emerald-600 font-semibold">Optimal Diastolic</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-medium text-slate-400 uppercase">Model Output</span>
                    <p className="text-lg font-extrabold text-medical-600 dark:text-medical-400">Negative</p>
                    <span className="text-[10px] text-slate-500 font-medium">96.1% Confidence</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5 pt-2 pb-4">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-600 dark:text-slate-300">Screening Risk Score</span>
                    <span className="text-emerald-600 dark:text-emerald-400">Low Risk (3.8%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-tealAccent-500 rounded-full w-[15%]"></div>
                  </div>
                </div>

                {/* Bottom button */}
                <Link
                  to="/predict"
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-xs font-bold transition-colors"
                >
                  <span>Launch Prediction Form</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. STATS OVERVIEW SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
            <h3 className="text-3xl sm:text-4xl font-extrabold text-medical-600 dark:text-medical-400">768</h3>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">
              Clinical Dataset Records
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
            <h3 className="text-3xl sm:text-4xl font-extrabold text-tealAccent-500">8</h3>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">
              Physiological Biomarkers
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
            <h3 className="text-3xl sm:text-4xl font-extrabold text-indigo-600 dark:text-indigo-400">78.6%</h3>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">
              Validation Accuracy
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
            <h3 className="text-3xl sm:text-4xl font-extrabold text-emerald-600 dark:text-emerald-400">70.4%</h3>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">
              Screening Recall (Sensitivity)
            </p>
          </div>
        </div>
      </section>

      {/* 3. CORE FEATURES SECTION */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-medical-600 dark:text-medical-400">
            Platform Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Designed for Academic Rigor & Clinical Clarity
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base">
            Every feature is engineered to provide end-to-end functionality from patient intake to clinical report generation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-white dark:bg-slate-900 p-7 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-medical-50 dark:bg-medical-950/60 text-medical-600 flex items-center justify-center mb-5">
              <Activity className="w-6 h-6 stroke-[2]" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Biomarker Form with Range Validation
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Validates 8 critical physiological parameters (Glucose, Insulin, BMI, Blood Pressure, etc.), instantly flagging biologically implausible inputs.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white dark:bg-slate-900 p-7 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center mb-5">
              <BrainCircuit className="w-6 h-6 stroke-[2]" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Leakage-Free ML Preprocessing
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Implements Scikit-Learn Pipelines with median imputation fitted exclusively on training data, preserving the original Linear SVM baseline alongside Decision Tree comparisons.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white dark:bg-slate-900 p-7 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center mb-5">
              <FileText className="w-6 h-6 stroke-[2]" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Automated PDF Clinical Reports
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Generates downloadable PDF documents via ReportLab featuring patient details, reference intervals, model classification badges, and mandatory medical disclaimers.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-white dark:bg-slate-900 p-7 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mb-5">
              <BarChart3 className="w-6 h-6 stroke-[2]" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Dynamic Real-Time Dashboards
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Dynamic statistics directly queried from SQLite. Tracks historical screening records, outcome distributions, and monthly risk trends without dummy analytics.
            </p>
          </div>

          {/* Card 5 */}
          <div className="bg-white dark:bg-slate-900 p-7 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center mb-5">
              <Lock className="w-6 h-6 stroke-[2]" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              JWT Auth & Admin Governance
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Bcrypt password hashing and JWT access tokens. Protects administrative routes to manage user accounts, inspect activity logs, and view system metrics.
            </p>
          </div>

          {/* Card 6 */}
          <div className="bg-white dark:bg-slate-900 p-7 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center mb-5">
              <Database className="w-6 h-6 stroke-[2]" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Academic Viva & ML Guides
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Dedicated viva preparation modules explaining SVM kernels, StandardScaler normalization, confusion matrices, precision/recall trade-offs, and overfitting prevention.
            </p>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-navy-900 via-slate-900 to-navy-950 rounded-3xl p-8 sm:p-14 text-white">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-tealAccent-400">
              Four-Step Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              How the Prediction Engine Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            <div className="space-y-3 text-center md:text-left">
              <div className="w-10 h-10 rounded-full bg-medical-500/20 text-medical-400 border border-medical-500/30 flex items-center justify-center font-bold text-sm mx-auto md:mx-0">
                1
              </div>
              <h4 className="font-bold text-base text-white">Input Parameters</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                User enters 8 physiological values: Glucose, Blood Pressure, BMI, Insulin, Age, Skinfold, Pedigree, and Pregnancies.
              </p>
            </div>

            <div className="space-y-3 text-center md:text-left">
              <div className="w-10 h-10 rounded-full bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center font-bold text-sm mx-auto md:mx-0">
                2
              </div>
              <h4 className="font-bold text-base text-white">Pipeline Imputation</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Biologically implausible zeros are converted to NaN and imputed using median training statistics to prevent data leakage.
              </p>
            </div>

            <div className="space-y-3 text-center md:text-left">
              <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-sm mx-auto md:mx-0">
                3
              </div>
              <h4 className="font-bold text-base text-white">Inference Engine</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Pre-trained classifier performs inference without re-training, computing classification labels and confidence scores.
              </p>
            </div>

            <div className="space-y-3 text-center md:text-left">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-sm mx-auto md:mx-0">
                4
              </div>
              <h4 className="font-bold text-base text-white">PDF & Tracking</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                The prediction is securely saved to SQLite, displayed with health guidance, and exported as a clinical PDF report.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FAQ SECTION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-medical-600 dark:text-medical-400">
            Frequently Asked Questions
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            Answers & Academic Context
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors"
            >
              <button
                onClick={() => toggleFaq(index)}
                className="w-full flex items-center justify-between p-5 text-left font-semibold text-sm sm:text-base text-slate-800 dark:text-slate-100 hover:text-medical-600 dark:hover:text-medical-400"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-slate-400 transition-transform ${
                    openFaq === index ? 'rotate-180 text-medical-600' : ''
                  }`}
                />
              </button>
              {openFaq === index && (
                <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 6. CALL TO ACTION BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-medical-600 to-tealAccent-600 rounded-3xl p-8 sm:p-12 text-center text-white space-y-6 shadow-xl">
          <h2 className="text-3xl sm:text-4xl font-extrabold">
            Ready to Evaluate Your Diabetes Risk Profile?
          </h2>
          <p className="text-medical-100 text-sm sm:text-base max-w-2xl mx-auto">
            Experience our machine learning screening model now. Fill in your eight health parameters and download an instant clinical report.
          </p>
          <div className="pt-2">
            <Link
              to="/predict"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-medical-700 font-extrabold text-base shadow-lg hover:bg-slate-50 hover:scale-105 transition-all"
            >
              <span>Start Risk Assessment</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
