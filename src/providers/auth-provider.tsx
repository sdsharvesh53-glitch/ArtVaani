'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter, usePathname } from 'next/navigation';

import { auth, db } from '@/lib/firebase';
import { AuthContext } from '@/contexts/auth-context';

interface UserProfile {
  role?: 'buyer' | 'artisan';
  profileComplete?: boolean;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        setUser(firebaseUser);
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const profile = userDoc.data() as UserProfile;
          setUserProfile(profile);
          if (!profile.profileComplete && pathname !== '/profile-setup') {
            router.push('/profile-setup');
          }
        } else {
          // New user, profile does not exist yet
          setUserProfile(null);
          if (pathname !== '/profile-setup') {
            router.push('/profile-setup');
          }
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, pathname]);

  const value = {
    user,
    loading,
    userProfile,
    isArtisan: userProfile?.role === 'artisan',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
