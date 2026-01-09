import { AuthProvider } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <DashboardLayout>
          {children}
        </DashboardLayout>
      </ProtectedRoute>
    </AuthProvider>
  );
}