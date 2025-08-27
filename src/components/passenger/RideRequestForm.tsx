
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Locate, Users, ArrowRight, Loader2, User } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import DriverListModal from './DriverListModal';
import { useState, useEffect } from 'react';
import pb from '@/lib/pocketbase';
import { useToast } from '@/hooks/use-toast';

interface RideRequestFormProps {
  onRideRequest: (rideId: string) => void;
  isSearching: boolean;
}

export default function RideRequestForm({ onRideRequest, isSearching }: RideRequestFormProps) {
    const [origin, setOrigin] = useState('Rua Principal, 123');
    const [destination, setDestination] = useState('Shopping da Cidade');
    const { toast } = useToast();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const isLoggedIn = isClient && pb.authStore.isValid;

    const handleCreateRide = async (driverId: string | null = null, isNegotiated = false) => {
        if (!isLoggedIn) {
            toast({
                variant: "destructive",
                title: "Login Necessário",
                description: "Por favor, faça login para solicitar uma corrida.",
            });
            return;
        }

        const data: any = {
            status: "requested",
            started_by: "passenger",
            is_negotiated: isNegotiated,
            passenger: pb.authStore.model?.id,
            origin_address: origin,
            destination_address: destination,
            target_driver: driverId,
        };

        if (!isNegotiated) {
            data.fare = 25.50; // Example fare
        }
        
        try {
            console.log("Creating ride with data:", data);
            const record = await pb.collection('rides').create(data);

            toast({
                title: "Corrida Solicitada!",
                description: "Sua solicitação foi enviada aos motoristas próximos.",
            });
            onRideRequest(record.id);

        } catch (error) {
            console.error("Failed to create ride:", error);
            toast({
                variant: "destructive",
                title: "Erro ao Solicitar Corrida",
                description: "Não foi possível criar sua solicitação. Tente novamente.",
            });
        }
    }


  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Onde vamos hoje?</CardTitle>
        <CardDescription>Solicite uma corrida com facilidade e segurança.</CardDescription>
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
                <Button className="w-full" size="lg" onClick={() => handleCreateRide(null, false)} disabled={isSearching || !isLoggedIn}>
                  {isSearching && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSearching ? 'Procurando Motorista...' : 'Pedir Corrida'}
                </Button>
                 <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full" size="lg" disabled={isSearching || !isLoggedIn}>Ver Motoristas <ArrowRight className="ml-2 h-4 w-4"/></Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                       <DriverListModal onSelectDriver={(driverId) => handleCreateRide(driverId, false)} />
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
                    <Button className="w-full" size="lg" disabled={!isLoggedIn}>Ver Motoristas <ArrowRight className="ml-2 h-4 w-4"/></Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                   <DriverListModal onSelectDriver={(driverId) => handleCreateRide(driverId, true)} />
                </DialogContent>
            </Dialog>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
