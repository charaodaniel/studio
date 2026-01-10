
'use client';

import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { type User } from '@/components/admin/UserList';
import { useDatabaseManager } from '@/hooks/use-database-manager';

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
  const { database, isLoading: isDbLoading } = useDatabaseManager();
  const router = useRouter();

  const login = useCallback(async (identity: string, password: string): Promise<User> => {
    if (!database) {
        throw new Error('Banco de dados não carregado. Tente novamente em alguns instantes.');
    }

    const foundUser = database.users.find(
      u => (u.email && u.email.toLowerCase() === identity.toLowerCase()) || u.phone === identity
    );

    if (foundUser) {
      console.log("Local login successful for:", foundUser.name);
      const userToLogin = convertLocalUserToUserType(foundUser);
      setUser(userToLogin);
      return userToLogin;
    }

    throw new Error('Credenciais inválidas. Verifique os dados em banco.json');
  }, [database]);

  const logout = useCallback(() => {
    setUser(null);
    router.push('/');
  }, [router]);

  const value: AuthContextType = {
    user,
    isLoggedIn: !!user,
    isLoading: isDbLoading,
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
