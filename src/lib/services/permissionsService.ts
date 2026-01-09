import { UserRole } from '@/lib/types';

export type Permission =
  // Student permissions
  | 'students.view'
  | 'students.create'
  | 'students.edit'
  | 'students.delete'

  // Group permissions
  | 'groups.view'
  | 'groups.create'
  | 'groups.edit'
  | 'groups.delete'

  // Attendance permissions
  | 'attendance.view'
  | 'attendance.mark'
  | 'attendance.edit'

  // Payment permissions
  | 'payments.view'
  | 'payments.create'
  | 'payments.edit'
  | 'payments.delete'

  // Teacher permissions
  | 'teachers.view'
  | 'teachers.create'
  | 'teachers.edit'
  | 'teachers.delete'

  // Report permissions
  | 'reports.view'
  | 'reports.export'

  // Settings permissions
  | 'settings.view'
  | 'settings.edit'

  // Center permissions
  | 'centers.view'
  | 'centers.create'
  | 'centers.edit'
  | 'centers.delete';

class PermissionsService {
  private rolePermissions: Record<UserRole, Permission[]> = {
    superadmin: [
      'centers.view',
      'centers.create',
      'centers.edit',
      'centers.delete',
      'students.view',
      'groups.view',
      'attendance.view',
      'payments.view',
      'teachers.view',
      'reports.view',
      'reports.export',
    ],

    centeradmin: [
      'students.view',
      'students.create',
      'students.edit',
      'students.delete',
      'groups.view',
      'groups.create',
      'groups.edit',
      'groups.delete',
      'attendance.view',
      'attendance.mark',
      'attendance.edit',
      'payments.view',
      'payments.create',
      'payments.edit',
      'payments.delete',
      'teachers.view',
      'teachers.create',
      'teachers.edit',
      'teachers.delete',
      'reports.view',
      'reports.export',
      'settings.view',
      'settings.edit',
    ],

    teacher: [
      'students.view',
      'groups.view',
      'attendance.view',
      'attendance.mark',
      'reports.view',
    ],

    student: [
      'attendance.view',
      'payments.view',
    ],

    parent: [
      'attendance.view',
      'payments.view',
    ],
  };

  /**
   * Foydalanuvchi ma'lum permissionga ega ekanligini tekshirish
   */
  hasPermission(role: UserRole, permission: Permission): boolean {
    return this.rolePermissions[role]?.includes(permission) || false;
  }

  /**
   * Foydalanuvchining barcha permissionlarini olish
   */
  getUserPermissions(role: UserRole): Permission[] {
    return this.rolePermissions[role] || [];
  }

  /**
   * Bir nechta permissionlarni tekshirish (hech bo'lmaganda bittasi bo'lishi kerak)
   */
  hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
    return permissions.some(permission => this.hasPermission(role, permission));
  }

  /**
   * Barcha permissionlarni tekshirish (hammasi bo'lishi kerak)
   */
  hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
    return permissions.every(permission => this.hasPermission(role, permission));
  }

  /**
   * Route uchun ruxsat borligini tekshirish
   */
  canAccessRoute(role: UserRole, route: string): boolean {
    const routePermissions: Record<string, Permission[]> = {
      '/admin': ['students.view'],
      '/admin/students': ['students.view'],
      '/admin/students/new': ['students.create'],
      '/admin/groups': ['groups.view'],
      '/admin/groups/new': ['groups.create'],
      '/admin/attendance': ['attendance.view'],
      '/admin/payments': ['payments.view'],
      '/admin/teachers': ['teachers.view'],
      '/admin/teachers/new': ['teachers.create'],
      '/admin/reports': ['reports.view'],
      '/admin/settings': ['settings.view'],

      '/teacher': ['attendance.mark'],
      '/teacher/groups': ['groups.view'],
      '/teacher/attendance': ['attendance.mark'],

      '/student': ['attendance.view'],
      '/student/attendance': ['attendance.view'],
      '/student/payments': ['payments.view'],

      '/parent': ['attendance.view'],
      '/parent/attendance': ['attendance.view'],
      '/parent/payments': ['payments.view'],
    };

    const requiredPermissions = routePermissions[route];
    if (!requiredPermissions) return true;

    return this.hasAnyPermission(role, requiredPermissions);
  }
}

export const permissionsService = new PermissionsService();