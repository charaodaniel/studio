

'use client';

import { useState, useEffect, useCallback } from 'react';
import RideRequestForm from './RideRequestForm';
import RideStatusCard from './RideStatusCard';
import { useToast } from '@/hooks/use-toast';
import { useNotificationSound } from '@/hooks/useNotificationSound';
import pb from '@/lib/pocketbase';
import type { RecordModel } from 'pocketbase';
import { Card, CardContent } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Star, Car, Send } from 'lucide-react';
import type { User as Driver } from '../admin/UserList';
import RideConfirmationModal from './RideConfirmationModal';
import { cn } from '@/lib/utils';

const getAvatarUrl = (record: RecordModel, avatarFileName: string) => {
    if (!record || !avatarFileName) return '';
    return pb.getFileUrl(record, avatarFileName);
};

interface RideRecord extends RecordModel {
    status: RideStatus;
    is_negotiated: boolean;
    passenger_anonymous_name?: string;
    expand?: {
        driver: DriverRecord;
    }
}

interface DriverRecord extends RecordModel {
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
  const [anonymousUserName, setAnonymousUserName] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
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

    pb.collection('users').getFullList<Driver>({
        filter: 'role = "Motorista" && disabled != true && driver_status = "online"'
    }).then(records => {
        setDrivers(records);
    }).catch(err => {
        console.error(err);
        toast({variant: 'destructive', title: 'Erro ao buscar motoristas'});
    }).finally(() => setIsLoadingDrivers(false));
    
    let unsubscribe: () => void;
    const subscribeToUsers = async () => {
        try {
            unsubscribe = await pb.collection('users').subscribe('*', e => {
                if(e.record.role?.includes('Motorista')) {
                    pb.collection('users').getFullList<Driver>({
                        filter: 'role = "Motorista" && disabled != true && driver_status = "online"'
                    }).then(records => setDrivers(records));
                }
            });
        } catch (err) {
            console.error("Realtime subscription failed for users:", err);
        }
    };
    
    subscribeToUsers();

    return () => {
        if (unsubscribe) {
            pb.collection('users').unsubscribe();
        }
    }
  }, [toast]);
  

  const handleRideUpdate = useCallback((updatedRide: RideRecord) => {
    setActiveRide(updatedRide);
    
    if (updatedRide.status === 'accepted' && rideStatus !== 'accepted') {
        const driverData = updatedRide.expand?.driver;
        if (driverData) {
            setRideStatus('accepted');
            setRideDetails({
                driverName: driverData.name || 'Motorista',
                driverAvatar: driverData.avatar ? getAvatarUrl(driverData, driverData.avatar) : '',
                driverPhone: driverData.phone || '',
                vehicleModel: driverData.driver_vehicle_model || 'Não informado',
                licensePlate: driverData.driver_vehicle_plate || 'Não informado',
                eta: '5 min'
            });
            playNotification();
            toast({title: "Corrida Aceita!", description: `${driverData.name} está a caminho.`});
        }
    } else if (updatedRide.status === 'in_progress') {
        setRideStatus('in_progress');
    } else if (updatedRide.status === 'completed') {
        handleCompleteRide();
    } else if (updatedRide.status === 'canceled') {
        handleCancelRide(false); // No need to update db again
        toast({title: "Corrida Cancelada", description: "A corrida foi cancelada.", variant: 'destructive'});
    }
}, [playNotification, rideStatus, toast]);

  useEffect(() => {
    const passengerId = pb.authStore.model?.id;
    if (!passengerId) {
      if (rideStatus !== 'idle') setRideStatus('idle'); // Reset if user logs out
      return;
    }
    
    // Check for existing active ride
    pb.collection('rides').getFirstListItem<RideRecord>(`passenger="${passengerId}" && (status="accepted" || status="in_progress")`, { expand: 'driver' })
      .then(ride => {
        handleRideUpdate(ride);
      }).catch(() => {
        // No active ride found, which is normal.
        if (rideStatus !== 'searching' && rideStatus !== 'idle') {
            setRideStatus('idle');
        }
      });
  }, [rideStatus, handleRideUpdate]);
  

  const onRideRequest = (rideId: string) => {
    setRideStatus('searching');
    let unsubscribe: () => void;
    const subscribeToRide = async () => {
        try {
            unsubscribe = await pb.collection('rides').subscribe<RideRecord>(rideId, e => {
              if(e.record) {
                handleRideUpdate(e.record);
              }
            });
        } catch (err) {
            console.error(`Realtime subscription for ride ${rideId} failed:`, err);
        }
    };
    subscribeToRide();

    // Store the unsubscribe function to be called on cleanup
    if (activeRide) {
        const oldUnsubscribe = pb.collection('rides').unsubscribe(activeRide.id);
    }
    // activeRide's unsubscribe will now be this new one.
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
    if(activeRide) pb.collection('rides').unsubscribe(activeRide.id);
  };
  
  const handleCompleteRide = () => {
    toast({ title: "Viagem Concluída!", description: "Obrigado por viajar com a gente."});
    setRideStatus('completed');
     // Reset after a delay
    setTimeout(() => {
        setRideStatus('idle');
        setRideDetails(null);
        setActiveRide(null);
        if(activeRide) pb.collection('rides').unsubscribe(activeRide.id);
    }, 5000);
  }

  const handleSelectDriver = (driver: Driver) => {
    if (!origin || !destination) {
        toast({
            variant: 'destructive',
            title: 'Campos obrigatórios',
            description: 'Por favor, preencha os campos de origem e destino antes de escolher um motorista.',
        });
        return;
    }
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
            anonymousUserName={pb.authStore.isValid ? null : 'Anônimo'}
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
                                    <AvatarImage src={driver.avatar ? getAvatarUrl(driver, driver.avatar) : ''} data-ai-hint="driver portrait" />
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
                passengerAnonymousName={pb.authStore.isValid ? null : "Passageiro Anônimo"}
            />
        )}
    </div>
  );
}
