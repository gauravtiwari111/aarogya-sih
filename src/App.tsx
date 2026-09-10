import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { MotionConfig } from 'framer-motion'
import { Toasts } from './components/Toasts'
import { AppProvider, useApp } from './hooks/AppContext'
import { RequireStep } from './hooks/RequireStep'
import { DoctorLayout } from './layouts/DoctorLayout'
import { ConsentPage } from './pages/ConsentPage'
import { ConversationPage } from './pages/ConversationPage'
import { DoctorDashboardPage } from './pages/DoctorDashboardPage'
import { DoctorPatientPage } from './pages/DoctorPatientPage'
import { DoctorReviewPage } from './pages/DoctorReviewPage'
import { DocumentsPage } from './pages/DocumentsPage'
import { PatientDetailsPage } from './pages/PatientDetailsPage'
import { SuccessPage } from './pages/SuccessPage'
import { SummaryPage } from './pages/SummaryPage'
import { VerificationPage } from './pages/VerificationPage'
import { WelcomePage } from './pages/WelcomePage'

function AnimatedApp() {
  const { a11y } = useApp()
  return (
    <MotionConfig reducedMotion={a11y.reducedMotion ? 'always' : 'never'}>
      <Toasts />
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route
          path="/consent"
          element={
            <RequireStep step="consent">
              <ConsentPage />
            </RequireStep>
          }
        />
        <Route
          path="/patient-details"
          element={
            <RequireStep step="details">
              <PatientDetailsPage />
            </RequireStep>
          }
        />
        <Route
          path="/conversation"
          element={
            <RequireStep step="conversation">
              <ConversationPage />
            </RequireStep>
          }
        />
        <Route
          path="/verification"
          element={
            <RequireStep step="verification">
              <VerificationPage />
            </RequireStep>
          }
        />
        <Route
          path="/documents"
          element={
            <RequireStep step="documents">
              <DocumentsPage />
            </RequireStep>
          }
        />
        <Route
          path="/summary"
          element={
            <RequireStep step="summary">
              <SummaryPage />
            </RequireStep>
          }
        />
        <Route path="/doctor" element={<DoctorLayout />}>
          <Route index element={<DoctorDashboardPage />} />
          <Route path="patient/:id" element={<DoctorPatientPage />} />
          <Route path="review" element={<DoctorReviewPage />} />
        </Route>
        <Route path="/success" element={<SuccessPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </MotionConfig>
  )
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AnimatedApp />
      </BrowserRouter>
    </AppProvider>
  )
}
