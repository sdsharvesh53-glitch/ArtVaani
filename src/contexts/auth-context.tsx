'use client';

import { type User } from 'firebase/auth';
import { createContext } from 'react';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  isArtisan: boolean;
  // In a real app, you would have more profile fields
  userProfile: { role?: 'buyer' | 'artisan' } | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
