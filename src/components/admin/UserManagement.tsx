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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import ProfileForm from "../driver/ProfileForm"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import AddUserForm from './AddUserForm';
  
const users = [
    { id: 1, name: "Ana Clara", email: "ana.clara@email.com", lastMessage: "Passageiro", unread: 0, type: 'Passageiro', avatar: 'AC' },
    { id: 2, name: "Roberto Andrade", email: "roberto.a@email.com", lastMessage: "Motorista", unread: 0, type: 'Motorista', avatar: 'RA' },
    { id: 3, name: "Admin User", email: "admin@ceolin.com", lastMessage: "Admin", unread: 0, type: 'Admin', avatar: 'AU' },
    { id: 4, name: "Carlos Dias", email: "carlos.dias@email.com", lastMessage: "Motorista", unread: 0, type: 'Motorista', avatar: 'CD' },
]

type User = typeof users[0];
  
export default function UserManagement() {
    const [selectedUser, setSelectedUser] = useState<User>(users[0]);

    return (
      <div className="grid grid-cols-1 md:grid-cols-[350px_1fr] h-screen">
        <div className="flex flex-col border-r bg-background">
          <div className="p-4 border-b sticky top-0 bg-background z-10">
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-bold font-headline">Usuários</h2>
                 <Dialog>
                  <DialogTrigger asChild>
                    <Button size="icon" variant="ghost"><UserPlus className="w-5 h-5"/></Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Adicionar Novo Usuário</DialogTitle>
                      <DialogDescription>Preencha os campos abaixo para criar um novo usuário.</DialogDescription>
                    </DialogHeader>
                    <AddUserForm />
                  </DialogContent>
                </Dialog>
            </div>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Pesquisar usuários..." className="pl-8" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {users.map((user) => (
              <div 
                key={user.id} 
                className={`flex items-center gap-3 p-3 cursor-pointer border-b border-l-4 ${selectedUser.id === user.id ? 'bg-muted/50 border-primary' : 'border-transparent hover:bg-muted/50'}`}
                onClick={() => setSelectedUser(user)}
              >
                <Avatar>
                  <AvatarImage src={`https://placehold.co/40x40.png?text=${user.avatar}`} data-ai-hint="user portrait"/>
                  <AvatarFallback>{user.avatar}</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                    <p className="font-semibold truncate">{user.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{user.lastMessage}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {selectedUser ? (
          <div className="flex-1 flex flex-col bg-muted/40">
            <div className="p-4 border-b flex items-center gap-3 bg-background">
              <Avatar>
                <AvatarImage src={`https://placehold.co/40x40.png?text=${selectedUser.avatar}`} data-ai-hint="user portrait"/>
                <AvatarFallback>{selectedUser.avatar}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{selectedUser.name}</p>
                <p className="text-sm text-green-500 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  Online
                </p>
              </div>
            </div>
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
              <div className="grid grid-cols-1 gap-6">
                  <Card>
                      <CardHeader>
                          <CardTitle>Gerenciamento de Usuário</CardTitle>
                          <CardDescription>Edite as informações e permissões do usuário.</CardDescription>
                      </CardHeader>
                      <CardContent>
                          <ProfileForm />
                      </CardContent>
                  </Card>
                   <Card>
                      <CardHeader>
                          <CardTitle>Atividade Recente</CardTitle>
                      </CardHeader>
                      <CardContent>
                          <p className="text-sm text-muted-foreground">Nenhuma atividade recente para este usuário.</p>
                      </CardContent>
                  </Card>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-muted/40">
            <p className="text-muted-foreground">Selecione um usuário para ver os detalhes.</p>
          </div>
        )}
      </div>
    )
}