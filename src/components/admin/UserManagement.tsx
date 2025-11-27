
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
import { auth, db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, doc, updateDoc, onSnapshot, orderBy, serverTimestamp, getDoc } from 'firebase/firestore';
import type { User as UserData } from './UserList';


interface ChatRecord {
  id: string;
  participants: string[];
  last_message: string;
  updatedAt: any; // Firestore Timestamp
  expand: {
    participants: UserData[];
  }
}

interface MessageRecord {
    id: string;
    chat: string;
    sender: string;
    text: string;
    createdAt: any; // Firestore Timestamp
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
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [selectedChat, setSelectedChat] = useState<ChatRecord | null>(null);
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
    const [messages, setMessages] = useState<MessageRecord[]>([]);
    const [newMessage, setNewMessage] = useState('');
    
    const [searchTerm, setSearchTerm] = useState('');
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const currentUser = auth.currentUser;


    const fetchChats = useCallback(async () => {
        if (!currentUser) return;
        setIsLoading(true);
        setError(null);

        const q = query(collection(db, "chats"), where("participants", "array-contains", currentUser.uid), orderBy("updatedAt", "desc"));
        
        const unsubscribe = onSnapshot(q, async (querySnapshot) => {
            try {
                const chatsData: ChatRecord[] = [];
                for (const chatDoc of querySnapshot.docs) {
                    const data = chatDoc.data();
                    const participantsData: UserData[] = [];

                    for (const participantId of data.participants) {
                        const userDoc = await getDoc(doc(db, 'users', participantId));
                        if (userDoc.exists()) {
                            participantsData.push({ id: userDoc.id, ...userDoc.data() } as UserData);
                        }
                    }
                    
                    chatsData.push({
                        id: chatDoc.id,
                        participants: data.participants,
                        last_message: data.last_message,
                        updatedAt: data.updatedAt,
                        expand: {
                            participants: participantsData,
                        },
                    });
                }
                setChats(chatsData);

            } catch (err) {
                console.error("Failed to process chat updates:", err);
                setError("Não foi possível carregar as conversas.");
                setChats([]);
            } finally {
                setIsLoading(false);
            }
        }, (err) => {
            console.error("Failed to fetch chats:", err);
            setError("Não foi possível carregar as conversas.");
            setIsLoading(false);
        });

        return unsubscribe;
    }, [currentUser]);


    useEffect(() => {
        setIsClient(true);
        let unsubscribe: (() => void) | undefined;
        fetchChats().then(cb => unsubscribe = cb);
        
        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };

    }, [fetchChats]);

    const fetchMessages = useCallback(async (chatId: string) => {
        // Now handled by onSnapshot in useEffect
    }, []);

    useEffect(() => {
        if (!selectedChat) return;

        const q = query(collection(db, "messages"), where("chat", "==", selectedChat.id), orderBy("createdAt", "asc"));
        
        const unsubscribe = onSnapshot(q, async (querySnapshot) => {
            const newMessages: MessageRecord[] = [];
            for (const messageDoc of querySnapshot.docs) {
                const data = messageDoc.data();
                const senderDocRef = doc(db, 'users', data.sender);
                const senderSnap = await getDoc(senderDocRef);
                newMessages.push({
                    id: messageDoc.id,
                    ...data,
                    expand: {
                        sender: { id: senderSnap.id, ...senderSnap.data() } as UserData
                    }
                } as MessageRecord);
            }
            setMessages(newMessages);
        });
        
        return () => unsubscribe();
    }, [selectedChat]);

    useEffect(() => {
      if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
      }
    }, [messages]);

    const handleSelectChat = (chat: ChatRecord) => {
        setSelectedChat(chat);
        const otherUser = chat.expand.participants.find(p => p.id !== currentUser?.uid);
        setSelectedUser(otherUser || null);
        setIsProfileOpen(false);
    }
    
    useEffect(() => {
        if (preselectedUser && currentUser) {
            const findOrCreateChat = async () => {
                try {
                    const q = query(collection(db, "chats"), where("participants", "in", [[currentUser.uid, preselectedUser.id], [preselectedUser.id, currentUser.uid]]));
                    const querySnapshot = await getDocs(q);

                    if (!querySnapshot.empty) {
                        const existingChat = { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() } as ChatRecord;
                        // We need to expand participants manually
                        const participantsData: UserData[] = [];
                        for (const participantId of existingChat.participants) {
                            const userDoc = await getDoc(doc(db, 'users', participantId));
                            if (userDoc.exists()) participantsData.push({ id: userDoc.id, ...userDoc.data() } as UserData);
                        }
                        existingChat.expand = { participants: participantsData };
                        handleSelectChat(existingChat);
                    } else {
                        const newChatRef = await addDoc(collection(db, "chats"), {
                            participants: [currentUser.uid, preselectedUser.id],
                            last_message: '',
                            updatedAt: serverTimestamp(),
                        });
                        const newChatDoc = await getDoc(newChatRef);
                        const newChatData = { id: newChatDoc.id, ...newChatDoc.data() } as ChatRecord;
                        // Expand participants
                        const participantsData: UserData[] = [];
                        for (const participantId of newChatData.participants) {
                            const userDoc = await getDoc(doc(db, 'users', participantId));
                            if (userDoc.exists()) participantsData.push({ id: userDoc.id, ...userDoc.data() } as UserData);
                        }
                        newChatData.expand = { participants: participantsData };

                        handleSelectChat(newChatData);
                        fetchChats(); // Refresh the list
                    }
                } catch (error) {
                     console.error("Error finding or creating chat:", error);
                }
            }
            findOrCreateChat();
            onUserSelect(null); // Reset preselection
        }
    }, [preselectedUser, onUserSelect, fetchChats, currentUser]);


    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedChat || !currentUser) return;

        const text = newMessage;
        setNewMessage(''); // Clear input immediately

        try {
            await addDoc(collection(db, 'messages'), {
                chat: selectedChat.id,
                sender: currentUser.uid,
                text: text,
                createdAt: serverTimestamp(),
            });
             await updateDoc(doc(db, 'chats', selectedChat.id), {
                last_message: text,
                updatedAt: serverTimestamp(),
            });

        } catch (error) {
            console.error("Failed to send message:", error);
        }
    };
    
    const handleGenerateReport = () => {
        if (!selectedUser || messages.length === 0) {
            return;
        }

        const reportHeader = `Histórico de Conversa com ${selectedUser.name}\n`;
        const reportContent = messages.map(msg => {
            const senderName = msg.expand?.sender?.name || 'Desconhecido';
            const timestamp = msg.createdAt ? new Date(msg.createdAt.toDate()).toLocaleString('pt-BR') : 'Data Indisponível';
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


    if (!isClient) {
        return <div className="flex-1 flex items-center justify-center bg-muted/40 h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>; 
    }

    if (isProfileOpen && selectedUser) {
        return <UserProfile user={selectedUser} onBack={() => setIsProfileOpen(false)} onContact={() => setIsProfileOpen(false)} isModal={false} />;
    }
    
    const filteredChats = chats.filter(chat => {
        const otherUser = chat.expand.participants.find(p => p.id !== currentUser?.uid);
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
              const otherUser = chat.expand.participants.find(p => p.id !== currentUser?.uid);
              if (!otherUser) return null;
              return (
                <div 
                  key={chat.id} 
                  className={`flex items-center gap-3 p-3 cursor-pointer border-b hover:bg-muted/50 ${selectedChat?.id === chat.id ? 'bg-muted/50' : ''}`}
                  onClick={() => handleSelectChat(chat)}
                >
                  <Avatar>
                    <AvatarImage src={otherUser.avatar || ''} data-ai-hint="user portrait"/>
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
                  <AvatarImage src={selectedUser.avatar || ''} data-ai-hint="user portrait"/>
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
                  {messages.map((msg) => (
                     <div key={msg.id} className={`flex items-start gap-3 ${msg.sender === currentUser?.uid ? 'flex-row-reverse' : ''}`}>
                       <Avatar className="w-8 h-8 border">
                          <AvatarFallback>{msg.expand.sender?.name?.substring(0,2).toUpperCase() || '??'}</AvatarFallback>
                       </Avatar>
                      <div className={`rounded-lg p-3 text-sm shadow-sm max-w-xs ${msg.sender === currentUser?.uid ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-white rounded-tl-none'}`}>
                           <p className="font-bold">{msg.sender === currentUser?.uid ? 'Você' : msg.expand.sender.name}</p>
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
