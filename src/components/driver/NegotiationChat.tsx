

'use client';

import { useState, type ReactNode, useEffect, useCallback, useRef } from 'react';
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Handshake, Check, X, Loader2, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { ScrollArea } from '../ui/scroll-area';
import { Input } from '../ui/input';
import { useNotificationSound } from '@/hooks/useNotificationSound';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, doc, getDoc, updateDoc, onSnapshot, orderBy, serverTimestamp, Timestamp } from 'firebase/firestore';
import type { User } from '../admin/UserList';

interface MessageRecord {
    id: string;
    chat: string;
    sender: string;
    text: string;
    createdAt: Timestamp;
    expand: {
        sender: User;
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
  const { playNotification } = useNotificationSound();
  const [messages, setMessages] = useState<MessageRecord[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [currentChatId, setCurrentChatId] = useState(chatId);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [proposedFare, setProposedFare] = useState('');
  const [isPassenger, setIsPassenger] = useState(false);
  const currentUser = auth.currentUser;

  useEffect(() => {
    const checkUserRole = async () => {
        if(currentUser) {
            const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
            if (userDoc.exists() && userDoc.data().role.includes('Passageiro')) {
                setIsPassenger(true);
            }
        }
    }
    checkUserRole();
  }, [currentUser]);


  const findOrCreateChat = useCallback(async () => {
    if (!rideId || !currentUser) return null;
    
    try {
      const q = query(collection(db, "chats"), where("rideId", "==", rideId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const chatDoc = querySnapshot.docs[0];
        setCurrentChatId(chatDoc.id);
        return chatDoc.id;
      } else {
        const rideDoc = await getDoc(doc(db, 'rides', rideId));
        const rideData = rideDoc.data();
        if (!rideData?.passenger) {
             toast({ variant: 'destructive', title: 'Erro', description: 'Esta corrida não tem um passageiro definido.' });
             return null;
        }
        const chatData = {
          participants: [currentUser.uid, rideData.passenger],
          rideId: rideId,
          lastMessage: '',
          updatedAt: serverTimestamp(),
        };
        const newChatRef = await addDoc(collection(db, "chats"), chatData);
        setCurrentChatId(newChatRef.id);
        return newChatRef.id;
      }
    } catch(createError) {
        console.error("Failed to create/find chat:", createError);
        toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível iniciar o chat.' });
        return null;
    }
  }, [rideId, toast, currentUser]);

  const fetchMessages = useCallback(async (id: string | null) => {
    setIsLoading(true);
    if (!id) {
        setMessages([]);
        setIsLoading(false);
        return;
    }
    // This will be handled by the onSnapshot listener
    setIsLoading(false);
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

    const q = query(collection(db, "messages"), where("chat", "==", currentChatId), orderBy("createdAt", "asc"));
    
    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
        const newMessages: MessageRecord[] = [];
        for (const messageDoc of querySnapshot.docs) {
            const data = messageDoc.data();
            const senderDoc = await getDoc(doc(db, 'users', data.sender));
            newMessages.push({
                id: messageDoc.id,
                ...data,
                expand: {
                    sender: { id: senderDoc.id, ...senderDoc.data() } as User
                }
            } as MessageRecord);
        }

        if (newMessages.length > messages.length && messages.length > 0) {
            playNotification();
        }

        setMessages(newMessages);
    });

    return () => {
        unsubscribe();
    };

  }, [currentChatId, playNotification, messages.length]);

  useEffect(() => {
      if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
      }
    }, [messages]);


  const sendMessage = async (text: string) => {
    if (!text.trim() || !currentUser || !currentChatId) return;

    setIsSending(true);

    try {
        await addDoc(collection(db, "messages"), {
            chat: currentChatId,
            sender: currentUser.uid,
            text: text,
            createdAt: serverTimestamp(),
        });

        await updateDoc(doc(db, "chats", currentChatId), {
            lastMessage: text,
            updatedAt: serverTimestamp(),
        });

    } catch (error) {
        console.error("Failed to send message:", error);
        toast({ variant: 'destructive', title: 'Erro ao Enviar', description: 'Não foi possível enviar a mensagem.' });
    } finally {
        setIsSending(false);
    }
  }

  const handleSendTextMessage = async () => {
      await sendMessage(newMessage);
      setNewMessage('');
  }
  
  const handleSendFareProposal = async () => {
    const fareValue = parseFloat(proposedFare);
    if (isNaN(fareValue) || fareValue <= 0) {
        toast({ variant: 'destructive', title: 'Valor Inválido', description: 'Por favor, insira um valor numérico positivo.'});
        return;
    }
    
    setIsSending(true);
    try {
        // Update ride fare, but don't accept it yet.
        await updateDoc(doc(db, 'rides', rideId), { fare: fareValue });
        
        // Send a message to the chat
        const proposalMessage = `Proposta de R$ ${fareValue.toFixed(2).replace('.',',')} enviada. Aguardando aceite do passageiro.`;
        await sendMessage(proposalMessage);

        toast({ title: 'Proposta Enviada!', description: 'Sua proposta foi enviada ao passageiro.' });
        setProposedFare('');
    } catch(error) {
        console.error("Failed to send fare proposal:", error);
        toast({ variant: 'destructive', title: 'Erro ao Enviar Proposta', description: 'Tente novamente.' });
    } finally {
        setIsSending(false);
    }
  };


  const handleAccept = async () => {
    try {
        if (isPassenger) {
            await updateDoc(doc(db, 'rides', rideId), {
                status: 'accepted',
            });
             toast({ title: "Proposta Aceita!", description: `Aguarde o motorista iniciar a viagem.` });
        } else { // Driver accepts
            if (onAcceptRide) {
                onAcceptRide();
            }
        }
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    } catch (error) {
        console.error("Error accepting ride/proposal:", error);
        toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível completar a ação.' });
    }
  }

  const handleReject = async () => {
      toast({ variant: "destructive", title: "Ação realizada", description: "A proposta/corrida foi rejeitada." });
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
                            const isMe = sender.id === currentUser?.uid;
                            return (
                                <div key={msg.id} className={`flex items-start gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                                    <Avatar className="w-8 h-8 border">
                                        <AvatarFallback>{sender.name?.substring(0,2).toUpperCase() || '??'}</AvatarFallback>
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
                     {isNegotiation && !isPassenger && (
                        <div className="flex gap-2">
                           <div className="relative flex-grow">
                             <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                             <Input 
                                type="number" 
                                placeholder="Valor (R$)" 
                                className="pl-9"
                                value={proposedFare}
                                onChange={(e) => setProposedFare(e.target.value)}
                                disabled={isSending}
                             />
                           </div>
                           <Button onClick={handleSendFareProposal} disabled={!proposedFare || isSending}>
                             {isSending ? <Loader2 className="h-4 w-4 animate-spin"/> : <Send className="w-4 h-4"/>}
                              <span className="hidden sm:inline ml-2">Propor</span>
                           </Button>
                        </div>
                    )}
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
                                handleSendTextMessage();
                            }
                        }}
                        />
                        <Button size="icon" className="absolute top-1/2 -translate-y-1/2 right-2" disabled={!newMessage || isSending} onClick={handleSendTextMessage}>
                            {isSending ? <Loader2 className="h-4 w-4 animate-spin"/> : <Send className="w-4 w-4"/>}
                            <span className="sr-only">Enviar</span>
                        </Button>
                    </div>
                    {isNegotiation && (
                        <div className="flex gap-2">
                                <Button variant="destructive" className="w-full" onClick={handleReject}><X className="mr-2 h-4 w-4" /> Rejeitar</Button>
                                <Button className="w-full" onClick={handleAccept}><Check className="mr-2 h-4 w-4" /> Aceitar Oferta</Button>
                        </div>
                    )}
                </CardFooter>
            )}
        </DialogContent>
    </Dialog>
  );
}
