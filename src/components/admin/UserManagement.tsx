
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
import pb from '@/lib/pocketbase';
import type { RecordModel } from 'pocketbase';

export interface User extends RecordModel {
    name: string;
    email: string;
    avatar: string;
    phone: string;
    role: 'Passageiro' | 'Motorista' | 'Admin' | 'Atendente';

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
}
  
interface ChatRecord extends RecordModel {
  participants: string[];
  last_message: string;
  expand: {
    participants: User[];
  }
}

interface MessageRecord extends RecordModel {
    chat: string;
    sender: string;
    text: string;
}

interface UserManagementProps {
    preselectedUser: User | null;
    onUserSelect: (user: User | null) => void;
}
  
export default function UserManagement({ preselectedUser, onUserSelect }: UserManagementProps) {
    const [chats, setChats] = useState<ChatRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [selectedChat, setSelectedChat] = useState<ChatRecord | null>(null);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [messages, setMessages] = useState<MessageRecord[]>([]);
    const [newMessage, setNewMessage] = useState('');
    
    const [searchTerm, setSearchTerm] = useState('');
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);


    const fetchChats = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const records = await pb.collection('chats').getFullList<ChatRecord>({ 
                sort: '-updated',
                expand: 'participants' 
            });
            setChats(records);
        } catch (err: any) {
            console.error("Failed to fetch chats:", err);
            setError("Não foi possível carregar as conversas.");
            setChats([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        setIsClient(true);
        fetchChats();
        
        // Subscribe to real-time updates
        const unsubscribe = pb.collection('chats').subscribe<ChatRecord>('*', e => {
            if (e.action === 'create' || e.action === 'update') {
               fetchChats();
            }
        });

        return () => {
            pb.collection('chats').unsubscribe('*');
        };

    }, [fetchChats]);

    const fetchMessages = useCallback(async (chatId: string) => {
        try {
            const result = await pb.collection('messages').getFullList<MessageRecord>({
                filter: `chat = "${chatId}"`,
                sort: 'id'
            });
            setMessages(result);
        } catch (error) {
            console.error("Failed to fetch messages:", error);
            setMessages([]);
        }
    }, []);

    useEffect(() => {
        if (selectedChat) {
            fetchMessages(selectedChat.id);
            const unsubscribe = pb.collection('messages').subscribe<MessageRecord>('*', e => {
                if (e.action === 'create' && e.record.chat === selectedChat.id) {
                    setMessages(prev => [...prev, e.record]);
                }
            });
            return () => pb.collection('messages').unsubscribe('*');
        }
    }, [selectedChat, fetchMessages]);

    useEffect(() => {
      if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
      }
    }, [messages]);

    const handleSelectChat = (chat: ChatRecord) => {
        setSelectedChat(chat);
        const otherUser = chat.expand.participants.find(p => p.id !== pb.authStore.model?.id);
        setSelectedUser(otherUser || null);
        setIsProfileOpen(false);
    }
    
    useEffect(() => {
        if (preselectedUser) {
            const findOrCreateChat = async () => {
                try {
                    // Try to find an existing chat
                    const existingChat = await pb.collection('chats').getFirstListItem<ChatRecord>(`participants~"${pb.authStore.model?.id}" && participants~"${preselectedUser.id}"`, {
                        expand: 'participants'
                    });
                    handleSelectChat(existingChat);
                } catch (error) {
                     // If not found, create a new one
                    if (error instanceof Error && error.message.includes("404")) {
                        const newChat = await pb.collection('chats').create<ChatRecord>({
                            participants: [pb.authStore.model?.id, preselectedUser.id]
                        }, { expand: 'participants' });
                        handleSelectChat(newChat);
                        fetchChats(); // Refresh the list
                    } else {
                        console.error("Error finding or creating chat:", error);
                    }
                }
            }
            findOrCreateChat();
            onUserSelect(null); // Reset preselection
        }
    }, [preselectedUser, onUserSelect, fetchChats]);


    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedChat || !pb.authStore.model) return;

        const text = newMessage;
        setNewMessage(''); // Clear input immediately

        try {
            await pb.collection('messages').create({
                chat: selectedChat.id,
                sender: pb.authStore.model.id,
                text: text
            });
             await pb.collection('chats').update(selectedChat.id, {
                last_message: text,
            });

        } catch (error) {
            console.error("Failed to send message:", error);
        }
    };

    if (!isClient) {
        return <div className="flex-1 flex items-center justify-center bg-muted/40 h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>; 
    }

    if (isProfileOpen && selectedUser) {
        return <UserProfile user={selectedUser} onBack={() => setIsProfileOpen(false)} onContact={() => setIsProfileOpen(false)} isModal={false} />;
    }
    
    const filteredChats = chats.filter(chat => {
        const otherUser = chat.expand.participants.find(p => p.id !== pb.authStore.model?.id);
        if (!otherUser) return false;
        return otherUser.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               otherUser.email.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const renderUserList = () => {
        if (isLoading) {
            return <div className="p-4 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>
        }
        if (error) {
            return <div className="p-4 text-center text-destructive">{error}</div>
        }
        if (filteredChats.length === 0) {
            return <div className="p-4 text-center text-muted-foreground">Nenhuma conversa encontrada.</div>
        }
        return filteredChats.map((chat) => {
              const otherUser = chat.expand.participants.find(p => p.id !== pb.authStore.model?.id);
              if (!otherUser) return null;
              return (
                <div 
                  key={chat.id} 
                  className={`flex items-center gap-3 p-3 cursor-pointer border-b hover:bg-muted/50 ${selectedChat?.id === chat.id ? 'bg-muted/50' : ''}`}
                  onClick={() => handleSelectChat(chat)}
                >
                  <Avatar>
                    <AvatarImage src={otherUser.avatar ? pb.getFileUrl(otherUser, otherUser.avatar) : ''} data-ai-hint="user portrait"/>
                    <AvatarFallback>{otherUser.name.substring(0,2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                      <p className="font-semibold truncate">{otherUser.name}</p>
                      <p className="text-sm text-muted-foreground truncate">{chat.last_message || 'Nenhuma mensagem ainda'}</p>
                  </div>
                </div>
              )
        });
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-[350px_1fr] h-full overflow-hidden">
        <div className={cn("flex flex-col border-r bg-background", selectedChat ? 'hidden md:flex' : 'flex')}>
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
                      <AddUserForm onUserAdded={fetchChats} />
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
        
        <div className={cn("flex flex-1 flex-col bg-muted/40", selectedChat ? 'flex' : 'hidden md:flex')}>
          {selectedChat && selectedUser ? (
            <>
              <div className="p-3 border-b flex items-center gap-3 bg-background shadow-sm">
                <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSelectedChat(null)}>
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
              <ScrollArea className="flex-1 p-4 sm:p-6 bg-[url('https://placehold.co/1000x1000/E3F2FD/E3F2FD.png')] bg-center bg-cover" ref={scrollAreaRef}>
                <div className="flex flex-col gap-4">
                  {messages.map((msg) => (
                     <div key={msg.id} className={`flex items-start gap-3 ${msg.sender === pb.authStore.model?.id ? 'flex-row-reverse' : ''}`}>
                      <div className={`rounded-lg p-3 text-sm shadow-sm max-w-xs ${msg.sender === pb.authStore.model?.id ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-white rounded-tl-none'}`}>
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
                      <Button type="submit" size="icon" className="absolute top-1/2 -translate-y-1/2 right-2" variant="ghost" disabled={!newMessage.trim()}>
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
