'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

export default function LabsTestAppLoginRedirectPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useSupabaseAuth();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (isAuthenticated) {
      router.replace('/labs/test-app/catalog');
      return;
    }

    router.replace('/login?redirect=/labs/test-app/catalog');
  }, [router, isAuthenticated, isLoading]);

  return null;
}
