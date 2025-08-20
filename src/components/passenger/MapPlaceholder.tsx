'use client';
import Image from 'next/image';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Car, Star, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const drivers = [
  { id: 1, name: 'João Silva', vehicle: 'Toyota Corolla - ABC1234', rating: 4.8, position: { top: '20%', left: '30%' }, img: 'https://placehold.co/40x40/E3F2FD/2979FF.png?text=JS' },
  { id: 2, name: 'Maria Souza', vehicle: 'Honda Civic - DEF5678', rating: 4.9, position: { top: '50%', left: '60%' }, img: 'https://placehold.co/40x40/E3F2FD/7C4DFF.png?text=MS' },
  { id: 3, name: 'Carlos Lima', vehicle: 'Chevrolet Onix - GHI9012', rating: 4.7, position: { top: '70%', left: '20%' }, img: 'https://placehold.co/40x40/E3F2FD/2979FF.png?text=CL' },
  { id: 4, name: 'Ana Pereira', vehicle: 'Hyundai HB20 - JKL3456', rating: 4.6, position: { top: '35%', left: '75%' }, img: 'https://placehold.co/40x40/E3F2FD/7C4DFF.png?text=AP' },
];

const acceptedDriver = { id: 5, name: 'Roberto Andrade', vehicle: 'Chevrolet Onix - BRA2E19', rating: 4.9, position: { top: '80%', left: '80%' }, img: 'https://placehold.co/40x40/E3F2FD/2979FF.png?text=RA' }

interface MapPlaceholderProps {
  rideInProgress?: boolean;
}

export default function MapPlaceholder({ rideInProgress = false }: MapPlaceholderProps) {
  return (
    <Card className="w-full h-full overflow-hidden shadow-lg">
      <CardContent className="p-0 relative h-full">
        <Image
          src="https://placehold.co/1200x800.png"
          data-ai-hint="Manoel Viana bridge"
          alt="Imagem da ponte de Manoel Viana"
          layout="fill"
          objectFit="cover"
          className="opacity-100"
        />
        <div className="absolute inset-0 bg-black/20"> {/* Added a slight overlay for text readability */}
          {!rideInProgress ? (
            drivers.map((driver) => (
              <Popover key={driver.id}>
                <PopoverTrigger asChild style={driver.position} className="absolute">
                  <button className="relative flex items-center justify-center" aria-label={`Driver ${driver.name}`}>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 delay-75"></span>
                    <Avatar className="h-10 w-10 border-2 border-primary-foreground shadow-md">
                      <AvatarImage src={driver.img} data-ai-hint="driver portrait" />
                      <AvatarFallback>{driver.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-64">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium leading-none font-headline">{driver.name}</h4>
                      <p className="text-sm text-muted-foreground flex items-center"><Car className="mr-2 h-4 w-4" />{driver.vehicle}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                        <span>{driver.rating}</span>
                      </div>
                      <Button size="sm" className="bg-accent hover:bg-accent/90">Chamar</Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            ))
          ) : (
            <div style={acceptedDriver.position} className="absolute transition-all duration-1000 ease-in-out top-1/2 left-1/2">
                <button className="relative flex items-center justify-center" aria-label={`Driver ${acceptedDriver.name}`}>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <Avatar className="h-10 w-10 border-2 border-primary-foreground shadow-md">
                      <AvatarImage src={acceptedDriver.img} data-ai-hint="driver portrait" />
                    <AvatarFallback>{acceptedDriver.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </button>
            </div>
          )}
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
          <User className="h-10 w-10 text-primary-foreground bg-primary rounded-full p-2" />
          <div className="mt-2 text-center bg-primary/80 text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold">Você</div>
        </div>
      </CardContent>
    </Card>
  );
}
