'use client';

import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import pb from '@/lib/pocketbase';
import { type User } from '@/components/admin/UserList';
import { RecordAuthResponse } from 'pocketbase';

export interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (identity: string, password: string) => Promise<User>;
  logout: () => void;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = () => {
      const currentUser = pb.authStore.model as User | null;
      setUser(currentUser);
      setIsLoading(false);
    };

    checkUser();

    const unsubscribe = pb.authStore.onChange(checkUser, true);

    return () => {
      unsubscribe();
    };
  }, []);

  const login = useCallback(async (identity: string, password: string): Promise<User> => {
    try {
      const authData: RecordAuthResponse<User> = await pb.collection('users').authWithPassword(identity, password);
      const loggedInUser = authData.record as User;
      setUser(loggedInUser);
      return loggedInUser;
    } catch (error: any) {
      // Clear auth store on failed login to ensure no stale data
      pb.authStore.clear();
      setUser(null);
      // Re-throw the error to be handled by the calling component
      throw new Error(error.response?.message || 'Credenciais inválidas.');
    }
  }, []);

  const logout = useCallback(() => {
    pb.authStore.clear();
    setUser(null);
    router.push('/');
  }, [router]);

  const value: AuthContextType = {
    user,
    isLoggedIn: !!user,
    isLoading,
    login,
    logout,
    setUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
