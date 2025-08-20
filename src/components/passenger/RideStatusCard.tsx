'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Car, Star, Phone, MessageSquare, Shield, CheckCircle2 } from 'lucide-react';
import type { RideDetails } from './PassengerDashboard';
import { Progress } from '../ui/progress';
import { useState, useEffect } from 'react';
import { RideChat } from '../driver/NegotiationChat';

interface RideStatusCardProps {
  rideDetails: RideDetails;
  rideStatus: 'in_progress' | 'completed';
  onCancel: () => void;
  onComplete: () => void;
}

export default function RideStatusCard({ rideDetails, rideStatus, onCancel, onComplete }: RideStatusCardProps) {
    const [progress, setProgress] = useState(10);

    useEffect(() => {
        if (rideStatus === 'completed') {
            setProgress(100);
            return;
        };

        const timer = setTimeout(() => {
            setProgress(60);
        }, 2000);

        const arrivalTimer = setTimeout(() => {
            onComplete();
        }, 8000)

        return () => {
            clearTimeout(timer);
            clearTimeout(arrivalTimer);
        }
    }, [rideStatus, onComplete]);


  if (rideStatus === 'completed') {
    return (
        <Card className="h-full flex flex-col items-center justify-center text-center">
            <CardHeader>
                <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <CardTitle className="font-headline text-2xl">Viagem Concluída!</CardTitle>
                <CardDescription>Obrigado por viajar com a CEOLIN. Esperamos te ver novamente em breve!</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">Você será redirecionado em alguns segundos...</p>
            </CardContent>
        </Card>
    )
  }
    
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Motorista a Caminho!</CardTitle>
        <CardDescription>Seu motorista chegará em breve. Acompanhe no mapa.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={rideDetails.driverAvatar} data-ai-hint="driver portrait"/>
            <AvatarFallback>{rideDetails.driverName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-grow">
            <p className="font-bold text-lg">{rideDetails.driverName}</p>
            <div className="flex items-center text-sm text-muted-foreground">
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
              <span>4.9</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
            <div className="p-4 rounded-lg bg-muted space-y-2">
                <div className="flex items-center gap-2">
                    <Car className="h-5 w-5 text-primary"/>
                    <div>
                        <p className="font-semibold">{rideDetails.vehicleModel}</p>
                        <p className="text-sm text-muted-foreground">{rideDetails.licensePlate}</p>
                    </div>
                </div>
            </div>
            <div className='text-center'>
                 <p className="text-sm font-semibold text-muted-foreground">Chega em</p>
                 <p className="font-bold text-2xl text-primary">{rideDetails.eta}</p>
            </div>
            <Progress value={progress} className="w-full" />
        </div>
      </CardContent>
      <CardFooter className="grid grid-cols-2 gap-2">
        <Button variant="outline"><Phone className="mr-2"/> Ligar</Button>
        <RideChat passengerName={rideDetails.driverName} isNegotiation={false}>
          <Button className="w-full"><MessageSquare className="mr-2"/> Mensagem</Button>
        </RideChat>
        <Button variant="destructive" className="col-span-2" onClick={onCancel}>
            <Shield className="mr-2"/> Cancelar Corrida
        </Button>
      </CardFooter>
    </Card>
  );
}
