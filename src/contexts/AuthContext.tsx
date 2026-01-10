'use client';

import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import pb from '@/lib/pocketbase';
import { type User } from '@/components/admin/UserList';
import localUsers from '@/database/banco.json';

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
    // Check if there's a user in pocketbase's store on initial load
    if (pb.authStore.isValid) {
      setUser(pb.authStore.model as User);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (identity: string, password: string): Promise<User> => {
    // Try PocketBase first
    try {
      const authData = await pb.collection('users').authWithPassword(identity, password);
      const loggedInUser = authData.record as User;
      setUser(loggedInUser);
      return loggedInUser;
    } catch (pocketbaseError) {
      console.warn("PocketBase login failed, trying fallback JSON login.", pocketbaseError);
      
      // Fallback to local JSON file if PocketBase fails
      const foundUser = localUsers.users.find(
        u => u.email === identity || u.phone === identity
      );

      if (foundUser) {
        console.log("Fallback login successful with user:", foundUser.name);
        // This is an insecure mock login. In a real app, you'd validate the password.
        // We are treating the local user as a valid user object.
        const mockUser: User = {
          ...foundUser,
          id: foundUser.id || `local_${Math.random()}`,
          collectionId: '_pb_users_auth_',
          collectionName: 'users',
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
          username: foundUser.email,
          verified: true,
          export: () => ({...foundUser}),
          toJSON: () => ({...foundUser}),
          clone: () => ({...mockUser}),
          $load: (_data: any) => {},
          $isNew: false,
          $has: (_key: string) => true,
        };
        setUser(mockUser);
        return mockUser;
      }
      
      throw new Error('Credenciais inválidas. Verifique seu email/telefone e senha.');
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
