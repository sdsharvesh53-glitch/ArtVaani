'use client';

import { AuthProvider } from '@/providers/auth-provider';
import { CartProvider } from '@/providers/cart-provider';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>{children}</CartProvider>
    </AuthProvider>
  );
}
