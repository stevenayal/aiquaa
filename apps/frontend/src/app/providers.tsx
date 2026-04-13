'use client';

import { SupabaseAuthProvider } from '@/contexts/SupabaseAuthContext';
import type { ReactNode } from 'react';

export default function Providers({ children }: { children: ReactNode }) {
  return <SupabaseAuthProvider>{children}</SupabaseAuthProvider>;
}
