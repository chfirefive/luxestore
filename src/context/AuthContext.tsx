"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebaseClient';
import { getUserProfile, saveUserProfile, UserProfile } from '@/lib/firebaseDb';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfileData: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  logout: async () => {},
  refreshProfile: async () => {},
  updateProfileData: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (currentUser: User) => {
    try {
      let profile = await getUserProfile(currentUser.uid);
      if (!profile && currentUser.email) {
        // Initial profile creation if not exists
        profile = {
          uid: currentUser.uid,
          email: currentUser.email.toLowerCase(),
          displayName: currentUser.displayName || currentUser.email.split('@')[0],
        };
        await saveUserProfile(profile);
      }
      setUserProfile(profile);
    } catch (e) {
      console.error('Error fetching/creating user profile:', e);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser && currentUser.email) {
        sessionStorage.setItem('buyer_auth', currentUser.email);
        localStorage.setItem('buyer_auth_email', currentUser.email);
        await fetchProfile(currentUser);
      } else {
        sessionStorage.removeItem('buyer_auth');
        localStorage.removeItem('buyer_auth_email');
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error('Error signing out:', e);
    }
    sessionStorage.removeItem('buyer_auth');
    localStorage.removeItem('buyer_auth_email');
    setUser(null);
    setUserProfile(null);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user);
    }
  };

  const updateProfileData = async (data: Partial<UserProfile>) => {
    if (!user || !user.email) return;
    const updated: UserProfile = {
      uid: user.uid,
      email: user.email.toLowerCase(),
      displayName: userProfile?.displayName || user.displayName || user.email.split('@')[0],
      phone: userProfile?.phone || '',
      address: userProfile?.address || '',
      city: userProfile?.city || '',
      postalCode: userProfile?.postalCode || '',
      ...data,
    };
    await saveUserProfile(updated);
    setUserProfile(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        logout,
        refreshProfile,
        updateProfileData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
