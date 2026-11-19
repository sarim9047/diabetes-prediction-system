import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Shield, FileText, Heart, Github, GraduationCap } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      {/* Disclaimer Strip */}
      <div className="bg-amber-950/40 border-b border-amber-900/40 py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-xs text-amber-200/90 text-center font-medium">
          <Shield className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <b>ACADEMIC RESEARCH DISCLAIMER:</b> This platform is an educational major project and NOT a certified clinical diagnostic system. Never substitute machine learning screening for professional healthcare consultations or laboratory blood testing.
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-medical-600 to-tealAccent-500 flex items-center justify-center text-white shadow-md">
                <Activity className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white">
                GlucoGuard
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              7th-Semester Major Academic Project (300 Marks). Built with FastAPI, Scikit-Learn pipelines, React, and SQLAlchemy to demonstrate statistical diabetes risk screening.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <GraduationCap className="w-4 h-4 text-tealAccent-400" />
              <span>B.Tech / Major Project Evaluation</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
              System Modules
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/predict" className="hover:text-medical-400 transition-colors">
                  Risk Assessment Form
                </Link>
              </li>
              <li>
                <Link to="/analytics" className="hover:text-medical-400 transition-colors">
                  ML Model Evaluation & Viva
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-medical-400 transition-colors">
                  Patient Health Dashboard
                </Link>
              </li>
              <li>
                <Link to="/history" className="hover:text-medical-400 transition-colors">
                  Historical Screening Records
                </Link>
              </li>
            </ul>
          </div>

          {/* Education & Awareness */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
              Clinical Awareness
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/awareness" className="hover:text-medical-400 transition-colors">
                  Type 1 vs Type 2 Etiology
                </Link>
              </li>
              <li>
                <Link to="/awareness#biomarkers" className="hover:text-medical-400 transition-colors">
                  Key Diagnostic Biomarkers
                </Link>
              </li>
              <li>
                <Link to="/awareness#prevention" className="hover:text-medical-400 transition-colors">
                  Evidence-based Prevention
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-medical-400 transition-colors">
                  Research Methodology
                </Link>
              </li>
            </ul>
          </div>

          {/* Project Details */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
              Technical Stack
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Python 3, Scikit-learn Pipeline (SimpleImputer, StandardScaler, Classifiers), FastAPI REST API, SQLite, ReportLab PDF, Vite, React, Tailwind CSS.
            </p>
            <div className="flex gap-3">
              <Link to="/about" className="text-slate-400 hover:text-white transition-colors">
                <FileText className="w-4 h-4" />
              </Link>
              <Link to="/contact" className="text-slate-400 hover:text-white transition-colors">
                <Heart className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© 2026 Diabetes Prediction & Health Risk Assessment System. Academic Research Project.</p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <Link to="/about" className="hover:text-slate-400 transition-colors">
              Methodology & Abstract
            </Link>
            <Link to="/contact" className="hover:text-slate-400 transition-colors">
              Contact & Feedback
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
