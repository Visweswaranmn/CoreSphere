import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '@/features/auth/useAuth';
import { FullPageLoader } from '@/components/FullPageLoader';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { LoginPage } from '@/features/auth/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';

/** Redirects already-authenticated users away from the login screen. */
function LoginRoute() {
  const { status } = useAuth();
  if (status === 'loading') return <FullPageLoader label="Restoring your session…" />;
  if (status === 'authenticated') return <Navigate to="/" replace />;
  return <LoginPage />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginRoute />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<DashboardPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
