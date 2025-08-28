'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Locate, ArrowRight, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import DriverListModal from './DriverListModal';
import { useState, useEffect } from 'react';
import pb from '@/lib/pocketbase';
import { useToast } from '@/hooks/use-toast';

interface RideRequestFormProps {
  onRideRequest: (rideId: string) => void;
  isSearching: boolean;
  anonymousUserName: string | null;
}

export default function RideRequestForm({ onRideRequest, isSearching, anonymousUserName }: RideRequestFormProps) {
    const [origin, setOrigin] = useState('Rua Principal, 123');
    const [destination, setDestination] = useState('Shopping da Cidade');
    const { toast } = useToast();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const isLoggedIn = isClient && pb.authStore.isValid;
    const canRequest = isLoggedIn || !!anonymousUserName;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-center">
            <div>
                <CardTitle className="font-headline text-2xl">Onde vamos hoje?</CardTitle>
                <CardDescription>Solicite uma corrida com facilidade e segurança.</CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <Tabs defaultValue="local" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="local">Corrida Local</TabsTrigger>
            <TabsTrigger value="intercity">Interior</TabsTrigger>
          </TabsList>
          <TabsContent value="local" className="pt-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="pickup-local">Local de Partida</Label>
              <div className="flex items-center gap-2">
                <MapPin className="text-muted-foreground" />
                <Input id="pickup-local" placeholder="Insira seu local de partida" value={origin} onChange={(e) => setOrigin(e.target.value)} disabled={isSearching}/>
                <Button variant="ghost" size="icon" aria-label="Usar localização atual" disabled={isSearching}>
                  <Locate />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="destination-local">Destino</Label>
              <div className="flex items-center gap-2">
                <MapPin className="text-muted-foreground" />
                <Input id="destination-local" placeholder="Insira seu destino" value={destination} onChange={(e) => setDestination(e.target.value)} disabled={isSearching}/>
              </div>
            </div>
             <div className="space-y-2">
                 <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full" size="lg" disabled={isSearching || !canRequest}>
                         {isSearching && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                         {isSearching ? 'Procurando Motorista...' : 'Escolher Motorista'}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                       <DriverListModal 
                        origin={origin} 
                        destination={destination}
                        isNegotiated={false}
                        onRideRequest={onRideRequest}
                        passengerAnonymousName={anonymousUserName}
                        />
                    </DialogContent>
                </Dialog>
             </div>
          </TabsContent>
          <TabsContent value="intercity" className="pt-6 space-y-6">
             <div className="space-y-2">
              <Label htmlFor="pickup-intercity">Origem</Label>
              <div className="flex items-center gap-2">
                <Input id="pickup-intercity" placeholder="Cidade de partida" value={origin} onChange={(e) => setOrigin(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="destination-intercity">Destino</Label>
              <div className="flex items-center gap-2">
                <Input id="destination-intercity" placeholder="Cidade de destino" value={destination} onChange={(e) => setDestination(e.target.value)} />
              </div>
            </div>
            <div className="p-4 border rounded-lg bg-accent/10">
                <h4 className="font-semibold">Negocie a Tarifa</h4>
                <p className="text-sm text-muted-foreground">
                    Para viagens para o interior, você negocia o valor diretamente com o motorista.
                </p>
            </div>
             <Dialog>
                <DialogTrigger asChild>
                    <Button className="w-full" size="lg" disabled={isSearching || !canRequest}>Ver Motoristas <ArrowRight className="ml-2 h-4 w-4"/></Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                   <DriverListModal 
                    origin={origin} 
                    destination={destination}
                    isNegotiated={true}
                    onRideRequest={onRideRequest}
                    passengerAnonymousName={anonymousUserName}
                   />
                </DialogContent>
            </Dialog>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
