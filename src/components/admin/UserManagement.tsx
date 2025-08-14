'use client';

import { useState } from 'react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, UserPlus, Send, MoreVertical, ArrowLeft } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import AddUserForm from './AddUserForm';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '@/lib/utils';
  
const users = [
    { id: 1, name: "Ana Clara", email: "ana.clara@email.com", lastMessage: "Olá, tudo bem?", unread: 2, type: 'Passageiro', avatar: 'AC' },
    { id: 2, name: "Roberto Andrade", email: "roberto.a@email.com", lastMessage: "Ok, estarei lá.", unread: 0, type: 'Motorista', avatar: 'RA' },
    { id: 3, name: "Admin User", email: "admin@ceolin.com", lastMessage: "Verifique os relatórios.", unread: 0, type: 'Admin', avatar: 'AU' },
    { id: 4, name: "Carlos Dias", email: "carlos.dias@email.com", lastMessage: "A caminho.", unread: 0, type: 'Motorista', avatar: 'CD' },
]

type User = typeof users[0];
  
export default function UserManagement() {
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="grid grid-cols-1 md:grid-cols-[350px_1fr] h-screen overflow-hidden">
        <div className={cn("flex flex-col border-r bg-background", selectedUser && "hidden md:flex")}>
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
            {filteredUsers.map((user) => (
              <div 
                key={user.id} 
                className={`flex items-center gap-3 p-3 cursor-pointer border-b hover:bg-muted/50`}
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
                 {user.unread > 0 && (
                  <div className="bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {user.unread}
                  </div>
                )}
              </div>
            ))}
          </ScrollArea>
        </div>
        
        <div className={cn("flex-1 flex-col bg-muted/40", selectedUser ? 'flex' : 'hidden md:flex')}>
          {selectedUser ? (
            <>
              <div className="p-3 border-b flex items-center gap-3 bg-background shadow-sm">
                <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSelectedUser(null)}>
                  <ArrowLeft className="w-5 h-5"/>
                </Button>
                <Avatar>
                  <AvatarImage src={`https://placehold.co/40x40.png?text=${selectedUser.avatar}`} data-ai-hint="user portrait"/>
                  <AvatarFallback>{selectedUser.avatar}</AvatarFallback>
                </Avatar>
                <div className='flex-1'>
                  <p className="font-semibold">{selectedUser.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedUser.type}</p>
                </div>
                <Button size="icon" variant="ghost"><MoreVertical className="w-5 h-5"/></Button>
              </div>
              <ScrollArea className="flex-1 p-4 sm:p-6 bg-[url('https://placehold.co/1000x1000/E3F2FD/E3F2FD.png')] bg-center bg-cover">
                <div className="flex flex-col gap-4">
                  <div className="flex items-start gap-3">
                      <div className="bg-white rounded-lg p-3 text-sm shadow-sm max-w-xs rounded-tl-none">
                          <p>Olá, tudo bem?</p>
                      </div>
                  </div>
                  <div className="flex items-start gap-3 flex-row-reverse">
                      <div className="bg-primary/90 text-primary-foreground rounded-lg p-3 text-sm shadow-sm max-w-xs rounded-br-none">
                          <p>Tudo bem por aqui, e com você?</p>
                      </div>
                  </div>
                </div>
              </ScrollArea>
              <div className="p-4 bg-background border-t">
                  <div className="relative">
                      <Input placeholder="Digite sua mensagem..." className="pr-12" />
                      <Button size="icon" className="absolute top-1/2 -translate-y-1/2 right-2" variant="ghost">
                          <Send className="w-5 h-5 text-primary"/>
                      </Button>
                  </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-muted/40 h-full">
              <div className='text-center text-muted-foreground'>
                  <p>Selecione uma conversa para começar</p>
                  <p className='text-xs'>Suas conversas com usuários e motoristas aparecerão aqui.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    )
}
