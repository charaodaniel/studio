'use client';
import { ScrollArea } from "../ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Separator } from "../ui/separator";
import { MessageSquare } from "lucide-react";
import { RideChat } from "./NegotiationChat";

const chats = [
  { id: '1', passengerName: 'João Passageiro', lastMessage: 'Ok, combinado. Estou a caminho.', timestamp: '10:40', avatar: 'man' },
  { id: '2', passengerName: 'Maria Silva', lastMessage: 'Obrigada pela corrida!', timestamp: 'Ontem', avatar: 'woman' },
  { id: '3', passengerName: 'Lucas Andrade', lastMessage: 'Já estou no local de partida.', timestamp: '23/07/24', avatar: 'person' },
];

export function DriverChatHistory() {
  if (chats.length === 0) {
      return (
          <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8 h-full bg-card rounded-lg">
                <MessageSquare className="h-10 w-10 mb-4" />
                <p className="font-semibold">Nenhuma conversa encontrada</p>
                <p className="text-sm">Seu histórico de conversas com passageiros aparecerá aqui.</p>
          </div>
      )
  }
    
  return (
    <div className="bg-card p-4 rounded-lg">
        <ScrollArea className="h-96 w-full">
            <h3 className="font-headline text-lg font-semibold text-center p-4 pt-0">Suas Conversas</h3>
            <ul className="px-4">
                {chats.map((chat, index) => (
                    <li key={chat.id}>
                        <RideChat 
                            passengerName={chat.passengerName}
                            isNegotiation={false}
                            isReadOnly={true} // Chat history is always read-only
                        >
                             <button className="w-full text-left py-4">
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-12 w-12">
                                        <AvatarImage src={`https://placehold.co/48x48.png`} data-ai-hint={`${chat.avatar} face`} />
                                        <AvatarFallback>{chat.passengerName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center">
                                            <p className="font-semibold">{chat.passengerName}</p>
                                            <p className="text-xs text-muted-foreground">{chat.timestamp}</p>
                                        </div>
                                        <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                                    </div>
                                </div>
                            </button>
                        </RideChat>
                        {index < chats.length - 1 && <Separator />}
                    </li>
                ))}
            </ul>
        </ScrollArea>
    </div>
  );
}
