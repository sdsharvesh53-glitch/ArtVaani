
'use client';

import { type User } from 'firebase/auth';
import { createContext } from 'react';
import { type UserProfile } from '@/providers/auth-provider';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  isArtisan: boolean;
  userProfile: UserProfile | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
