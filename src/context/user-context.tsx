'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { Locale, UserProfile } from '@/lib/types';
import { getProfile, saveProfile, clearAll, isOnboarded as checkOnboarded } from '@/lib/storage';
import { useRouter, usePathname } from 'next/navigation';

interface UserContextValue extends UserProfile {
  isOnboarded: boolean;
  updateProfile: (partial: Partial<UserProfile>) => void;
  resetAll: () => void;
  hydrated: boolean;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children, locale }: { children: ReactNode; locale: Locale }) {
  const [profile, setProfile] = useState<UserProfile>({
    nickname: '',
    struggle: '',
    locale,
    ttsSpeed: 1.2,
  });
  const [hydrated, setHydrated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const saved = getProfile();
    setProfile({ ...saved, locale });
    setHydrated(true);
  }, [locale]);

  const updateProfile = useCallback((partial: Partial<UserProfile>) => {
    setProfile((prev) => {
      const updated = { ...prev, ...partial };
      saveProfile(partial);
      return updated;
    });
  }, []);

  const resetAll = useCallback(() => {
    clearAll();
    setProfile({ nickname: '', struggle: '', locale: 'id', ttsSpeed: 1.2 });
    router.push('/id/onboarding');
  }, [router]);

  // Redirect to onboarding if not onboarded (but not if already on onboarding page)
  useEffect(() => {
    if (!hydrated) return;
    if (!checkOnboarded() && !pathname.includes('/onboarding')) {
      router.push(`/${locale}/onboarding`);
    }
  }, [hydrated, pathname, locale, router]);

  return (
    <UserContext.Provider
      value={{
        ...profile,
        isOnboarded: !!profile.nickname,
        updateProfile,
        resetAll,
        hydrated,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}
