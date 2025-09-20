'use client';

import { AuthProvider } from '@/providers/auth-provider';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
