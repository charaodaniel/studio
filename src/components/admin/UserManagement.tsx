
'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, UserPlus, Send, MoreVertical, ArrowLeft, FileText, User, MessageSquare, WifiOff, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import AddUserForm from './AddUserForm';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import UserProfile from './UserProfile';
import type { User as UserData } from './UserList';
import pb from '@/lib/pocketbase';
  
export type User = UserData; // Use the same type

type Message = {
    id: number;
    text: string;
    sender: 'me' | 'user';
    timestamp: string;
};

// Use string IDs for the message records
const initialMessages: Record<string, Message[]> = {
    '1': [
        { id: 1, text: "Olá, tudo bem?", sender: 'user', timestamp: '10:30' },
        { id: 2, text: "Tudo bem por aqui, e com você?", sender: 'me', timestamp: '10:31' },
    ],
    '2': [
        { id: 1, text: "Ok, estarei lá.", sender: 'user', timestamp: '11:00' },
    ],
};

interface UserManagementProps {
    preselectedUser: User | null;
    onUserSelect: (user: User | null) => void;
}
  
export default function UserManagement({ preselectedUser, onUserSelect }: UserManagementProps) {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [messages, setMessages] = useState(initialMessages);
    const [newMessage, setNewMessage] = useState('');
    const [isClient, setIsClient] = useState(false);

    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const records = await pb.collection('users').getFullList<User>({ sort: '-created' });
            setUsers(records);
        } catch (err: any) {
            console.error("Failed to fetch users for chat:", err);
            setError("Não foi possível carregar os usuários.");
            setUsers([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Initial fetch
    useEffect(() => {
        setIsClient(true);
        fetchUsers();
    }, [fetchUsers]);

    // This effect handles user selection changes from other components (like UserList)
    useEffect(() => {
        if (preselectedUser) {
            setSelectedUser(preselectedUser);
            setIsProfileOpen(false); // Make sure chat view is open
            onUserSelect(null); // Reset preselection after applying it
        }
    }, [preselectedUser, onUserSelect]);

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

    if (!isClient) {
        return <div className="flex-1 flex items-center justify-center bg-muted/40 h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>; 
    }

    if (isProfileOpen && selectedUser) {
        return <UserProfile user={selectedUser} onBack={() => setIsProfileOpen(false)} onContact={() => setIsProfileOpen(false)} isModal={false} />;
    }
    
    const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const renderUserList = () => {
        if (isLoading) {
            return <div className="p-4 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>
        }
        if (error) {
            return <div className="p-4 text-center text-destructive">{error}</div>
        }
        if (filteredUsers.length === 0) {
            return <div className="p-4 text-center text-muted-foreground">Nenhum usuário encontrado.</div>
        }
        return filteredUsers.map((user) => (
              <div 
                key={user.id} 
                className={`flex items-center gap-3 p-3 cursor-pointer border-b hover:bg-muted/50 ${selectedUser?.id === user.id ? 'bg-muted/50' : ''}`}
                onClick={() => {
                    setSelectedUser(user);
                    setIsProfileOpen(false);
                }}
              >
                <Avatar>
                  <AvatarImage src={user.avatar ? pb.getFileUrl(user, user.avatar) : ''} data-ai-hint="user portrait"/>
                  <AvatarFallback>{user.name.substring(0,2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                    <p className="font-semibold truncate">{user.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{messages[user.id]?.[messages[user.id].length - 1]?.text || 'Nenhuma mensagem ainda'}</p>
                </div>
                 {/* {(messages[user.id] || []).filter(m => m.sender === 'user').length > 0 && (
                  <div className="bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {(messages[user.id] || []).filter(m => m.sender === 'user').length}
                  </div>
                )} */}
              </div>
        ));
    }


    return (
      <div className="grid grid-cols-1 md:grid-cols-[350px_1fr] h-full overflow-hidden">
        <div className={cn("flex flex-col border-r bg-background", selectedUser ? 'hidden md:flex' : 'flex')}>
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
                      <AddUserForm onUserAdded={fetchUsers} />
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
            {renderUserList()}
          </ScrollArea>
        </div>
        
        <div className={cn("flex flex-1 flex-col bg-muted/40", selectedUser ? 'flex' : 'hidden md:flex')}>
          {selectedUser ? (
            <>
              <div className="p-3 border-b flex items-center gap-3 bg-background shadow-sm">
                <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSelectedUser(null)}>
                  <ArrowLeft className="w-5 h-5"/>
                </Button>
                <Avatar>
                  <AvatarImage src={selectedUser.avatar ? pb.getFileUrl(selectedUser, selectedUser.avatar) : ''} data-ai-hint="user portrait"/>
                  <AvatarFallback>{selectedUser.name.substring(0,2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className='flex-1'>
                  <p className="font-semibold">{selectedUser.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedUser.role}</p>
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
                    {selectedUser.role === 'Motorista' && (
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
