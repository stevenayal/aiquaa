'use client';

import { useRouter } from 'next/navigation';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

export default function UserMenu() {
  const { user, isLoading, signOut } = useSupabaseAuth();
  const router = useRouter();

  if (isLoading) {
    return <div className="h-8 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />;
  }

  if (!user) return null;

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-[160px]">
        {user.email}
      </span>
      <button
        onClick={handleLogout}
        className="text-sm px-3 py-1.5 rounded-md bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 transition-colors"
      >
        Salir
      </button>
    </div>
  );
}
