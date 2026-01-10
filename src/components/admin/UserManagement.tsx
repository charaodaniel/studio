
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, UserPlus, Send, MoreVertical, ArrowLeft, FileText, User, MessageSquare, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import AddUserForm from './AddUserForm';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import UserProfile from './UserProfile';
import type { User as UserData } from './UserList';
import localData from '@/database/banco.json';
import { useToast } from '@/hooks/use-toast';
import { useDatabaseManager } from '@/hooks/use-database-manager';

const getAvatarUrl = (avatarPath: string) => {
    if (!avatarPath) return '';
    return avatarPath;
};

interface ChatRecord {
  id: string;
  participants: string[];
  last_message: string;
  updated: string;
  expand: {
    participants: UserData[];
  }
}

interface MessageRecord {
    id: string;
    chat: string;
    sender: string;
    text: string;
    created: string;
    expand: {
        sender: UserData;
    }
}

interface UserManagementProps {
    preselectedUser: UserData | null;
    onUserSelect: (user: UserData | null) => void;
}
  
export default function UserManagement({ preselectedUser, onUserSelect }: UserManagementProps) {
    const { database, isLoading: isDbLoading, saveDatabase, refreshDatabase } = useDatabaseManager();
    const [chats, setChats] = useState<ChatRecord[]>([]);

    const [selectedChat, setSelectedChat] = useState<ChatRecord | null>(null);
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
    const [messages, setMessages] = useState<MessageRecord[]>([]);
    const [newMessage, setNewMessage] = useState('');
    
    const [searchTerm, setSearchTerm] = useState('');
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();
    
    // Simulating a logged-in admin user
    const currentUser = database?.users.find(u => u.role === "Admin" || (Array.isArray(u.role) && u.role.includes("Admin"))) as UserData | undefined;

    useEffect(() => {
        setIsClient(true);
        if (database) {
            const allUsers = database.users as unknown as UserData[];
            const populatedChats = database.chats.map(chat => {
                const participants = chat.participants.map(pId => allUsers.find(u => u.id === pId)).filter(Boolean) as UserData[];
                return {
                    ...chat,
                    expand: {
                        participants,
                    }
                }
            }) as ChatRecord[];

            const userChats = populatedChats.filter(chat => chat.participants.find(p => p.id === currentUser?.id));
            setChats(userChats);
        }
    }, [database, currentUser]);

    const fetchMessages = useCallback(async (chatId: string) => {
        if (!database) return;
        setMessages([]); // Clear old messages
        const allUsers = database.users as unknown as UserData[];
        const chatMessages = database.messages
            .filter(msg => msg.chat === chatId)
            .map(msg => ({
                ...msg,
                expand: {
                    sender: allUsers.find(u => u.id === msg.sender) as UserData
                }
            })) as MessageRecord[];
        
        setMessages(chatMessages);
    }, [database]);

    useEffect(() => {
        if (!selectedChat) return;
        fetchMessages(selectedChat.id);
    }, [selectedChat, fetchMessages]);

    useEffect(() => {
      if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
      }
    }, [messages]);

    const handleSelectChat = (chat: ChatRecord) => {
        setSelectedChat(chat);
        const otherUser = chat.expand.participants.find(p => p.id !== currentUser?.id);
        setSelectedUser(otherUser || null);
        setIsProfileOpen(false);
    }
    
    useEffect(() => {
        if (preselectedUser && currentUser && chats.length > 0) {
            const findOrCreateChat = async () => {
                let existingChat = chats.find(chat => 
                    chat.participants.some(p => p.id === currentUser.id) && 
                    chat.participants.some(p => p.id === preselectedUser.id)
                );

                if (existingChat) {
                    handleSelectChat(existingChat);
                } else {
                     if (!database) return;
                     const newChat = {
                         id: `chat_${new Date().getTime()}`,
                         participants: [currentUser.id, preselectedUser.id],
                         ride: null,
                         last_message: "Nova conversa iniciada.",
                         updated: new Date().toISOString(),
                     };
                     const updatedDb = { ...database, chats: [...database.chats, newChat] };
                     const success = await saveDatabase(updatedDb);
                     if (success) {
                         refreshDatabase(); // This will re-trigger the main useEffect
                         toast({ title: "Nova conversa iniciada" });
                     }
                }
            }
            findOrCreateChat();
            onUserSelect(null); // Reset preselection
        }
    }, [preselectedUser, onUserSelect, chats, currentUser, toast, database, saveDatabase, refreshDatabase]);


    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedChat || !currentUser || !database) return;
        
        const textToSend = newMessage;
        setNewMessage('');

        const newMsg = {
            id: `msg_${new Date().getTime()}`,
            chat: selectedChat.id,
            sender: currentUser.id,
            text: textToSend,
            created: new Date().toISOString()
        };

        const updatedMessages = [...database.messages, newMsg];
        const updatedChats = database.chats.map(c => 
            c.id === selectedChat.id ? { ...c, last_message: textToSend, updated: new Date().toISOString() } : c
        );

        const updatedDb = { ...database, messages: updatedMessages, chats: updatedChats };
        const success = await saveDatabase(updatedDb);
        if (success) {
            refreshDatabase();
        } else {
            setNewMessage(textToSend); // Restore message on failure
        }
    };
    
    const handleGenerateReport = () => {
        if (!selectedUser || messages.length === 0) {
            return;
        }

        const reportHeader = `Histórico de Conversa com ${selectedUser.name}\n`;
        const reportContent = messages.map(msg => {
            const senderName = msg.expand?.sender?.name || 'Desconhecido';
            const timestamp = new Date(msg.created).toLocaleString('pt-BR');
            return `[${timestamp}] ${senderName}: ${msg.text}`;
        }).join('\n');
        
        const fullReport = reportHeader + '-'.repeat(20) + '\n' + reportContent;
        
        const blob = new Blob([fullReport], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `conversa_${selectedUser.name.replace(/\s+/g, '_')}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };


    if (!isClient || isDbLoading || !currentUser) {
        return <div className="flex-1 flex items-center justify-center bg-muted/40 h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>; 
    }

    if (isProfileOpen && selectedUser) {
        return <UserProfile user={selectedUser} onBack={() => setIsProfileOpen(false)} onContact={() => setIsProfileOpen(false)} isModal={false} onUserUpdate={() => { refreshDatabase(); setIsProfileOpen(false); }} />;
    }
    
    const filteredChats = chats.filter(chat => {
        const otherUser = chat.expand.participants.find(p => p.id !== currentUser?.id);
        if (!otherUser) return false;
        return otherUser.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               (otherUser.email && otherUser.email.toLowerCase().includes(searchTerm.toLowerCase()));
    });

    const renderUserList = () => {
        if (isDbLoading) {
            return <div className="p-4 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>
        }
        if (filteredChats.length === 0) {
            return <div className="p-4 text-center text-muted-foreground">Nenhuma conversa encontrada.</div>
        }
        return filteredChats.map((chat) => {
              const otherUser = chat.expand.participants.find(p => p.id !== currentUser?.id);
              if (!otherUser) return null;
              const avatarUrl = getAvatarUrl(otherUser.avatar);
              return (
                <div 
                  key={chat.id} 
                  className={`flex items-center gap-3 p-3 cursor-pointer border-b hover:bg-muted/50 ${selectedChat?.id === chat.id ? 'bg-muted/50' : ''}`}
                  onClick={() => handleSelectChat(chat)}
                >
                  <Avatar>
                    <AvatarImage src={avatarUrl} data-ai-hint="user portrait"/>
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
                  <AvatarImage src={getAvatarUrl(selectedUser.avatar)} data-ai-hint="user portrait"/>
                  <AvatarFallback>{selectedUser.name.substring(0,2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className='flex-1'>
                  <p className="font-semibold">{selectedUser.name}</p>
                  <p className="text-sm text-muted-foreground">{Array.isArray(selectedUser.role) ? selectedUser.role.join(', ') : selectedUser.role}</p>
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
                    <DropdownMenuItem onClick={handleGenerateReport}>
                        <FileText className="mr-2 h-4 w-4"/> Gerar Relatório
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <ScrollArea className="flex-1 p-4 sm:p-6" ref={scrollAreaRef}>
                <div className="flex flex-col gap-4">
                  {messages.map((msg) => {
                     const sender = msg.expand?.sender;
                     const isMe = sender?.id === currentUser?.id;
                     return (
                     <div key={msg.id} className={`flex items-start gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                       <Avatar className="w-8 h-8 border">
                          <AvatarImage src={sender?.avatar ? getAvatarUrl(sender.avatar) : ''} />
                          <AvatarFallback>{sender?.name?.substring(0,2).toUpperCase() || '??'}</AvatarFallback>
                       </Avatar>
                      <div className={`rounded-lg p-3 text-sm shadow-sm max-w-xs ${isMe ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-white rounded-tl-none'}`}>
                           <p className="font-bold">{isMe ? 'Você' : sender?.name}</p>
                          <p>{msg.text}</p>
                      </div>
                  </div>
                  )})}
                </div>
              </ScrollArea>
              <div className="p-4 bg-background border-t">
                  <form onSubmit={handleSendMessage} className="relative">
                      <Input 
                        placeholder="Digite sua mensagem..." 
                        className="pr-12" 
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        disabled={isDbLoading}
                      />
                      <Button type="submit" size="icon" className="absolute top-1/2 -translate-y-1/2 right-2" variant="ghost" disabled={!newMessage.trim() || isDbLoading}>
                          {isDbLoading ? <Loader2 className="w-5 h-5 animate-spin"/> : <Send className="w-5 h-5 text-primary"/>}
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
