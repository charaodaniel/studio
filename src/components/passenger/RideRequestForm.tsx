'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Locate, Users, ArrowRight, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import DriverListModal from './DriverListModal';

interface RideRequestFormProps {
  onRideRequest: () => void;
  isSearching: boolean;
}

export default function RideRequestForm({ onRideRequest, isSearching }: RideRequestFormProps) {
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
                <Input id="pickup-local" placeholder="Insira seu local de partida" defaultValue="Rua Principal, 123" disabled={isSearching}/>
                <Button variant="ghost" size="icon" aria-label="Usar localização atual" disabled={isSearching}>
                  <Locate />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="destination-local">Destino</Label>
              <div className="flex items-center gap-2">
                <MapPin className="text-muted-foreground" />
                <Input id="destination-local" placeholder="Insira seu destino" defaultValue="Shopping da Cidade" disabled={isSearching}/>
              </div>
            </div>
             <div className="space-y-2">
                <Button className="w-full" size="lg" onClick={onRideRequest} disabled={isSearching}>
                  {isSearching && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSearching ? 'Procurando Motorista...' : 'Pedir Corrida'}
                </Button>
                 <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full" size="lg" disabled={isSearching}>Ver Motoristas <ArrowRight className="ml-2 h-4 w-4"/></Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Motoristas Disponíveis</DialogTitle>
                            <DialogDescription>
                                Escolha um motorista para sua corrida.
                            </DialogDescription>
                        </DialogHeader>
                       <DriverListModal onSelectDriver={onRideRequest} />
                    </DialogContent>
                </Dialog>
             </div>
          </TabsContent>
          <TabsContent value="intercity" className="pt-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="pickup-intercity">Origem</Label>
              <div className="flex items-center gap-2">
                <Input id="pickup-intercity" placeholder="Cidade de partida" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="destination-intercity">Destino</Label>
              <div className="flex items-center gap-2">
                <Input id="destination-intercity" placeholder="Cidade de destino" />
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
                    <Button className="w-full" size="lg">Ver Motoristas <ArrowRight className="ml-2 h-4 w-4"/></Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Motoristas Disponíveis</DialogTitle>
                        <DialogDescription>
                            Escolha um motorista para sua corrida.
                        </DialogDescription>
                    </DialogHeader>
                   <DriverListModal onSelectDriver={onRideRequest}/>
                </DialogContent>
            </Dialog>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
