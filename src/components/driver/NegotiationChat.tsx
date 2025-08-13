'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { negotiateIntercityFare } from '@/ai/flows/fare-negotiation-tool';
import { Wand2, Send, Bot, User, Handshake } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import { Avatar, AvatarFallback } from '../ui/avatar';

export default function NegotiationChat() {
  const [driverMessage, setDriverMessage] = useState('');
  const [passengerMessage, setPassengerMessage] = useState("Acho R$100 um pouco caro. Consegue fazer por R$80?");
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
        initialFare: 100,
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
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <Handshake /> Chat de Negociação
        </CardTitle>
        <CardDescription>Use a IA para te ajudar a negociar a melhor tarifa com o passageiro.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border rounded-lg p-4 space-y-4 h-64 overflow-y-auto">
            <div className="flex items-start gap-3">
                <Avatar className="w-8 h-8 border">
                    <AvatarFallback><User /></AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-lg p-3 text-sm">
                    <p className="font-bold">Passageiro</p>
                    <p>{passengerMessage}</p>
                </div>
            </div>
            {driverMessage && (
                 <div className="flex items-start gap-3 flex-row-reverse">
                    <Avatar className="w-8 h-8 border">
                        <AvatarFallback><Bot /></AvatarFallback>
                    </Avatar>
                    <div className="bg-primary text-primary-foreground rounded-lg p-3 text-sm">
                        <p className="font-bold">Você</p>
                        <p>{driverMessage}</p>
                    </div>
                </div>
            )}
        </div>
        
        <div>
          <Label htmlFor="driver-message">Sua resposta:</Label>
          <div className="relative">
            <Textarea
              id="driver-message"
              value={driverMessage}
              onChange={(e) => setDriverMessage(e.target.value)}
              placeholder="Digite sua contra-proposta..."
              className="pr-12"
            />
            <Button size="icon" className="absolute top-1/2 -translate-y-1/2 right-2" disabled={!driverMessage}>
                <Send className="w-4 h-4"/>
                <span className="sr-only">Enviar</span>
            </Button>
          </div>
        </div>
        
        <Button onClick={handleGetSuggestions} disabled={isLoading} className="w-full bg-accent hover:bg-accent/90">
          <Wand2 className="mr-2 h-4 w-4" /> {isLoading ? 'Gerando...' : 'Obter Sugestões da IA'}
        </Button>
        
        {isLoading && (
            <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
            </div>
        )}

        {suggestedPhrases.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold">Sugestões:</h4>
            {suggestedPhrases.map((phrase, index) => (
              <Badge
                key={index}
                variant="outline"
                className="p-2 cursor-pointer hover:bg-secondary w-full text-left justify-start"
                onClick={() => setDriverMessage(phrase)}
              >
                {phrase}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
