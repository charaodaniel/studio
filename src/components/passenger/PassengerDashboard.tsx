

'use client';

import { useState, useEffect, useCallback } from 'react';
import RideRequestForm from './RideRequestForm';
import RideStatusCard from './RideStatusCard';
import pb from '@/lib/pocketbase';
import type { RecordModel } from 'pocketbase';
import { useToast } from '@/hooks/use-toast';
import { useNotificationSound } from '@/hooks/useNotificationSound';
import { Card, CardContent } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Star, Car, Send } from 'lucide-react';
import type { User as Driver } from '../admin/UserList';
import RideConfirmationModal from './RideConfirmationModal';
import { cn } from '@/lib/utils';


interface RideRecord extends RecordModel {
    status: RideStatus;
    is_negotiated: boolean;
    passenger_anonymous_name?: string;
    expand?: {
        driver: DriverRecord;
    }
}

interface DriverRecord extends RecordModel {
    id: string;
    name: string;
    avatar: string;
    phone: string;
    driver_vehicle_model: string;
    driver_vehicle_plate: string;
}

type RideStatus = 'idle' | 'searching' | 'in_progress' | 'completed' | 'canceled' | 'accepted';

export interface RideDetails {
  driverName: string;
  driverAvatar: string;
  driverPhone: string;
  vehicleModel: string;
  licensePlate: string;
  eta: string;
}

const getStatusVariant = (status?: string) => {
    switch (status) {
        case 'online':
            return 'bg-green-100 text-green-800 border-green-200';
        case 'urban-trip':
        case 'rural-trip':
            return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'offline':
        default:
            return 'bg-red-100 text-red-800 border-red-200';
    }
};

const getStatusLabel = (status?: string) => {
    const labels: { [key: string]: string } = {
        'online': 'Online',
        'offline': 'Offline',
        'urban-trip': 'Em Viagem',
        'rural-trip': 'Em Viagem',
    };
    return labels[status || 'offline'] || status;
};


export default function PassengerDashboard() {
  const { toast } = useToast();
  const { playNotification } = useNotificationSound();
  const [rideStatus, setRideStatus] = useState<RideStatus>('idle');
  const [rideDetails, setRideDetails] = useState<RideDetails | null>(null);
  const [activeRide, setActiveRide] = useState<RideRecord | null>(null);
  
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoadingDrivers, setIsLoadingDrivers] = useState(true);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  
  // State for the form
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');

  const fetchActiveRide = useCallback(async () => {
    if (!pb.authStore.model) return;

    try {
      const result = await pb.collection('rides').getFirstListItem(
        `passenger="${pb.authStore.model.id}" && (status="accepted" || status="in_progress")`,
        { expand: 'driver' }
      );
      setActiveRide(result as RideRecord);
    } catch (error) {
      // It's normal to not find a ride, so we don't log this error
    }
  }, []);

  useEffect(() => {
    fetchActiveRide();
    pb.authStore.onChange(fetchActiveRide, true);
    
    // Realtime subscription for ride updates
    const subscribeToRides = async () => {
        await pb.collection('rides').subscribe('*', handleRideUpdate);
    }
    subscribeToRides();

    // Ask for location permission
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            () => {}, // Success, do nothing
            (error) => {
                if (error.code === error.PERMISSION_DENIED) {
                     toast({
                        title: 'Permissão de Localização Negada',
                        description: 'Para uma melhor experiência, considere ativar a localização.',
                        variant: 'destructive',
                        duration: 7000
                    });
                }
            }
        )
    }

    const fetchDrivers = async () => {
        setIsLoadingDrivers(true);
        try {
            const result = await pb.collection('users').getFullList({
                filter: 'role = "Motorista" && disabled != true && driver_status = "online"',
            });
            setDrivers(result as Driver[]);
        } catch (error) {
            console.error(error);
            toast({variant: 'destructive', title: 'Erro ao buscar motoristas'});
        } finally {
            setIsLoadingDrivers(false);
        }
    }
    fetchDrivers();

    const subscribeToDrivers = async () => {
        await pb.collection('users').subscribe('*', fetchDrivers);
    };
    subscribeToDrivers();

    return () => {
        pb.collection('rides').unsubscribe();
        pb.collection('users').unsubscribe();
    }
  }, [fetchActiveRide, toast]);
  

  const handleRideUpdate = ({ action, record }: { action: string, record: RideRecord }) => {
    if (record.passenger !== pb.authStore.model?.id) return;

    if (action === 'update') {
        setActiveRide(prev => {
            if (prev && prev.id === record.id) {
                 if (record.status === 'accepted') {
                    setRideStatus('accepted');
                    setRideDetails({
                        driverName: record.expand?.driver.name || 'Motorista',
                        driverAvatar: record.expand?.driver.avatar ? pb.getFileUrl(record.expand.driver, record.expand.driver.avatar, { 'thumb': '100x100' }) : '',
                        driverPhone: record.expand?.driver.phone || '',
                        vehicleModel: record.expand?.driver.driver_vehicle_model || 'Não informado',
                        licensePlate: record.expand?.driver.driver_vehicle_plate || 'Não informado',
                        eta: '5 min' // Placeholder
                    });
                    playNotification();
                    toast({title: "Corrida Aceita!", description: `${record.expand?.driver.name} está a caminho.`})
                } else if (record.status === 'in_progress') {
                    setRideStatus('in_progress');
                } else if (record.status === 'completed') {
                    handleCompleteRide();
                } else if (record.status === 'canceled') {
                    handleCancelRide(false); // No need to update db again
                     toast({title: "Corrida Cancelada", description: "A corrida foi cancelada.", variant: 'destructive'})
                }
                return record;
            }
            return prev;
        });
    }
  };


  const onRideRequest = (rideId: string) => {
    setRideStatus('searching');
    pb.collection('rides').getOne(rideId).then(ride => {
        setActiveRide(ride as RideRecord);
    }).catch(error => {
        console.error(error);
        setRideStatus('idle');
        toast({title: 'Erro', description: 'Não foi possível acompanhar o status da corrida.'})
    })
  };

  const handleCancelRide = async (updateDb = true) => {
    if (updateDb && activeRide) {
        await pb.collection('rides').update(activeRide.id, { status: 'canceled' });
        toast({
            title: 'Corrida Cancelada',
            description: 'Sua solicitação foi cancelada.',
            variant: 'destructive'
        });
    }
    setRideStatus('idle');
    setRideDetails(null);
    setActiveRide(null);
  };
  
  const handleCompleteRide = () => {
    toast({ title: "Viagem Concluída!", description: "Obrigado por viajar com a gente."});
    setRideStatus('completed');
     // Reset after a delay
    setTimeout(() => {
        setRideStatus('idle');
        setRideDetails(null);
        setActiveRide(null);
    }, 5000);
  }

  const handleSelectDriver = (driver: Driver) => {
    setSelectedDriver(driver);
    setIsConfirmationOpen(true);
  }

  return (
    <div className="container mx-auto p-4 flex flex-col gap-8 h-full">
      <div className="w-full lg:max-w-md mx-auto">
        {rideStatus === 'idle' || rideStatus === 'searching' ? (
          <RideRequestForm
            onRideRequest={onRideRequest}
            isSearching={rideStatus === 'searching'}
            anonymousUserName={pb.authStore.model ? null : 'Anônimo'}
            origin={origin}
            setOrigin={setOrigin}
            destination={destination}
            setDestination={setDestination}
          />
        ) : (
          rideDetails && activeRide && (
            <RideStatusCard
              rideDetails={rideDetails}
              rideStatus={rideStatus}
              rideId={activeRide.id}
              isNegotiated={activeRide.is_negotiated}
              onCancel={() => handleCancelRide(true)}
              onComplete={handleCompleteRide}
            />
          )
        )}
      </div>

      {(rideStatus === 'idle' || rideStatus === 'searching') && (
        <div className="space-y-4">
            <h2 className="font-headline text-xl text-center">Motoristas Disponíveis</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {drivers.map(driver => {
                const isAvailable = driver.driver_status === 'online';
                return (
                    <Card key={driver.id} className="flex flex-col">
                        <CardContent className="p-4 flex-grow">
                            <div className="flex flex-col items-center text-center gap-2">
                                <Avatar className="h-16 w-16 mb-2">
                                    <AvatarImage src={driver.avatar ? pb.getFileUrl(driver, driver.avatar) : ''} data-ai-hint="driver portrait" />
                                    <AvatarFallback>{driver.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <p className="font-bold">{driver.name}</p>
                                <Badge variant="outline" className={cn("text-xs", getStatusVariant(driver.driver_status))}>
                                    {getStatusLabel(driver.driver_status)}
                                </Badge>
                                <div className="text-xs text-muted-foreground flex items-center gap-2">
                                    <Car className="h-4 w-4" />
                                    <span>{driver.driver_vehicle_model || 'Não informado'}</span>
                                </div>
                                <div className="flex items-center text-xs text-muted-foreground">
                                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                                    <span>4.8</span>
                                </div>
                            </div>
                        </CardContent>
                        <div className="p-4 pt-0">
                           <Button 
                              className="w-full" 
                              onClick={() => handleSelectDriver(driver)} 
                              disabled={!isAvailable}>
                                <Send className="mr-2 h-4 w-4" /> Chamar
                            </Button>
                        </div>
                    </Card>
                )
            })}
            </div>
        </div>
      )}

        {selectedDriver && (
            <RideConfirmationModal
                isOpen={isConfirmationOpen}
                onOpenChange={setIsConfirmationOpen}
                driver={selectedDriver}
                origin={origin}
                destination={destination}
                isNegotiated={false} // This view logic defaults to non-negotiated. The form handles negotiation.
                onConfirm={onRideRequest}
                passengerAnonymousName={pb.authStore.model ? null : "Passageiro Anônimo"}
            />
        )}
    </div>
  );
}
