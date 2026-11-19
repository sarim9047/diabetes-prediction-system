import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Eye,
  Plus,
  History,
  BarChart2,
  Calendar,
  ChevronRight,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { dashboardApi } from '../services/api';

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-200 dark:bg-slate-700 rounded ${className}`} />
);

// ─── StatCard ─────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.45, delay }}
    className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 flex items-center gap-5 hover:shadow-md transition-shadow"
  >
    <div className={`p-3 rounded-xl ${color}`}>
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{label}</p>
      <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-0.5">{value}</p>
    </div>
  </motion.div>
);

// ─── StatCard Skeleton ─────────────────────────────────────────────────────────
const StatCardSkeleton = () => (
  <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 flex items-center gap-5">
    <Skeleton className="w-12 h-12 rounded-xl" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-7 w-16" />
    </div>
  </div>
);

// ─── Empty State ───────────────────────────────────────────────────────────────
const EmptyState = () => {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-full mb-6">
        <Activity size={48} className="text-blue-500" />
      </div>
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
        No predictions yet
      </h2>
      <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-8">
        Run your first diabetes risk assessment to see your dashboard come to life with charts and analytics.
      </p>
      <button
        onClick={() => navigate('/predict')}
        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-md"
      >
        <Plus size={18} />
        Start Your First Prediction
      </button>
    </motion.div>
  );
};

// ─── Result Badge ──────────────────────────────────────────────────────────────
const ResultBadge = ({ result }) =>
  result === 1 || result === true || result === 'positive' ? (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">
      <AlertTriangle size={11} /> High Risk
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
      <CheckCircle size={11} /> Low Risk
    </span>
  );

// ─── Main Component ────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await dashboardApi.getStats();
        // Map backend field names to frontend expectations
        setStats({
          ...res.data,
          positive_count: res.data.high_risk_count || 0,
          negative_count: res.data.low_risk_count || 0,
        });
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const latestResultLabel =
    stats?.latest_prediction == null
      ? '—'
      : stats.latest_prediction === 1 || stats.latest_prediction === true
      ? 'High Risk'
      : 'Low Risk';

  const pieData =
    stats && (stats.positive_count > 0 || stats.negative_count > 0)
      ? [
          { name: 'High Risk', value: stats.positive_count ?? 0 },
          { name: 'Low Risk', value: stats.negative_count ?? 0 },
        ]
      : [];

  const PIE_COLORS = ['#ef4444', '#10b981'];

  const hasData = stats && stats.total_predictions > 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">
              Welcome back,{' '}
              <span className="text-blue-600">{user?.full_name ?? 'User'}</span>!
            </h1>
            <p className="mt-1 text-slate-500 dark:text-slate-400 flex items-center gap-1.5 text-sm">
              <Calendar size={14} />
              {today}
            </p>
          </div>
          <button
            onClick={() => navigate('/predict')}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow"
          >
            <Plus size={16} /> New Prediction
          </button>
        </div>
      </motion.div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* ── Stat Cards ── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {[...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatCard
            icon={Activity}
            label="Total Predictions"
            value={stats?.total_predictions ?? 0}
            color="bg-blue-500"
            delay={0}
          />
          <StatCard
            icon={AlertTriangle}
            label="High Risk"
            value={stats?.positive_count ?? 0}
            color="bg-red-500"
            delay={0.08}
          />
          <StatCard
            icon={CheckCircle}
            label="Low Risk"
            value={stats?.negative_count ?? 0}
            color="bg-emerald-500"
            delay={0.16}
          />
          <StatCard
            icon={Clock}
            label="Latest Result"
            value={latestResultLabel}
            color="bg-teal-500"
            delay={0.24}
          />
        </div>
      )}

      {/* ── Main Content ── */}
      <AnimatePresence>
        {!loading && !hasData ? (
          <EmptyState key="empty" />
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            {/* ── Charts ── */}
            {!loading && (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
                {/* Line Chart */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp size={18} className="text-blue-500" />
                    <h3 className="font-semibold text-slate-700 dark:text-slate-200">
                      Monthly Prediction Trends
                    </h3>
                  </div>
                  {stats?.monthly_trends?.length > 0 ? (
                    <ResponsiveContainer width="100%" height={260}>
                      <LineChart data={stats.monthly_trends} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="count"
                          name="Total"
                          stroke="#2563eb"
                          strokeWidth={2}
                          dot={{ r: 3 }}
                          activeDot={{ r: 5 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="positive"
                          name="High Risk"
                          stroke="#ef4444"
                          strokeWidth={2}
                          dot={{ r: 3 }}
                          activeDot={{ r: 5 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="negative"
                          name="Low Risk"
                          stroke="#10b981"
                          strokeWidth={2}
                          dot={{ r: 3 }}
                          activeDot={{ r: 5 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[260px] text-slate-400 text-sm">
                      No trend data available yet.
                    </div>
                  )}
                </motion.div>

                {/* Pie Chart */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.18 }}
                  className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart2 size={18} className="text-teal-500" />
                    <h3 className="font-semibold text-slate-700 dark:text-slate-200">
                      Outcome Distribution
                    </h3>
                  </div>
                  {pieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={260}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={4}
                          dataKey="value"
                          label={({ name, percent }) =>
                            `${name} ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {pieData.map((_, i) => (
                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[260px] text-slate-400 text-sm">
                      No data to display.
                    </div>
                  )}
                </motion.div>
              </div>
            )}

            {/* ── Recent Predictions Table ── */}
            {!loading && stats?.recent_predictions?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.26 }}
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 mb-8"
              >
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-semibold text-slate-700 dark:text-slate-200">
                    Recent Predictions
                  </h3>
                  <Link
                    to="/history"
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
                  >
                    View all <ChevronRight size={14} />
                  </Link>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-700">
                        <th className="text-left pb-3 text-slate-500 dark:text-slate-400 font-medium">Date</th>
                        <th className="text-left pb-3 text-slate-500 dark:text-slate-400 font-medium">Glucose</th>
                        <th className="text-left pb-3 text-slate-500 dark:text-slate-400 font-medium">Age</th>
                        <th className="text-left pb-3 text-slate-500 dark:text-slate-400 font-medium">Result</th>
                        <th className="text-left pb-3 text-slate-500 dark:text-slate-400 font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                      {stats.recent_predictions.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors">
                          <td className="py-3 text-slate-600 dark:text-slate-300">
                            {new Date(p.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="py-3 text-slate-600 dark:text-slate-300">
                            {p.glucose ?? '—'} mg/dL
                          </td>
                          <td className="py-3 text-slate-600 dark:text-slate-300">
                            {p.age ?? '—'}
                          </td>
                          <td className="py-3">
                            <ResultBadge result={p.result} />
                          </td>
                          <td className="py-3">
                            <button
                              onClick={() => navigate(`/result/${p.id}`)}
                              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium text-xs px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors"
                            >
                              <Eye size={12} /> View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* ── Loading skeleton for table ── */}
            {loading && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 mb-8 space-y-3">
                <Skeleton className="h-5 w-48 mb-5" />
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            )}

            {/* ── Quick Actions ── */}
            {!loading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.34 }}
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6"
              >
                <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-5">
                  Quick Actions
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Link
                    to="/predict"
                    className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 transition-colors group"
                  >
                    <div className="p-2 bg-blue-600 rounded-lg group-hover:scale-110 transition-transform">
                      <Plus size={18} className="text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">New Prediction</p>
                      <p className="text-xs opacity-70">Run an assessment</p>
                    </div>
                  </Link>
                  <Link
                    to="/history"
                    className="flex items-center gap-3 p-4 rounded-xl bg-teal-50 dark:bg-teal-900/20 hover:bg-teal-100 dark:hover:bg-teal-900/40 text-teal-700 dark:text-teal-300 transition-colors group"
                  >
                    <div className="p-2 bg-teal-600 rounded-lg group-hover:scale-110 transition-transform">
                      <History size={18} className="text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">View History</p>
                      <p className="text-xs opacity-70">All past predictions</p>
                    </div>
                  </Link>
                  <Link
                    to="/analytics"
                    className="flex items-center gap-3 p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-purple-700 dark:text-purple-300 transition-colors group"
                  >
                    <div className="p-2 bg-purple-600 rounded-lg group-hover:scale-110 transition-transform">
                      <BarChart2 size={18} className="text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">ML Analytics</p>
                      <p className="text-xs opacity-70">Model performance</p>
                    </div>
                  </Link>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
