
'use client';

import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import pb from '@/lib/pocketbase';
import { type User } from '@/components/admin/UserList';

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
    const currentUser = pb.authStore.model as User | null;
    setUser(currentUser);
    setIsLoading(false);

    const removeListener = pb.authStore.onChange(() => {
        const updatedUser = pb.authStore.model as User | null;
        setUser(updatedUser);
    }, true);

    return () => {
        removeListener();
    };
  }, []);

  const login = useCallback(async (identity: string, password: string): Promise<User> => {
    const authData = await pb.collection('users').authWithPassword(identity, password);
    const loggedInUser = authData.record as User;
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const logout = useCallback(() => {
    pb.authStore.clear();
    setUser(null);
    router.push('/');
  }, [router]);

  const value: AuthContextType = {
    user,
    isLoggedIn: !!user,
    isLoading: isLoading,
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
