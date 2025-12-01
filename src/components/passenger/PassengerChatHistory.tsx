
'use client';
import { ScrollArea } from "../ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Separator } from "../ui/separator";
import { MessageSquare, WifiOff, Loader2 } from "lucide-react";
import { RideChat } from "../driver/NegotiationChat";
import { useState, useEffect, useCallback } from "react";
import { User } from "../admin/UserList";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, getDoc, doc } from 'firebase/firestore';


interface ChatRecord {
  id: string;
  participants: string[];
  last_message: string;
  ride: string;
  updatedAt: any;
  expand: {
    participants: User[];
  }
}

export function PassengerChatHistory() {
  const [chats, setChats] = useState<ChatRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChats = useCallback(async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
        setIsLoading(false);
        return;
    };
    setIsLoading(true);
    setError(null);

    const q = query(collection(db, "chats"), where("participants", "array-contains", currentUser.uid));
    
    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
        try {
            const chatsData: ChatRecord[] = [];
            for (const chatDoc of querySnapshot.docs) {
                const data = chatDoc.data();
                const participantsData: User[] = [];

                for (const participantId of data.participants) {
                    const userDoc = await getDoc(doc(db, 'users', participantId));
                    if (userDoc.exists()) {
                        participantsData.push({ id: userDoc.id, ...userDoc.data() } as User);
                    }
                }
                
                chatsData.push({
                    id: chatDoc.id,
                    participants: data.participants,
                    last_message: data.last_message,
                    ride: data.ride,
                    updatedAt: data.updatedAt,
                    expand: {
                        participants: participantsData,
                    },
                });
            }
            
            chatsData.sort((a, b) => b.updatedAt?.toMillis() - a.updatedAt?.toMillis());
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
  }, []);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    const authUnsubscribe = auth.onAuthStateChanged((user) => {
        if (user) {
            fetchChats().then(cb => unsubscribe = cb);
        } else {
            setIsLoading(false);
            setChats([]);
        }
    });

    return () => {
        authUnsubscribe();
        if (unsubscribe) {
            unsubscribe();
        }
    };
  }, [fetchChats]);

  const renderContent = () => {
    if (isLoading) {
        return <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
    }
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center text-center text-destructive p-8 h-full">
                <WifiOff className="h-10 w-10 mb-4" />
                <p className="font-semibold">Erro de Conexão</p>
                <p className="text-sm">{error}</p>
            </div>
        );
    }
    if (chats.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8 h-full bg-card rounded-lg">
                  <MessageSquare className="h-10 w-10 mb-4" />
                  <p className="font-semibold">Nenhuma conversa encontrada</p>
                  <p className="text-sm">Seu histórico de conversas com motoristas aparecerá aqui.</p>
            </div>
        )
    }
    return (
        <ul className="px-4">
            {chats.map((chat, index) => {
                const otherUser = chat.expand.participants.find(p => p.id !== auth.currentUser?.uid);
                if (!otherUser) return null;

                const avatarUrl = otherUser.avatar;

                return (
                    <li key={chat.id}>
                        <RideChat 
                            chatId={chat.id}
                            rideId={chat.ride} // Assuming ride id is stored in chat
                            passengerName={otherUser.name} // This will be driver's name from passenger's perspective
                            isNegotiation={false}
                        >
                            <button className="w-full text-left py-4">
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-12 w-12">
                                        <AvatarImage src={avatarUrl} data-ai-hint={`${otherUser.role} face`} />
                                        <AvatarFallback>{otherUser.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center">
                                            <p className="font-semibold">{otherUser.name}</p>
                                            <p className="text-xs text-muted-foreground">{chat.updatedAt ? new Date(chat.updatedAt.toDate()).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ''}</p>
                                        </div>
                                        <p className="text-sm text-muted-foreground truncate">{chat.last_message || 'Nenhuma mensagem.'}</p>
                                    </div>
                                </div>
                            </button>
                        </RideChat>
                        {index < chats.length - 1 && <Separator />}
                    </li>
                )
            })}
        </ul>
    );
  }
    
  return (
    <div className="bg-card p-4 rounded-lg">
        <ScrollArea className="h-96 w-full">
            {renderContent()}
        </ScrollArea>
    </div>
  );
}
