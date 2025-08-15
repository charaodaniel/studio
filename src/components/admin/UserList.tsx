
'use client';

import { useState, useEffect } from 'react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, UserPlus } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import AddUserForm from './AddUserForm';
import { ScrollArea } from '../ui/scroll-area';
import UserProfile from './UserProfile';
import pb from '@/lib/pocketbase';
import type { RecordModel } from 'pocketbase';
  
// This type is now more aligned with your actual PocketBase schema.
// We add some UI-specific fields that are not in the database.
export interface User extends RecordModel {
    name: string;
    email: string;
    lastMessage: string;
    unread: number;
    type: string; // This can be derived or defaulted
    avatar: string; // This will be the URL from PocketBase
    phone: string; // Not in schema, will be empty for now
}

interface UserListProps {
    roleFilter?: 'Passageiro' | 'Motorista' | 'Admin' | 'Atendente';
    onSelectUser: (user: User) => void;
}
  
export default function UserList({ roleFilter, onSelectUser }: UserListProps) {
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            setIsLoading(true);
            try {
                // Fetching directly from PocketBase users collection, sorted by creation date
                const records = await pb.collection('users').getList<User>(1, 50, {
                    sort: '-created',
                });

                // Mapping PocketBase records to our User type for the UI
                const fetchedUsers = records.items.map(item => ({
                    ...item,
                    lastMessage: '', // Default value
                    unread: 0, // Default value
                    type: 'Passageiro', // Default or from a 'role' field if you add one
                    // The avatar field from PocketBase needs to be constructed into a URL
                    avatar: item.avatar ? pb.getFileUrl(item, item.avatar) : `https://placehold.co/40x40.png?text=${item.name.substring(0, 2).toUpperCase()}`,
                    phone: '' // Default value
                }));
                setUsers(fetchedUsers);
            } catch (error) {
                console.error("Failed to fetch users:", error);
                // We can have a placeholder or show an error message
                setUsers([]); 
            } finally {
                setIsLoading(false);
            }
        };

        fetchUsers();
    }, []);


    const baseFilteredUsers = roleFilter ? users.filter(user => user.type === roleFilter) : users;

    const filteredUsers = baseFilteredUsers.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelectAndClose = (user: User) => {
        onSelectUser(user);
        setSelectedUser(null);
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
                      <AddUserForm />
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
            {isLoading ? (
                 <div className="text-center p-8 text-muted-foreground">Carregando usuários...</div>
            ) : filteredUsers.length > 0 ? filteredUsers.map((user) => (
              <div 
                key={user.id} 
                className="flex items-center gap-3 p-3 cursor-pointer border-b hover:bg-muted/50"
                onClick={() => setSelectedUser(user)}
              >
                <Avatar>
                  <AvatarImage src={user.avatar} data-ai-hint="user portrait"/>
                  <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                    <p className="font-semibold truncate">{user.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>
            )) : (
              <div className="text-center p-8 text-muted-foreground">
                  Nenhum usuário encontrado. Verifique sua conexão ou adicione novos usuários.
              </div>
            )}
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
