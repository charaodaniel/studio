
'use client';

import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import pb from '@/lib/pocketbase';
import { type User } from '@/components/admin/UserList';
import localUsersData from '@/database/banco.json';

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
    } as User;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // In this local-first mode, we ignore PocketBase's authStore on load.
    // The login function will handle setting the user from banco.json.
    pb.authStore.clear();
    setIsLoading(false);
  }, []);

  const login = useCallback(async (identity: string, password: string): Promise<User> => {
    console.log(`Attempting local login with: ${identity}`);
    const foundUser = localUsersData.users.find(
      u => (u.email && u.email.toLowerCase() === identity.toLowerCase()) || u.phone === identity
    );

    if (foundUser) {
      // NOTE: Password check is bypassed for local development with banco.json
      console.log("Local login successful for:", foundUser.name);
      const userToLogin = convertLocalUserToUserType(foundUser);
      setUser(userToLogin);
      // Simulate PocketBase's authStore for any remaining client-side checks that might use it
      pb.authStore.save('local_token_placeholder', userToLogin);
      return userToLogin;
    }

    throw new Error('Credenciais inválidas. Verifique os dados em banco.json');
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
