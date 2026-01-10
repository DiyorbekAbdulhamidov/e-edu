'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';
import { authService } from '@/lib/services/authService';
import { useRouter } from 'next/navigation';
import * as Icons from '@/components/ui/Icons';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: string[];
}

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthContext();
  const router = useRouter();

  const navigation: NavItem[] = [

    {
      name: 'Bosh sahifa',
      href: '/superadmin',
      icon: Icons.HomeIcon,
      roles: ['superadmin'],
    },
    {
      name: 'Markazlar',
      href: '/superadmin/centers',
      icon: Icons.HomeIcon, // Building icon bo'lishi kerak
      roles: ['superadmin'],
    },
    {
      name: 'Analitika',
      href: '/superadmin/analytics',
      icon: Icons.ChartBarIcon,
      roles: ['superadmin'],
    },
    {
      name: 'Sozlamalar',
      href: '/superadmin/settings',
      icon: Icons.Cog6ToothIcon,
      roles: ['superadmin'],
    },
    // CenterAdmin navigation
    {
      name: 'Bosh sahifa',
      href: '/admin',
      icon: Icons.HomeIcon,
      roles: ['centeradmin'],
    },
    {
      name: 'Talabalar',
      href: '/admin/students',
      icon: Icons.UsersIcon,
      roles: ['centeradmin'],
    },
    {
      name: 'Guruhlar',
      href: '/admin/groups',
      icon: Icons.AcademicCapIcon,
      roles: ['centeradmin'],
    },
    {
      name: 'Davomat',
      href: '/admin/attendance',
      icon: Icons.ClipboardDocumentCheckIcon,
      roles: ['centeradmin'],
    },
    {
      name: 'To\'lovlar',
      href: '/admin/payments',
      icon: Icons.CurrencyDollarIcon,
      roles: ['centeradmin'],
    },
    {
      name: 'O\'qituvchilar',
      href: '/admin/teachers',
      icon: Icons.UsersIcon,
      roles: ['centeradmin'],
    },
    {
      name: 'Hisobotlar',
      href: '/admin/reports',
      icon: Icons.ChartBarIcon,
      roles: ['centeradmin'],
    },
    {
      name: 'Sozlamalar',
      href: '/admin/settings',
      icon: Icons.Cog6ToothIcon,
      roles: ['centeradmin'],
    },

    {
      name: 'Samaradorlik',
      href: '/admin/teachers/performance',
      icon: Icons.ChartBarIcon,
      roles: ['centeradmin'],
    },
    {
      name: 'Maosh',
      href: '/admin/teachers/salary',
      icon: Icons.CurrencyDollarIcon,
      roles: ['centeradmin'],
    },
    {
      name: 'Import',
      href: '/admin/teachers/import',
      icon: Icons.AcademicCapIcon,
      roles: ['centeradmin'],
    },

    // Teacher navigation
    {
      name: 'Bosh sahifa',
      href: '/teacher',
      icon: Icons.HomeIcon,
      roles: ['teacher'],
    },
    {
      name: 'Mening guruhlarim',
      href: '/teacher/groups',
      icon: Icons.AcademicCapIcon,
      roles: ['teacher'],
    },
    {
      name: 'Davomat',
      href: '/teacher/attendance',
      icon: Icons.ClipboardDocumentCheckIcon,
      roles: ['teacher'],
    },

    // Student navigation
    {
      name: 'Bosh sahifa',
      href: '/student',
      icon: Icons.HomeIcon,
      roles: ['student'],
    },
    {
      name: 'Davomat',
      href: '/student/attendance',
      icon: Icons.ClipboardDocumentCheckIcon,
      roles: ['student'],
    },
    {
      name: 'To\'lovlar',
      href: '/student/payments',
      icon: Icons.CurrencyDollarIcon,
      roles: ['student'],
    },

    // Parent navigation
    {
      name: 'Bosh sahifa',
      href: '/parent',
      icon: Icons.HomeIcon,
      roles: ['parent'],
    },
    {
      name: 'Davomat',
      href: '/parent/attendance',
      icon: Icons.ClipboardDocumentCheckIcon,
      roles: ['parent'],
    },
    {
      name: 'To\'lovlar',
      href: '/parent/payments',
      icon: Icons.CurrencyDollarIcon,
      roles: ['parent'],
    },
  ];

  const handleLogout = async () => {
    try {
      await authService.logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const filteredNavigation = navigation.filter(item =>
    user && item.roles.includes(user.role)
  );

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      <div className="flex items-center justify-center h-16 px-4 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-primary-600">e-edu</h1>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {filteredNavigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                ${isActive
                  ? 'bg-primary-50 text-primary-700 font-medium'
                  : 'text-slate-700 hover:bg-slate-50'
                }
              `}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-200">
        <div className="mb-3 px-4 py-2 bg-slate-50 rounded-lg">
          <p className="text-sm font-medium text-slate-900 truncate">
            {user?.displayName}
          </p>
          <p className="text-xs text-slate-500 truncate">
            {user?.email}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 rounded-lg transition-all"
        >
          <Icons.ArrowLeftOnRectangleIcon className="h-5 w-5" />
          <span>Chiqish</span>
        </button>
      </div>
    </div>
  );
}