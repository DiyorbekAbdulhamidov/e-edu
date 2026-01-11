'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';
import { usePermissions } from '@/lib/hooks/usePermissions';
import { UserRole } from '@/lib/types';
import Spinner from '@/components/ui/Spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requiredPermission?: string;
}

export default function ProtectedRoute({
  children,
  allowedRoles,
  requiredPermission
}: ProtectedRouteProps) {
  const { user, loading } = useAuthContext();
  const { canAccessRoute } = usePermissions();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
        return;
      }

      if (allowedRoles && !allowedRoles.includes(user.role)) {
        router.push('/login');
        return;
      }

      if (requiredPermission && !canAccessRoute(requiredPermission)) {
        router.push('/login');
        return;
      }
    }
  }, [user, loading, allowedRoles, requiredPermission, router, canAccessRoute]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user || (allowedRoles && !allowedRoles.includes(user.role))) {
    return null;
  }

  return <>{children}</>;
}