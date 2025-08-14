
'use client';

import { useState } from 'react';
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
  
const users = [
    { id: 1, name: "Ana Clara", email: "ana.clara@email.com", lastMessage: "Olá, tudo bem?", unread: 2, type: 'Passageiro', avatar: 'AC', phone: "11987654321" },
    { id: 2, name: "Roberto Andrade", email: "roberto.a@email.com", lastMessage: "Ok, estarei lá.", unread: 0, type: 'Motorista', avatar: 'RA', phone: "11912345678" },
    { id: 3, name: "Admin User", email: "admin@ceolin.com", lastMessage: "Verifique os relatórios.", unread: 0, type: 'Admin', avatar: 'AU', phone: "11988887777" },
    { id: 4, name: "Carlos Dias", email: "carlos.dias@email.com", lastMessage: "A caminho.", unread: 0, type: 'Motorista', avatar: 'CD', phone: "11977778888" },
    { id: 5, name: "Sofia Mendes", email: "sofia.mendes@email.com", lastMessage: "Preciso de ajuda.", unread: 1, type: 'Atendente', avatar: 'SM', phone: "11966665555" },
];

export type User = typeof users[0];

interface UserListProps {
    roleFilter?: 'Passageiro' | 'Motorista' | 'Admin' | 'Atendente';
}
  
export default function UserList({ roleFilter }: UserListProps) {
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const baseFilteredUsers = roleFilter ? users.filter(user => user.type === roleFilter) : users;

    const filteredUsers = baseFilteredUsers.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
            {filteredUsers.length > 0 ? filteredUsers.map((user) => (
              <div 
                key={user.id} 
                className="flex items-center gap-3 p-3 cursor-pointer border-b hover:bg-muted/50"
                onClick={() => setSelectedUser(user)}
              >
                <Avatar>
                  <AvatarImage src={`https://placehold.co/40x40.png?text=${user.avatar}`} data-ai-hint="user portrait"/>
                  <AvatarFallback>{user.avatar}</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                    <p className="font-semibold truncate">{user.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>
            )) : (
              <div className="text-center p-8 text-muted-foreground">
                  Nenhum usuário encontrado para este perfil.
              </div>
            )}
          </ScrollArea>
        </div>
        <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
            <DialogContent className="p-0 sm:max-w-md">
                <DialogHeader className="p-4">
                  <DialogTitle>Perfil do Usuário</DialogTitle>
                </DialogHeader>
                {selectedUser && <UserProfile user={selectedUser} onBack={() => setSelectedUser(null)} isModal={true} />}
            </DialogContent>
        </Dialog>
      </>
    )
}
