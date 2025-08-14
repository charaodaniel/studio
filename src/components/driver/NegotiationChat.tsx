'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { negotiateIntercityFare } from '@/ai/flows/fare-negotiation-tool';
import { Wand2, Send, Bot, User, Handshake, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import { Avatar, AvatarFallback } from '../ui/avatar';
import type { RideRequest } from './RideRequests';

interface NegotiationChatProps {
    request: RideRequest;
}

export default function NegotiationChat({ request }: NegotiationChatProps) {
  const [driverMessage, setDriverMessage] = useState('');
  const [passengerMessage, setPassengerMessage] = useState(`Acho ${request.driverSuggestion} um pouco caro. Consegue fazer por ${request.passengerOffer}?`);
  const [suggestedPhrases, setSuggestedPhrases] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGetSuggestions = async () => {
    setIsLoading(true);
    setSuggestedPhrases([]);
    try {
      const response = await negotiateIntercityFare({
        passengerMessage,
        driverMessage,
        initialFare: 100, // Assuming static values for now
        suggestedFare: 80,
      });
      setSuggestedPhrases(response.suggestedPhrases);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Erro de IA',
        description: 'Não foi possível obter sugestões. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <Handshake /> {request.title}
        </CardTitle>
        <CardDescription>
            Oferta do passageiro: <span className="font-bold text-foreground">{request.passengerOffer}</span> |
            Sua sugestão: <span className="font-bold text-foreground">{request.driverSuggestion}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-4 flex flex-col">
        <div className="border rounded-lg p-4 space-y-4 h-64 overflow-y-auto flex-grow bg-muted/20">
            <div className="flex items-start gap-3">
                <Avatar className="w-8 h-8 border">
                    <AvatarFallback><User /></AvatarFallback>
                </Avatar>
                <div className="bg-background rounded-lg p-3 text-sm shadow-sm max-w-xs">
                    <p className="font-bold text-primary">Passageiro</p>
                    <p>{passengerMessage}</p>
                </div>
            </div>
            {driverMessage && (
                 <div className="flex items-start gap-3 flex-row-reverse">
                    <Avatar className="w-8 h-8 border">
                        <AvatarFallback><Bot /></AvatarFallback>
                    </Avatar>
                    <div className="bg-primary text-primary-foreground rounded-lg p-3 text-sm shadow-sm max-w-xs">
                        <p className="font-bold">Você</p>
                        <p>{driverMessage}</p>
                    </div>
                </div>
            )}
        </div>
        
        {suggestedPhrases.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Sugestões da IA:</h4>
            <div className="flex flex-wrap gap-2">
            {suggestedPhrases.map((phrase, index) => (
              <Badge
                key={index}
                variant="outline"
                className="p-2 cursor-pointer hover:bg-secondary"
                onClick={() => setDriverMessage(phrase)}
              >
                {phrase}
              </Badge>
            ))}
            </div>
          </div>
        )}

        {isLoading && (
            <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-2/3" />
            </div>
        )}
        
      </CardContent>
      <CardFooter className="flex-col items-stretch gap-2 pt-4">
        <Button onClick={handleGetSuggestions} disabled={isLoading} className="w-full bg-accent hover:bg-accent/90">
          <Wand2 className="mr-2 h-4 w-4" /> {isLoading ? 'Gerando...' : 'Obter Sugestões da IA'}
        </Button>
         <div className="relative">
            <Textarea
              id="driver-message"
              value={driverMessage}
              onChange={(e) => setDriverMessage(e.target.value)}
              placeholder="Digite sua contra-proposta..."
              className="pr-12"
              rows={1}
            />
            <Button size="icon" className="absolute top-1/2 -translate-y-1/2 right-2" disabled={!driverMessage}>
                <Send className="w-4 h-4"/>
                <span className="sr-only">Enviar</span>
            </Button>
          </div>
           <div className="flex gap-2">
                <Button className="w-full"><Check className="mr-2 h-4 w-4" /> Aceitar Oferta</Button>
                <Button variant="destructive" className="w-full"><X className="mr-2 h-4 w-4" /> Rejeitar</Button>
            </div>
      </CardFooter>
    </Card>
  );
}

// Add this type definition
export interface RideRequest {
    id: number;
    title: string;
    description: string;
    type: string;
    from: string;
    to: string;
    price: string | null;
    passengerOffer: string | null;
    driverSuggestion: string | null;
}
