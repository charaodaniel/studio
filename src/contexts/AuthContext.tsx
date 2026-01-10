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

const convertLocalUserToUserType = (localUser: any): User => {
    // This function adds the necessary properties to make the local user object
    // compatible with the PocketBase 'User' type used throughout the app.
    return {
        ...localUser,
        id: localUser.id || `local_${Math.random().toString(36).substr(2, 9)}`,
        collectionId: '_pb_users_auth_',
        collectionName: 'users',
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        username: localUser.email || localUser.phone,
        verified: true,
        role: Array.isArray(localUser.role) ? localUser.role : [localUser.role],
        // Add other required RecordModel properties if needed
        '$isNew': false,
    } as User;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // On initial load, try to use PocketBase authStore if valid, otherwise clear it.
    if (pb.authStore.isValid && pb.authStore.model) {
      setUser(pb.authStore.model as User);
    } else {
        // This ensures we don't use a stale PocketBase login if the app logic
        // is supposed to rely on the local JSON file.
        pb.authStore.clear();
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (identity: string, password: string): Promise<User> => {
    // Use local JSON file as the primary source of truth for now.
    const foundUser = localUsers.users.find(
      u => u.email === identity || u.phone === identity
    );

    if (foundUser) {
      // NOTE: Password check is bypassed for local development with banco.json
      console.log("Fallback login successful for user:", foundUser.name);
      const userToLogin = convertLocalUserToUserType(foundUser);
      setUser(userToLogin);
      // We don't set anything in pb.authStore because we're in local mode.
      return userToLogin;
    }
    
    // As a secondary fallback, try authenticating with PocketBase.
    // This allows the app to work if the backend is configured.
    try {
      const authData = await pb.collection('users').authWithPassword(identity, password);
      const loggedInUser = authData.record as User;
      setUser(loggedInUser);
      return loggedInUser;
    } catch (pocketbaseError) {
       console.warn("PocketBase login also failed.", pocketbaseError);
    }

    throw new Error('Credenciais inválidas. Verifique seu email/telefone e senha.');
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
