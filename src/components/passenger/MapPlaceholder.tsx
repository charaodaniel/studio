'use client';
import Image from 'next/image';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Car, Star, User, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect, useCallback } from 'react';
import pb from '@/lib/pocketbase';
import type { User as Driver } from '../admin/UserList';

interface FullDriver extends Driver {
  position: { top: string; left: string };
}

const acceptedDriver = { id: 5, name: 'Roberto Andrade', vehicle: 'Chevrolet Onix - BRA2E19', rating: 4.9, position: { top: '80%', left: '80%' }, img: 'https://placehold.co/40x40/E3F2FD/2979FF.png?text=RA' }

interface MapPlaceholderProps {
  rideInProgress?: boolean;
}

export default function MapPlaceholder({ rideInProgress = false }: MapPlaceholderProps) {
  const [onlineDrivers, setOnlineDrivers] = useState<FullDriver[]>([]);
  const [userPosition, setUserPosition] = useState({ top: '50%', left: '50%' });
  const [refreshKey, setMapRefreshKey] = useState(0);

  const fetchOnlineDrivers = useCallback(async () => {
    try {
      const driverRecords = await pb.collection('users').getFullList<Driver>({
        filter: 'role = "Motorista" && driver_status = "online"',
      });

      const driversWithPosition = driverRecords.map(driver => ({
        ...driver,
        position: {
          top: `${Math.random() * 80 + 10}%`,
          left: `${Math.random() * 80 + 10}%`,
        }
      }));

      setOnlineDrivers(driversWithPosition);
    } catch (error) {
      console.error("Failed to fetch online drivers:", error);
    }
  }, []);

  useEffect(() => {
    fetchOnlineDrivers();
    setUserPosition({
        top: `${Math.random() * 60 + 20}%`,
        left: `${Math.random() * 60 + 20}%`,
    });
    
    const unsubscribe = pb.collection('users').subscribe('*', (e) => {
        if (e.record.role === 'Motorista') {
            fetchOnlineDrivers();
        }
    });

    return () => {
        pb.collection('users').unsubscribe('*');
    };
  }, [fetchOnlineDrivers, refreshKey]);

  const onRefreshLocation = () => {
      setMapRefreshKey(prev => prev + 1);
  }
  
  return (
    <Card className="w-full h-full overflow-hidden shadow-lg">
      <CardContent className="p-0 relative h-full">
        <Image
          src="https://placehold.co/1200x800/E3F2FD/E3F2FD.png"
          data-ai-hint="Manoel Viana bridge"
          alt="Imagem da ponte de Manoel Viana"
          fill
          className="object-cover opacity-100"
          priority
        />
         <div className="absolute top-2 right-2 z-10">
          <Button variant="ghost" size="icon" aria-label="Atualizar localização" onClick={onRefreshLocation} className="bg-background/50 hover:bg-background/80">
              <RefreshCw className="h-5 w-5 text-foreground" />
          </Button>
        </div>
        <div className="absolute inset-0 bg-black/20"> {/* Added a slight overlay for text readability */}
          {!rideInProgress ? (
            onlineDrivers.map((driver) => (
              <Popover key={driver.id}>
                <PopoverTrigger asChild style={driver.position} className="absolute">
                  <button className="relative flex items-center justify-center" aria-label={`Driver ${driver.name}`}>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 delay-75"></span>
                    <Avatar className="h-10 w-10 border-2 border-primary-foreground shadow-md">
                      <AvatarImage src={driver.avatar ? pb.getFileUrl(driver, driver.avatar) : ''} data-ai-hint="driver portrait" />
                      <AvatarFallback>{driver.name.substring(0,2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-64">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium leading-none font-headline">{driver.name}</h4>
                      <p className="text-sm text-muted-foreground flex items-center"><Car className="mr-2 h-4 w-4" />{driver.driver_vehicle_model} - {driver.driver_vehicle_plate}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                        <span>4.8</span>
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
        <div style={userPosition} className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center transition-all duration-500">
          <User className="h-10 w-10 text-primary-foreground bg-primary rounded-full p-2" />
          <div className="mt-2 text-center bg-primary/80 text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold">Você</div>
        </div>
      </CardContent>
    </Card>
  );
}
