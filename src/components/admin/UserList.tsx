
'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Search, Loader2, WifiOff } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { ScrollArea } from '../ui/scroll-area';
import UserProfile from './UserProfile';
import { Skeleton } from '../ui/skeleton';
import pb from '@/lib/pocketbase';
import type { RecordModel } from 'pocketbase';
  
export interface User extends RecordModel {
    name: string;
    email: string;
    avatar: string;
    phone: string;
    role: string[];
    driver_status?: 'online' | 'offline' | 'urban-trip' | 'rural-trip';
    driver_vehicle_model?: string;
    driver_vehicle_plate?: string;
    driver_vehicle_photo?: string;
    driver_cnpj?: string;
    driver_pix_key?: string;
    driver_fare_type?: 'fixed' | 'km';
    driver_fixed_rate?: number;
    driver_km_rate?: number;
    driver_accepts_rural?: boolean;
    disabled?: boolean;
}

interface UserListProps {
    roleFilter?: 'Passageiro' | 'Motorista' | 'Admin' | 'Atendente';
    onSelectUser: (user: User) => void;
}

const getAvatarUrl = (record: RecordModel, avatarFileName: string) => {
    if (!record || !avatarFileName) return '';
    return pb.getFileUrl(record, avatarFileName);
};
  
export default function UserList({ roleFilter, onSelectUser }: UserListProps) {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const filter = roleFilter ? `role ~ "${roleFilter}"` : '';
            const records = await pb.collection('users').getFullList<User>({ filter, sort: 'name' });
            setUsers(records);
        } catch (err: any) {
            setError('Não foi possível carregar os usuários.');
        } finally {
            setIsLoading(false);
        }
    }, [roleFilter]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const filteredUsers = users.filter((user: User) => {
        const searchMatch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()));
        return searchMatch;
    });

    const handleSelectAndClose = (user: User) => {
        onSelectUser(user);
        setSelectedUser(null);
    };
    
    const handleUserUpdate = () => {
        fetchUsers();
        setSelectedUser(null);
    };

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="space-y-3 p-3">
                     {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <Skeleton className="h-12 w-12 rounded-full" />
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            )
        }
        if (error) {
            return (
                <div className="flex flex-col items-center justify-center p-8 text-destructive">
                   <WifiOff className="h-8 w-8 mb-2" />
                   <p>{error}</p>
                </div>
            );
        }
        if (filteredUsers.length > 0) {
            return filteredUsers.map((user) => (
                <div 
                  key={user.id} 
                  className="flex items-center gap-3 p-3 cursor-pointer border-b hover:bg-muted/50"
                  onClick={() => setSelectedUser(user)}
                >
                  <Avatar>
                    <AvatarImage src={getAvatarUrl(user, user.avatar)} data-ai-hint="user portrait"/>
                    <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                      <p className="font-semibold truncate">{user.name}</p>
                      <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>
            ));
        }
        return (
            <div className="text-center p-8 text-muted-foreground">
                Nenhum usuário encontrado para "{roleFilter}".
            </div>
        );
    };

    return (
      <>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b sticky top-0 bg-background z-10">
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-bold font-headline">{roleFilter ? `${roleFilter}s` : 'Usuários'}</h2>
            </div>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Pesquisar usuários..." 
                className="pl-8" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <ScrollArea className="flex-1">
            {renderContent()}
          </ScrollArea>
        </div>
        <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
            <DialogContent className="p-0 sm:max-w-lg md:max-w-xl">
                 <DialogHeader className="p-4 sr-only">
                    <DialogTitle>Perfil do Usuário</DialogTitle>
                    <DialogDescription></DialogDescription>
                </DialogHeader>
                {selectedUser && (
                    <UserProfile 
                        user={selectedUser} 
                        onContact={() => handleSelectAndClose(selectedUser)} 
                        onBack={() => setSelectedUser(null)} 
                        onUserUpdate={handleUserUpdate}
                    />
                )}
            </DialogContent>
        </Dialog>
      </>
    )
}
