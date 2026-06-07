'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

export default function LabsTestAppRegisterRedirectPage() {
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

    router.replace('/register?redirect=/labs/test-app/catalog');
  }, [router, isAuthenticated, isLoading]);

  return null;
}
