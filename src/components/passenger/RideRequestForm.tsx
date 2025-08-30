

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
  origin: string;
  setOrigin: (value: string) => void;
  destination: string;
  setDestination: (value: string) => void;
}

export default function RideRequestForm({ onRideRequest, isSearching, anonymousUserName, origin, setOrigin, destination, setDestination }: RideRequestFormProps) {
    const { toast } = useToast();
    const [isClient, setIsClient] = useState(false);
    const [isLocating, setIsLocating] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const isLoggedIn = isClient && pb.authStore.isValid;
    const canRequest = isLoggedIn || !!anonymousUserName;

    const handleGetCurrentLocation = () => {
        if (!navigator.geolocation) {
            toast({
                variant: 'destructive',
                title: 'Geolocalização não suportada',
                description: 'Seu navegador não suporta a captura de localização.',
            });
            return;
        }

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                // Em um app real, você usaria estas coordenadas para chamar uma API de geocodificação reversa.
                // Para este protótipo, exibimos as coordenadas diretamente.
                const locationString = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
                setOrigin(locationString);
                toast({
                    title: 'Localização Capturada!',
                    description: 'Seu local de partida foi preenchido com as coordenadas.',
                });
                setIsLocating(false);
            },
            (error) => {
                let description = 'Não foi possível obter sua localização.';
                if (error.code === error.PERMISSION_DENIED) {
                    description = 'A permissão para acessar a localização foi negada.';
                }
                toast({
                    variant: 'destructive',
                    title: 'Erro de Localização',
                    description: description,
                });
                setIsLocating(false);
            }
        );
    };

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
                <Input id="pickup-local" placeholder="Insira seu local de partida" value={origin} onChange={(e) => setOrigin(e.target.value)} disabled={isSearching || isLocating}/>
                <Button variant="ghost" size="icon" aria-label="Usar localização atual" onClick={handleGetCurrentLocation} disabled={isSearching || isLocating}>
                  {isLocating ? <Loader2 className="animate-spin" /> : <Locate />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground pl-8">Formato: Rua, Número, Bairro, Cidade</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="destination-local">Destino</Label>
              <div className="flex items-center gap-2">
                <MapPin className="text-muted-foreground" />
                <Input id="destination-local" placeholder="Insira seu destino" value={destination} onChange={(e) => setDestination(e.target.value)} disabled={isSearching}/>
              </div>
              <p className="text-xs text-muted-foreground pl-8">Formato: Rua, Número, Bairro, Cidade</p>
            </div>
             <div className="space-y-2">
                 <Dialog>
                    <DialogTrigger asChild>
                        <Button className="w-full" size="lg" disabled={isSearching || !canRequest}>Ver Motoristas <ArrowRight className="ml-2 h-4 w-4"/></Button>
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
                <Input id="pickup-intercity" placeholder="Insira seu local de partida" value={origin} onChange={(e) => setOrigin(e.target.value)} />
              </div>
              <p className="text-xs text-muted-foreground pl-2">Formato: Rua, Número, Bairro, Cidade</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="destination-intercity">Destino</Label>
              <div className="flex items-center gap-2">
                <Input id="destination-intercity" placeholder="Insira seu destino" value={destination} onChange={(e) => setDestination(e.target.value)} />
              </div>
              <p className="text-xs text-muted-foreground pl-2">Formato: Rua, Número, Bairro, Cidade</p>
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
