
'use client';

import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { type User } from '@/components/admin/UserList';
import localDatabase from '@/database/banco.json';

export interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (identity: string, password?: string) => Promise<User>;
  logout: () => void;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const USER_STORAGE_KEY = 'ceolin-auth-user';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // On initial load, try to restore the session from localStorage.
  useEffect(() => {
    try {
      const storedUserJson = localStorage.getItem(USER_STORAGE_KEY);
      if (storedUserJson) {
        const storedUser = JSON.parse(storedUserJson) as User;
        // Verify this user still exists in our 'database'
        const userExists = localDatabase.users.some(u => u.id === storedUser.id);
        if (userExists) {
            setUser(storedUser);
        } else {
            // User from storage doesn't exist anymore, clear it.
            localStorage.removeItem(USER_STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem(USER_STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (identity: string, password?: string): Promise<User> => {
    // Simula a autenticação com o banco.json
    await new Promise(resolve => setTimeout(resolve, 500)); // Simula delay da rede

    const foundUser = localDatabase.users.find(u => 
      u.email?.toLowerCase() === identity.toLowerCase() || u.phone === identity
    );

    // In prototype mode, we check for a placeholder password if it exists
    if (foundUser && (!foundUser.password_placeholder || foundUser.password_placeholder === password)) {
        const fullUser = {
            ...foundUser,
            id: foundUser.id,
            collectionId: '_pb_users_auth_',
            collectionName: 'users',
            created: foundUser.created || new Date().toISOString(),
            updated: foundUser.updated || new Date().toISOString(),
            role: Array.isArray(foundUser.role) ? foundUser.role : [foundUser.role]
        } as User;
        
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(fullUser));
        setUser(fullUser);
        return fullUser;
    } else {
        throw new Error("Usuário ou senha inválidos.");
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    router.push('/');
    router.refresh(); // Forces a refresh to clear state in other components
  }, [router]);
  
  // Effect to update localStorage if the user object is modified externally (e.g., profile update)
  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    }
  }, [user]);

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
