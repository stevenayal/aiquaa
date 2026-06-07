'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TestAppLayout from './components/TestAppLayout';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

export default function TestAppHomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useSupabaseAuth();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (isAuthenticated) {
      router.push('/labs/test-app/catalog');
      return;
    }

    router.push('/login?redirect=/labs/test-app/catalog');
  }, [router, isAuthenticated, isLoading]);

  return (
    <TestAppLayout>
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirigiendo...</p>
      </div>
    </TestAppLayout>
  );
}
