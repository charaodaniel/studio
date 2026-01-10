
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Send, MoreVertical, ArrowLeft, FileText, User, MessageSquare, Loader2, Info } from "lucide-react"
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '../ui/dropdown-menu';
import UserProfile from './UserProfile';
import type { User as UserData } from './UserList';
import { useToast } from '@/hooks/use-toast';
import pb from '@/lib/pocketbase';
import type { RecordModel } from 'pocketbase';

const getAvatarUrl = (record: RecordModel, avatarFileName: string) => {
    if (!record || !avatarFileName) return '';
    return pb.getFileUrl(record, avatarFileName);
};

interface ChatRecord extends RecordModel {
  participants: string[];
  last_message: string;
  updated: string;
  ride: string;
  expand: {
    participants: UserData[];
  }
}

interface MessageRecord extends RecordModel {
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
    const [chats, setChats] = useState<ChatRecord[]>([]);
    const [selectedChat, setSelectedChat] = useState<ChatRecord | null>(null);
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
    const [messages, setMessages] = useState<MessageRecord[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isDbLoading, setIsDbLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [allUsers, setAllUsers] = useState<UserData[]>([]);
    
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();
    
    const currentUser = pb.authStore.model as UserData | null;

    const fetchInitialData = useCallback(async () => {
        if (!currentUser) return;
        setIsDbLoading(true);
        try {
            const [chatRecords, userRecords] = await Promise.all([
                pb.collection('chats').getFullList<ChatRecord>({ expand: 'participants', sort: '-updated' }),
                pb.collection('users').getFullList<UserData>()
            ]);
            setChats(chatRecords.filter(c => c.participants.includes(currentUser.id)));
            setAllUsers(userRecords);
        } catch (error) {
            toast({ variant: 'destructive', title: "Erro ao carregar dados", description: "Não foi possível buscar as conversas e usuários." });
        } finally {
            setIsDbLoading(false);
        }
    }, [currentUser, toast]);
    
    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);
    
    useEffect(() => {
      if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
      }
    }, [messages]);

    const fetchMessages = useCallback(async (chatId: string) => {
        setMessages([]);
        try {
            const chatMessages = await pb.collection('messages').getFullList<MessageRecord>({
                filter: `chat = "${chatId}"`,
                sort: 'created',
                expand: 'sender'
            });
            setMessages(chatMessages);
        } catch (error) {
            toast({ variant: 'destructive', title: "Erro", description: "Não foi possível carregar as mensagens." });
        }
    }, [toast]);


    const handleSelectChat = useCallback((chat: ChatRecord) => {
        setSelectedChat(chat);
        const otherUser = chat.expand.participants.find(p => p.id !== currentUser?.id);
        setSelectedUser(otherUser || null);
        fetchMessages(chat.id);
        setIsProfileOpen(false);
    }, [currentUser, fetchMessages]);

    
    useEffect(() => {
        if (preselectedUser && currentUser && chats) {
            const findOrCreateChat = async () => {
                let existingChat = chats.find(chat => 
                    chat.participants.includes(currentUser.id) && 
                    chat.participants.includes(preselectedUser.id)
                );

                if (existingChat) {
                    handleSelectChat(existingChat);
                } else {
                     const newChatData = {
                         participants: [currentUser.id, preselectedUser.id],
                         last_message: "Nova conversa iniciada.",
                     };
                     
                     try {
                        const newChat = await pb.collection('chats').create<ChatRecord>(newChatData, { expand: 'participants' });
                        setChats(prev => [newChat, ...prev]);
                        handleSelectChat(newChat);
                         toast({ 
                            title: "Nova conversa iniciada",
                            description: `Conversa com ${preselectedUser.name} foi criada.`,
                        });
                     } catch (error) {
                        toast({ variant: 'destructive', title: "Erro", description: "Não foi possível criar a conversa." });
                     }
                }
            }
            findOrCreateChat();
            onUserSelect(null); // Reset preselection
        }
    }, [preselectedUser, onUserSelect, chats, currentUser, toast, handleSelectChat]);


    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedChat || !currentUser) return;
        
        setIsSending(true);
        const textToSend = newMessage;
        setNewMessage('');
        
        try {
            const newMsgRecord = await pb.collection('messages').create({
                chat: selectedChat.id,
                sender: currentUser.id,
                text: textToSend,
            }, { expand: 'sender' });
            
            // Optimistic UI update
            setMessages(prev => [...prev, newMsgRecord as MessageRecord]);

            await pb.collection('chats').update(selectedChat.id, { 'last_message+': textToSend });

        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível enviar a mensagem.' });
            setNewMessage(textToSend); // Revert input on error
        } finally {
            setIsSending(false);
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

    if (isDbLoading) {
        return <div className="flex-1 flex items-center justify-center bg-muted/40 h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>; 
    }
    
    if (isProfileOpen && selectedUser) {
        return <UserProfile user={selectedUser} onBack={() => setIsProfileOpen(false)} onContact={() => setIsProfileOpen(false)} onUserUpdate={() => { fetchInitialData(); setIsProfileOpen(false); }} />;
    }

    const filteredChats = chats.filter(({ expand }) => {
        const otherUser = expand.participants.find(p => p.id !== currentUser?.id);
        if (!otherUser) return false;
        return otherUser.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               (otherUser.email && otherUser.email.toLowerCase().includes(searchTerm.toLowerCase()));
    }).sort((a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime());

    const renderUserList = () => {
        if (filteredChats.length === 0) {
            return <div className="p-4 text-center text-muted-foreground">Nenhuma conversa encontrada.</div>
        }
        return filteredChats.map((chat) => {
              const otherUser = chat.expand.participants.find(p => p.id !== currentUser?.id);
              if (!otherUser) return null;
              const avatarUrl = getAvatarUrl(otherUser, otherUser.avatar);
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
            <div className="flex justify-between items-center my-2">
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
                  <AvatarImage src={getAvatarUrl(selectedUser, selectedUser.avatar)} data-ai-hint="user portrait"/>
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
                          <AvatarImage src={sender?.avatar ? getAvatarUrl(sender, sender.avatar) : ''} />
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
                        disabled={isSending}
                      />
                      <Button type="submit" size="icon" className="absolute top-1/2 -translate-y-1/2 right-2" variant="ghost" disabled={!newMessage.trim() || isSending}>
                        {isSending ? <Loader2 className="h-4 w-4 animate-spin"/> : <Send className="w-5 h-5 text-primary"/>}
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
