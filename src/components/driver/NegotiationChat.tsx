'use client';

import { useState, type ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Bot, User, Handshake, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';

interface RideChatProps {
    children: ReactNode;
    passengerName: string;
    isNegotiation: boolean;
    isReadOnly?: boolean;
    onAcceptRide?: () => void;
}

export function RideChat({ children, passengerName, isNegotiation, isReadOnly = false, onAcceptRide }: RideChatProps) {
  const { toast } = useToast();
  const [messages, setMessages] = useState([
      { sender: 'user', text: isNegotiation ? `Acho R$ 100,00 um pouco caro. Consegue fazer por R$ 80,00?` : 'Ok, combinado. Estou a caminho.' },
  ]);
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    setMessages(prev => [...prev, { sender: 'me', text: newMessage }]);
    setNewMessage('');
    
    setTimeout(() => {
        setMessages(prev => [...prev, { sender: 'user', text: "Ok, entendi." }]);
    }, 1500)
  }

  const handleAccept = () => {
      toast({
          title: "Oferta Aceita!",
          description: `Você aceitou a corrida de ${passengerName}.`,
      });
      if (onAcceptRide) {
          onAcceptRide();
      }
      // This is a way to programmatically close the dialog.
      // In a real app with controlled state, you'd pass a setter function.
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
  }

  return (
    <Dialog>
        <DialogTrigger asChild>
            {children}
        </DialogTrigger>
        <DialogContent className="flex flex-col h-[90vh] max-h-[700px] p-0">
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                <Handshake /> {isNegotiation ? `Negociação com ${passengerName}` : `Chat com ${passengerName}`}
                </CardTitle>
                <CardDescription>
                    {isNegotiation ? 'Negocie o valor e finalize o acordo para iniciar a viagem.' : 'Troque mensagens com o passageiro.'}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-4 flex flex-col overflow-y-auto px-4">
                <div className="space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-start gap-3 ${msg.sender === 'me' ? 'flex-row-reverse' : ''}`}>
                            <Avatar className="w-8 h-8 border">
                                <AvatarFallback>{msg.sender === 'me' ? <Bot /> : <User />}</AvatarFallback>
                            </Avatar>
                            <div className={`rounded-lg p-3 text-sm shadow-sm max-w-xs ${msg.sender === 'me' ? 'bg-primary text-primary-foreground' : 'bg-background'}`}>
                                <p className="font-bold text-primary">{msg.sender === 'me' ? 'Você' : passengerName}</p>
                                <p>{msg.text}</p>
                            </div>
                        </div>
                    ))}
                </div>
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
                        />
                        <Button size="icon" className="absolute top-1/2 -translate-y-1/2 right-2" disabled={!newMessage} onClick={handleSendMessage}>
                            <Send className="w-4 h-4"/>
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
