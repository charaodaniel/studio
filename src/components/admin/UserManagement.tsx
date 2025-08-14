
'use client';

import { useState } from 'react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, UserPlus, Send, MoreVertical, ArrowLeft, FileText, User, MessageSquare } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import AddUserForm from './AddUserForm';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import UserProfile from './UserProfile';
  
const users = [
    { id: 1, name: "Ana Clara", email: "ana.clara@email.com", lastMessage: "Olá, tudo bem?", unread: 2, type: 'Passageiro', avatar: 'AC', phone: '11987654321' },
    { id: 2, name: "Roberto Andrade", email: "roberto.a@email.com", lastMessage: "Ok, estarei lá.", unread: 0, type: 'Motorista', avatar: 'RA', phone: '11912345678' },
    { id: 3, name: "Admin User", email: "admin@ceolin.com", lastMessage: "Verifique os relatórios.", unread: 0, type: 'Admin', avatar: 'AU', phone: '11988887777' },
    { id: 4, name: "Carlos Dias", email: "carlos.dias@email.com", lastMessage: "A caminho.", unread: 0, type: 'Motorista', avatar: 'CD', phone: '11977778888' },
]

export type User = typeof users[0];

type Message = {
    id: number;
    text: string;
    sender: 'me' | 'user';
    timestamp: string;
};

const initialMessages: Record<number, Message[]> = {
    1: [
        { id: 1, text: "Olá, tudo bem?", sender: 'user', timestamp: '10:30' },
        { id: 2, text: "Tudo bem por aqui, e com você?", sender: 'me', timestamp: '10:31' },
    ],
    2: [
        { id: 1, text: "Ok, estarei lá.", sender: 'user', timestamp: '11:00' },
    ],
    3: [
         { id: 1, text: "Verifique os relatórios.", sender: 'me', timestamp: '09:15' },
    ],
    4: [
        { id: 1, text: "A caminho.", sender: 'user', timestamp: '14:05' },
    ]
};
  
export default function UserManagement() {
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [messages, setMessages] = useState(initialMessages);
    const [newMessage, setNewMessage] = useState('');


    const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedUser) return;

        const newMsg: Message = {
            id: Date.now(),
            text: newMessage,
            sender: 'me',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        
        const userMessages = messages[selectedUser.id] || [];
        setMessages({
            ...messages,
            [selectedUser.id]: [...userMessages, newMsg]
        });

        setNewMessage('');

        // Simulate a reply after a short delay
        setTimeout(() => {
            const replyMsg: Message = {
                id: Date.now() + 1,
                text: "Obrigado pela sua mensagem. Responderei em breve.",
                sender: 'user',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prevMessages => ({
                ...prevMessages,
                [selectedUser.id]: [...(prevMessages[selectedUser.id] || []), replyMsg]
            }));
        }, 1500);
    };

    if (isProfileOpen && selectedUser) {
        return <UserProfile user={selectedUser} onBack={() => setIsProfileOpen(false)} />;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-[350px_1fr] h-full overflow-hidden">
        <div className={cn("flex flex-col border-r bg-background", selectedUser && !isProfileOpen && "hidden md:flex")}>
          <div className="p-4 border-b sticky top-0 bg-background z-10">
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-bold font-headline">Conversas</h2>
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
                placeholder="Pesquisar conversas..." 
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
                className={`flex items-center gap-3 p-3 cursor-pointer border-b hover:bg-muted/50 ${selectedUser?.id === user.id ? 'bg-muted/50' : ''}`}
                onClick={() => {
                    setSelectedUser(user);
                    setIsProfileOpen(false);
                }}
              >
                <Avatar>
                  <AvatarImage src={`https://placehold.co/40x40.png?text=${user.avatar}`} data-ai-hint="user portrait"/>
                  <AvatarFallback>{user.avatar}</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                    <p className="font-semibold truncate">{user.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{messages[user.id]?.[messages[user.id].length - 1]?.text || user.lastMessage}</p>
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
        
        <div className={cn("flex-1 flex-col bg-muted/40", selectedUser && !isProfileOpen ? 'flex' : 'hidden md:flex')}>
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost"><MoreVertical className="w-5 h-5"/></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Ações</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => setIsProfileOpen(true)}>
                      <User className="mr-2 h-4 w-4"/> Ver Perfil
                    </DropdownMenuItem>
                    {selectedUser.type === 'Motorista' && (
                        <DropdownMenuItem>
                            <FileText className="mr-2 h-4 w-4"/> Gerar Relatório
                        </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <ScrollArea className="flex-1 p-4 sm:p-6 bg-[url('https://placehold.co/1000x1000/E3F2FD/E3F2FD.png')] bg-center bg-cover">
                <div className="flex flex-col gap-4">
                  {(messages[selectedUser.id] || []).map((msg) => (
                     <div key={msg.id} className={`flex items-start gap-3 ${msg.sender === 'me' ? 'flex-row-reverse' : ''}`}>
                      <div className={`rounded-lg p-3 text-sm shadow-sm max-w-xs ${msg.sender === 'me' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-white rounded-tl-none'}`}>
                          <p>{msg.text}</p>
                      </div>
                  </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="p-4 bg-background border-t">
                  <form onSubmit={handleSendMessage} className="relative">
                      <Input 
                        placeholder="Digite sua mensagem..." 
                        className="pr-12" 
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                      />
                      <Button type="submit" size="icon" className="absolute top-1/2 -translate-y-1/2 right-2" variant="ghost">
                          <Send className="w-5 h-5 text-primary"/>
                      </Button>
                  </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-muted/40 h-full">
              <div className='text-center text-muted-foreground'>
                  <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                  <p className='mt-2'>Selecione uma conversa para começar</p>
                  <p className='text-xs'>Suas conversas com usuários e motoristas aparecerão aqui.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    )
}
