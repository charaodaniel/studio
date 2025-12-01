
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
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/firebase';

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
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        setIsClient(true);
        const unsubscribe = auth.onAuthStateChanged(user => {
            setIsLoggedIn(!!user);
        });
        return () => unsubscribe();
    }, []);

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
            async (position) => {
                const { latitude, longitude } = position.coords;
                
                try {
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                    const data = await response.json();

                    if (data && data.address) {
                        const { road, suburb, city, town, village } = data.address;
                        const formattedAddress = [road, suburb, city || town || village].filter(Boolean).join(', ');
                        setOrigin(formattedAddress);
                        toast({
                            title: 'Localização Encontrada!',
                            description: `Seu endereço foi preenchido: ${formattedAddress}`,
                        });
                    } else {
                        throw new Error('Endereço não encontrado.');
                    }

                } catch (error) {
                    console.error("Reverse geocoding failed:", error);
                    const locationString = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
                    setOrigin(locationString);
                    toast({
                        title: 'Coordenadas Capturadas!',
                        description: 'Não foi possível encontrar o nome da rua, mas as coordenadas foram preenchidas.',
                    });
                } finally {
                     setIsLocating(false);
                }
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

    const renderFormContent = (isNegotiated: boolean) => (
        <div className="pt-6 space-y-6">
            <div className="space-y-2">
                <Label htmlFor={`pickup-${isNegotiated ? 'intercity' : 'local'}`}>Local de Partida</Label>
                <div className="flex items-center gap-2">
                    <MapPin className="text-muted-foreground" />
                    <Input id={`pickup-${isNegotiated ? 'intercity' : 'local'}`} placeholder="Insira seu local de partida" value={origin} onChange={(e) => setOrigin(e.target.value)} disabled={isSearching || isLocating}/>
                    <Button variant="ghost" size="icon" aria-label="Usar localização atual" onClick={handleGetCurrentLocation} disabled={isSearching || isLocating}>
                    {isLocating ? <Loader2 className="animate-spin" /> : <Locate />}
                    </Button>
                </div>
                <p className="text-xs text-muted-foreground pl-8">Formato: Rua, Número, Bairro, Cidade</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`destination-${isNegotiated ? 'intercity' : 'local'}`}>Destino</Label>
              <div className="flex items-center gap-2">
                <MapPin className="text-muted-foreground" />
                <Input id={`destination-${isNegotiated ? 'intercity' : 'local'}`} placeholder="Insira seu destino" value={destination} onChange={(e) => setDestination(e.target.value)} disabled={isSearching}/>
              </div>
              <p className="text-xs text-muted-foreground pl-8">Formato: Rua, Número, Bairro, Cidade</p>
            </div>
            
            {isNegotiated && (
                <div className="p-4 border rounded-lg bg-accent/10">
                    <h4 className="font-semibold">Negocie a Tarifa</h4>
                    <p className="text-sm text-muted-foreground">
                        Para viagens para o interior, você negocia o valor diretamente com o motorista.
                    </p>
                </div>
            )}

            <div className="space-y-2">
                 <Dialog>
                    <DialogTrigger asChild>
                        <Button className="w-full" size="lg" disabled={isSearching || !canRequest || !origin || !destination}>
                            {isSearching && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isSearching ? 'Procurando...' : 'Ver Motoristas'}
                            {!isSearching && <ArrowRight className="ml-2 h-4 w-4"/>}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DriverListModal 
                            origin={origin} 
                            destination={destination}
                            isNegotiated={isNegotiated}
                            onRideRequest={onRideRequest}
                            passengerAnonymousName={anonymousUserName}
                        />
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-center">
            <div>
                <CardTitle className="font-headline text-2xl">Onde vamos hoje?</CardTitle>
                <CardDescription>Solicite uma corrida agora ou agende para mais tarde.</CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <Tabs defaultValue="local" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="local">Corrida Local</TabsTrigger>
            <TabsTrigger value="intercity">Interior</TabsTrigger>
          </TabsList>
          <TabsContent value="local">
            {renderFormContent(false)}
          </TabsContent>
          <TabsContent value="intercity">
            {renderFormContent(true)}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
