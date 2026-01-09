'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';
import { usePermissions } from '@/lib/hooks/usePermissions';
import { UserRole } from '@/lib/types';

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
      // Foydalanuvchi yo'q bo'lsa, login sahifasiga yo'naltirish
      if (!user) {
        router.push('/login');
        return;
      }

      // Role tekshirish
      if (allowedRoles && !allowedRoles.includes(user.role)) {
        router.push('/unauthorized');
        return;
      }

      // Permission tekshirish
      if (requiredPermission && !canAccessRoute(requiredPermission)) {
        router.push('/unauthorized');
        return;
      }
    }
  }, [user, loading, allowedRoles, requiredPermission, router, canAccessRoute]);

  // Loading holati
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Foydalanuvchi yo'q yoki ruxsat yo'q bo'lsa
  if (!user || (allowedRoles && !allowedRoles.includes(user.role))) {
    return null;
  }

  return <>{children}</>;
}