import { AuthProvider } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <ErrorBoundary>
          <DashboardLayout>
            {children}
          </DashboardLayout>
        </ErrorBoundary>
      </ProtectedRoute>
    </AuthProvider >
  );
}