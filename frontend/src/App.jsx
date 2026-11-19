import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute'
import AppLayout from './layouts/AppLayout'
import PublicLayout from './layouts/PublicLayout'

// Lazy-loaded pages
const LandingPage = lazy(() => import('./pages/LandingPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const PredictionFormPage = lazy(() => import('./pages/PredictionFormPage'))
const PredictionResultPage = lazy(() => import('./pages/PredictionResultPage'))
const PredictionHistoryPage = lazy(() => import('./pages/PredictionHistoryPage'))
const MLAnalyticsPage = lazy(() => import('./pages/MLAnalyticsPage'))
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const AwarenessPage = lazy(() => import('./pages/AwarenessPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-white dark:bg-slate-900">
    <div className="w-12 h-12 border-4 border-navy-600 border-t-transparent rounded-full animate-spin"
      style={{ borderColor: '#1e3a5f', borderTopColor: 'transparent' }}
    />
  </div>
)

export default function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Public routes — PublicLayout */}
        <Route
          path="/"
          element={
            <PublicLayout>
              <LandingPage />
            </PublicLayout>
          }
        />
        <Route
          path="/login"
          element={
            <PublicLayout>
              <LoginPage />
            </PublicLayout>
          }
        />
        <Route
          path="/register"
          element={
            <PublicLayout>
              <RegisterPage />
            </PublicLayout>
          }
        />
        <Route
          path="/awareness"
          element={
            <PublicLayout>
              <AwarenessPage />
            </PublicLayout>
          }
        />
        <Route
          path="/about"
          element={
            <PublicLayout>
              <AboutPage />
            </PublicLayout>
          }
        />
        <Route
          path="/contact"
          element={
            <PublicLayout>
              <ContactPage />
            </PublicLayout>
          }
        />

        {/* Protected routes — AppLayout */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AppLayout>
                <DashboardPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/predict"
          element={
            <ProtectedRoute>
              <AppLayout>
                <PredictionFormPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/result/:id"
          element={
            <ProtectedRoute>
              <AppLayout>
                <PredictionResultPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <AppLayout>
                <PredictionHistoryPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <AppLayout>
                <ProfilePage />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Semi-public — AppLayout (no sidebar enforcement for unauth handled inside) */}
        <Route
          path="/analytics"
          element={
            <AppLayout>
              <MLAnalyticsPage />
            </AppLayout>
          }
        />

        {/* Admin route */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AppLayout>
                <AdminDashboardPage />
              </AppLayout>
            </AdminRoute>
          }
        />

        {/* 404 fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
