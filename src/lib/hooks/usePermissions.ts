'use client';

import { useMemo } from 'react';
import { useAuth } from './useAuth';
import { permissionsService, Permission } from '@/lib/services/permissionsService';

export function usePermissions() {
  const { user } = useAuth();

  const permissions = useMemo(() => {
    if (!user) return [];
    return permissionsService.getUserPermissions(user.role);
  }, [user]);

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;
    return permissionsService.hasPermission(user.role, permission);
  };

  const hasAnyPermission = (perms: Permission[]): boolean => {
    if (!user) return false;
    return permissionsService.hasAnyPermission(user.role, perms);
  };

  const hasAllPermissions = (perms: Permission[]): boolean => {
    if (!user) return false;
    return permissionsService.hasAllPermissions(user.role, perms);
  };

  const canAccessRoute = (route: string): boolean => {
    if (!user) return false;
    return permissionsService.canAccessRoute(user.role, route);
  };

  return {
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessRoute,
  };
}