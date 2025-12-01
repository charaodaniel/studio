

'use client';
import { ScrollArea } from "../ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Separator } from "../ui/separator";
import { MessageSquare, WifiOff, Loader2 } from "lucide-react";
import pb from "@/lib/pocketbase";
import { RideChat } from "../driver/NegotiationChat";
import { useState, useEffect, useCallback } from "react";
import type { RecordModel } from "pocketbase";
import { User } from "../admin/UserList";

interface ChatRecord extends RecordModel {
  participants: string[];
  lastMessage: string;
  rideId: string;
  expand: {
    participants: User[];
  }
}

export function PassengerChatHistory() {
  const [chats, setChats] = useState<ChatRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChats = useCallback(async () => {
    if (!pb.authStore.isValid) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await pb.collection('chats').getFullList({
        filter: `participants.id ?= "${pb.authStore.model?.id}"`,
        sort: '-updated',
        expand: 'participants'
      });
      setChats(result as unknown as ChatRecord[]);
    } catch(err: any) {
      setError('Não foi possível carregar as conversas.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChats();
    const unsubscribe = pb.collection('chats').subscribe('*', e => {
        if(e.record.participants.includes(pb.authStore.model?.id)) {
            fetchChats();
        }
    });
    return () => {
      pb.collection('chats').unsubscribe();
    }
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
                const otherUser = chat.expand.participants.find(p => p.id !== pb.authStore.model?.id);
                if (!otherUser) return null;

                const avatarUrl = otherUser.avatar ? pb.getFileUrl(otherUser, otherUser.avatar, { 'thumb': '100x100' }) : '';

                return (
                    <li key={chat.id}>
                        <RideChat 
                            chatId={chat.id}
                            rideId={chat.rideId} // Assuming ride id is stored in chat
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
                                            <p className="text-xs text-muted-foreground">{new Date(chat.updated).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                        <p className="text-sm text-muted-foreground truncate">{chat.lastMessage || 'Nenhuma mensagem.'}</p>
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
