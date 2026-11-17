'use client';

import { ConfirmProvider } from '@/components/ui/ConfirmDialog';
import { SupabaseAuthProvider } from '@/contexts/SupabaseAuthContext';
import type { ReactNode } from 'react';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SupabaseAuthProvider>
      <ConfirmProvider>{children}</ConfirmProvider>
    </SupabaseAuthProvider>
  );
}
