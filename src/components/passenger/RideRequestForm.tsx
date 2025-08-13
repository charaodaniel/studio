'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { MapPin, Locate, Users } from 'lucide-react';

export default function RideRequestForm() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Onde vamos hoje?</CardTitle>
        <CardDescription>Solicite uma corrida com facilidade e segurança.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-6">
        <div className="space-y-2">
          <Label htmlFor="pickup">Local de Partida</Label>
          <div className="flex items-center gap-2">
            <MapPin className="text-muted-foreground" />
            <Input id="pickup" placeholder="Insira seu local de partida" />
            <Button variant="ghost" size="icon" aria-label="Usar localização atual">
              <Locate />
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="destination">Destino</Label>
          <div className="flex items-center gap-2">
            <MapPin className="text-muted-foreground" />
            <Input id="destination" placeholder="Insira seu destino" />
          </div>
        </div>
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div>
            <Label htmlFor="intercity-mode">Interior/Intermunicipal</Label>
            <p className="text-sm text-muted-foreground">
              Ative para negociar a tarifa.
            </p>
          </div>
          <Switch id="intercity-mode" />
        </div>
      </CardContent>
      <CardFooter className="flex-col sm:flex-row gap-2">
        <Button className="w-full sm:w-auto flex-1" size="lg">Pedir Corrida</Button>
        <Button variant="secondary" className="w-full sm:w-auto">
          <Users className="mr-2 h-4 w-4" /> Ver Motoristas
        </Button>
      </CardFooter>
    </Card>
  );
}
