'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, UserPlus, WifiOff, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import AddUserForm from './AddUserForm';
import { ScrollArea } from '../ui/scroll-area';
import UserProfile from './UserProfile';
import pb from '@/lib/pocketbase';
import { Skeleton } from '../ui/skeleton';
import type { RecordModel } from 'pocketbase';
import localUsers from '@/database/banco.json';
  
export interface User extends RecordModel {
    id: string;
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

const getAvatarUrl = (user: User) => {
    if (!user) return '';
    // Check if the avatar is a full URL (from placehold.co)
    if (user.avatar?.startsWith('http')) {
        return user.avatar;
    }
    // If it's a PocketBase file, construct the URL
    if (user.collectionId && user.id && user.avatar) {
        return pb.getFileUrl(user, user.avatar);
    }
    return '';
};
  
export default function UserList({ roleFilter, onSelectUser }: UserListProps) {
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Simulating an async fetch
            await new Promise(resolve => setTimeout(resolve, 250));

            let userList = localUsers.users.map(u => ({
                ...u,
                id: u.id || `local_${Math.random()}`,
                role: Array.isArray(u.role) ? u.role : [u.role],
                collectionId: '_pb_users_auth_',
                collectionName: 'users',
                created: new Date().toISOString(),
                updated: new Date().toISOString(),
            })) as unknown as User[];

            if (roleFilter) {
                userList = userList.filter(user => user.role.includes(roleFilter));
            }
            
            setUsers(userList);
        } catch (err: any) {
            setError("Não foi possível carregar os usuários do arquivo local.");
            setUsers([]); 
        } finally {
            setIsLoading(false);
        }
    }, [roleFilter]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);


    const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleSelectAndClose = (user: User) => {
        onSelectUser(user);
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
                <div className="text-center p-8 text-destructive">
                    <WifiOff className="mx-auto h-10 w-10 mb-2" />
                    <p className="font-semibold">Erro ao Carregar</p>
                    <p className="text-sm">{error}</p>
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
                    <AvatarImage src={getAvatarUrl(user)} data-ai-hint="user portrait"/>
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
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="icon" variant="ghost"><UserPlus className="w-5 h-5"/></Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Adicionar Novo Usuário</DialogTitle>
                      <DialogDescription>Preencha os campos abaixo para criar um novo usuário.</DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="max-h-[80vh]">
                      <AddUserForm onUserAdded={fetchUsers} />
                    </ScrollArea>
                  </DialogContent>
                </Dialog>
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
                {selectedUser && <UserProfile user={selectedUser} onContact={() => handleSelectAndClose(selectedUser)} onBack={() => setSelectedUser(null)} isModal={true} />}
            </DialogContent>
        </Dialog>
      </>
    )
}
