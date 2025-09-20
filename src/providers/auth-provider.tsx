
'use client';

import { useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { useRouter, usePathname } from 'next/navigation';

import { auth, db } from '@/lib/firebase';
import { AuthContext } from '@/contexts/auth-context';

// Expanded user profile type
export interface UserProfile {
  uid: string;
  email: string | null;
  name?: string;
  city?: string;
  phone?: string;
  role: 'buyer' | 'artisan';
  verified?: boolean;
  profileComplete: boolean;
  craft?: string;
  experience?: number;
  about?: string;
  samplePhotoUrl?: string;
  createdAt: any; // Firestore timestamp
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const handleUserProfile = useCallback(
    (profile: UserProfile | null) => {
      setUserProfile(profile);
      if (profile && !profile.profileComplete && pathname !== '/profile-setup') {
        router.push('/profile-setup');
      }
    },
    [pathname, router]
  );

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        setUser(firebaseUser);
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        
        // Use onSnapshot for real-time profile updates
        const unsubscribeSnapshot = onSnapshot(userDocRef, (doc) => {
          if (doc.exists()) {
            handleUserProfile(doc.data() as UserProfile);
          } else {
             // This case is handled in signup-form, but as a fallback:
            handleUserProfile(null);
          }
          setLoading(false);
        }, (error) => {
            console.error("Error fetching user profile:", error);
            setUser(null);
            setUserProfile(null);
            setLoading(false);
        });

        return () => unsubscribeSnapshot();
      } else {
        setUser(null);
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, [handleUserProfile]);

  const value = {
    user,
    loading,
    userProfile,
    isArtisan: userProfile?.role === 'artisan',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
