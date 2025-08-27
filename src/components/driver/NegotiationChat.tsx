
'use client';

import { useState, type ReactNode, useEffect, useCallback, useRef } from 'react';
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Bot, User, Handshake, Check, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import pb from '@/lib/pocketbase';
import { type RecordModel } from 'pocketbase';
import { ScrollArea } from '../ui/scroll-area';

interface MessageRecord extends RecordModel {
    chat: string;
    sender: string;
    text: string;
    expand: {
        sender: RecordModel;
    }
}

interface RideChatProps {
    children: ReactNode;
    rideId: string;
    chatId: string | null;
    passengerName: string;
    isNegotiation: boolean;
    isReadOnly?: boolean;
    onAcceptRide?: () => void;
}

export function RideChat({ children, rideId, chatId, passengerName, isNegotiation, isReadOnly = false, onAcceptRide }: RideChatProps) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<MessageRecord[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [currentChatId, setCurrentChatId] = useState(chatId);
  const scrollAreaRef = useRef<HTMLDivElement>(null);


  const findOrCreateChat = useCallback(async () => {
    if (!rideId || !pb.authStore.model) return;
    
    // First, try to find an existing chat for the ride
    try {
      const chat = await pb.collection('chats').getFirstListItem(`ride="${rideId}"`);
      setCurrentChatId(chat.id);
      return chat.id;
    } catch(e) {
      // If no chat exists, create one
      try {
        const ride = await pb.collection('rides').getOne(rideId);
        const chatData = {
          participants: [pb.authStore.model.id, ride.passenger],
          ride: rideId
        };
        const newChat = await pb.collection('chats').create(chatData);
        setCurrentChatId(newChat.id);
        return newChat.id;
      } catch(createError) {
        console.error("Failed to create chat:", createError);
        toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível iniciar o chat.' });
        return null;
      }
    }
  }, [rideId, toast]);

  const fetchMessages = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
        const result = await pb.collection('messages').getFullList<MessageRecord>({
            filter: `chat = "${id}"`,
            sort: 'created',
            expand: 'sender'
        });
        setMessages(result);
    } catch (error) {
        console.error("Failed to fetch messages:", error);
        setMessages([]);
    } finally {
        setIsLoading(false);
    }
  }, []);

  const handleOpen = async (open: boolean) => {
      if (open) {
          let id = currentChatId;
          if (!id) {
              id = await findOrCreateChat();
          }
          if (id) {
              fetchMessages(id);
          }
      }
  }

  useEffect(() => {
    if (!currentChatId) return;
    const unsubscribe = pb.collection('messages').subscribe<MessageRecord>('*', e => {
        if (e.action === 'create' && e.record.chat === currentChatId) {
            pb.collection('messages').getOne<MessageRecord>(e.record.id, { expand: 'sender' }).then(fullRecord => {
                setMessages(prev => [...prev, fullRecord]);
            });
        }
    });

    return () => pb.collection('messages').unsubscribe('*');
  }, [currentChatId]);

  useEffect(() => {
      if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
      }
    }, [messages]);


  const handleSendMessage = async () => {
    if (!newMessage.trim() || !pb.authStore.model || !currentChatId) return;
    
    setIsSending(true);
    const text = newMessage;
    setNewMessage(''); // Clear input immediately

    try {
        await pb.collection('messages').create({
            chat: currentChatId,
            sender: pb.authStore.model.id,
            text: text
        });
         await pb.collection('chats').update(currentChatId, {
            last_message: text,
        });

    } catch (error) {
        console.error("Failed to send message:", error);
        toast({ variant: 'destructive', title: 'Erro ao Enviar', description: 'Não foi possível enviar a mensagem.' });
        setNewMessage(text); // Restore message on error
    } finally {
        setIsSending(false);
    }
  }

  const handleAccept = () => {
      toast({
          title: "Oferta Aceita!",
          description: `Você aceitou a corrida de ${passengerName}.`,
      });
      if (onAcceptRide) {
          onAcceptRide();
      }
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
  }

  return (
    <Dialog onOpenChange={handleOpen}>
        <DialogTrigger asChild>
            {children}
        </DialogTrigger>
        <DialogContent className="flex flex-col h-[90vh] max-h-[700px] p-0">
            <DialogHeader className="p-6 pb-0">
                <DialogTitle className="font-headline flex items-center gap-2">
                    <Handshake /> {isNegotiation ? `Negociação com ${passengerName}` : `Chat com ${passengerName}`}
                </DialogTitle>
                <DialogDescription>
                    {isNegotiation ? 'Negocie o valor e finalize o acordo para iniciar a viagem.' : 'Troque mensagens com o passageiro.'}
                </DialogDescription>
            </DialogHeader>
            <CardContent className="flex-grow space-y-4 flex flex-col overflow-y-auto px-4 pt-0">
                <ScrollArea className="flex-1 pr-4 -mr-4" ref={scrollAreaRef}>
                    <div className="space-y-4">
                        {isLoading && <div className="text-center p-8"><Loader2 className="h-6 w-6 animate-spin mx-auto"/></div>}
                        {!isLoading && messages.map((msg) => {
                            const sender = msg.expand.sender;
                            const isMe = sender.id === pb.authStore.model?.id;
                            return (
                                <div key={msg.id} className={`flex items-start gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                                    <Avatar className="w-8 h-8 border">
                                        <AvatarFallback>{sender.name.substring(0,2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div className={`rounded-lg p-3 text-sm shadow-sm max-w-xs ${isMe ? 'bg-primary text-primary-foreground' : 'bg-background'}`}>
                                        <p className="font-bold">{isMe ? 'Você' : sender.name}</p>
                                        <p>{msg.text}</p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </ScrollArea>
            </CardContent>
            {!isReadOnly && (
                <CardFooter className="flex-col items-stretch gap-2 pt-4 border-t">
                    <div className="relative">
                        <Textarea
                        id="driver-message"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Digite sua mensagem..."
                        className="pr-12"
                        rows={1}
                        disabled={isSending}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                            }
                        }}
                        />
                        <Button size="icon" className="absolute top-1/2 -translate-y-1/2 right-2" disabled={!newMessage || isSending} onClick={handleSendMessage}>
                            {isSending ? <Loader2 className="h-4 w-4 animate-spin"/> : <Send className="w-4 h-4"/>}
                            <span className="sr-only">Enviar</span>
                        </Button>
                    </div>
                    {isNegotiation && (
                        <div className="flex gap-2">
                                <Button variant="destructive" className="w-full"><X className="mr-2 h-4 w-4" /> Rejeitar</Button>
                                <Button className="w-full" onClick={handleAccept}><Check className="mr-2 h-4 w-4" /> Aceitar Oferta</Button>
                        </div>
                    )}
                </CardFooter>
            )}
        </DialogContent>
    </Dialog>
  );
}
