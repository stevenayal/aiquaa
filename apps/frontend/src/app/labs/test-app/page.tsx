'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from './lib/storage';
import TestAppLayout from './components/TestAppLayout';

export default function TestAppHomePage() {
  const router = useRouter();

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      router.push('/labs/test-app/catalog');
    } else {
      router.push('/labs/test-app/login');
    }
  }, [router]);

  return (
    <TestAppLayout>
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirigiendo...</p>
      </div>
    </TestAppLayout>
  );
}
