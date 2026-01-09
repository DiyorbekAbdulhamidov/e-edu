'use client';

import { BellIcon, MagnifyingGlassIcon } from '@/components/ui/Icons';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';

export default function Header() {
  const { user } = useCurrentUser();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
      <div className="flex-1 max-w-md">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Qidirish..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
          <BellIcon className="h-6 w-6" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-danger-500 rounded-full"></span>
        </button>

        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-primary-700 font-semibold">
              {user?.displayName?.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}