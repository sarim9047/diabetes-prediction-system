import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Activity,
  AlertTriangle,
  CheckCircle,
  Trash2,
  Search,
  Shield,
  BarChart2,
  RefreshCw,
  Eye,
} from 'lucide-react';
import {
  BarChart,
  Bar,
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
import { adminApi } from '../services/api';

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-200 dark:bg-slate-700 rounded ${className}`} />
);

// ─── StatCard ─────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 flex items-center gap-5"
  >
    <div className={`p-3 rounded-xl ${color}`}>
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{label}</p>
      <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-0.5">{value ?? '—'}</p>
    </div>
  </motion.div>
);

// ─── Role Badge ────────────────────────────────────────────────────────────────
const RoleBadge = ({ role }) =>
  role === 'admin' ? (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
      <Shield size={10} /> Admin
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
      User
    </span>
  );

// ─── Result Badge ──────────────────────────────────────────────────────────────
const ResultBadge = ({ result }) =>
  result === 1 || result === true || result === 'positive' ? (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">
      <AlertTriangle size={10} /> High Risk
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
      <CheckCircle size={10} /> Low Risk
    </span>
  );

// ─── Confirm Delete Modal ──────────────────────────────────────────────────────
const ConfirmModal = ({ open, name, onConfirm, onCancel, loading }) => (
  <AnimatePresence>
    {open && (
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.92, opacity: 0 }}
          className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 max-w-sm w-full z-10"
        >
          <div className="flex flex-col items-center text-center">
            <div className="p-3 bg-red-100 dark:bg-red-900/40 rounded-full mb-4">
              <Trash2 size={24} className="text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">
              Delete User
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
              Are you sure you want to delete{' '}
              <span className="font-semibold text-slate-700 dark:text-slate-200">{name}</span>?
              This action cannot be undone and will also delete all their predictions.
            </p>
            <div className="flex gap-3 w-full">
              <button
                onClick={onCancel}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white font-semibold transition-colors text-sm flex items-center justify-center gap-2"
              >
                {loading ? (
                  <RefreshCw size={14} className="animate-spin" />
                ) : (
                  <Trash2 size={14} />
                )}
                Delete
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// ─── Main Component ────────────────────────────────────────────────────────────
export default function AdminDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [recentPredictions, setRecentPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [predsLoading, setPredsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userSearch, setUserSearch] = useState('');

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState({ open: false, userId: null, userName: '' });
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ── Fetch stats ──
  useEffect(() => {
    const load = async () => {
      try {
        const res = await adminApi.getStats();
        // Map backend field names to frontend expectations
        setStats({
          ...res.data,
          positive_count: res.data.positive_classifications || 0,
          negative_count: res.data.negative_classifications || 0,
        });
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load admin stats.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ── Fetch users ──
  const fetchUsers = useCallback(async () => {
    try {
      setUsersLoading(true);
      const res = await adminApi.getUsers({ search: userSearch });
      setUsers(res.data?.users ?? res.data ?? []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load users.');
    } finally {
      setUsersLoading(false);
    }
  }, [userSearch]);

  useEffect(() => {
    const timer = setTimeout(fetchUsers, 350);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  // ── Fetch recent predictions ──
  useEffect(() => {
    const load = async () => {
      try {
        setPredsLoading(true);
        const res = await adminApi.getPredictions({ page: 1, limit: 10 });
        setRecentPredictions(res.data?.predictions ?? res.data ?? []);
      } catch {
        // non-critical
      } finally {
        setPredsLoading(false);
      }
    };
    load();
  }, []);

  // ── Delete handler ──
  const handleDeleteClick = (u) => {
    setDeleteModal({ open: true, userId: u.id, userName: u.full_name ?? u.email });
  };

  const handleDeleteConfirm = async () => {
    try {
      setDeleteLoading(true);
      await adminApi.deleteUser(deleteModal.userId);
      setDeleteModal({ open: false, userId: null, userName: '' });
      fetchUsers();
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to delete user.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── Chart data preparation ──
  const barData = stats?.daily_predictions ?? [];
  const pieData = stats?.role_distribution
    ? Object.entries(stats.role_distribution).map(([name, value]) => ({ name, value }))
    : [];
  const PIE_COLORS = ['#2563eb', '#0d9488', '#8b5cf6', '#f59e0b'];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      {/* ── Confirm Modal ── */}
      <ConfirmModal
        open={deleteModal.open}
        name={deleteModal.userName}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteModal({ open: false, userId: null, userName: '' })}
        loading={deleteLoading}
      />

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
      >
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">
              Admin Dashboard
            </h1>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-purple-600 text-white">
              <Shield size={11} /> Admin
            </span>
          </div>
          <p className="mt-1 text-slate-500 dark:text-slate-400 text-sm">
            System overview and user management
          </p>
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
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-6 flex items-center gap-5 shadow-sm border border-slate-100 dark:border-slate-700">
              <Skeleton className="w-12 h-12 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-7 w-16" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatCard icon={Users} label="Total Users" value={stats?.total_users} color="bg-blue-500" delay={0} />
          <StatCard icon={Activity} label="Total Predictions" value={stats?.total_predictions} color="bg-teal-500" delay={0.08} />
          <StatCard icon={AlertTriangle} label="Positive Cases" value={stats?.positive_count} color="bg-red-500" delay={0.16} />
          <StatCard icon={CheckCircle} label="Negative Cases" value={stats?.negative_count} color="bg-emerald-500" delay={0.24} />
        </div>
      )}

      {/* ── Charts ── */}
      {!loading && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
          {/* Bar Chart: predictions per day */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <BarChart2 size={18} className="text-blue-500" />
              <h3 className="font-semibold text-slate-700 dark:text-slate-200">
                Predictions — Last 7 Days
              </h3>
            </div>
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={barData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="Predictions" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[260px] text-slate-400 text-sm">
                No data for the last 7 days.
              </div>
            )}
          </motion.div>

          {/* Pie Chart: role distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Users size={18} className="text-teal-500" />
              <h3 className="font-semibold text-slate-700 dark:text-slate-200">
                User Role Distribution
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
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
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
                No role data available.
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* ── Users Management ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.26 }}
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 mb-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-blue-500" />
            <h3 className="font-semibold text-slate-700 dark:text-slate-200">
              Users Management
            </h3>
            {!usersLoading && (
              <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full">
                {users.length}
              </span>
            )}
          </div>
          {/* Search */}
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 w-56"
            />
          </div>
        </div>

        {usersLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            {userSearch ? 'No users match your search.' : 'No users found.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700">
                  <th className="text-left pb-3 text-slate-500 dark:text-slate-400 font-medium">Name</th>
                  <th className="text-left pb-3 text-slate-500 dark:text-slate-400 font-medium">Email</th>
                  <th className="text-left pb-3 text-slate-500 dark:text-slate-400 font-medium">Role</th>
                  <th className="text-left pb-3 text-slate-500 dark:text-slate-400 font-medium">Joined</th>
                  <th className="text-left pb-3 text-slate-500 dark:text-slate-400 font-medium">Predictions</th>
                  <th className="text-left pb-3 text-slate-500 dark:text-slate-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors"
                  >
                    <td className="py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center text-white text-xs font-bold uppercase">
                          {(u.full_name ?? u.email ?? '?')[0]}
                        </div>
                        <span className="font-medium text-slate-700 dark:text-slate-200 truncate max-w-[120px]">
                          {u.full_name ?? '—'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 text-slate-500 dark:text-slate-400 truncate max-w-[160px]">
                      {u.email}
                    </td>
                    <td className="py-3">
                      <RoleBadge role={u.role} />
                    </td>
                    <td className="py-3 text-slate-500 dark:text-slate-400">
                      {u.created_at
                        ? new Date(u.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : '—'}
                    </td>
                    <td className="py-3 text-slate-600 dark:text-slate-300 font-medium">
                      {u.predictions_count ?? 0}
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => handleDeleteClick(u)}
                        disabled={u.id === user?.id}
                        title={u.id === user?.id ? "You can't delete yourself" : `Delete ${u.full_name}`}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          u.id === user?.id
                            ? 'opacity-30 cursor-not-allowed bg-slate-100 dark:bg-slate-700 text-slate-400'
                            : 'bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-400 border border-red-200 dark:border-red-800'
                        }`}
                      >
                        <Trash2 size={12} />
                        {u.id === user?.id ? 'You' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* ── Recent Predictions (All Users) ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.34 }}
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6"
      >
        <div className="flex items-center gap-2 mb-5">
          <Activity size={18} className="text-teal-500" />
          <h3 className="font-semibold text-slate-700 dark:text-slate-200">
            Recent Predictions (All Users)
          </h3>
        </div>

        {predsLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : recentPredictions.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            No predictions found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700">
                  <th className="text-left pb-3 text-slate-500 dark:text-slate-400 font-medium">Date</th>
                  <th className="text-left pb-3 text-slate-500 dark:text-slate-400 font-medium">User</th>
                  <th className="text-left pb-3 text-slate-500 dark:text-slate-400 font-medium">Result</th>
                  <th className="text-left pb-3 text-slate-500 dark:text-slate-400 font-medium">Age</th>
                  <th className="text-left pb-3 text-slate-500 dark:text-slate-400 font-medium">Glucose</th>
                  <th className="text-left pb-3 text-slate-500 dark:text-slate-400 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                {recentPredictions.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors">
                    <td className="py-3 text-slate-500 dark:text-slate-400">
                      {p.created_at
                        ? new Date(p.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : '—'}
                    </td>
                    <td className="py-3 text-slate-700 dark:text-slate-200 font-medium max-w-[140px] truncate">
                      {p.user_name ?? p.user?.full_name ?? p.user?.email ?? '—'}
                    </td>
                    <td className="py-3">
                      <ResultBadge result={p.result} />
                    </td>
                    <td className="py-3 text-slate-600 dark:text-slate-300">
                      {p.age ?? '—'}
                    </td>
                    <td className="py-3 text-slate-600 dark:text-slate-300">
                      {p.glucose != null ? `${p.glucose} mg/dL` : '—'}
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => navigate(`/result/${p.id}`)}
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium text-xs px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-50 dark:border-blue-700 dark:hover:bg-blue-900/20 transition-colors"
                      >
                        <Eye size={12} /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
