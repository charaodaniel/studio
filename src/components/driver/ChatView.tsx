
'use client';

import { useState } from 'react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, MoreVertical, ArrowLeft, User as UserIcon } from "lucide-react"
import { ScrollArea } from '../ui/scroll-area';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import type { User } from '../admin/UserList';

type Message = {
    id: number;
    text: string;
    sender: 'me' | 'user';
    timestamp: string;
};

const initialMessages: Record<string, Message[]> = {
    '1': [
        { id: 1, text: "Ok, combinado. Estou a caminho.", sender: 'user', timestamp: '10:40' },
        { id: 2, text: "Perfeito, estou no aguardo!", sender: 'me', timestamp: '10:41' },
    ],
    '2': [
        { id: 1, text: "Obrigada pela corrida!", sender: 'user', timestamp: 'Ontem' },
    ],
};


interface ChatViewProps {
    user: User;
}

export default function ChatView({ user }: ChatViewProps) {
    const [messages, setMessages] = useState(initialMessages);
    const [newMessage, setNewMessage] = useState('');

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !user) return;

        const newMsg: Message = {
            id: Date.now(),
            text: newMessage,
            sender: 'me',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        
        const userMessages = messages[user.id] || [];
        setMessages({
            ...messages,
            [user.id]: [...userMessages, newMsg]
        });

        setNewMessage('');

        // Simulate a reply after a short delay
        setTimeout(() => {
            const replyMsg: Message = {
                id: Date.now() + 1,
                text: "Mensagem recebida.",
                sender: 'user',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prevMessages => ({
                ...prevMessages,
                [user.id]: [...(prevMessages[user.id] || []), replyMsg]
            }));
        }, 1500);
    };

    return (
        <div className="flex flex-1 flex-col bg-muted/40 h-full">
            <div className="p-3 border-b flex items-center gap-3 bg-background shadow-sm">
                <Avatar>
                  <AvatarImage src={user.avatar} data-ai-hint="user portrait"/>
                  <AvatarFallback>{user.name.substring(0,2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className='flex-1'>
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.type}</p>
                </div>
                 <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost"><MoreVertical className="w-5 h-5"/></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <UserIcon className="mr-2 h-4 w-4"/> Ver Perfil
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <ScrollArea className="flex-1 p-4 sm:p-6 bg-[url('https://placehold.co/1000x1000/E3F2FD/E3F2FD.png')] bg-center bg-cover">
                <div className="flex flex-col gap-4">
                  {(messages[user.id] || []).map((msg) => (
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
        </div>
    )
}
