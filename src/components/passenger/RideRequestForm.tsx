'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Locate, Users, ArrowRight } from 'lucide-react';

export default function RideRequestForm() {
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
            <TabsTrigger value="intercity">Interior/Intermunicipal</TabsTrigger>
          </TabsList>
          <TabsContent value="local" className="pt-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="pickup-local">Local de Partida</Label>
              <div className="flex items-center gap-2">
                <MapPin className="text-muted-foreground" />
                <Input id="pickup-local" placeholder="Insira seu local de partida" />
                <Button variant="ghost" size="icon" aria-label="Usar localização atual">
                  <Locate />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="destination-local">Destino</Label>
              <div className="flex items-center gap-2">
                <MapPin className="text-muted-foreground" />
                <Input id="destination-local" placeholder="Insira seu destino" />
              </div>
            </div>
             <div className="space-y-2">
                <Button className="w-full" size="lg">Pedir Corrida</Button>
                <Button variant="outline" className="w-full" size="lg">Ver Motoristas <ArrowRight className="ml-2 h-4 w-4"/></Button>
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
                    Para viagens intermunicipais, você negocia o valor diretamente com o motorista.
                </p>
            </div>
             <Button className="w-full" size="lg">Ver Motoristas <ArrowRight className="ml-2 h-4 w-4"/></Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
